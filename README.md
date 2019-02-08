# imageboard - blue things | red things

## overview

A single-page application built with Vue.js. Anyone can upload and post an image, add a title and description and comment on the images displayed.

In my imageboard I collected blue and red things - since these are my favorite colors :-). You can filter all images by tagto only view the blue or red stuff, and reset the filter again to go back to the whole collection.

This project was realised during 5 days in the altogether three-month study programme for "Full Stack Web Development" at SPICED Academy Berlin.

## technologies used

-   **Vue.js** for rendering dynamically added content without refreshing the page. The website is made up of a main Vue instance and a component for rendering the popup.
-   **Node.js** for serverside JavaScript.
-   **npm-packages `multer` and `uid-safe`** for the image upload and the **S3-client `knox`** for storing the images online in an Amazon Web Service bucket.
-   **moment.js** for date formating
-   **PostgreSQL database** and queries to get, post, sort, filter and limit data related to the images
-   responsive design using **media queries and CSS flexbox**

## screenshots

Image upload

![image upload](https://github.com/jen-do/imageboard/raw/master/public/images/imageboard_image-upload.gif)

Filter images by tag. Clicking on the more button shows the next 6 images.

![filter images and pagination](https://github.com/jen-do/imageboard/raw/master/public/images/imageboard_filter-pagination.gif)

Clicking on a image a popup opens containing more details about the image and the possibility to add a comment or read the comments of other users.

![popup modal](https://github.com/jen-do/imageboard/raw/master/public/images/imageboard_image-modal.gif)
