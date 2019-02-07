const express = require("express");
const app = express();
const db = require("./db");
var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");
const s3 = require("./s3.js");
const moment = require("moment");
const bodyparser = require("body-parser");
app.use(bodyparser.json());

// file upload
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
// end file upload

app.use(express.static("./public"));
app.use(express.static("./uploads"));

app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
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
                console.log("error in POST /upload if statement: ", err);
            });
    } else {
        res.json({
            success: false
        }),
        console.log("upload did not work");
    }
});

app.post("/upload/tag", (req, res) => {
    db.saveTag(req.body.tag, req.body.image_id)
        .then(results => {
            res.json({
                newTag: results[0]
            });
        })
        .catch(err => {
            console.log("error in POST /upload/tag: ", err);
        });
});

app.get("/imageboard", (req, res) => {
    db.getImages()
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log("error in GET/imageboard ", err);
        });
});

app.get("/imageboard/:id", (req, res) => {
    db.checkId(req.params.id)
        .then(results => {
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
            res.json(results);
        })
        .catch(err => {
            console.log("error in GET/get-more-images ", err);
        });
});

app.get("/imageboard/filter/:tag", (req, res) => {
    var tag = req.params.tag;
    db.filterByTag(tag)
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log("error in GET/imageboard/filter/:tag ", err);
        });
});

app.get("/singleImage/:imageId", (req, res) => {
    Promise.all([
        db.getSelectedImage(req.params.imageId),
        db.getComments(req.params.imageId)
    ])
        .then((selectedImage, comments) => {
            selectedImage[0][0].created_at = moment(
                selectedImage[0][0].created_at
            ).format("MMMM Do YYYY, h:mm a");
            comments = selectedImage[1];
            comments.forEach(comment => {
                comment.created_at = moment(comment.created_at).fromNow();
            });

            res.json({
                selectedImage: selectedImage,
                comments: comments
            });
        })
        .catch(err => {
            console.log("error in GET/singleimage: ", err);
        });
});

app.post("/singleImage/:imageId", (req, res) => {
    db.saveComment(req.body.comment, req.body.username, req.params.imageId)
        .then(results => {
            results.forEach(comment => {
                comment.created_at = moment(comment.created_at).fromNow();
                return results;
            });
            res.json({
                newComment: results[0]
            });
        })
        .catch(err => {
            console.log("error in POST saving comments: ", err);
        });
});

app.listen(8080, () => console.log("listening!"));
