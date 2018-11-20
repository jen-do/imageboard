const spicedPg = require("spiced-pg");

var db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

exports.getImages = function() {
    return db
        .query(
            `SELECT * FROM images
            ORDER BY id DESC`
        )
        .then(function(results) {
            return results.rows;
        });
};

exports.saveUploads = function(file, username, title, description) {
    return db
        .query(
            `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING url, username, title, description`,
            [file, username, title, description]
        )
        .then(function(results) {
            return results.rows;
        });
};
