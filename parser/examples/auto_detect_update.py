#!/usr/bin/env python3
"""
Script to search for existing content by title and decide whether to create a new one or update an existing one.
"""
import json
import sys
import requests
import argparse
from parser.wordexporter import parse_word_text, generate_curl_command, generate_update_curl_command

def search_content_by_title(api_url, title):
    """
    Search for existing content with an exact or similar title

    Args:
        api_url: Base API URL
        title: Title to search for

    Returns:
        dict: Found content or None if not found
    """
    # Define search URL
    search_url = f"{api_url}?title={requests.utils.quote(title)}"

    try:
        # Make GET request
        response = requests.get(search_url)

        # Check if request was successful
        if response.status_code == 200:
            contents = response.json()

            # If there are results that exactly match the title
            for content in contents:
                if content.get('title') == title:
                    return content

            # If there are no exact matches but there are similar results
            if contents and len(contents) > 0:
                # Return the first result as the best match
                return contents[0]

        return None

    except Exception as e:
        print(f"Error searching for contents: {e}", file=sys.stderr)
        return None

def main():
    parser = argparse.ArgumentParser(description="Automatically detect whether to create or update content")
    parser.add_argument(
        "--input-file", "-i",
        required=True,
        help="Input file with structured text"
    )
    parser.add_argument(
        "--api-url", "-a",
        required=True,
        help="Base API URL"
    )
    parser.add_argument(
        "--force-create", "-c",
        action="store_true",
        help="Force creation of new content even if a similar one exists"
    )
    parser.add_argument(
        "--force-update", "-u",
        help="ID of the content to update, ignoring title search"
    )

    args = parser.parse_args()

    # Read input file
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        print(f"Error al leer el archivo: {e}", file=sys.stderr)
        sys.exit(1)

    # Analizar el texto
    try:
        parsed_data = parse_word_text(text)
    except Exception as e:
        print(f"Error al analizar el texto: {e}", file=sys.stderr)
        sys.exit(1)

    title = parsed_data.get("title", "")
    if not title:
        print("ADVERTENCIA: No se encontró un título en el texto analizado.", file=sys.stderr)

    # Determinar si crear o actualizar
    content_id = None
    action = "CREATE"

    if args.force_update:
        # Si se especificó un ID para actualizar, usarlo
        content_id = args.force_update
        action = "UPDATE"
    elif not args.force_create and title:
        # Buscar si existe un contenido con ese título
        print(f"Buscando contenido con título: {title}")
        existing_content = search_content_by_title(args.api_url, title)

        if existing_content:
            content_id = existing_content.get("_id")
            print(f"Se encontró un contenido existente con ID: {content_id}")
            print(f"Título existente: {existing_content.get('title')}")

            # Preguntar al usuario si desea actualizar
            response = input("¿Desea actualizar este contenido? (s/n): ").lower()
            if response == 's' or response == 'si' or response == 'y' or response == 'yes':
                action = "UPDATE"
            else:
                print("Se creará un nuevo contenido.")
                action = "CREATE"

    # Generar el comando curl adecuado
    if action == "UPDATE" and content_id:
        print(f"\nGenerando comando para ACTUALIZAR contenido con ID: {content_id}")
        curl_command = generate_update_curl_command(parsed_data, args.api_url, content_id)
    else:
        print("\nGenerando comando para CREAR nuevo contenido")
        curl_command = generate_curl_command(parsed_data, args.api_url)

    print("\n=== Comando curl generado ===")
    print(curl_command)

    # Guardar el comando en un archivo
    output_filename = "update_command.sh" if action == "UPDATE" else "create_command.sh"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write("#!/bin/bash\n")
        f.write(curl_command)

    # Hacer el archivo ejecutable
    import os
    os.chmod(output_filename, 0o755)

    print(f"\nEl comando se ha guardado en '{output_filename}' y se ha hecho ejecutable.")
    print(f"Puede ejecutarlo con: ./{output_filename}")

if __name__ == "__main__":
    main()