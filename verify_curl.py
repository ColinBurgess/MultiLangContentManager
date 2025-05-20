import json
from parser.wordexporter import parse_word_text, generate_curl_command

# Ejemplo con caracteres que necesitan escape
test_input = """1. Script de Teleprompter (Inglés)
This is a test script that's got some quotes like isn't and doesn't.
It also has emojis like 🚀 and 🤖.

2. Título Atractivo (SEO)
Español: Prueba de escapes 'apostrofes' y "comillas"
Inglés: Testing escapes 'apostrophes' and "quotes"
"""

# Analizar el texto con el parser
parsed_data = parse_word_text(test_input)

# Generar comando cURL
api_url = "http://localhost:3000/api/contents"
curl_command = generate_curl_command(parsed_data, api_url)

# Imprimir resultados
print("Comando curl generado y guardado en verify_curl_output.txt")

# Guardar el resultado para examinarlo
with open("verify_curl_output.txt", "w", encoding="utf-8") as f:
    f.write(curl_command)

# Verificar características básicas
print("\nVerificaciones básicas:")

# 1. Los emojis están presentes
if "🚀" in curl_command and "🤖" in curl_command:
    print("✅ Los emojis están presentes")
else:
    print("❌ Problemas con los emojis")

# 2. Las comillas simples están escapadas correctamente (formato Bash: ' -> '\'' )
if "that'\\'" in curl_command or "isn'\\'" in curl_command or "doesn'\\'" in curl_command:
    print("✅ Las comillas simples están escapadas correctamente")
else:
    print("❌ Problema con el escape de comillas simples")
    # Verificamos el formato alternativo de escape (que parece estar siendo usado)
    if "that'\\'" in curl_command or "isn'\\''" in curl_command or "doesn'\\''" in curl_command:
        print("   ⚠️ Se detectó un formato de escape alternativo")

# 3. Las comillas dobles no están escapadas en el JSON pero sí en los parámetros curl
if '"comillas"' in curl_command and '"quotes"' in curl_command:
    print("✅ Las comillas dobles en el JSON están presentes correctamente")
else:
    print("❌ Problema con las comillas dobles en el JSON")

# Extraer y mostrar fragmentos relevantes del comando
print("\nFragmentos del comando curl para inspección:")
curl_lines = curl_command.split("\n")
for i, line in enumerate(curl_lines):
    if "that's" in line.lower() or "isn't" in line.lower() or "doesn't" in line.lower():
        print(f"Línea {i+1}: {line[:70]}...")
    elif "emoji" in line.lower() and ("🚀" in line or "🤖" in line):
        print(f"Línea {i+1}: {line[:70]}...")