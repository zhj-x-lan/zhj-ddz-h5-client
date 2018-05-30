cc.Class({
    extends: cc.Component,

    properties: {
        bgImg: cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {
        this.isShow = true; // 是否需要显示
        this.isTurn = false; // 是否已经翻开
        this.cardInfo = null;
    },

    initCardInfo : function (cardInfo) {
        this.cardInfo = cardInfo;
        this.updateUI();
    },

    updateUI : function () {
        var imgName = this.getSpriteNameByCardId();
        var strImgName = imgName + ".png";
        var self = this;
        cc.loader.load(cc.url.raw("resources/niuNiuTable/poker/" + strImgName), function (error, texture) {
            if (!error && texture) {
                self.bgImg.spriteFrame = new cc.SpriteFrame(texture);
            }else {
                console.error(error);
            }
        });
        // var imgUrl = cc.url.raw("resources/niuNiuTable/poker/" + strImgName);
        //
        // var texture = cc.textureCache.addImage(imgUrl);
        //
        // this.bgImg.spriteFrame.setTexture(texture);
    },

    turnOver: function (isTurn) {
        if (isTurn === undefined) {
            isTurn = true;
        }
        // if (this.isTurn || !this.cardInfo) {
        //     return;
        // }
        // if (this.isTurn == isTurn) {
        //     return;
        // }
        this.isTurn = isTurn;
        this.updateUI();
    },

    /**
     *  suit : 0 方块 1 梅花 2 红桃 3 黑桃
     *  index : 0 ~ 12
     */
    getSpriteNameByCardId : function () {
        if (!this.cardInfo) {

            return 0+"";
        }
        if (!this.isTurn) {

            return 0+"";
        }
        var suitType = parseInt(this.cardInfo/100);
        var baseNum = (suitType-1) * 16;
        var cardNum = this.cardInfo-suitType*100;
        return (cardNum + baseNum) + "";
    },

    showTipAction: function () {
      this.node.runAction(cc.moveBy(0.2, cc.p(0,60)));
    },

    NIU_Little: function (pokerInfo) {
        var index = 0;
        var score = 0;
        for (var i = 0; i < pokerInfo.length; i++) {
            var pokerScore = pokerInfo[i] - parseInt(pokerInfo[i]/100)*100;
            cc.log('pokerScore = '+pokerScore);
            if (pokerScore < 5) {
                index++;
            }
            score += pokerScore;
        }
        if (index === 5 && score <= 10) {
            return 0;
        }else {
            return 1;
        }
    },
    NIU_NONE: function (pokerInfo) {

    },
});
