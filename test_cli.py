#!/usr/bin/env python3
"""
Script de prueba para el CLI actualizado de wordexporter.
"""
import os
import tempfile

# Crear un archivo temporal con texto de ejemplo
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp:
    temp.write("""1. Script de Teleprompter (Inglés)
This is a test script for the CLI interface.
We're testing both creation and update functionality.

2. Título Atractivo (SEO)
Español: 🧪 Prueba de CLI: Creación y Actualización
Inglés: 🧪 CLI Test: Creation and Update

3. Descripción para YouTube (Español)
Esta es una prueba del CLI que permite crear y actualizar contenido.
Estamos verificando que ambas funciones operen correctamente.
""")
    temp_filename = temp.name

print("=== Prueba CLI: Crear una nueva entrada ===")
os.system(f"python3 parser/cli.py -i {temp_filename} -c http://localhost:3000/api/contents -p")

print("\n\n=== Prueba CLI: Actualizar una entrada existente ===")
os.system(f"python3 parser/cli.py -i {temp_filename} -c http://localhost:3000/api/contents -u --id test12345 -p")

# Limpiar archivo temporal
os.unlink(temp_filename)
print("\nPrueba completada, archivo temporal eliminado.")