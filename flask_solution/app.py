from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from PIL import Image
import base64
import numpy as np
import cv2
from scipy import signal

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)

dA = 1
dB = 0.5
feed = 0.055
k = 0.062

def numpy_grayscott(U, V):

    u, v = U[1:-1,1:-1], V[1:-1,1:-1]
    u = u.astype(np.float64)
    v = v.astype(np.float64)

    Lu = laplacian(U)
    Lv = laplacian(V)

    uvv = u*v*v
    u += dA*Lu - uvv + feed*(1 - u)
    v += dB*Lv + uvv - (feed + k)*v

    periodic_bc(U)
    periodic_bc(V)

    return U, V

def laplacian(u):
    """second order finite differences"""
    return (u[:-2, 1:-1] + u[1:-1,:-2] - 4*u[1:-1,1:-1] + u[1:-1,2:] + u[2:,1:-1] )

def periodic_bc(u):
    u[0, :] = u[-2, :]
    u[-1, :] = u[1, :]
    u[:, 0] = u[:, -2]
    u[:, -1] = u[:, 1]

def update_a(input_a, input_b):    
    new_array = input_a + (convolve_2d(input_a) * dA) - np.multiply(np.multiply(input_a, input_b), input_b) + (feed * (np.ones(input_a.shape) - input_a))
    return np.round(np.clip(new_array, 0, 255))
       
def update_b(input_a, input_b):
    new_array = input_b + (convolve_2d(input_b) * dB) + np.multiply(np.multiply(input_a, input_b), input_b) - ((feed + k) * input_b)
    return np.round(np.clip(new_array, 0, 255))    

def convolve_2d(my_input):
    filter = np.array([[0.05,0.2,0.05],[0.2,-1,0.2],[0.05,0.2,0.05]])
    new_array = np.c_[my_input[:,-1],my_input,my_input[:,0]]
    new_array = np.vstack([new_array[-1],new_array, new_array[0]])
    new_array[0][0], new_array[0][-1], new_array[-1][0], new_array[-1][-1] = new_array[-2][-2], new_array[-2][1], new_array[1][-2], new_array[1][1]
    return signal.convolve2d(new_array, filter, mode='valid')

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    
@app.route('/update', methods=['POST', 'GET'])
def update():
    if request.method == 'POST':         

        file = request.data ## byte file
        app.logger.info("Receiving : {}".format(file[:50]))

        file = file[22:] ## needs shorten sequence because current one is not divided by 4
        app.logger.info("Shorted : {}".format(file[:50]))
        decoded = base64.decodebytes(file)
        app.logger.info("Decoded : {}".format(decoded[:50]))

        npimg = np.frombuffer(decoded, np.uint8)      
        app.logger.info("From buffer: {}".format(npimg[:50]))  

        img = cv2.imdecode(npimg,cv2.IMREAD_UNCHANGED)
        img = np.transpose(img, axes=[2,0,1])
        app.logger.info("Imdecode: {}".format(img[0].shape))     

        second_channel = img[2].copy()
        img[2] = update_a(img[2],img[0])
        img[0] = update_b(second_channel,img[0])

        # foo, bar = numpy_grayscott(img[2], img[0])
        # img[2] = foo
        # img[0] = bar

        img = np.transpose(img, axes=[1,2,0])

        # img_to_save = Image.fromarray(img.astype("uint8")) 
        # img_to_save.save('hahaha.png')
         
        imgg = cv2.imencode('.png', img)
        app.logger.info("Imencode: {}".format(imgg[1][:50])) 

        img_base64 = base64.b64encode(imgg[1])
        would_be_added = 'data:image/png;base64,'
        img_base64 = str(img_base64)
        img_base64 = img_base64[:2] + would_be_added + img_base64[2:] 
        app.logger.info('To be send: {}'.format(img_base64[:50]))
        return jsonify({'status':str(img_base64[2:-1])})

@app.route('/init', methods=['POST', 'GET'])
def init():
    if request.method == 'POST':         

        file = request.data 
        file = file[22:]
        decoded = base64.decodebytes(file)

        npimg = np.frombuffer(decoded, np.uint8)    
        app.logger.info('init shape: {}'.format(npimg.shape))  

        img = cv2.imdecode(npimg,cv2.IMREAD_UNCHANGED)

        app.logger.info('init shape: {}'.format(img.shape))

        img = np.transpose(img, axes=[2,0,1])

        img[0] = np.zeros(img[0].shape)
        img[1] = np.zeros(img[1].shape)
        img[2] = np.ones(img[1].shape) * 255
        img[3] = np.ones(img[1].shape) * 255

        img[0][46:55,46:55] = np.ones(img[0][146:155,146:155].shape) * 255
        
        img = np.transpose(img, axes=[1,2,0])
         
        imgg = cv2.imencode('.png', img)

        img_base64 = base64.b64encode(imgg[1])
        would_be_added = 'data:image/png;base64,'
        img_base64 = str(img_base64)
        img_base64 = img_base64[:2] + would_be_added + img_base64[2:] 
        return jsonify({'status':str(img_base64[2:-1])})

@app.route('/mischief_managed', methods=['GET'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

def my_laplace(grid, x, y):
    sumB = 0    

    sumB += grid[x][y] * -1
    sumB += grid[x-1][y] * 0.2
    sumB += grid[x+1][y] * 0.2
    sumB += grid[x][y-1] * 0.2
    sumB += grid[x][y+1] * 0.2
    sumB += grid[x-1][y+1] * 0.05
    sumB += grid[x+1][y+1] * 0.05
    sumB += grid[x+1][y-1] * 0.05
    sumB += grid[x-1][y-1] * 0.05

    return sumB


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)

