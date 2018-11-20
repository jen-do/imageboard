const spicedPg = require("spiced-pg");

var db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

exports.getImages = function() {
    return db.query(`SELECT * FROM images`).then(function(results) {
        return results.rows;
    });
};
