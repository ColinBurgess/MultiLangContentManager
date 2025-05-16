# MultiLangContentManager

A flexible, full-stack web application for managing and organizing multilingual video content across different publishing platforms.

## 🌐 Description

MultiLangContentManager helps content creators streamline their workflow by providing a centralized hub to manage scripts, descriptions, and publishing status for video content in multiple languages. Originally designed for Spanish and English content, it's evolving toward a configurable solution that supports any language combination.

## ✨ Key Features

- Manage content scripts and descriptions in multiple languages
- Track publication status per language with direct access to published content
- Organize content with a tagging system
- Create optimized descriptions for various platforms (YouTube, TikTok, Twitter, Facebook)
- Real-time search functionality
- Copy-to-clipboard functionality for easy content transfer
- Responsive user interface
- User preferences saved via cookies
- MongoDB database for flexible content storage

## 🔍 Perfect For

- YouTube content creators managing multilingual channels
- Social media managers handling content across multiple platforms
- Video production teams working with international audiences
- Anyone needing to organize and track multilingual digital content

## Características 🌟

- Gestión bilingüe de contenido (Español/Inglés)
- Control de estado de publicación por idioma
- Acceso directo a contenido publicado desde la interfaz
- Sistema de etiquetas para categorización
- Búsqueda avanzada en ambos idiomas
- Gestión de enlaces a redes sociales
- Interfaz de usuario responsive
- Seguridad mejorada para credenciales de base de datos
- Preferencias de usuario mediante cookies

## Estructura del Proyecto 📁

```
VideoContentCreationOrganizer/
├── server/
│   ├── server.js         # Configuración principal del servidor
│   ├── routes/
│   │   └── content.js    # Rutas de la API de contenido
│   └── models/
│       └── Content.js    # Modelo de MongoDB
├── client/
│   └── public/
│       ├── index.html    # Página principal
│       ├── new-content.html # Formulario de creación/edición
│       ├── css/
│       │   └── styles.css # Estilos
│       └── js/
│           ├── list.js   # Lógica para la lista de contenidos
│           ├── form.js   # Lógica para el formulario de edición
│           └── utils.js  # Funciones de utilidad
├── utils/
│   ├── credentials.js    # Utilidad de credenciales
│   └── logger.js         # Sistema de logs
├── logs/                 # Archivos de registro
├── scripts/
│   └── encrypt-credentials.js # Script de encriptación
└── package.json         # Dependencias y scripts
```

## Requisitos Previos 📋

- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

## Instalación 🔧

1. Clonar el repositorio:
   ```bash
   git clone [url-del-repositorio]
   cd VideoContentCreationOrganizer
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Editar el archivo `.env` con tus configuraciones.

4. Encriptar las credenciales de MongoDB:
   ```bash
   node scripts/encrypt-credentials.js
   ```
   Sigue las instrucciones en pantalla para configurar las credenciales de manera segura.

## Uso 🚀

1. Iniciar el servidor:
   ```bash
   npm start
   ```

2. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

## Guía de Usuario 📘

### Gestión de Contenido

La aplicación permite gestionar contenido bilingüe para producciones de video:

1. **Vista Principal:**
   - Lista de todos los contenidos disponibles
   - Indicadores de estado de publicación (ES/EN)
   - Filtro de búsqueda en tiempo real

2. **Estados de Publicación:**
   - Indicador verde: Contenido publicado
   - Indicador amarillo: Contenido pendiente
   - Los indicadores verdes son clicables y llevan directamente al contenido publicado

3. **Crear/Editar Contenido:**
   - Formulario completo para todos los campos en ambos idiomas
   - Control de estado de publicación (publicado/pendiente)
   - URLs para acceso directo al contenido publicado
   - Limitadores de caracteres para redes sociales

4. **Visualización:**
   - Vista detallada con toda la información
   - Funcionalidad para copiar contenido al portapapeles
   - Acceso rápido a la edición desde la vista detallada

### Preferencias de Usuario

La aplicación recuerda ciertas preferencias del usuario:

- El mensaje informativo sobre los indicadores ES/EN puede cerrarse
- La preferencia se guarda en una cookie durante 1 año
- Notificaciones temporales al copiar texto al portapapeles

## API Endpoints 🛣️

### Contenido

- `GET /api/contents` - Obtener todos los contenidos
- `POST /api/contents` - Crear nuevo contenido
- `PUT /api/contents/:id` - Actualizar contenido existente
- `PATCH /api/contents/:id` - Actualizar estado de publicación
- `DELETE /api/contents/:id` - Eliminar contenido
- `GET /api/contents/search` - Buscar contenidos

## Modelo de Datos 📊

El modelo de datos incluye campos para:

- Información básica (título, tags)
- Contenido bilingüe (ES/EN)
- Estados de publicación por idioma
- URLs de contenido publicado
- Texto para teleprompter
- Descripciones para diferentes plataformas:
  - YouTube
  - TikTok
  - Twitter (X)
  - Facebook
- Comentarios fijados

## Seguridad 🔒

El proyecto implementa varias medidas de seguridad:

1. **Credenciales Encriptadas:**
   - Las credenciales de MongoDB se almacenan de forma segura
   - Uso de encriptación AES-256-GCM
   - Salt único para cada instalación

2. **Buenas Prácticas:**
   - Variables de entorno para configuración sensible
   - Sanitización de entradas
   - Validación de datos
   - Sistema de logs para auditoría

## Mantenimiento 🔧

### Backup de Base de Datos

1. Exportar datos:
   ```bash
   mongodump --uri="[tu-uri-de-mongodb]" --out=./backup
   ```

2. Importar datos:
   ```bash
   mongorestore --uri="[tu-uri-de-mongodb]" ./backup
   ```

### Actualización

1. Obtener últimos cambios:
   ```bash
   git pull origin main
   ```

2. Actualizar dependencias:
   ```bash
   npm install
   ```

3. Aplicar migraciones si existen:
   ```bash
   npm run migrate
   ```

## Solución de Problemas 🔍

### Problemas Comunes

1. **Error de Conexión a MongoDB:**
   - Verificar que MongoDB está corriendo
   - Comprobar credenciales en .env
   - Verificar conectividad de red

2. **Errores de CORS:**
   - Verificar configuración de CORS en server.js
   - Comprobar origen de las peticiones

3. **Cookies y Preferencias:**
   - Si las preferencias no se guardan, verificar configuración de cookies
   - Limpiar cookies del navegador si hay comportamientos inesperados

## Contribuir 🤝

1. Fork del repositorio
2. Crear rama para feature: `git checkout -b feature/NuevaCaracteristica`
3. Commit cambios: `git commit -am 'Añadir nueva característica'`
4. Push a la rama: `git push origin feature/NuevaCaracteristica`
5. Crear Pull Request

## Licencia 📄

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles