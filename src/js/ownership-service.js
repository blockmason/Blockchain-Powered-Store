const { link } = require('@blockmason/link-sdk');

// Ownership API on GoChain
const ownershipMicroservice = link({
    clientId: "Q9cW9nnK_A3UEFUdxJ5Yu0T3E3Ys5gm2h2c-qzASJ9E",
    clientSecret: "3z95vf3ZsTDquumD3fCbsJVpmQJ+6cK2NHEgnO5UXIvt6LlpAQfjErIqqssHIua"
});

module.exports = {
    getOwner: function (asset) {
        const data = {
            "value": asset
        };
        return ownershipMicroservice.get('/ownerOf', data);
    },

    getAuthority: function () {
        return ownershipMicroservice.get('/authority');
    },

    setOwner: function (assetId, owner) {
        const reqBody = {
            "asset": assetId,
            "owner": owner
        };
        return ownershipMicroservice.post('/setOwner', reqBody);
    }
}