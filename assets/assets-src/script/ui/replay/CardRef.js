cc.Class({
    extends: cc.Component,

    properties: {
        cardFaces: {
            default: [],
            type: cc.SpriteFrame
        },
    },


    getSpriteFrame: function (cardId) {
        if (cardId <= 31) {
            return this.cardFaces[cardId - 1];
        } else {
            if (cardId == 41) {
                return this.cardFaces[31];
            }
            if (cardId == 51) {
                return this.cardFaces[32];
            }
            if (cardId == 61) {
                return this.cardFaces[33];
            }
            if (cardId == 71) {
                return this.cardFaces[34];
            }
            if (cardId == 81) {
                return this.cardFaces[35];
            }
            if (cardId == 91) {
                return this.cardFaces[36];
            }
        }
        return null;
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});