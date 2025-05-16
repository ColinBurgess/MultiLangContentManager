# Tablero Kanban - Guía de Uso

El tablero Kanban es una herramienta visual para gestionar tareas relacionadas con tus contenidos. Te permite ver el flujo de trabajo de tus tareas y seguir su progreso.

## Cambios Importantes

El tablero Kanban ha sido rediseñado para enfocarse en **gestionar tareas de trabajo** en lugar de simplemente reflejar el estado de publicación de los contenidos. Los principales cambios son:

1. **Nuevas columnas de estado**: Las columnas ahora representan estados de progreso en el flujo de trabajo:
   - **Por Hacer**: Tareas que aún no han comenzado.
   - **En Progreso**: Tareas que se están trabajando actualmente.
   - **Completado**: Tareas finalizadas.

2. **Tareas independientes**: Las tareas ahora son entidades independientes que hacen referencia a un contenido. Una tarea puede ser "Grabar versión en inglés" para un contenido específico.

3. **Arrastrar y soltar**: Ahora puedes mover tareas entre las columnas para actualizar su estado.

4. **Fecha límite**: Las tareas pueden tener una fecha límite para su finalización.

## Usando el Tablero Kanban

### Crear una nueva tarea

1. Haz clic en el botón **"Nueva Tarea"** en la esquina superior derecha.
2. Completa el formulario:
   - **Título de la Tarea**: Un nombre claro y descriptivo (ej. "Grabar versión en inglés").
   - **Descripción de la Tarea**: Información detallada sobre lo que hay que hacer.
   - **Estado**: El estado actual de la tarea.
   - **Fecha Límite**: Fecha objetivo para completar la tarea.
   - **Contenido Relacionado**: El contenido al que está asociada esta tarea.
   - **Asignado a**: La persona responsable de completar la tarea.
   - **Etiquetas**: Palabras clave para agrupar o identificar tareas.

### Editar una tarea existente

1. Haz clic en cualquier tarjeta del tablero para abrir el formulario de edición.
2. Actualiza los detalles necesarios.
3. Haz clic en **"Guardar"** para aplicar los cambios.

### Cambiar el estado de una tarea

Tienes dos opciones para cambiar el estado:

1. **Arrastrar y soltar**: Simplemente arrastra la tarjeta a la columna deseada.
2. **Editar la tarea**: Haz clic en la tarjeta y cambia el estado en el formulario.

### Eliminar una tarea

1. Haz clic en la tarea para abrir el formulario de edición.
2. Haz clic en el botón **"Eliminar"** en la esquina inferior izquierda.
3. Confirma la eliminación cuando se te solicite.

## Migración de Datos Existentes

Si estás actualizando desde una versión anterior, tus contenidos existentes se han migrado automáticamente a la nueva estructura de tareas. Para cada contenido:

- Se ha creado una tarea con el título "Gestionar: [Título del contenido]"
- El estado de la tarea se ha establecido en base al estado de publicación anterior
- La descripción de la tarea indica qué acciones son necesarias

Para migrar manualmente, puedes ejecutar el script:

```
./migrate-to-tasks.sh
```

## Diferencias con el Sistema Anterior

En el sistema anterior, el tablero Kanban simplemente reflejaba el estado de publicación de los contenidos, con columnas específicas para la publicación en diferentes idiomas.

El nuevo sistema está diseñado para ser más flexible y enfocado en el flujo de trabajo, permitiéndote gestionar tareas específicas relacionadas con un contenido, no solo su estado de publicación.