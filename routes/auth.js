const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');


router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleAuthCallback
);

router.get('/logout', authController.logout);

module.exports = router;

