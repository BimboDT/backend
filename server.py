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
    for box in results[0].boxes:
        detections.append({
            "confidence": float(box.conf),       # Confianza del modelo
            "xmin": int(box.xyxy[0][0]),         # Coordenada superior izquierda en x
            "ymin": int(box.xyxy[0][1]),         # Coordenada superior izquierda en y
            "xmax": int(box.xyxy[0][2]),         # Coordenada inferior derecha en x
            "ymax": int(box.xyxy[0][3])          # Coordenada inferior derecha en y
        })

    detections = results[0].boxes

    # Devolver los resultados en formato JSON
    return jsonify({'detections': len(detections)})

if __name__ == '__main__':
    # Iniciar el servidor
    server.run(debug=False, host='0.0.0.0', port=8080)
