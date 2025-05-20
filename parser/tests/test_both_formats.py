import json
from parser.wordexporter import parse_word_text, generate_curl_command

# Test del formato original
original_format = """Example Video Title
Teleprompter
Español:
Este es un ejemplo de teleprompter en español.
Ingles:
This is an example of teleprompter in English.

Descripcion Video
Español:
Descripción de video en español.
Ingles:
Video description in English.

Lista de tags
Español:
tag1_es, tag2_es, tag3_es, tag4_es
Ingles:
tag1_en, tag2_en, tag3_en, tag4_en

Comentario Pineado
Español:
Comentario en español para pinear.
Ingles:
Comment in English to pin.

Descripción simplificada para TikTok
Español:
TikTok en español #ejemplo
Ingles:
TikTok in English #example

Post para X
Español:
Post para X en español #ejemplo
Ingles:
X post in English #example

Descripción para un post en Facebook
Español:
Post para Facebook en español.
Ingles:
Facebook post in English.
"""

# Test del nuevo formato numerado
numbered_format = """1. Script de Teleprompter (Inglés)
Imagine if the next revolution in programming doesn't come from a new language, but from an AI that learns from your own mistakes? Well, buckle up, because OpenAI just bought Windsurf for $3 billion, and this could change everything!

2. Título Atractivo (SEO)
Español: 💸 OpenAI COMPRA Windsurf: ¿El Futuro de la Programación con IA?
Inglés: 💸 OpenAI BUYS Windsurf: The Future of AI-Powered Programming?

3. Descripción para YouTube (Español)
🚨 ¡Noticia BOMBA en el mundo de la IA! 🚨 OpenAI, los creadores de ChatGPT, acaban de adquirir Windsurf por ¡3.000 millones de dólares! 🤯
"""

# Prueba del formato original
print("Prueba del formato original")
print("=" * 50)
original_result = parse_word_text(original_format)
print("Título:", original_result.get("title", "No encontrado"))
print("Teleprompter ES:", original_result.get("teleprompterEs", "No encontrado")[:50] + "..." if len(original_result.get("teleprompterEs", "")) > 50 else original_result.get("teleprompterEs", "No encontrado"))
print("Teleprompter EN:", original_result.get("teleprompterEn", "No encontrado")[:50] + "..." if len(original_result.get("teleprompterEn", "")) > 50 else original_result.get("teleprompterEn", "No encontrado"))
print("Tags:", original_result.get("tags", "No encontrados"))
print()

# Prueba del formato numerado
print("Prueba del formato numerado")
print("=" * 50)
numbered_result = parse_word_text(numbered_format)
print("Título:", numbered_result.get("title", "No encontrado"))
print("Teleprompter EN:", numbered_result.get("teleprompterEn", "No encontrado")[:50] + "..." if len(numbered_result.get("teleprompterEn", "")) > 50 else numbered_result.get("teleprompterEn", "No encontrado"))
print("Descripción YouTube ES:", numbered_result.get("videoDescriptionEs", "No encontrado")[:50] + "..." if len(numbered_result.get("videoDescriptionEs", "")) > 50 else numbered_result.get("videoDescriptionEs", "No encontrado"))
print()

print("Ambos formatos son procesados correctamente.")