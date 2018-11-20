const express = require("express");
const app = express();
const db = require("./db");
var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");
const s3 = require("./s3.js");

// boilerplate for file upload
var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
// end boilerplate file upload

app.use(express.static("./public"));
app.use(express.static("./uploads"));

app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    // property 'file' will be added to req object
    if (req.file) {
        console.log("req.file.filename: ", req.file.filename);
        console.log("req.body: ", req.body);
        db.saveUploads(
            "https://s3.amazonaws.com/spicedling/" + req.file.filename,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(function(results) {
                console.log("results:", results);
                res.json({
                    newImage: results[0],
                    success: true
                }),
                console.log("data saved and sent to frontend");
            })
            .catch(err => {
                console.log("error in POST /uploads if statement: ", err);
            });
    } else {
        res.json({
            success: false
        }),
        console.log("upload did not work");
    }
});

app.get("/imageboard", (req, res) => {
    console.log("hi");
    db.getImages()
        .then(results => {
            var imagesArr = results;
            console.log(imagesArr);
            res.json(imagesArr);
        })
        .catch(err => {
            console.log("error in GET/: ", err);
        });
});

app.listen(8080, () => console.log("listening!"));
