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
Spanish:
This is a teleprompter example in Spanish.
English:
This is an example of teleprompter in English.

Video Description
Spanish:
Video description in Spanish.
English:
Video description in English.

Tag List
Spanish:
tag1_es, tag2_es, tag3_es, tag4_es
English:
tag1_en, tag2_en, tag3_en, tag4_en

Pinned Comment
Spanish:
Pinned comment in Spanish.
English:
Comment in English to pin.

Simplified TikTok Description
Spanish:
TikTok in Spanish #example
English:
TikTok in English #example

X Post
Spanish:
X post in Spanish #example
English:
X post in English #example

Facebook Post Description
Spanish:
Facebook post in Spanish.
English:
Facebook post in English."""

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