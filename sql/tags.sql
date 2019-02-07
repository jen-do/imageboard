DROP TABLE IF EXISTS tags;


CREATE TABLE tags(
    id SERIAL PRIMARY KEY,
    tag VARCHAR(100),
    image_id INTEGER NOT NULL REFERENCES images(id)
);
