(function() {
    ///////////////////////////// VUE Component ////////////////////////////

    Vue.component("popup", {
        template: "#popup-template",
        props: ["imageId"],
        data: function() {
            return {
                singleImage: {},
                form: {
                    comment: "",
                    username: ""
                },
                comments: []
            };
        },
        watch: {
            imageId: function() {
                console.log("watcher running!", this.imageId);
                var self = this;
                axios.get("/imageboard/" + self.imageId).then(function(resp) {
                    if (resp.data.length > 0) {
                        self.singleImage = resp.data[0];
                        // console.log("valid id");
                    } else {
                        // console.log("no valid id");
                        function closeComponent() {
                            self.$emit("close-the-component");
                        }
                        closeComponent();
                    }
                });
            }
        },
        mounted: function() {
            var self = this;

            axios
                .get(`/singleImage/${this.imageId}`)
                .then(function(resp) {
                    self.singleImage = resp.data.selectedImage[0][0];
                    self.comments = resp.data.selectedImage[1];
                    // console.log(self.singleImage, self.comments);
                })
                .catch(function(err) {
                    console.log(
                        "error in axios GET request of singleImage: ",
                        err
                    );
                });
        },
        methods: {
            closeComponent: function() {
                this.$emit("close-the-component"); // name of the message => refering to the eventhandler in index.html component-tag <popup>
            },
            submitComment: function(e) {
                e.preventDefault();

                var submittedComments = {
                    comment: this.form.comment,
                    username: this.form.username
                };
                var self = this;

                axios
                    .post(`/singleImage/${this.imageId}`, submittedComments)
                    .then(function(resp) {
                        self.comments.unshift(resp.data.newComment);
                    })
                    .catch(function(err) {
                        console.log(
                            "error in axios POST request of singleImage: ",
                            err
                        );
                    });
            }
        }
    });

    /////////////////////////// #main Vue instance ///////////////////////////

    new Vue({
        el: "#main", // el short for 'element'
        data: {
            images: [],
            imageId: location.hash.slice(1) || 0,
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            },
            showMoreButton: true
        },
        mounted: function() {
            var self = this;
            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
                // console.log(location.hash.slice(1));
            });
            axios.get("/imageboard").then(function(resp) {
                self.images = resp.data;
                console.log("self.images = imagesFromServer: ", self.images);
            });
        }, // end of mounted function
        methods: {
            toggleComponent: function(e) {
                console.log(
                    "e.target.id in toggleComponent: ",
                    e.target.id
                    // e.currentTarget.getAttribute("id"),
                );
                this.imageId = e.target.id;
                //  e.currentTarget.getAttribute("id");
            },

            closingTheComponent: function() {
                this.imageId = 0;
            },

            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },

            uploadFile: function(e) {
                e.preventDefault(); // prevents form from submittung and reloading the page
                console.log("this :", this.form);

                //use formData to upload file an user input to server, use only for file uploads
                var formData = new FormData();

                formData.append("file", this.form.file);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                var self = this;
                axios.post("/upload", formData).then(function(resp) {
                    if (resp.data.success) {
                        self.images.unshift(resp.data.newImage);
                    }
                    console.log("resp: ", resp);
                });
            },
            getMoreImages: function() {
                var lastId = this.images[this.images.length - 1].id;
                var self = this;
                // GET /get-more-images/
                axios.get("/get-more-images/" + lastId).then(function(resp) {
                    self.images.push.apply(self.images, resp.data); // merging the two arrays self.images and resp.data into the images array in the vue instance data

                    // hide more button if there are no more images to display:
                    if (resp.data[0].last_id + 2 == lastId) {
                        self.showMoreButton = false;
                    }
                });
            }
        }
    });
})();
