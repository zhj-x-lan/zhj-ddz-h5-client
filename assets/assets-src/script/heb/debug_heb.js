var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        editCards: cc.EditBox,
        editBaoCards: cc.EditBox,
        editNextCard: cc.EditBox,
        cardInput: cc.EditBox,

        parents: {
            default: [],
            type: cc.Node
        },
        debugBtn: cc.Node
    },

    // use this for initialization
    onLoad: function () {

        var setCardsOpen = configMgr.getSetCardsOpen();
        this.debugBtn.active = setCardsOpen;//!cc.sys.isNative;
    },

    onClose: function () {
        this.node.getComponent('roomMain_heb').showDebugLayer();
    },

    onSetCards: function () {
        var str = this.editCards.string.split(',');
        var cards = [];
        for (var i = 0; i < str.length; i++) {
            cards.push(parseInt(str[i]));
        }
        var data = { roomid: GameData.room.id, cards: cards };
        GameNet.getInstance().request("game.debugHandler.setCards", data, function (rtn) { });
    },

    onSetBaoCards: function () {
        var str = this.editBaoCards.string.split(',');
        var cards = [];
        for (var i = 0; i < str.length; i++) {
            cards.push(parseInt(str[i]));
        }
        var data = { roomid: GameData.room.id, cards: cards };
        GameNet.getInstance().request("game.debugHandler.setWildCards", data, function (rtn) { });
    },

    onSetNextCard: function () {
        var str = this.editNextCard.string.split(',');
        var cards = [];
        for (var i = 0; i < str.length; i++) {
            cards.push(parseInt(str[i]));
        }
        var data = { roomid: GameData.room.id, cards: cards };
        GameNet.getInstance().request("game.debugHandler.setWildCards", data, function (rtn) { });
    },

    testAllCardShow: function () {
        for (var i = 0; i < this.parents.length; i++) {
            var parent = this.parents[i];
            if (parent.name != 'layer_down') {
                cc.find('cardHand', parent).active = false;
            }
        }
        var cardId = this.cardInput.string;
        this.testHand(cardId);
        this.testPeng(cardId);
        this.testDis(cardId);
    },

    testHand: function (cardId) {
        for (var i = 0; i < this.parents.length; i++) {
            var parent = this.parents[i];
            if (parent.name == 'layer_down') {
                var cardHandParent = cc.find('cardHand', parent);
                for (var n = 0; n < cardHandParent.childrenCount; n++) {
                    var cardHand = cardHandParent.getChildByName('cardHand' + n);
                    this.showCardContent(cardHand, 'mj_card_xia_shou', cardId);
                }
            }
        }
    },

    testDis: function (cardId) {
        for (var i = 0; i < this.parents.length; i++) {
            var parent = this.parents[i];
            parent.active = true;
            var cardDis = cc.find('cardDis', parent);
            for (var n = 0; n < cardDis.childrenCount; n++) {
                var disCard = cardDis.getChildByName('card_face' + (n + 1));
                disCard.active = true;
                if (parent.name == 'layer_down') {
                    this.showCardContent(disCard, 'mj_card_xia_chu', cardId);
                }
                else if (parent.name == 'layer_right') {
                    this.showCardContent(disCard, 'mj_card_you_chu', cardId);
                }
                else if (parent.name == 'layer_left') {
                    this.showCardContent(disCard, 'mj_card_zuo_chu', cardId);
                }
                else if (parent.name == 'layer_up') {
                    this.showCardContent(disCard, 'mj_card_shang_chu', cardId);
                }
            }
        }
    },

    testPeng: function (cardId) {
        for (var i = 0; i < this.parents.length; i++) {
            var parent = this.parents[i];
            for (var n = 0; n < GameData.room.opts.joinermax; n++) {
                var pengParent = cc.find('cardPeng/cardPeng' + (n + 1), parent);
                pengParent.active = true;
                for (var m = 0; m < 4; m++) {
                    var cardFace = pengParent.getChildByName('card_face' + (m + 1));
                    cardFace.active = true;
                    if (parent.name == 'layer_down') {
                        this.showCardContent(cardFace, 'mj_card_xia_peng', cardId);
                    }
                    else if (parent.name == 'layer_right') {
                        this.showCardContent(cardFace, 'mj_card_you_peng', cardId);
                    }
                    else if (parent.name == 'layer_left') {
                        this.showCardContent(cardFace, 'mj_card_zuo_peng', cardId);
                    }
                    else if (parent.name == 'layer_up') {
                        this.showCardContent(cardFace, 'mj_card_shang_chu', cardId);
                    }
                }
            }

        }
    },

    showCardContent: function (cardNode, cardHeader, cardId) {
        var card = cardNode.getComponent('Card');
        if (card == null) {
            cc.log('missing card Component, please add it');
            return;
        }
        var cardIndex = card.index;

        var iconUrl = 'resources/mjcard/' + cardHeader + '_' + cardIndex + '_' + cardId + '.png';
        cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
});
