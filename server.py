from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import base64
import numpy as np

# Decodifica una imagen en Base64 a un formato OpenCV
def binary_to_image(img_binary):
    np_array = np.frombuffer(img_binary, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    return image

# Codificar la imagen
def image_to_binary(image):
    _, buffer = cv2.imencode('.jpg', image)  # Codifica en JPEG
    img_binary = buffer.tobytes()  # Convierte el buffer en binario
    return img_binary

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
    image = binary_to_image(base64_string)
    if image is None:
        return jsonify({"error": "No se pudo decodificar la imagen"}), 400

    # Redimensionar la imagen a 640x640
    img_rs = cv2.resize(image, (640, 640))

    # Realizar la inferencia con YOLO
    results = model(img_rs)

    # Extraer información de detecciones
    detections = []
    # for box in results[0].boxes:
    #     detections.append({
    #         "confidence": float(box.conf),       # Confianza del modelo
    #         "xmin": int(box.xyxy[0][0]),         # Coordenada superior izquierda en x
    #         "ymin": int(box.xyxy[0][1]),         # Coordenada superior izquierda en y
    #         "xmax": int(box.xyxy[0][2]),         # Coordenada inferior derecha en x
    #         "ymax": int(box.xyxy[0][3])          # Coordenada inferior derecha en y
    #     })

    detections = results[0].boxes

    for box in detections:
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Coordenadas de la caja
        score = box.conf[0]  # Confianza
        label = f"Caja ({score:.2f})"
        cv2.rectangle(img_rs, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(img_rs, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.5, (255, 0, 0), 2)

    img_rs = image_to_binary(img_rs)
    print(img_rs)

    # Devolver los resultados en formato JSON
    response = jsonify({
        'detections': len(detections),
        'image_decoded': img_rs
    })

if __name__ == '__main__':
    # Iniciar el servidor
    server.run(debug=False, host='0.0.0.0', port=8080)
