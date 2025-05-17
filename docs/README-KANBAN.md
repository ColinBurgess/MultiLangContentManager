# Kanban Board - User Guide

The Kanban board is a visual tool for managing tasks related to your content. It allows you to see the workflow of your tasks and track their progress.

## Important Changes

The Kanban board has been redesigned to focus on **managing work tasks** instead of simply reflecting the publication status of content. The main changes are:

1. **New status columns**: The columns now represent progress states in the workflow:
   - **To Do**: Tasks that have not yet started.
   - **In Progress**: Tasks that are currently being worked on.
   - **Completed**: Finished tasks.

2. **Independent tasks**: Tasks are now independent entities that reference content. A task can be "Record English version" for a specific content.

3. **Drag and drop**: You can now move tasks between columns to update their status.

4. **Due date**: Tasks can have a deadline for completion.

## Using the Kanban Board

### Creating a new task

1. Click on the **"New Task"** button in the top right corner.
2. Complete the form:
   - **Task Title**: A clear and descriptive name (e.g., "Record English version").
   - **Task Description**: Detailed information about what needs to be done.
   - **Status**: The current status of the task.
   - **Due Date**: Target date for completing the task.
   - **Related Content**: The content to which this task is associated.
   - **Assigned to**: The person responsible for completing the task.
   - **Tags**: Keywords to group or identify tasks.

### Editing an existing task

1. Click on any card on the board to open the edit form.
2. Update the necessary details.
3. Click on **"Save"** to apply the changes.

### Changing the status of a task

You have two options to change the status:

1. **Drag and drop**: Simply drag the card to the desired column.
2. **Edit the task**: Click on the card and change the status in the form.

### Deleting a task

1. Click on the task to open the edit form.
2. Click on the **"Delete"** button in the bottom left corner.
3. Confirm the deletion when prompted.

## Migration of Existing Data

If you're updating from a previous version, your existing content has been automatically migrated to the new task structure. For each content:

- A task has been created with the title "Manage: [Content Title]"
- The task status has been set based on the previous publication status
- The task description indicates what actions are needed

To migrate manually, you can run the script:

```
./migrate-to-tasks.sh
```

## Differences from the Previous System

In the previous system, the Kanban board simply reflected the publication status of the content, with specific columns for publication in different languages.

The new system is designed to be more flexible and workflow-focused, allowing you to manage specific tasks related to content, not just its publication status.