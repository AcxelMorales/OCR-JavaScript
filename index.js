'use strict';

// Imports
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const {
    createWorker
} = require('tesseract.js');
const PDFDocument = require('pdfkit');

// Initialize
const app = express();
const doc = new PDFDocument();
const worker = createWorker({
    logger: (m) => console.log(m)
});

doc.pipe(fs.createWriteStream('tesseract.js-ocr-result.pdf'));

// Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage
}).single('avatar');

// Configs
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, async (err, data) => {
            if (err) return console.log('This is your error', err);

            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const {
                data: {
                    text
                }
            } = await worker.recognize(data);

            doc.image(data, {
                fit: [250, 300],
                align: 'center',
                valign: 'center'
            });
            doc
                .addPage()
                .fontSize(25)
                .text(text);
            doc.end();

            // res.send(text);
            res.redirect('/download');
            await worker.terminate();
        });
    });
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

// Listener
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});