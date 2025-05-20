#!/usr/bin/env python3
"""
Test script for the updated wordexporter CLI.
"""
import os
import tempfile

# Create a temporary file with test text
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp:
    temp.write("""1. Teleprompter Script (English)
This is a test script for the CLI interface.
We're testing both creation and update functionality.

2. Attractive Title (SEO)
English: 🧪 CLI Test: Creation and Update

3. YouTube Description (English)
This is a CLI test that allows creating and updating content.
It's verifying that both functions operate correctly.
""")
    temp_filename = temp.name

print("=== CLI Test: Create a new entry ===")
os.system(f"python3 parser/cli.py -i {temp_filename} -c http://localhost:3000/api/contents -p")

print("\n\n=== CLI Test: Update an existing entry ===")
os.system(f"python3 parser/cli.py -i {temp_filename} -c http://localhost:3000/api/contents -u --id test12345 -p")

# Clean up temporary file
os.unlink(temp_filename)
print("\nTest completed, temporary file deleted.")