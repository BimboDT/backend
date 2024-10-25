import base64
import json

# Función para codificar la imagen en Base64 y crear el JSON
def generar_json_con_imagen(image_path, json_path):
    # Leer la imagen y codificarla en Base64
    with open(image_path, "rb") as img_file:
        encoded_string = base64.b64encode(img_file.read()).decode('utf-8')
    
    # Crear el diccionario con la imagen codificada
    data = {
        "image": encoded_string,
    }
    
    # Guardar el diccionario como un archivo JSON
    with open(json_path, "w") as json_file:
        json.dump(data, json_file, indent=4)
    print(f"JSON generado en: {json_path}")

# Ejemplo de uso
image_path = "demo.jpg"
json_path = "imagen_codificada.json"

generar_json_con_imagen(image_path, json_path)
