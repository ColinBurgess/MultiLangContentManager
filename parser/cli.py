#!/usr/bin/env python3
"""
Command-line interface for the wordexporter parser.
"""
import argparse
import json
import sys
from wordexporter import parse_word_text, generate_curl_command

def main():
    parser = argparse.ArgumentParser(description="Parse structured text from Word documents to JSON format")
    parser.add_argument(
        "--input-file", "-i",
        help="Input file containing structured text (if not provided, read from stdin)"
    )
    parser.add_argument(
        "--output-file", "-o",
        help="Output file for JSON result (if not provided, print to stdout)"
    )
    parser.add_argument(
        "--curl", "-c",
        help="Generate curl command with the given API URL"
    )
    parser.add_argument(
        "--pretty", "-p",
        action="store_true",
        help="Pretty-print the JSON output"
    )

    args = parser.parse_args()

    # Read input
    if args.input_file:
        try:
            with open(args.input_file, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading input file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print("Enter your structured text (Ctrl+D to finish):", file=sys.stderr)
        text = sys.stdin.read()

    # Parse text
    try:
        parsed_data = parse_word_text(text)
    except Exception as e:
        print(f"Error parsing text: {e}", file=sys.stderr)
        sys.exit(1)

    # Format output
    indent = 2 if args.pretty else None
    json_output = json.dumps(parsed_data, indent=indent, ensure_ascii=False)

    # Generate curl command if requested
    if args.curl:
        curl_cmd = generate_curl_command(parsed_data, args.curl)

    # Write output
    if args.output_file:
        try:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                f.write(json_output)
                if args.curl:
                    f.write("\n\n# curl command:\n")
                    f.write(curl_cmd)
        except Exception as e:
            print(f"Error writing output file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(json_output)
        if args.curl:
            print("\n# curl command:")
            print(curl_cmd)

if __name__ == "__main__":
    main()