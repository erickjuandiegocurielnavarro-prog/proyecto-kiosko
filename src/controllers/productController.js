const Product = require('../models/Product');

exports.getProducts = (req, res) => {
  res.json(Product.getAllProducts());
};
