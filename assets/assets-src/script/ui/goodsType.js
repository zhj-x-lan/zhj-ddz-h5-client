var gameDefine = require('gameDefine');
var shopHandler = require('shopHandler');
var configMgr = require('configMgr');
cc.Class({
    extends: cc.Component,

    properties: {
        buttonId: 0,
        costStr: cc.Label,
        getStr: cc.Label,
        headIcon: cc.Sprite,
        getType: 0,
    },
    onLoad: function () {
    },
    getButtonId: function (btnId) {
        this.buttonId = btnId;
    },
    clickConsume: function () {
        cc.log('this.buttonId = ' + this.buttonId);
        var setCardsOpen = configMgr.getSetCardsOpen();
        if (setCardsOpen == true) {
            var self = this;
            var showStr = '是否确认使用'+this.costNum+'兑换'+this.getNum;
            createMessageBox(showStr,function () {
                shopHandler.exchange(self.buttonId);
            }, function () {});
        } else {
            if (this.getType == gameDefine.shopGetType.Shop_Get_Coin) {
                var self = this;
                var showStr = '是否确认使用'+this.costNum+'兑换'+this.getNum;
                createMessageBox(showStr,function () {
                    shopHandler.exchange(self.buttonId);
                }, function () {});
            }else{
                createMessageBox('兑换功能尚未开放',function () {});
            }
        }
        
    },
    initUI: function (data) {
        //消耗类型
        this.costNum = '';
        switch (data.costType) {
            case gameDefine.shopCostType.Shop_Cost_Point:
                this.costNum = data.costNum+'积分';
                break;
            case gameDefine.shopCostType.Shop_Cost_Card:
                this.costNum = data.costNum+'房卡';
                break;
            case gameDefine.shopCostType.Shop_Cost_Coin:
                this.costNum = data.costNum+'金币';
                break;
            case gameDefine.shopCostType.Shop_Cost_Cash:
                this.costNum = data.costNum+'现金';
                break;
            default :
                break;
        }
        this.costStr.string = this.costNum;
        //获取类型
        this.getNum = '';
        if (data.desc) {
            this.getNum = data.desc;
        }
        this.getStr.string = this.getNum;
        this.setHeadIcon(data.icon);
        this.getType = data.getType;
    },
    setHeadIcon: function (headimgurl) {
        var self = this;
        cc.loader.loadRes("shop/shopPlist", cc.SpriteAtlas, function (err, atlas) {
            var frame = atlas.getSpriteFrame(headimgurl);
            self.headIcon.spriteFrame = frame;
        });
    },
});
