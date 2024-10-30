from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO    #type: ignore
import cv2
import base64
import numpy as np

# Decodifica una imagen en Base64 a un formato OpenCV
def base64_to_image(base64_string):
    img_data = base64.b64decode(base64_string)
    np_array = np.frombuffer(img_data, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    return image

## Server configuration
server = Flask(__name__)
CORS(server)

# Ruta de prueba
@server.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API funcionando correctamente"}), 200

# Cargar el modelo YOLO
model = YOLO('best.pt')

# Ruta para predicción
@server.route('/predict', methods=['POST'])
def predictJSON():
    # Obtener y decodificar la imagen en base64
    data = request.json
    base64_string = data['image']
    image = base64_to_image(base64_string)
    if image is None:
        return jsonify({"error": "No se pudo decodificar la imagen"}), 400

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
