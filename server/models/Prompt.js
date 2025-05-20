const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the 'updatedAt' field on save
promptSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for search
promptSchema.index({
    title: 'text',
    description: 'text',
    body: 'text',
    tags: 'text'
});

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;