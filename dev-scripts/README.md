# Development Scripts

Este directorio contiene scripts de desarrollo para el proyecto MultiLangContentManager. Están organizados por categorías para facilitar su uso y mantenimiento.

## 🗂️ Estructura

```
dev-scripts/
├── migrations/     # Scripts de migración de base de datos
├── testing/        # Scripts para testing y datos de prueba
└── README.md       # Este archivo
```

## 🔄 Migrations (Migraciones)

Scripts para migrar y actualizar datos de la base de datos de manera segura.

### `migrations/migrate-platform-data.js`
**Propósito:** Migra contenido existente para usar la nueva estructura de `platformStatus` específica por plataforma.

**Cuándo usar:** Después de actualizar el modelo de datos para soportar estados específicos por plataforma.

**Uso:**
```bash
cd /ruta/del/proyecto
node dev-scripts/migrations/migrate-platform-data.js
```

**Qué hace:**
- Encuentra contenido sin estructura `platformStatus`
- Migra estados existentes (`statusEs`/`statusEn`) a YouTube como plataforma principal
- Inicializa todas las demás plataformas como `pending`
- Mantiene compatibilidad hacia atrás

### `migrations/migrate-statuses.js`
**Propósito:** Migra campos booleanos `publishedEs`/`publishedEn` a estados más descriptivos.

**Uso:**
```bash
node dev-scripts/migrations/migrate-statuses.js
```

**Qué hace:**
- Convierte `publishedEs: true` → `statusEs: 'published'`
- Convierte `publishedEs: false` → `statusEs: 'pending'`
- Lo mismo para campos EN

### `migrations/safe-migrate-status.js`
**Propósito:** Versión segura del script anterior con backup y capacidad de rollback.

**Uso:**
```bash
# Migrar con backup
node dev-scripts/migrations/safe-migrate-status.js migrate

# Revertir cambios (si algo sale mal)
node dev-scripts/migrations/safe-migrate-status.js rollback
```

**Características:**
- ✅ Crea backup automático antes de migrar
- ✅ Permite rollback completo
- ✅ Verificaciones de seguridad
- ✅ Confirmación del usuario

## 🧪 Testing (Pruebas)

Scripts para generar datos de prueba y analizar la estructura de la base de datos.

### `testing/safe-insert-test-data.js`
**Propósito:** Inserta datos de prueba de manera segura para testing.

**Uso:**
```bash
node dev-scripts/testing/safe-insert-test-data.js
```

**Características:**
- ✅ Verifica datos existentes antes de insertar
- ✅ Crea backup automático si hay datos
- ✅ Pregunta confirmación al usuario
- ✅ Opción de limpiar datos existentes

**Datos que inserta:**
- 4 contenidos de ejemplo con diferentes estados
- Combinaciones de `published`/`pending` para ES/EN
- Estados `in-progress` para testing

### `testing/insert-test-data.js`
**Propósito:** Versión simple para insertar datos de prueba rápidamente.

**Uso:**
```bash
node dev-scripts/testing/insert-test-data.js
```

**⚠️ Atención:** No hace backup, úsalo solo en bases de datos de desarrollo.

### `testing/list-database-structure.js`
**Propósito:** Analiza y muestra la estructura completa de la base de datos.

**Uso:**
```bash
node dev-scripts/testing/list-database-structure.js
```

**Qué muestra:**
- Todas las colecciones en la base de datos
- Número de documentos por colección
- Estructura de campos de cada documento
- Ejemplos de datos para entender el esquema

## 🚀 Cómo Usar estos Scripts

### Prerrequisitos
1. Node.js instalado
2. MongoDB ejecutándose
3. Variables de entorno configuradas (`.env`)

### Variables de Entorno Necesarias
```env
MONGODB_URI=mongodb://localhost:27017/video-content-organizer
```

### Orden Recomendado para Nuevo Setup

1. **Analizar estructura actual:**
   ```bash
   node dev-scripts/testing/list-database-structure.js
   ```

2. **Insertar datos de prueba (si es necesario):**
   ```bash
   node dev-scripts/testing/safe-insert-test-data.js
   ```

3. **Migrar a nueva estructura (si es necesario):**
   ```bash
   node dev-scripts/migrations/safe-migrate-status.js migrate
   node dev-scripts/migrations/migrate-platform-data.js
   ```

### Para Desarrollo Diario

- **Limpiar y resetear datos:** Use `safe-insert-test-data.js`
- **Verificar estructura:** Use `list-database-structure.js`
- **Migrar cambios:** Use scripts de `migrations/`

## ⚠️ Importante

- **SIEMPRE** haz backup antes de ejecutar scripts de migración en producción
- Prueba todos los scripts en un entorno de desarrollo primero
- Los scripts `safe-*` son más seguros pero más lentos
- Verifica que las variables de entorno apunten a la base de datos correcta

## 🔧 Mantenimiento

- Cuando agregues nuevos scripts, documéntalos aquí
- Incluye el propósito, uso, y qué hace exactamente
- Marca scripts obsoletos y explica las alternativas
- Actualiza este README cuando cambien los procedimientos

## 📝 Logs

Los scripts generan logs detallados. Revísalos si algo falla:
- ✅ = Operación exitosa
- ❌ = Error que requiere atención
- ⚠️ = Advertencia, revisar pero no crítico