#!/usr/bin/env python3
"""
Script para buscar si un contenido existe por título y decidir si crear uno nuevo o actualizar uno existente.
"""
import json
import sys
import requests
import argparse
from parser.wordexporter import parse_word_text, generate_curl_command, generate_update_curl_command

def search_content_by_title(api_url, title):
    """
    Busca contenido existente con un título igual o similar

    Args:
        api_url: URL base de la API
        title: Título a buscar

    Returns:
        dict: Contenido encontrado o None si no se encuentra
    """
    # Definir la URL de búsqueda
    search_url = f"{api_url}?title={requests.utils.quote(title)}"

    try:
        # Realizar la solicitud GET
        response = requests.get(search_url)

        # Verificar si la solicitud fue exitosa
        if response.status_code == 200:
            contents = response.json()

            # Si hay resultados que coinciden exactamente con el título
            for content in contents:
                if content.get('title') == title:
                    return content

            # Si no hay coincidencias exactas pero hay resultados similares
            if contents and len(contents) > 0:
                # Devolver el primer resultado como la mejor coincidencia
                return contents[0]

        return None

    except Exception as e:
        print(f"Error al buscar contenidos: {e}", file=sys.stderr)
        return None

def main():
    parser = argparse.ArgumentParser(description="Detecta automáticamente si crear o actualizar contenido")
    parser.add_argument(
        "--input-file", "-i",
        required=True,
        help="Archivo de entrada con texto estructurado"
    )
    parser.add_argument(
        "--api-url", "-a",
        required=True,
        help="URL base de la API"
    )
    parser.add_argument(
        "--force-create", "-c",
        action="store_true",
        help="Forzar la creación de un nuevo contenido aunque exista uno similar"
    )
    parser.add_argument(
        "--force-update", "-u",
        help="ID del contenido a actualizar, ignorando la búsqueda por título"
    )

    args = parser.parse_args()

    # Leer el archivo de entrada
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