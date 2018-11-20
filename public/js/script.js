// put all vue stuff in the effi to keep vue out of global scope

(function() {
    new Vue({
        el: "#main", // el short for 'element'
        data: {
            images: [],
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            }
        },
        mounted: function() {
            console.log("this: ", this.images);
            var self = this;
            axios.get("/imageboard").then(function(resp) {
                var imagesFromServer = resp.data;
                self.images = imagesFromServer;

                console.log("self.images = imagesFromServer: ", self.images);
            });
        }, // end of mounted function
        methods: {
            handleFileChange: function(e) {
                console.log("handlefilechange running", e.target.files[0]); // log the file just uploaded

                // put uploaded file in data
                this.form.file = e.target.files[0];
                console.log("this.form: ", this.form);
            },
            uploadFile: function(e) {
                e.preventDefault(); // prevents form from submittung and reloading the page
                console.log("this :", this.form);

                //user formData to upload file an user input to server
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
            }
        }
    });
})();
