#!/usr/bin/env python3
"""
Test script to demonstrate the automatic detection functionality.
"""
import os
import tempfile
import subprocess

# Create a temporary file with example text
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp:
    temp.write("""1. Teleprompter Script (English)
This is a test script for the auto detection feature.
We're testing automatic content detection to decide between creation and update.

2. Attractive Title (SEO)
Spanish: 🔍 Auto Detection Test
English: 🔍 Auto Detection Test

3. YouTube Description (Spanish)
This script tests the ability to automatically detect whether content already exists
based on the title, and decide whether to create a new one or update the existing one.
""")
    temp_filename = temp.name

print("=== Auto Detection Test ===")
print("This script simulates user interaction to decide between creating or updating.")
print("Note: The API must be available to search for existing content.")
print("\nScenario 1: Simulating that NO content exists with that title (forcing creation):")

# Run the script with --force-create to simulate no matches
cmd = [
    "python3",
    "auto_detect_update.py",
    "-i", temp_filename,
    "-a", "http://localhost:3000/api/contents",
    "--force-create"
]

print("\nEjecutando:", " ".join(cmd))
try:
    subprocess.run(cmd, check=True)
except subprocess.CalledProcessError as e:
    print(f"Error al ejecutar el comando: {e}")

print("\nEscenario 2: Simulando que SÍ existe contenido con ese título (forzando actualización):")

# Ejecutar el script con --force-update para simular una coincidencia
cmd = [
    "python3",
    "auto_detect_update.py",
    "-i", temp_filename,
    "-a", "http://localhost:3000/api/contents",
    "--force-update", "sample12345"
]

print("\nEjecutando:", " ".join(cmd))
try:
    subprocess.run(cmd, check=True)
except subprocess.CalledProcessError as e:
    print(f"Error al ejecutar el comando: {e}")

# Limpiar archivo temporal
os.unlink(temp_filename)
print("\nPrueba completada, archivo temporal eliminado.")
print("\nNota: En una situación real (sin --force-create o --force-update),")
print("se consultaría la API y se permitiría al usuario decidir basado en")
print("las coincidencias encontradas con el título del contenido.")