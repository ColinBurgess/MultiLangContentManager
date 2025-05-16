const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    // Publication status and URLs
    publishedEs: {
        type: Boolean,
        default: false
    },
    publishedEn: {
        type: Boolean,
        default: false
    },
    publishedUrlEs: {
        type: String,
        trim: true,
        default: ''
    },
    publishedUrlEn: {
        type: String,
        trim: true,
        default: ''
    },
    // Teleprompter
    teleprompterEs: {
        type: String,
        trim: true
    },
    teleprompterEn: {
        type: String,
        trim: true
    },
    // Video description
    videoDescriptionEs: {
        type: String,
        trim: true
    },
    videoDescriptionEn: {
        type: String,
        trim: true
    },
    // Tags list (500 chars)
    tagsListEs: {
        type: String,
        trim: true,
        maxlength: 500
    },
    tagsListEn: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Pinned comment
    pinnedCommentEs: {
        type: String,
        trim: true
    },
    pinnedCommentEn: {
        type: String,
        trim: true
    },
    // TikTok description
    tiktokDescriptionEs: {
        type: String,
        trim: true
    },
    tiktokDescriptionEn: {
        type: String,
        trim: true
    },
    // X (Twitter) post - maximum 180 characters
    twitterPostEs: {
        type: String,
        trim: true,
        maxlength: 180
    },
    twitterPostEn: {
        type: String,
        trim: true,
        maxlength: 180
    },
    // Facebook description
    facebookDescriptionEs: {
        type: String,
        trim: true
    },
    facebookDescriptionEn: {
        type: String,
        trim: true
    },
    // Tags for search and categorization
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for search
contentSchema.index({
    title: 'text',
    tags: 'text',
    videoDescriptionEs: 'text',
    videoDescriptionEn: 'text',
    teleprompterEs: 'text',
    teleprompterEn: 'text'
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;