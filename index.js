const express = require("express");
const app = express();

const db = require("./db");

app.use(express.static("./public"));

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
