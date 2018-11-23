const express = require("express");
const app = express();
const db = require("./db");
var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");
const s3 = require("./s3.js");

const bodyparser = require("body-parser");
app.use(bodyparser.json());

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
        db.saveUploads(
            "https://s3.amazonaws.com/spicedling/" + req.file.filename,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(function(results) {
                res.json({
                    newImage: results[0],
                    success: true
                });
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
    db.getImages()
        .then(results => {
            var imagesArr = results;
            // console.log(imagesArr);
            res.json(imagesArr);
        })
        .catch(err => {
            console.log("error in GET/imageboard ", err);
        });
});

app.get("/imageboard/:id", (req, res) => {
    console.log("req.params.id", req.params.id);
    db.checkId(req.params.id)
        .then(results => {
            console.log("results in checkId: ", results);
            res.json(results);
        })
        .catch((err, results) => {
            console.log("error in GET/checkId ", err);
            res.json(results);
        });
});

app.get("/get-more-images/:id", (req, res) => {
    var lastId = req.params.id;
    db.getMoreImages(lastId)
        .then(results => {
            console.log(results);
            res.json(results);
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/singleImage/:imageId", (req, res) => {
    Promise.all([
        db.getSelectedImage(req.params.imageId),
        db.getComments(req.params.imageId)
    ])
        .then((selectedImage, comments) => {
            res.json({
                selectedImage: selectedImage,
                comments: comments
            });
        })
        .catch(err => {
            console.log("error in GET/singleimage image: ", err);
        });
});

app.post("/singleImage/:imageId", (req, res) => {
    console.log(
        "req.body und req.params in post comment: ",
        req.body,
        req.params.imageId
    );
    db.saveComment(req.body.comment, req.body.username, req.params.imageId)
        .then(results => {
            res.json({
                newComment: results[0]
            });
        })
        .catch(err => {
            console.log("error in POST saving comments: ", err);
        });
});

app.listen(8080, () => console.log("listening!"));
