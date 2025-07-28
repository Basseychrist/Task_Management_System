const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth } = require('../middleware/auth');


router.get('/:id', ensureAuth, userController.getUserProfile);

module.exports = router;
