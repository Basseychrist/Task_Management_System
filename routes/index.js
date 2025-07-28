const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth'); // Import the middleware


router.get('/', ensureGuest, (req, res) => {
  res.render('index', { layout: 'login', title: 'Welcome to Task Manager' }); // Pass layout and title
});


router.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard', { title: 'Dashboard' }); // Pass title
});

module.exports = router;

