const express = require('express');
const router = express.Router();
const multer = require('multer');
const RegistrationController = require('../controller/RegistrationController'); // Ensure the path is correct

// Define the route for user sign-up
router.post('/sign-up', RegistrationController.registeruser);

module.exports = router;
