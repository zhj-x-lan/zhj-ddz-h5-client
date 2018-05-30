var RuleHandler = require('ruleHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        tingNode: cc.Node,
        bg: cc.Node,
        nbg: cc.Node,
        cardTemplate: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.bgHeight = this.bg.height;
        this.nbgHeight = this.nbg.height;

        this.cardNodeList = [];
        this.cardTemplate.active = false;
    },

    show: function (selectCard, tingData) {
        var huCards = [],
            showCards = [],
            tempCards = {},
            totalLeft = 0;
        for (var i = 0; i < tingData.length; i++) {
            var data = tingData[i];
            if (data.discard == selectCard) {
                huCards = data.ting;
                break;
            }
        }

        if (huCards.length > 0) {
            this.tingNode.active = true;
        } else {
            this.tingNode.active = false;
            return;
        }

        for (var i = 0; i < this.cardNodeList.length; i++) {
            var cardNode = this.cardNodeList[i];
            cardNode.destroy();
        }
        this.cardNodeList.splice(0, this.cardNodeList.length);

        //cc.log('huCards:'+JSON.stringify(huCards));
        for (var t = 0; t < huCards.length; t++) {
            var item = huCards[t];
            var key = item.type.toString();
            if (key === "4") key = "3";
            tempCards[key] = tempCards[key] || [];
            tempCards[key].push(item);
        }

        //cc.log('tempCards:'+JSON.stringify(tempCards));
        for (var i in tempCards) {
            var item = tempCards[i];
            if (item.length >= 15) {
                showCards.push({
                    obcard: -1,
                    score: item[0].score
                });
            } else {
                for (var n in item) {
                    showCards.push({
                        obcard: item[n].obcard,
                        score: item[n].score
                    });
                }
            }
        }
        showCards.sort(function (a, b) {
            return b.score - a.score;
        });

        var anyIdx = -1;
        for (var i = 0; i < showCards.length; i++) {
            if (showCards[i].obcard == -1) {
                anyIdx = i;
                continue;
            }
            var obcard = showCards[i].obcard;
            var score = showCards[i].score;
            var leftCount = this.leftCard(obcard);
            totalLeft += leftCount;

            this.showCardNode(obcard, score, leftCount);
        }
        if (anyIdx >= 0) {
            var obcard = 'renyi';
            var score = showCards[anyIdx].score;
            var leftCount = GameData.game.cardleft - totalLeft;
            totalLeft = GameData.game.cardleft;

            this.showCardNode(obcard, score, leftCount);
        }

        cc.find('totalLeftLabel', this.tingNode).getComponent(cc.Label).string = '剩余' + totalLeft + '张';

        var length = this.cardNodeList.length;
        var oneRowCount = (length > 4) ? Math.ceil(length / 2) : length;
        var lineCount = Math.ceil(length / oneRowCount);

        for (var i = 0; i < this.cardNodeList.length; i++) {
            var cardNode = this.cardNodeList[i];
            cardNode.x = this.cardTemplate.x + 90 * (i % oneRowCount);
            cardNode.y = this.cardTemplate.y - Math.floor(i / oneRowCount) * 154;
        }

        this.nbg.width = 90 * oneRowCount;
        this.bg.width = 220 + this.nbg.width;

        if (length > 4) {
            //two row
            this.bg.height = 370;
            this.nbg.height = 300;
        } else {
            //one row
            this.bg.height = this.bgHeight;
            this.nbg.height = this.nbgHeight;
        }
    },

    hide: function () {
        this.tingNode.active = false;
    },

    showCardNode: function (card, score, left) {
        var cardNode = cc.instantiate(this.cardTemplate);
        var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + card + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        cc.find('scoreLabel', cardNode).getComponent(cc.Label).string = score + '分';
        cc.find('leftLabel', cardNode).getComponent(cc.Label).string = left + '张';
        cc.find('mask', cardNode).active = (left == 0 ? true : false);
        cardNode.active = true;
        this.tingNode.addChild(cardNode);
        this.cardNodeList.push(cardNode);
    },

    leftCard: function (obcard) {
        var knowCount = 0;
        var cards = GameData.getMyHandCards();

        for (var key in cards) {
            if (obcard == key) {
                knowCount += cards[key];
            }
        }

        for (var index = 0; index < GameData.joiners.length; index++) {
            var player = GameData.joiners[index];
            if (!player) continue;
            var uid = player.uid;
            var disCards = GameData.getDisCards(uid);
            var pengCards = GameData.getPengCards(uid);
            var gangCards = GameData.getGangCards(uid);

            for (var key in disCards) {
                if (obcard == disCards[key]) {
                    knowCount += 1;
                }
            }
            for (var key in pengCards) {
                if (obcard == pengCards[key][0]) {
                    knowCount += 3;
                }
            }
            for (var key in gangCards) {
                if (obcard == gangCards[key][0]) {
                    knowCount += 4;
                }
            }
        }

        var leftCount = 4 - knowCount;
        leftCount = leftCount <= 0 ? 0 : leftCount;

        return leftCount;
    }
});