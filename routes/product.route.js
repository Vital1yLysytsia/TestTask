const { Router } = require('express');
const router = Router();
const Product = require('../models/Product');

router.post('/add', async (req, res) => {
    try {
        const { id, imageUrl, name, count, size, weight, comments } = req.body;

        const product = new Product({
            id,
            imageUrl,
            name,
            count,
            size,
            weight,
            comments
        });

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();

        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const { id, imageUrl, name, count, size, weight, comments } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { id, imageUrl, name, count, size, weight, comments },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
