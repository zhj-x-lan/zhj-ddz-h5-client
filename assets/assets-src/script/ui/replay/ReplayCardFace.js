cc.Class({
    extends: cc.Component,

    properties: {
        bottom: cc.Sprite,
        icon: cc.Sprite,
        huier: cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {

    },

    setIcon: function (iconUrl) {
        if (iconUrl === '') {
            this.icon.node.active = false;
        } else {
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.icon.spriteFrame = new cc.SpriteFrame(texture);
            this.icon.node.active = true;
        }
    },

    setHuier: function (huierUrl) {
        var texture = cc.textureCache.addImage(cc.url.raw(huierUrl));
        this.huier.spriteFrame = new cc.SpriteFrame(texture);
    },

    setBottom: function (bottomUrl) {
        var texture = cc.textureCache.addImage(cc.url.raw(bottomUrl));
        this.bottom.spriteFrame = new cc.SpriteFrame(texture)
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});