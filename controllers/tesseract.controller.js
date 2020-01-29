'use strict';

const fs = require('fs');
const {
    createWorker
} = require('tesseract.js');
const worker = createWorker({
    logger: (m) => {
        // console.log(Math.floor(m.progress * 100));
        console.log(m);
    }
});

const upload = require('../storage/storage');

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
    //     left: 197,
    //     top: 73,
    //     width: 200,
    //     height: 60
    // },
    {
        left: 97,
        top: 130,
        width: 412,
        height: 60
    },
    {
        left: -3,
        top: 180,
        width: 582,
        height: 50
    },
    {
        left: -3,
        top: 200,
        width: 500,
        height: 60
    }
];

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