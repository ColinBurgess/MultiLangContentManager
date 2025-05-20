import json
from parser.wordexporter import parse_word_text, generate_update_curl_command

# Ejemplo de uso para actualizar un contenido existente
print("== Ejemplo de actualización de contenido existente ==")

# ID del contenido que deseas actualizar
content_id = "64a7c2e5f1b5e3d2c1a9b8f7"  # Reemplaza con el ID real del contenido

# Texto con nuevo contenido
update_text = """1. Script de Teleprompter (Inglés)
This is an updated version of the script with some new information.
We're demonstrating how to update existing content.

2. Título Atractivo (SEO)
Español: 🔄 Contenido Actualizado: Nueva Versión del Artículo
Inglés: 🔄 Updated Content: New Version of the Article

3. Descripción para YouTube (Español)
Esta es una versión actualizada de nuestra descripción anterior.
Hemos añadido nueva información y corregido algunos errores.
"""

# Analizar el texto con el parser
parsed_data = parse_word_text(update_text)

# URL base de la API
api_url = "http://localhost:3000/api/contents"

# Generar comando cURL para actualización
curl_command = generate_update_curl_command(parsed_data, api_url, content_id)

print("\nComando curl para actualizar un contenido existente:")
print(curl_command)

print("\n== Instrucciones de uso ==")
print("1. Reemplaza el ID '64a7c2e5f1b5e3d2c1a9b8f7' con el ID real de tu contenido")
print("2. Si es necesario, actualiza la URL de la API según tu entorno")
print("3. Ejecuta el comando curl en tu terminal para actualizar el contenido")
print("4. También puedes guardar el comando en un archivo .sh y ejecutarlo:")
print("   echo '{curl_command}' > update_content.sh")
print("   chmod +x update_content.sh")
print("   ./update_content.sh")

# Guardar el comando en un archivo para facilitar su uso
with open("update_curl_command.txt", "w", encoding="utf-8") as f:
    f.write(curl_command)

print("\nEl comando curl se ha guardado en 'update_curl_command.txt' para su uso posterior.")