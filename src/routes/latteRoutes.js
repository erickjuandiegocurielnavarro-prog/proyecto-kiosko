const express = require('express');
const router = express.Router();
const latteController = require('../controllers/latteController');

router.get('/', latteController.getLattes);
router.post('/', latteController.createLatte);
router.put('/:id', latteController.updateLatte);
router.delete('/:id', latteController.deleteLatte);

module.exports = router;
