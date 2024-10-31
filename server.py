from flask import Flask, request, jsonify
from flask_cors import CORS

# Librerías
from ultralytics import YOLO
import cv2
import requests
import numpy as np
## Server configuration
server = Flask(__name__)
CORS(server)

# Cargar el modelo YOLO
model = YOLO('best.pt')

# Función para descargar la imagen desde una URL y convertirla al formato OpenCV
def url_to_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        img_array = np.frombuffer(response.content, np.uint8)
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        return image
    else:
        return None

# Ruta de prueba
@server.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API funcionando correctamente"}), 200

# Ruta para predicción
@server.route('/predict', methods=['POST'])
def predictJSON():

    # Cargar la imagen
    data = request.json
    imgUrl = data['imageUrl']

    # Descargar la imagen
    image = url_to_image(imgUrl)
    if image is None:
        return jsonify({"message": "No se pudo obtener la imagen desde la URL"}), 400

    # Redimensionar la imagen a 640x640
    img_rs = cv2.resize(image, (640, 640))

    # Realizar la inferencia con YOLO
    results = model(img_rs)

    # Extraer información de detecciones
    detections = []

    for box in detections:
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Coordenadas de la caja
        score = box.conf[0]  # Confianza
        label = f"Caja ({score:.2f})"
        cv2.rectangle(img_rs, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(img_rs, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.5, (255, 0, 0), 2)

    detections = results[0].boxes

    # Devolver los resultados en formato JSON
    response = jsonify({
        'detections': len(detections),
    })

if __name__ == '__main__':
    # Iniciar el servidor
    server.run(debug=False, host='0.0.0.0', port=8080)
