cc.Class({
    extends: cc.Component,

    properties: {
        playerName: cc.Label,
        playerId: cc.Label,
        scoreNode: cc.Node,
        specialSpriteNode: cc.Node,
        cardRow_1: cc.Node,
        cardRow_2: cc.Node,
        cardRow_3: cc.Node,
        fonts:{
            default:[],
            type:cc.Font
        },

        id:0
    },

    onLoad: function () {
    },

    onDestroy: function() {
    },

    showPlayerRoundDetail: function() {
        this.showPlayer();
        this.showCard();
    },

    showPlayer: function() {

        if(GameData13.gemaEndResult.history == undefined){
            cc.log("GameData13.gameEndResult.history is undefined");
            return;
        }

        var score = 0;
        if (!GameData13.isEmptyObject(GameData13.gemaEndResult)) {
            if (GameData13.gemaEndResult.history.length > 0) {
                score = GameData13.gemaEndResult.history[this.roundNum][this.playerUidById(this.id)].score;
            }
        }else {
            cc.log('GameData13.gemaEndResult is empty.');
        }
        this.showScore(score);

        if (isChinese(GameData13.joiners[this.id].name)) {
            this.playerName.string = getShortStr(GameData13.joiners[this.id].name, 6);
        }else if (!isChinese(GameData13.joiners[this.id].name)) {
            this.playerName.string = getShortStr(GameData13.joiners[this.id].name, 8);
        }
        this.playerId.string = GameData13.joiners[this.id].uid;
    },

    showCard: function() {

        //隐藏特殊牌型名字节点
        this.specialSpriteNode.active = false;

        var cards = {};
        var isSpecial = 0;
        if (!GameData13.isEmptyObject(GameData13.gemaEndResult)) {
            if (GameData13.gemaEndResult.history.length > 0) {

                if (GameData13.gemaEndResult.history[this.roundNum][this.playerUidById(this.id)].special) {
                    isSpecial = GameData13.gemaEndResult.history[this.roundNum][this.playerUidById(this.id)].special;
                }
                cards = GameData13.gemaEndResult.history[this.roundNum][this.playerUidById(this.id)].cards;
            }
        }else {
            cc.log('GameData13.gemaEndResult is empty.');
        }
        if (!isSpecial) {
            for (var i = 0; i < cards.up.length; i++) {
                var card = cc.find('card'+i, this.cardRow_1);
                this.showCardTextrue(card, cards.up[i]);
            }
            for (var i = 0; i < cards.mid.length; i++) {
                var card_mid = cc.find('card'+i, this.cardRow_2);
                var card_down = cc.find('card'+i, this.cardRow_3);
                this.showCardTextrue(card_mid, cards.mid[i]);
                this.showCardTextrue(card_down, cards.down[i]);
            }
        }else if (isSpecial) {
            for (var i = 0; i < cards.length; i++) {
                if (i >= 0 && i < 3) {
                    var card = cc.find('card'+i, this.cardRow_1);
                    this.showCardTextrue(card, cards[i]);
                }else if (i >= 3 && i < 8) {
                    var card = cc.find('card'+(i - 3), this.cardRow_2);
                    this.showCardTextrue(card, cards[i]);
                }else if (i >= 8 && i < 13) {
                    var card = cc.find('card'+(i - 8), this.cardRow_3);
                    this.showCardTextrue(card, cards[i]);
                }
            }
            //更新特殊牌型名字图片
            if(isSpecial != 60){
                this.specialSpriteNode.active = true;
                this.updateSpecialSprite(isSpecial);
            }
        }
    },

    showScore: function(score) {

        if (score > 0) {
            this.scoreNode.getComponent(cc.Label).string = '+'+score;
            this.scoreNode.getComponent(cc.Label).font = this.fonts[0];
        }else if (score < 0) {
            this.scoreNode.getComponent(cc.Label).string = score;
            this.scoreNode.getComponent(cc.Label).font = this.fonts[1];
        }else {
            this.scoreNode.getComponent(cc.Label).string = score;
            this.scoreNode.getComponent(cc.Label).font = this.fonts[2];
        }
    },

    showCardTextrue: function(node, card) {
        var str = "resources/shisanshui/cardUI";
        var iconUrl = str + "/" + (card.value+1) + '_' + (card.type+1) + ".png";
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },

    updateSpecialSprite :function(Special)
    {
        var str = "resources/shisanshui/cardTypeUI/specialName/";
        var iconUrl = str +'special_'+Special+".png";
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        this.specialSpriteNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },

    setRoundNum: function(num) {
        this.roundNum = num;
    },

    playerUidById: function(id) {
        return GameData13.joiners[id].uid;
    }
});
