const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    name: { type: String, required: true },
    count: { type: Number, required: true },
    size: {
        width: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    weight: { type: String, required: true },
    comments: { type: [String], required: true }
});

module.exports = mongoose.model('Product', productSchema);
