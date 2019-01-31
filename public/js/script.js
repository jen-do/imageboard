(function() {
    // ----------- VUE Component ----------- //

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
            // whenever imageId in props changes this function will run and send another axois request to get information about and render the other image (if existing)
            imageId: function() {
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
                // name of the emitted message (close-the-component) is refering to the eventhandler in the <popup> tag in index.html
                this.$emit("close-the-component");
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
                        self.form.comment = "";
                        self.form.username = "";
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

    // ----------- #main VUE instance ----------- //

    new Vue({
        el: "#main",
        data: {
            images: [],
            imageId: location.hash.slice(1) || 0,
            tags: [],
            form: {
                title: "",
                description: "",
                username: "",
                tag: "",
                file: null
            },
            showMoreButton: true,
            blue: false,
            red: false
        },
        mounted: function() {
            var self = this;
            window.addEventListener("hashchange", function() {
                self.imageId = location.hash.slice(1);
            });
            axios.get("/imageboard").then(function(resp) {
                self.images = resp.data;
            });
        },
        methods: {
            toggleComponent: function(e) {
                this.imageId = e.target.id;
            },

            closingTheComponent: function() {
                this.imageId = 0;
            },
            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },
            uploadFile: function(e) {
                e.preventDefault();

                //use formData for file uploads only
                var formData = new FormData();

                formData.append("file", this.form.file);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);

                var self = this;
                axios.post("/upload", formData).then(function(resp) {
                    if (resp.data.success) {
                        self.images.unshift(resp.data.newImage);
                        var taggedImage = {
                            tag: self.form.tag,
                            image_id: resp.data.newImage.id
                        };
                        // console.log(taggedImage);
                        axios
                            .post("/upload/tag", taggedImage)
                            .then(function(resp) {
                                self.tags.unshift(resp.data.newTag);
                            });
                    }
                });
            },
            // getMoreImages: figure out the id of the last image displayed to get the next 6 images stored in the db
            getMoreImages: function() {
                var lastId = this.images[this.images.length - 1].id;
                var self = this;
                axios.get("/get-more-images/" + lastId).then(function(resp) {
                    // merging the two arrays (array of images already stored in data and the newly requested array of images) into one single single array:
                    self.images.push.apply(self.images, resp.data);

                    // hide more button if there are no more images to display:
                    if (resp.data.length == 0) {
                        self.showMoreButton = false;
                    }
                });
            },
            filterByTag: function(arg) {
                this.tag = arg;
                var self = this;
                axios
                    .get(`/imageboard/filter/${this.tag}`)
                    .then(function(resp) {
                        // console.log("resp in axios request for filtered images: ", resp);
                        self.images = resp.data;
                        self.showMoreButton = false;
                        if (resp.data[0].tag == "blue") {
                            self.blue = true;
                            self.red = false;
                        } else if (resp.data[0].tag == "red") {
                            self.red = true;
                            self.blue = false;
                        }
                    });
            },
            resetFilter: function() {
                var self = this;
                axios.get("/imageboard").then(function(resp) {
                    self.images = resp.data;
                    self.showMoreButton = true;
                    self.red = false;
                    self.blue = false;
                });
            }
        }
    });
})();
