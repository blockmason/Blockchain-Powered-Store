const { link } = require('@blockmason/link-sdk');

const commentsMicroservice = link({
    clientId: "F8iCaGWKf2ZxafTf1MhZLuSu_SsgvDw8WEkwtf1JYw0",
    clientSecret: "vsY5P7eDO4ljFXtx8rK8ljLFxfZ1KK1SDdns2ZceHBujmKizqNdLCwVXLj+HKtx"
});


module.exports = {
    commentsInMemory: [],

    addCommentsInMemory: function (comments) {
        this.commentsInMemory.push(comments);
    },

    postComment: async function (event) {
        let textArea = $(event.target).closest("div.message-area").find("textarea");
        let storeId = $(event.target).parents(".panel-store").find(".btn-own").data('id');

        if (textArea.val() !== '') {
            message = textArea.val();
            const reqBody = {
                "asset": storeId,
                "comment": message
            };
            this.addCommentsInMemory(reqBody);
            textArea.val('');
            this.printComments();
            await commentsMicroservice.post('/postComment', reqBody);
        }
        await this.getComments();
    },

    getComments: async function () {
        const comments = await commentsMicroservice.get('/events/Comment');
        this.commentsInMemory = [];
        comments.data.forEach((data) => {
            this.addCommentsInMemory(data);
        });
    },

    printComments: function () {
        let comments = this.commentsInMemory;
        this.removeComments()

        comments.forEach((commentObject) => {

            const commentsRow = document.getElementById(commentObject.asset);

            if (commentsRow != null) {
                elChild = document.createElement('div');
                elChild.innerHTML = "<div class='alert alert-warning'> '" + commentObject.comment + "' - Verified Purchaser" + "</div>";
                commentsRow.prepend(elChild);
            }
        });
    },

    removeComments: function () {
        $('.comments-row').children("div").remove();
    }
}