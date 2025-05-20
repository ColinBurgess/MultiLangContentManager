#!/bin/bash
curl -X POST http://localhost:3000/api/contents \
  -H "Content-Type: application/json" \
  -d '{
  "title": "🔍 Prueba de Detección Automática",
  "publishedEs": false,
  "publishedEn": false,
  "publishedDateEs": null,
  "publishedDateEn": null,
  "publishedUrlEs": "",
  "publishedUrlEn": "",
  "teleprompterEs": "",
  "teleprompterEn": "This is a test script for the auto detection feature.\nWe'\''re testing automatic content detection to decide between creation and update.",
  "videoDescriptionEs": "Este script prueba la capacidad de detectar automáticamente si un contenido ya existe\nbasándose en el título, y decidir si crear uno nuevo o actualizar el existente.",
  "videoDescriptionEn": "",
  "tagsListEs": "",
  "tagsListEn": "",
  "pinnedCommentEs": "",
  "pinnedCommentEn": "",
  "tiktokDescriptionEs": "",
  "tiktokDescriptionEn": "",
  "twitterPostEs": "",
  "twitterPostEn": "",
  "facebookDescriptionEs": "",
  "facebookDescriptionEn": "",
  "tags": []
}'