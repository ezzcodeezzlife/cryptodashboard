const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
    querystring: String,
    title: String,
    desc: String,
    publishedAt: String,
    content: String,
    url: String

});

module.exports = mongoose.model('ArticleSchema', newsArticleSchema);

