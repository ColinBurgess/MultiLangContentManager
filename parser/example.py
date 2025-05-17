#!/usr/bin/env python3
"""
Example script demonstrating the usage of the wordexporter parser.
"""
import json
from wordexporter import parse_word_text, generate_curl_command

def main():
    print("Word Document Parser Example")
    print("============================")
    print("This example demonstrates parsing structured text from Word documents.")
    print()

    # Simple example text
    example_text = """Example Video Title
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

    # Parse the text
    parsed_data = parse_word_text(example_text)

    # Print the result
    print("Parsed Data:")
    print(json.dumps(parsed_data, indent=2, ensure_ascii=False))
    print()

    # Generate a curl command
    api_url = "http://localhost:3000/api/contents"
    curl_cmd = generate_curl_command(parsed_data, api_url)

    print("Generated cURL Command:")
    print(curl_cmd)

if __name__ == "__main__":
    main()