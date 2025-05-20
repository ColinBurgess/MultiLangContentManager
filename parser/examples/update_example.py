import json
from parser.wordexporter import parse_word_text, generate_update_curl_command

# Example usage to update existing content
print("== Example of updating existing content ==")

# ID of the content you want to update
content_id = "64a7c2e5f1b5e3d2c1a9b8f7"  # Replace with the actual content ID

# Text with new content
update_text = """1. Teleprompter Script (English)
This is an updated version of the script with some new information.
We're demonstrating how to update existing content.

2. Attractive Title (SEO)
English: Updated Content: New Version of the Article

3. YouTube Description (English)
This is an updated version of our previous description.
We've added new information and corrected some errors.
"""

# Analyze the text with the parser
parsed_data = parse_word_text(update_text)

# URL base de la API
api_url = "http://localhost:3000/api/contents"

# Generate cURL command for update
curl_command = generate_update_curl_command(parsed_data, api_url, content_id)

print("\nCurl command to update existing content:")
print(curl_command)

print("\n== Instructions for use ==")
print("1. Replace the ID '64a7c2e5f1b5e3d2c1a9b8f7' with the actual ID of your content")
print("2. If needed, update the API URL according to your environment")
print("3. Execute the curl command in your terminal to update the content")
print("4. You can also save the command in a .sh file and execute it:")

# Guardar el comando en un archivo para facilitar su uso
with open("update_curl_command.txt", "w", encoding="utf-8") as f:
    f.write(curl_command)

print("\nEl comando curl se ha guardado en 'update_curl_command.txt' para su uso posterior.")