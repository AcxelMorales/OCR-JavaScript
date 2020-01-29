'use strict';

// Imports
const express = require('express');

// Initialize
const app = express();

// Configs
app.set('view engine', 'ejs');

const PORT = 3000 || process.env.PORT;

// Routes
app.use(require('./routes/tesseract.routes'));

// Listener
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});