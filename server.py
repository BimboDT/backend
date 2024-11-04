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

# Bucket URL (Oracle Cloud Storage)
bucketUrl = "https://objectstorage.us-phoenix-1.oraclecloud.com/p/7hs26atNwRAfFpn_TAJK6PIEriKMfVtAnnROyQWxqCr0pELa62lbaKvFwVw4bxON/n/axxbc0j4otis/b/bimbucket/o/"


# Función para descargar la imagen desde una URL y convertirla al formato OpenCV
def url_to_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        img_array = np.frombuffer(response.content, np.uint8)
        image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        return image
    else:
        return None
    
# Función para subir la imagen procesada a Oracle Cloud Storage
def upload_image(bucket_url, image):
    # Convertir la imagen a un formato compatible (PNG)
    _, buffer = cv2.imencode('.png', image)
    headers = {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=Procesado.png"
    }
    response = requests.put(bucket_url, headers=headers, data=buffer.tobytes())
    return response.status_code == 200

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
        # Dibujar las cajas y etiquetas en la imagen
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Coordenadas de la caja
        score = box.conf[0]  # Confianza
        label = f"Caja ({score:.2f})"
        cv2.rectangle(img_rs, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(img_rs, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.5, (255, 0, 0), 2)

    #uploadImage = upload_image(bucketUrl, img_rs)
    detections = results[0].boxes

    # if not uploadImage:
    #     return jsonify({"error": "No se pudo subir la imagen procesada al bucket"}), 500

    # Devolver los resultados en formato JSON
    return jsonify({'detections': len(detections)})

if __name__ == '__main__':
    # Iniciar el servidor
    server.run(debug=False, host='0.0.0.0', port=8080)
