import cv2
import numpy as np

def image_to_binary(image_path):
    """Lee una imagen desde un archivo y la convierte a binario."""
    with open(image_path, "rb") as file:
        img_binary = file.read()  # Lee el archivo como binario
    return img_binary

def save_binary_to_file(binary_data, file_path):
    """Guarda datos binarios en un archivo."""
    with open(file_path, "wb") as file:
        file.write(binary_data)

def load_binary_from_file(file_path):
    """Lee datos binarios desde un archivo."""
    with open(file_path, "rb") as file:
        img_binary = file.read()
    return img_binary

def binary_to_image(img_binary):
    """Convierte datos binarios a una imagen en formato OpenCV."""
    np_array = np.frombuffer(img_binary, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    return image

def show_image_from_binary(img_binary):
    """Muestra la imagen decodificada a partir de datos binarios."""
    image = binary_to_image(img_binary)
    cv2.imshow("Decoded Image", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Ruta a la imagen original y el archivo binario
image_path = "boxes.jpg"
binary_file_path = "server_image_binary.txt"

# Convertir la imagen a binario y guardarla en un archivo
img_binary = image_to_binary(image_path)
print(img_binary)
# save_binary_to_file(img_binary, binary_file_path)

# Leer la imagen en binario desde el archivo y mostrarla
# img_binary_from_file = load_binary_from_file(binary_file_path)
# show_image_from_binary(img_binary_from_file)
