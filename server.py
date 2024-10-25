### BACKEND SERVER ###

## Python Libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

## File management
# import os

## Server configuration
server = Flask(__name__)
CORS(server)

## Loading the model
model = YOLO('best.pt')


## Defining a route to send JSON data
@server.route('/predict', methods=['POST'])
def predictJSON():
    # Process the input data
    data = request.json
    base64_string = data['image']
    #print(base64_string)

    # Realizar la inferencia con el modelo YOLO directamente usando el string
    results = model(base64_string)
    detections = results[0].boxes

    # Extraer resultados de las detecciones
    output = []
    for box in detections:
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Coordenadas de la caja
        score = float(box.conf[0])  # Confianza de la detección
        output.append({
            'box': [x1, y1, x2, y2],
            'confidence': score
        })
    
    return jsonify({'Cajas': output})

if __name__ == '__main__':
    # Start the server
    server.run(debug=False, host='0.0.0.0', port=8080)