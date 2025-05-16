const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'in-progress', 'done'],
        default: 'draft'
    },
    dueDate: {
        type: Date,
        default: null
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        required: true
    },
    contentTitle: {
        type: String,
        trim: true
    },
    assignee: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índices para búsqueda
taskSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text'
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;