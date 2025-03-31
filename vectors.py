from multiprocessing import Process, Queue
import matplotlib.pyplot as plt

class VectorVisualizer:
    def __init__(self):
        self.queue = Queue()
        self.process = Process(target=self._visualization_loop)
        self.process.start()
    
    def _visualization_loop(self):
        plt.switch_backend('Qt5Agg')
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')
        ax.set_xlim([-1, 1])
        ax.set_ylim([-1, 1])
        ax.set_zlim([-1, 1])
        
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        
        ax.quiver(0, 0, 0, 0, 1, 0, color='g', arrow_length_ratio=0.1, label='Y')
        ax.quiver(0, 0, 0, 1, 0, 0, color='r', arrow_length_ratio=0.1, label='X')
        ax.quiver(0, 0, 0, 0, 0, 1, color='b', arrow_length_ratio=0.1, label='Z')
        ax.legend()
        
        vector = None
        
        while True:
            if not self.queue.empty():
                x, y, z = self.queue.get()
                if vector: vector.remove()
                vector = ax.quiver(0, 0, 0, x, y, z, color='purple')
                plt.draw()
            plt.pause(0.1)
    
    def draw_vector(self, x, y, z):
        self.queue.put((x, y, z))
