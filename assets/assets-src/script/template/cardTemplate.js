cc.Class({
    extends: cc.Component,

    properties: {
        id: 0,
        index: 0,
        bottom: cc.Sprite,
        icon: cc.Sprite,
        huier: cc.Sprite,
        btn: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        //this.pos = this.node.parent.getPosition();
    },

    setId: function(id) {
        this.id = id;
    },

    setIndex: function(index) {
        this.index = index;
    },

    setIcon: function(iconUrl) {
        if (iconUrl === '') {
            this.icon.node.active = false;
        } else {
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.icon.spriteFrame = new cc.SpriteFrame(texture);
            this.icon.node.active = true;
        }
    },

    setHuier: function(huierUrl) {
        var texture = cc.textureCache.addImage(cc.url.raw(huierUrl));
        this.huier.spriteFrame = new cc.SpriteFrame(texture);

        //add huierIcon
        var huierNode = new cc.Node();
        this.node.addChild(huierNode);
        huierNode.y = 48;
        var huierIconTexture = cc.textureCache.addImage(cc.url.raw('resources/table/huier_icon.png'));
        var huierIconSprite = huierNode.addComponent(cc.Sprite);
        huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTexture);
    },

    setBottom: function(bottomUrl) {
        //var texture = cc.textureCache.addImage(cc.url.raw(bottomUrl));
        //this.bottom.spriteFrame = new cc.SpriteFrame(texture)
    },

    enableButton: function(enable) {
        this.btn.node.active = enable;
        /*if (enable) {
            var self = this;
            var time = 0.2;
            var dis = 30;

            self.btn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
                self.node.parent.stopAllActions();
                self.node.parent.runAction(cc.moveTo(time, cc.p(self.pos.x, dis)));
            });
            self.btn.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                self.node.parent.stopAllActions();
                self.node.parent.runAction(cc.moveTo(time, cc.p(self.pos.x, 0)));
            });
            self.btn.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
                self.node.parent.stopAllActions();
                self.node.parent.runAction(cc.moveTo(time, cc.p(self.pos.x, 0)));
            });
            self.btn.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                var move_y = event.getDelta().y;  
                if (move_y >= dis) {
                    self.onBtnClicked();
                    self.node.parent.y = 0;
                }
            });
        }*/
    },

    onBtnClicked: function(evt) {
        sendEvent('onHandCardClicked', {card: this.id, index: this.index});
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
