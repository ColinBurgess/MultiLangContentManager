import json
from parser.wordexporter import parse_word_text, generate_curl_command

# Texto con emojis para probar la codificación
test_input = """1. Script de Teleprompter (Inglés)
This is a test script with emojis 🤖🔥💯

2. Título Atractivo (SEO)
Español: Prueba de emojis 🚀 y #hashtags
Inglés: Testing emoji 🚀 and #hashtags

3. Descripción para YouTube (Español)
Esta es una prueba con emojis 🤔 🤖 🎉 y #hashtags
"""

# Analizar el texto con el parser
parsed_data = parse_word_text(test_input)

# Generar comando cURL
api_url = "http://localhost:3000/api/contents"
curl_command = generate_curl_command(parsed_data, api_url)

# Imprimir el comando cURL generado
print("Comando cURL generado:")
print(curl_command)

# Verificar si los emojis están correctamente codificados
print("\nVerificando la codificación de emojis:")
if "🤔" in curl_command and "🤖" in curl_command and "🚀" in curl_command:
    print("✅ Los emojis están codificados correctamente")
else:
    print("❌ Hay problemas con la codificación de emojis")

# Verificar si los hashtags están correctamente procesados
print("\nVerificando hashtags:")
if "#hashtags" in curl_command:
    print("✅ Los hashtags están procesados correctamente")
else:
    print("❌ Hay problemas con los hashtags")

# Verificar si hay escapes múltiples de comillas simples
print("\nVerificando escapes de comillas:")
if "\\'\\''" in curl_command:
    print("❌ Hay escapes múltiples de comillas")
else:
    print("✅ Las comillas simples están correctamente escapadas")