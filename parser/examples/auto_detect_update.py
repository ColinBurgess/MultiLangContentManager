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
        print("WARNING: No title found in analyzed text.", file=sys.stderr)

    # Determinar si crear o actualizar
    content_id = None
    action = "CREATE"

    if args.force_update:
        # Si se especificó un ID para actualizar, usarlo
        content_id = args.force_update
        action = "UPDATE"
    elif not args.force_create and title:
        # Search for existing content with that title
        print(f"Searching for content with title: {title}")
        existing_content = search_content_by_title(args.api_url, title)

        if existing_content:
            content_id = existing_content.get("_id")
            print(f"Found existing content with ID: {content_id}")
            print(f"Existing title: {existing_content.get('title')}")

            # Ask the user if they want to update
            response = input("Would you like to update this content? (y/n): ").lower()
            if response == 'y' or response == 'yes':
                action = "UPDATE"
            else:
                print("A new content will be created.")
                action = "CREATE"

    # Generate the appropriate curl command
    # Generar el comando curl adecuado
    if action == "UPDATE" and content_id:
        print(f"\nGenerating command to UPDATE content with ID: {content_id}")
        curl_command = generate_update_curl_command(parsed_data, args.api_url, content_id)
    else:
        print("\nGenerating command to CREATE new content")
        curl_command = generate_curl_command(parsed_data, args.api_url)

    print("\n=== Generated curl command ===")
    print(curl_command)

    # Guardar el comando en un archivo
    output_filename = "update_command.sh" if action == "UPDATE" else "create_command.sh"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write("#!/bin/bash\n")
        f.write(curl_command)

    # Hacer el archivo ejecutable
    import os
    os.chmod(output_filename, 0o755)

    print(f"\nThe command has been saved to '{output_filename}' and made executable.")
    print(f"You can run it with: ./{output_filename}")

if __name__ == "__main__":
    main()