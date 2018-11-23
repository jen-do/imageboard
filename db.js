const spicedPg = require("spiced-pg");

var db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

exports.getImages = function() {
    return db
        .query(
            `SELECT * FROM images
            ORDER BY id DESC
            LIMIT 3`
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
            [file || null, username || null, title || null, description]
        )
        .then(function(results) {
            return results.rows;
        });
};

exports.getMoreImages = function(lastId) {
    return db
        .query(
            `
        SELECT *, (
            SELECT id FROM images
            ORDER BY id
            LIMIT 1) AS last_id
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 3`,
            [lastId]
        )
        .then(function(results) {
            return results.rows;
        });
};

exports.getSelectedImage = function(id) {
    return db
        .query(
            `SELECT * FROM images
            WHERE id = $1`,
            [id]
        )
        .then(function(selectedImage) {
            return selectedImage.rows;
        });
};

exports.getComments = function(id) {
    return db
        .query(
            `SELECT * FROM comments
            WHERE image_id = $1`,
            [id]
        )
        .then(function(comments) {
            return comments.rows;
        });
};

// exports.getImageAndComments = function(id) {
//     return (
//         db.query`SELECT images.id AS imageId, images.url, images.title, images.description, images.username AS imageUser, images.created_at AS imageDate, comments.comment, comments.username AS commentUser, comments.created_at AS commentDate
//         FROM images
//         LEFT JOIN comments
//         ON images.id = comments.image_id
//         WHERE images.id = $1`,
//         [id]().then(function(results) {
//             return results.rows;
//         })
//     );
// };

exports.checkId = function(id) {
    return db
        .query(
            `SELECT * FROM images
            WHERE id = $1`,
            [id]
        )
        .then(function(comments) {
            return comments.rows;
        });
};

exports.saveComment = function(comment, username, imageId) {
    return db
        .query(
            `
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        RETURNING comment, username, created_at AS commentDate`,
            [comment || null, username || null, imageId]
        )
        .then(function(results) {
            return results.rows;
        });
};
