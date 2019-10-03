//Link user: harish+microservices@blockmason.io
//Org: microservices-demo

const storeData = require('../store.json');
const paymentService = require('./payments-service.js');
const commentsService = require('./comments-service.js');
const ownershipService = require('./ownership-service.js');

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
};

App = {
    tokenConversionRate: 1,
    walletMapping: {
        'Drake': '0x9a10e85924da9fe6a12a1a30d3d07e415f2ac823'.toLowerCase(),
        'Bianca': '0xc1b63e1bb4aedfbce9cf44316e7738f086d33219'.toLowerCase(),
        'Harish': '0x83fe96cdd189e4f3c965f37309e1597a8e76aae2'.toLowerCase()
    },

    init: async function () {
        // Load store.
        const storesRow = $('#storesRow');
        const storeTemplate = $('#storeTemplate');

        for (i = 0; i < storeData.length; i++) {
            storeTemplate.find('.panel-title').text(storeData[i].name);
            storeTemplate.find('img').attr('src', storeData[i].picture);
            storeTemplate.find('.store-description').text(storeData[i].description);
            storeTemplate.find('.btn-own').attr('data-id', storeData[i].id);
            storeTemplate.find('.btn-value').text(storeData[i].price * App.tokenConversionRate);
            storeTemplate.find('.comments-row').attr('id', storeData[i].id);
            storesRow.append(storeTemplate.html());
            App.markOwned(i, storeData[i].id);
        }
        await commentsService.getComments();
        commentsService.printComments();
        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-own', App.handleOwnership);
        $(document).on('click', '.btn-comment', App.postComment);
    },

    markOwned: async function (index, name) {
        const { result } = await ownershipService.getOwner(name);
        const owner = getKeyByValue(App.walletMapping, result);

        if (result !== '0x0000000000000000000000000000000000000000') {
            $('.panel-store').eq(index).find('#ownerAddress').empty();
            $('.panel-store').eq(index).find('#ownerAddress').append('Just bought by: ' + owner).css({ wordWrap: "break-word" });
        }
    },

    fetchAuthority: async function () {
        const { result } = await ownershipService.getAuthority();
        console.log('authority is', result);
    },

    setOwnership: async function (event, storeId, ownerAddress) {
        event.preventDefault();
        console.log('set ownership address is', ownerAddress);
        try {
            const response = await ownershipService.setOwner(storeId, ownerAddress);
            if (response.errors) {
                alert(response.errors[0].detail);
                $(event.target).text("Buy").attr('disabled', false);
            }
            else {
                console.log('setOwner request successful');
                $(event.target).text("Purchased").attr('disabled', false);
                $(event.target).closest("div.owner-address").find("input[name='owner']").val('');
                $(event.target).parents(".panel-store").find("#ownerAddress").text('Just bought by: ' + getKeyByValue(App.walletMapping, ownerAddress));
            }
        } catch (err) {
            console.log(err);
            alert("Blockchain network request timed out. Please try again");
        }
    },

    handleOwnership: async function (event) {
        event.preventDefault();
        if (confirm("Do you want to buy this?")) {
            $(event.target).text("Processing").attr('disabled', true);
            const storeId = $(event.target).data('id');
            const newOwner = $("#login").val();
            console.log(newOwner);
            const newOwnerAddress = App.walletMapping[newOwner];
            const price = parseInt($(event.target).next().html());
            let existingOwner = $(event.target).parents(".panel-store").find("#ownerAddress").text().split(" ")[1];
            let existingOwnerAddress = App.walletMapping[existingOwner];

            if (existingOwnerAddress !== '') {
                if (existingOwnerAddress !== newOwnerAddress) {
                    $(event.target).text("Buy").attr('disabled', true);
                    await paymentService(price / App.tokenConversionRate);
                    App.setOwnership(event, storeId, newOwnerAddress);
                } else {
                    alert("Thanks for shopping!");
                    $(event.target).text("Buy").attr('disabled', false);
                }
            } else {
                App.setOwnership(event, storeId, newOwnerAddress);
            }
        }
    },

    postComment: async function (event) {
        commentsService.postComment(event);
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
