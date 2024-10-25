import cv2
import base64
import json
import numpy as np
from ultralytics import YOLO

def base64_to_image(base64_string):
    """Decodifica una imagen en Base64 a un formato OpenCV."""
    img_data = base64.b64decode(base64_string)
    np_array = np.frombuffer(img_data, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    return image

def cargar_json(json_path):
    """Carga el contenido del archivo JSON."""
    with open(json_path, 'r') as f:
        data = json.load(f)
    return data['image']

def main(model, json_path):
    """Función principal."""
    # Cargar la imagen codificada desde el JSON
    base64_string = cargar_json(json_path)

    # Decodificar la imagen
    image = base64_to_image(base64_string)
    if image is None:
        print("Error: No se pudo decodificar la imagen.")
        return

    # Redimensionar la imagen a 640x640
    img_rs = cv2.resize(image, (640, 640))

    # Realizar la inferencia con YOLO
    results = model(img_rs)
    detections = results[0].boxes

    print(f"Número de cajas detectadas: {len(detections)}")

    # Dibujar las cajas y etiquetas
    for box in detections:
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Coordenadas de la caja
        score = box.conf[0]  # Confianza
        label = f"Caja ({score:.2f})"
        cv2.rectangle(img_rs, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(img_rs, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.5, (255, 0, 0), 2)

    # Mostrar la imagen con las detecciones
    cv2.imshow("Detecciones", img_rs)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Cargar el modelo YOLO
model_path = 'best.pt'
model = YOLO(model_path)

# Ruta del archivo JSON que contiene la imagen
json_path = 'demo.json'

if __name__ == "__main__":
    main(model, json_path)

