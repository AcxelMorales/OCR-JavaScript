'use strict';

const fs = require('fs');
const { createWorker } = require('tesseract.js');

const upload = require('../storage/storage');
const rectangles = require('../utils/rectangles.utils');

const worker = createWorker({
    logger: (m) => console.log(m)
});

exports.getView = (req, res) => {
    res.render('index');
};

exports.postImage = (req, res) => {
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
            await worker.terminate();

            return res.json({
                ok: true,
                data: values
            });
        });
    });
}