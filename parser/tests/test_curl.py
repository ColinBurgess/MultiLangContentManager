import json
import sys
import os

# Add parent directory to path to import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from wordexporter import parse_word_text, generate_curl_command

test_input = """TEST Title Super Condensado
Guion
Esta parte del guion es general y el script actual podría ignorarla si no hay marcadores específicos de Teleprompter Español/Inglés debajo.

Teleprompter
Español:
Guion de prueba en español. Muy breve.
Final del guion ES.
Ingles:
Test script in English. Very short.
End of EN script.

Descripcion Video
Español:
Descripción de video ES. SEO optimizado.
Contenido de prueba.
Ingles:
Video description EN. SEO optimized.
Test content here.

Lista de tags (500 caracteres):
Español:
tag1_es, tag2_es, prueba_es
Ingles:
tag1_en, tag2_en, test_en

Comentario Pineado ES
Español:
Comentario fijado español: ¡Genial!
Ingles:
Pinned comment English: Awesome!

Descripción simplificada para TikTok:
Español:
TikTok en español: #test #corto
Ingles:
TikTok in English: #test #short

Post para X (menos de 180 caracteres):
Español:
Post X en español: Contenido de prueba. #minitest
Ingles:
X post in English: Test content. #minitest

Descripción para un post en Facebook:
Español:
Facebook post en español. Un ejemplo rápido.
Ingles:
Facebook post in English. A quick example."""

# Procesar el texto
parsed_data = parse_word_text(test_input)

# Generar comando cURL
curl_command = generate_curl_command(parsed_data, 'http://localhost:3000/api/contents')

# Imprimir el comando cURL generado
print("\nComando cURL generado:")
print(curl_command)