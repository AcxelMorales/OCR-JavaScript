'use strict';

// Imports
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const {
    createWorker
} = require('tesseract.js');
// const PDFDocument = require('pdfkit');

// Initialize
const app = express();
// const doc = new PDFDocument();
const worker = createWorker({
    logger: (m) => {
        // console.log(Math.floor(m.progress * 100));
        console.log(m);
    }
});

const rectangles = [
    {
        left: 10,
        top: 40,
        width: 300,
        height: 100
    },
    {
        left: 197,
        top: 40,
        width: 240,
        height: 65
    },
    // {
    //     left: 300,
    //     top: 120,
    //     width: 150,
    //     height: 40
    // },
    {
        left: 97,
        top: 130,
        width: 412,
        height: 60
    },
];

// doc.pipe(fs.createWriteStream('tesseract.js-ocr-result.pdf'));

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
        if (!req.file) {
            return res.json({
                ok: false,
                message: 'Not file'
            });
        }

        if (!req.file.mimetype.includes('image')) {
            return res.json({
                ok: false,
                message: 'The file is not a image'
            });
        }

        if (err) return console.log('This is your error', err);

        fs.readFile(`./uploads/${req.file.originalname}`, async (err, data) => {
            if (err) return console.log('This is your error', err);

            await worker.load();
            await worker.loadLanguage('spa');
            await worker.initialize('spa');

            const values = [];
            for (let i = 0; i < rectangles.length; i++) {
                const {
                    data: {
                        text
                    }
                } = await worker.recognize(data, { rectangle: rectangles[i] });

                values.push(text.replace('NICIMENTO', 'NACIMIENTO'));
                console.log(text);
            }

            // doc.image(data, {
            //     fit: [250, 300],
            //     align: 'center',
            //     valign: 'center'
            // });
            // doc
            //     .addPage()
            //     .fontSize(25)
            //     .text(text);
            // doc.end();

            // res.redirect('/download');
            await worker.terminate();

            return res.json({
                ok: true,
                data: values
            });
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