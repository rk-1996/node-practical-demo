'use strict';
const express = require('express');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const passport      = require('passport');
const router = express()
module.exports = router;

const authController = require('./authController');
const userController = require('./userController');


router.use('/auth',authController)
router.use('/user',passport.authenticate('jwt', { session: false }),userController)
