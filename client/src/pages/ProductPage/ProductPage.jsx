import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import './ProductPage.scss';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newComment, setNewComment] = useState({});
    const [formData, setFormData] = useState({
        id: '',
        imageUrl: '',
        name: '',
        count: '',
        size: {
            width: '',
            height: ''
        },
        weight: ''
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortMethod, setSortMethod] = useState('alphabetical');
    const [commentVisibility, setCommentVisibility] = useState({});

    const getProducts = useCallback(async () => {
        try {
            const response = await axios.get('/api/title', {
                headers: { 'Content-Type': 'application/json' }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);

    const createProduct = async () => {
        const { id, imageUrl, name, count, size, weight } = formData;
        if (!name || !count || !weight || !size.width || !size.height) return;
        try {
            const response = await axios.post('/api/title/add', {
                id: parseInt(id, 10),
                imageUrl,
                name,
                count: parseInt(count, 10),
                size: {
                    width: parseInt(size.width, 10), 
                    height: parseInt(size.height, 10) 
                },
                weight,
                comments: []
            });
            setProducts([...products, response.data]);
            setFormData({
                id: '',
                imageUrl: '',
                name: '',
                count: '',
                size: {
                    width: '',
                    height: ''
                },
                weight: ''
            });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const updateProduct = async (id, updatedData) => {
        try {
            const response = await axios.put(`/api/title/update/${id}`, updatedData);
            setProducts(products.map(product => product._id === id ? { ...product, ...updatedData } : product));
            setEditingProduct(null);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const removeProduct = async (id) => {
        try {
            await axios.delete(`/api/title/delete/${id}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setProducts(products.filter(product => product._id !== id));
            setDeletingProduct(null);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleDeleteConfirmation = (product) => {
        setDeletingProduct(product);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            id: product.id,
            imageUrl: product.imageUrl,
            name: product.name,
            count: product.count,
            size: {
                width: product.size.width,
                height: product.size.height
            },
            weight: product.weight
        });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData({
            id: '',
            imageUrl: '',
            name: '',
            count: '',
            size: {
                width: '',
                height: ''
            },
            weight: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'width' || name === 'height') {
            setFormData(prevState => ({
                ...prevState,
                size: {
                    ...prevState.size,
                    [name]: value
                }
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleNewCommentChange = (e, productId) => {
        setNewComment(prevState => ({
            ...prevState,
            [productId]: e.target.value
        }));
    };

    const addComment = async (productId) => {
        try {
            const product = products.find(product => product._id === productId);
            const updatedComments = [...product.comments, newComment[productId].trim()];
            await updateProduct(productId, { comments: updatedComments });
            setNewComment(prevState => ({
                ...prevState,
                [productId]: ''
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const deleteComment = async (productId, commentIndex) => {
        try {
            const product = products.find(product => product._id === productId);
            const updatedComments = product.comments.filter((_, index) => index !== commentIndex);
            await updateProduct(productId, { comments: updatedComments });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const toggleCommentVisibility = (productId) => {
        setCommentVisibility(prevState => ({
            ...prevState,
            [productId]: !prevState[productId]
        }));
    };

    const sortProducts = (products) => {
        let sortedProducts = [...products];
        if (sortMethod === 'alphabetical') {
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMethod === 'count') {
            sortedProducts.sort((a, b) => a.count - b.count);
        }
        return sortedProducts;
    };

    useEffect(() => {
        getProducts();
    }, [getProducts]);

    const chunkArray = (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    const productChunks = chunkArray(sortProducts(products), 4);

    return (
        <div className='product'>
            <div className="product__box">
                <div className="product__box-list">
                    <div className="product__box-list-item">
                        <h3>Product list</h3>
                        <select value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
                            <option value="alphabetical">Alphabetical</option>
                            <option value="count">Count</option>
                        </select>
                        {productChunks.map((chunk, chunkIndex) => (
                            <div key={chunkIndex}>
                                <h4 className='product__box-list-item-number'>Product #{chunkIndex + 1}</h4>
                                <div className='product__box-list-item-container'>
                                    {chunk.map((product, index) => (
                                        <div key={product._id}>
                                            <div className="row flex product-item">
                                                <div className="col product-num">{1 + chunkIndex * 4 + index}</div>
                                                {editingProduct && editingProduct._id === product._id ? (
                                                    <div className="col product-text">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            name="imageUrl"
                                                            value={formData.imageUrl}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="number"
                                                            name="count"
                                                            value={formData.count}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            name="width"
                                                            value={formData.size.width}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            name="height"
                                                            value={formData.size.height}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            name="weight"
                                                            value={formData.weight}
                                                            onChange={handleInputChange}
                                                        />
                                                        <button onClick={() => updateProduct(product._id, formData)} className='confirmEdit-save'>Save</button>
                                                        <button onClick={handleCancelEdit} className='confirmEdit-cancel'>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <div className="col product-text">
                                                        <div><p>Name:</p><span>{product.name}</span></div>
                                                        <div><img src={product.imageUrl} alt="Product" className="product__image"/></div>
                                                        <div><p>Count:</p><span>{product.count}</span></div>
                                                        <div><p>Size:</p><span> W:{product.size.width} x H:{product.size.height}</span></div>
                                                        <div><p>Weight:</p><span>{product.weight} g</span></div>
                                                        <div className='goods-comments'>
                                                            <button onClick={() => toggleCommentVisibility(product._id)}>
                                                                {commentVisibility[product._id] ? 'Hide Comments' : 'Show Comments'}
                                                            </button>
                                                            {commentVisibility[product._id] && (
                                                                <ul>
                                                                    {Array.isArray(product.comments) && product.comments.map((comment, idx) => (
                                                                        <li className='comment-view' key={idx}>
                                                                            <span>{comment}</span>
                                                                            <button onClick={() => deleteComment(product._id, idx)}>❌</button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col product-buttons">
                                                    <button className="edit" onClick={() => handleEditProduct(product)}>✏️</button>
                                                    <button className="delete" onClick={() => handleDeleteConfirmation(product)}>🗑️</button>
                                                </div>
                                                {deletingProduct && deletingProduct._id === product._id && (
                                                    <div className="confirmation-modal">
                                                        <div className="confirmation-back">
                                                            <div>
                                                                <button className="confirm" onClick={() => removeProduct(product._id)}>Confirm</button>
                                                                <button className="cancel" onClick={() => setDeletingProduct(null)}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col comment-section">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment"
                                                        value={newComment[product._id] || ''}
                                                        onChange={(e) => handleNewCommentChange(e, product._id)}
                                                    />
                                                    <button onClick={() => addComment(product._id)}>Add Comment</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button className="product-add-button" onClick={() => setIsAddModalOpen(true)}>
                            Add New Product
                        </button>
                        {isAddModalOpen && (
                            <div className="add-modal">
                                <div className="add-modal-content">
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="id">ID</label>
                                            <input
                                                type="number"
                                                id="id"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="name">Product Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="imageUrl">Image URL</label>
                                            <input
                                                type="text"
                                                id="imageUrl"
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="count">Count</label>
                                            <input
                                                type="number"
                                                id="count"
                                                name="count"
                                                value={formData.count}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="width">Width</label>
                                            <input
                                                type="text"
                                                id="width"
                                                name="width"
                                                value={formData.size.width}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="height">Height</label>
                                            <input
                                                type="text"
                                                id="height"
                                                name="height"
                                                value={formData.size.height}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col s12">
                                            <label htmlFor="weight">Weight</label>
                                            <input
                                                type="text"
                                                id="weight"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="buttons-row">
                                        <button className="confirm" onClick={createProduct}>Add</button>
                                        <button className="cancel" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
