# Word Document Parser

This Python module allows parsing structured text (like that exported from Word) and transforming it into JSON format for insertion or updating in the MultiLangContentManager database.

## Features

- Parses structured text with two supported formats:
  - Original format with sections: "Teleprompter", "Video Description", etc.
  - Numbered format: "1. Teleprompter Script", "2. Attractive Title", etc.
- Extracts bilingual content (Spanish/English)
- Generates curl commands for the API
- Supports both creating new content and updating existing content
- Allows automatic detection of existing content by title

## Installation

```bash
# Clone the main repository
git clone [repository-url]
cd MultiLangContentManager

# Install parser dependencies
pip install -r parser/requirements.txt
```

## Usage

### 1. Basic CLI (cli.py)

The most common way to use the parser:

```bash
# Basic usage (reads from stdin, displays to stdout)
python parser/cli.py

# Parse from a file with formatted output
python parser/cli.py -i input_file.txt -p

# Parse and generate curl command to create content
python parser/cli.py -i input_file.txt -c http://localhost:3000/api/contents

# Parse and generate curl command to update existing content
python parser/cli.py -i input_file.txt -c http://localhost:3000/api/contents -u --id abc123
```

#### Command Line Options

- `--input-file` or `-i`: Input file with structured text
- `--output-file` or `-o`: Output file to save the JSON result
- `--curl` or `-c`: API URL to generate curl command
- `--update` or `-u`: Generate curl command to update (requires --id)
- `--id`: ID of the content to update
- `--pretty` or `-p`: Format JSON with indentation

### 2. Automatic Detection (auto_detect_update.py)

Script to automatically detect if content already exists based on the title:

```bash
# Automatically detect whether to create or update
python auto_detect_update.py -i input_file.txt -a http://localhost:3000/api/contents

# Force creation even if similar content exists
python auto_detect_update.py -i input_file.txt -a http://localhost:3000/api/contents --force-create

# Force update of a specific ID
python auto_detect_update.py -i input_file.txt -a http://localhost:3000/api/contents --force-update abc123
```

#### Command Line Options

- `--input-file` or `-i`: Input file with structured text
- `--api-url` or `-a`: Base URL of the API
- `--force-create` or `-c`: Force creation of new content even if similar exists
- `--force-update` or `-u`: ID of the content to update, ignoring title search

### 3. wordexporter.py Module

While it's recommended to use cli.py or auto_detect_update.py, it's also possible to use wordexporter.py directly:

```bash
# Run the module directly
python parser/wordexporter.py
```

When run directly, wordexporter.py:
- Prompts for text input via console
- Parses the text
- Generates a curl command using a predefined URL (http://localhost:3000/api/contents)

## Supported Input Formats

### Original Format with Sections

```
Teleprompter
Spanish:
[Your Spanish script here]

English:
[Your English script here]

Video Description
Spanish:
[Your Spanish description here]

English:
[Your English description here]

...
```

### Numbered Format

```
1. Teleprompter Script (English)
[Your English script here]

2. Attractive Title (SEO)
Spanish: [Title in Spanish]
English: [Title in English]

3. YouTube Description (Spanish)
[Your Spanish description here]

...
```

## API

The main functions of the module are:

- `parse_word_text(text_block)`: Parses structured text and returns a dictionary with the data
- `generate_curl_command(parsed_data, api_url)`: Generates a curl command to create new content
- `generate_update_curl_command(parsed_data, api_url, content_id)`: Generates a curl command to update existing content

## Test Scripts

Test scripts are also available to verify functionality:

```bash
# Test the basic CLI (create and update)
python test_cli.py

# Test automatic detection
python test_auto_detect.py
```

## Requirements

- Python 3.6+
- `requests` module (for auto_detect_update.py)