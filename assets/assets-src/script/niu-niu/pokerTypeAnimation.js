var niuNiuHandler = require('niuNiuHandler');
cc.Class({
    extends: cc.Component,

    properties: {
      actNode: cc.Node,
      skeNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.actNode.active = false;
        this.skeNode.active = false;
        this._fanInfo = null;
    },

    initFanInfo : function (data) {
        cc.log('data = '+data);
        // 1 设置纹理
        if (data == null) {
            return;
        }
        this._fanInfo = data;
        cc.log('1111111111this._fanInfo = '+this._fanInfo);
        if (this._fanInfo == niuNiuHandler.NIU_NIU.POKER_TYPE.NIU_Little) {
            // 如果是小牛牛
            this.skeNode.parent.active = true;
            this.skeNode.active = true;
            var adsp = this.skeNode.getComponent(dragonBones.ArmatureDisplay);
            adsp.playAnimation("newAnimation",1);
        }else {

            var self = this;
            self.actNode.active = true;
            cc.log('2222222222222this._fanInfo = '+this._fanInfo);
            cc.loader.load(cc.url.raw("resources/niuNiuTable/pokerType/"+ this._fanInfo +".png"), function (error, texture) {
                if (!error && texture) {
                    self.actNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    self.actNode.getComponent(cc.Animation).play('niuNiuPokerTypeAnimation');
                }
            });
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
