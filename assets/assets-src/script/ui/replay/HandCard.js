cc.Class({
    extends: cc.Component,

    properties: {
        bottom: cc.Sprite,
        icon: cc.Sprite,
        huier: cc.Node,
        cardId: 0,
        _cardRef: null,
    },

    // use this for initialization
    onLoad: function () {
        this.showHuier(false);
    },

    setIcon: function (cardId) {
        var ref = this.getCardRef();
        if (ref != null) {
            this.icon.spriteFrame = ref.getSpriteFrame(cardId);
            this.icon.node.active = true;
        }
    },

    showHuier: function (show) {
        this.huier.active = show;
    },

    setBottom: function (bottomUrl) {
        var texture = cc.textureCache.addImage(cc.url.raw(bottomUrl));
        this.bottom.spriteFrame = new cc.SpriteFrame(texture)
    },

    getCardRef: function () {
        if (this._cardRef == null) {
            this._cardRef = this.node.getComponent("CardRef");
        }
        return this._cardRef;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});