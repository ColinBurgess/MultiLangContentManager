#!/bin/bash

echo "Starting migration from content to tasks..."
node server/scripts/migrateToTasks.js

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Migration failed. Check the logs for more information."
fi