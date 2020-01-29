'use strict';

// Imports
const express = require('express');

// Initialize
const app = express();

// Configs
app.set('view engine', 'ejs');

// Routes
app.use(require('./routes/tesseract.routes'));

// Listener
const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});