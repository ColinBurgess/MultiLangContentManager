#!/usr/bin/env python3
"""
Script de prueba para demostrar la función de detección automática.
"""
import os
import tempfile
import subprocess

# Crear un archivo temporal con texto de ejemplo
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as temp:
    temp.write("""1. Script de Teleprompter (Inglés)
This is a test script for the auto detection feature.
We're testing automatic content detection to decide between creation and update.

2. Título Atractivo (SEO)
Español: 🔍 Prueba de Detección Automática
Inglés: 🔍 Auto Detection Test

3. Descripción para YouTube (Español)
Este script prueba la capacidad de detectar automáticamente si un contenido ya existe
basándose en el título, y decidir si crear uno nuevo o actualizar el existente.
""")
    temp_filename = temp.name

print("=== Prueba de Detección Automática ===")
print("Este script simula la interacción del usuario para decidir entre crear o actualizar.")
print("Tenga en cuenta que la API debe estar disponible para buscar contenidos existentes.")
print("\nEscenario 1: Simulando que NO existe contenido con ese título (forzando creación):")

# Ejecutar el script con --force-create para simular que no hay coincidencias
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