import json
import re
from parser.wordexporter import parse_word_text, generate_curl_command

# Ejemplo similar al texto del reporte, con emojis y caracteres especiales
test_input = """1. Script de Teleprompter (Inglés)
Imagine if the next revolution in programming doesn't come from a new language, but from an AI that learns from your own mistakes? Well, buckle up, because OpenAI just bought Windsurf for $3 billion, and this could change everything! 🚀

OpenAI, the brains behind ChatGPT, has made a bold move by acquiring Windsurf, a sophisticated code editor that uses artificial intelligence to help you program at lightning speed. But why spend so much on an editor when they already have AIs that generate code?

The key is in the data. When you use ChatGPT to program, OpenAI only sees your question and the answer it gives you. But what really matters is what you do next: how you correct, adapt, or improve that code. That's pure gold for training better models!

2. Título Atractivo (SEO)
Español: 💸 OpenAI COMPRA Windsurf: ¿El Futuro de la Programación con IA? 🤖
Inglés: 💸 OpenAI BUYS Windsurf: The Future of AI-Powered Programming? 🤖

3. Descripción para YouTube (Español)
🚨 ¡Noticia BOMBA en el mundo de la IA! 🚨 OpenAI, los creadores de ChatGPT, acaban de adquirir Windsurf por ¡3.000 millones de dólares! 🤯 ¿Es este el futuro de la programación asistida por IA? 🤔

En este video, analizamos a fondo:

💸 Por qué OpenAI ha hecho esta compra millonaria.
🤖 Qué es Windsurf y cómo su IA puede revolucionar la forma en que programamos.
#OpenAI #Windsurf #IA #InteligenciaArtificial
"""

# Analizar el texto con el parser
parsed_data = parse_word_text(test_input)

# Verificar el contenido parsed_data
print("Contenido parseado:")
for key, value in parsed_data.items():
    if key in ["title", "teleprompterEn", "videoDescriptionEs"] and value:
        print(f"{key}: {value[:50]}...")
    else:
        continue

# Generar comando cURL
api_url = "http://localhost:3000/api/contents"
curl_command = generate_curl_command(parsed_data, api_url)

# Guardar el comando en un archivo para inspeccionarlo fácilmente
with open("curl_command.txt", "w", encoding="utf-8") as f:
    f.write(curl_command)

print("\nEl comando curl ha sido generado y guardado en 'curl_command.txt'")

# Verificaciones específicas
print("\nVerificando presencia de emojis:")
emojis = ["🚀", "🤖", "🚨", "🤯", "🤔", "💸"]
for emoji in emojis:
    if emoji in curl_command:
        print(f"✅ Emoji {emoji} presente")
    else:
        print(f"❌ Emoji {emoji} ausente")

print("\nVerificando escape de comillas simples:")
# Busca patrones específicos en el texto que indiquen el escape correcto
matches = re.findall(r"doesn['\\\]+t", curl_command)
if matches:
    print(f"Patrón encontrado para 'doesn't': {matches[0]}")
    if matches[0] == "doesn\\'t":
        print("✅ Escape de comillas correcto")
    else:
        print(f"❌ Escape de comillas incorrecto: {matches[0]}")
else:
    print("❌ No se encontró el patrón para 'doesn't'")

matches = re.findall(r"That['\\\]+s", curl_command)
if matches:
    print(f"Patrón encontrado para 'That's': {matches[0]}")
    if matches[0] == "That\\'s":
        print("✅ Escape de comillas correcto")
    else:
        print(f"❌ Escape de comillas incorrecto: {matches[0]}")
else:
    print("❌ No se encontró el patrón para 'That's'")

print("\nVerificando hashtags:")
if "#OpenAI" in curl_command and "#Windsurf" in curl_command:
    print("✅ Hashtags presentes correctamente")
else:
    print("❌ Problema con hashtags")

# Extraer una porción del texto que incluya comillas simples para examinarlo
print("\nExaminando un fragmento del comando con comillas simples:")
excerpt = re.search(r'next revolution in programming(.{20,60})', curl_command)
if excerpt:
    print(f"Fragmento: ...{excerpt.group(0)}...")

# Imprimir las primeras 5 líneas del comando curl
print("\nPrimeras líneas del comando curl:")
lines = curl_command.split("\n")
for i in range(min(5, len(lines))):
    print(lines[i])