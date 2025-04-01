use actix_web::{web, App, HttpServer, HttpResponse, Responder, get, post};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Aim {
    x: f64,
    y: f64,
    z: f64,
    press: bool,
    hold: bool,
}

impl Default for Aim {
    fn default() -> Self {
        Aim {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            press: false,
            hold: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Vector {
    x: f64,
    y: f64,
    z: f64,
    press: bool,
}

impl Vector {
    fn new(x: f64, y: f64, z: f64, press: bool) -> Self {
        Vector { x, y, z, press }
    }

    fn add(&self, other: &Vector) -> Vector {
        Vector::new(
            self.x + other.x,
            self.y + other.y,
            self.z + other.z,
            other.press,
        )
    }

    fn multiply(&self, scalar: f64) -> Vector {
        Vector::new(
            self.x * scalar,
            self.y * scalar,
            self.z * scalar,
            self.press,
        )
    }

    fn divide(&self, scalar: f64) -> Vector {
        Vector::new(
            self.x / scalar,
            self.y / scalar,
            self.z / scalar,
            self.press,
        )
    }
}

struct AppState {
    aims: Mutex<Vec<Aim>>,
    raw_vectors: Mutex<VecDeque<Vector>>,
    filter_window: Vec<f64>,
}

fn filter(data: &VecDeque<Vector>, window: &[f64]) -> Vector {
    let mut sum = Vector::new(0.0, 0.0, 0.0, false);
    let mut sum_window = 0.0;

    if data.len() < window.len() {
        for i in 0..data.len() {
            sum = sum.add(&data[i].multiply(window[window.len() - data.len() + i]));
            sum_window += window[window.len() - data.len() + i];
        }
    } else {
        for i in 0..window.len() {
            sum = sum.add(&data[data.len() - window.len() + i].multiply(window[i]));
            sum_window += window[i];
        }
    }

    sum.divide(sum_window)
}

#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../templates/index.html"))
}

#[get("/motion_control")]
async fn motion_control() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../templates/motion_controller.html"))
}

#[get("/get_aim/{id}")]
async fn get_aim(data: web::Data<AppState>, path: web::Path<usize>) -> impl Responder {
    let id = path.into_inner();
    let mut aims = data.aims.lock().unwrap();
    let ret_aims = aims.clone();
    if id < aims.len() {
        aims[id].press = false;
        HttpResponse::Ok().json(&ret_aims[id])
    } else {
        HttpResponse::NotFound().body("Aim not found")
    }
}

#[get("/js/{script}")]
async fn send_script(path: web::Path<String>) -> impl Responder {
    let script = path.into_inner();
    match std::fs::read_to_string(format!("./js/{}", script)) {
        Ok(content) => HttpResponse::Ok()
            .content_type("application/javascript")
            .body(content),
        Err(_) => HttpResponse::NotFound().body("Script not found"),
    }
}

#[get("/img/{image}")]
async fn send_image(path: web::Path<String>) -> impl Responder {
    let image = path.into_inner();
    match std::fs::read(format!("./img/{}", image)) {
        Ok(content) => HttpResponse::Ok()
            .content_type(mime_guess::from_path(&image).first_or_octet_stream())
            .body(content),
        Err(_) => HttpResponse::NotFound().body("Image not found"),
    }
}

#[post("/send_vector")]
async fn get_vector(
    // data: web::Path<String>,
    data: web::Json<Vector>,
    app_data: web::Data<AppState>,
) -> impl Responder {
    println!("A");
    // println!("{:?}", data);
    let mut raw_vectors = app_data.raw_vectors.lock().unwrap();
    let filter_window = &app_data.filter_window;
    
    raw_vectors.push_back(data.into_inner());
    if raw_vectors.len() > filter_window.len() {
        raw_vectors.pop_front();
    }
    
    let aim_vector = filter(&raw_vectors, filter_window);
    
    // TODO: Implement vector visualization if needed
    // if DRAW_VECTORS {
        //     vec_viz.draw_vector(aim_vector.x, aim_vector.y, aim_vector.z);
        // }
        
        println!("{:?}", aim_vector);
        
        let mut aims = app_data.aims.lock().unwrap();
        if let Some(first_aim) = aims.get_mut(0) {
            *first_aim = Aim {
                x: aim_vector.x,
                y: aim_vector.y,
                z: aim_vector.z,
                press: aim_vector.press,
                hold: false,
            };
        }
        
        println!("B");
        HttpResponse::Ok().body("ok")
    }

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_state = web::Data::new(AppState {
        aims: Mutex::new(vec![Aim::default(), Aim::default()]),
        raw_vectors: Mutex::new(VecDeque::new()),
        filter_window: vec![0.7, 0.7, 0.8, 0.8, 0.9, 0.9, 1.0],
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .service(index)
            .service(motion_control)
            .service(get_aim)
            .service(send_script)
            .service(send_image)
            .service(get_vector)
    })
    .bind("0.0.0.0:5000")?
    .run()
    .await
}