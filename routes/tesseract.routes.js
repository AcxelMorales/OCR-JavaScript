'use strict';

const { Router } = require('express');

const tesseractController = require('../controllers/tesseract.controller');

const router = Router();

router.get('/', tesseractController.getView);

router.post('/upload', tesseractController.postImage);

module.exports = router;