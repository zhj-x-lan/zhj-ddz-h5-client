cc.Class({
    extends: cc.Component,

    properties: {
        faces: {
            default: [],
            type: [cc.Sprite]
        },

        body4: cc.Node,
        huierTemplate: cc.Node,
        angangBody: cc.Node,
        _cardRef: null,
        _huierNodes: [],
        _currentCards: [],

        direction: 'right',
    },

    // use this for initialization
    onLoad: function () {
        this.initHUierUI();
    },

    initHUierUI: function () {
        if (this.huierTemplate == null) {
            return;
        }

        for (var i = 0; i < 4; i++) {
            var huierNode = cc.instantiate(this.huierTemplate);
            var faceSprite = this.faces[i];
            if (faceSprite != null) {
                huierNode.parent = this.faces[i].node.parent;
                this._huierNodes.push(huierNode);
            }
        }

        this.huierTemplate.destroy();
    },

    peng: function (cards) {
        this._currentCards = cards;
        this.angangBody.active = false;
        this.body4.active = false;
        this.showFace(cards);
    },

    chi: function (cards) {
        this._currentCards = cards;
        this.angangBody.active = false;
        this.body4.active = false;
        this.showFace(cards);
    },

    gang: function (cards) {
        this._currentCards = cards;
        if (this.angangBody != null)
            this.angangBody.active = false;
        this.body4.active = true;
        this.showFace(cards);
    },

    angang: function (cards) {
        this._currentCards = cards;
        if (this.angangBody != null)
            this.angangBody.active = true;
        this.body4.active = false;
        this.showFace(cards);
    },

    showFace: function (cards) {
        // var ref = this.getCardRef();
        // if(ref != null)
        // {
        for (var i = 0; i < this.faces.length; i++) {
            var faceSprite = this.faces[i];
            if (faceSprite != null && i < cards.length) {
                var cardId = cards[i];
                var huierNode = this._huierNodes[i];
                if (huierNode != null) {
                    var y = ReplayDataCenter.isHuier(cardId);
                    //cc.log('cardId : ' + cardId + ",y" + y + ", i" + i);
                    huierNode.active = y;
                }
                //faceSprite.spriteFrame = ref.getSpriteFrame(cardId);
                this.showCardContent(faceSprite.node, this.getHeader(), cardId);
            }
        }
        // }       
    },


    showCardContent: function (cardNode, cardHeader, cardId) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },

    getHeader: function () {
        var cardHeader = '';
        if (this.direction == 'left') {
            cardHeader = 'mj_face_zuo_chu';
        } else if (this.direction == 'right') {
            cardHeader = 'mj_face_you_chu';
        } else if (this.direction == 'up') {
            cardHeader = 'mj_face_shang_shou';
        } else {
            cardHeader = 'mj_face_xia_chu';
        }
        return cardHeader;
    },



    getCardRef: function () {
        if (this._cardRef == null) {
            this._cardRef = this.node.getComponent("CardRef");
        }
        return this._cardRef;
    },

    hasCard: function (cardId) {
        if (this._currentCards == null) {
            return false;
        }
        for (var i = 0; i < this._currentCards.length; i++) {
            var cId = this._currentCards[i];
            var b = ReplayDataCenter.isHuier(cId);
            if (b == true) {
                continue;
            } else if (cardId == cId) {
                return true;
            }
        }
        return false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});