// put all vue stuff in the effi to keep vue out of global scope

(function() {
    new Vue({
        el: "#main", // el short for 'element'
        data: {
            images: []
        },
        mounted: function() {
            console.log("this: ", this.images);
            var self = this;
            axios.get("/imageboard").then(function(resp) {
                var imagesFromServer = resp.data;
                self.images = imagesFromServer;

                console.log("self.images = imagesFromServer: ", self.images);
            });
        }
    });
})();
