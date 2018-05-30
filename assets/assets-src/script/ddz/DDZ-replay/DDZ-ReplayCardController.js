cc.Class({
    extends: cc.Component,

    properties: {
        uid: 0,
        handPokers: cc.Node,
        disPokers: cc.Node,
        headNode: cc.Node,
        headPrefab: cc.Prefab,
        headComponent: null,
        direction: 'right',
        handPokerList: [],
        disPokerList: [],
    },

    getList: function () {
        return {
            uid: this.uid,
            hand: this.handPokerList,
            dis: this.disPokerList
        };
    },

    // use this for initialization
    onLoad: function () {
        // this.pengNode.active = false;
        // this.disNode.active = false;
        this.joinermax = Object.keys(ReplayData.players).length;
        // if (this.joinermax == 4) this.discardMax = 24;
        // else if (this.joinermax == 3) this.discardMax = 36;
        // else if (this.joinermax == 2) this.discardMax = 60;
    },

    showHead: function (playername, headimgurl) {
        this.getHeadComponent().setName(playername);
        this.getHeadComponent().setHeadIcon(headimgurl);
    },

    showPlayerIdentity: function (show, type) {
        this.getHeadComponent().showPlayerIdentity(show, type);
    },
    getLiuGuang: function (isPlay) {
        //this.getHeadComponent().getLiuGuang(isPlay);
    },

    setCoin: function (value) {
        this.getHeadComponent().setCoin(value);
    },
    setNamePositionByDir: function (direction) {
        this.getHeadComponent().setNamePositionByDir(direction);
    },
    getHeadComponent: function () {
        if (this.headComponent == null) {
            var head = cc.instantiate(this.headPrefab);
            head.parent = this.headNode;
            this.headComponent = head.getComponent('DDZ-playerTemplate');
        }
        return this.headComponent;
    },
    discard: function (cards) {
        cc.log('cards:' + cards);
        //隐藏dispoker节点
        this.hideDisCard();
        if (cards == null) {
            cc.log('ReplayCardController,can not discard the card, the card is null or length is not 1');
            return;
        }

        //var discardCardId = cards[0];

        this.handCardListRemove(cards);

        for (var i = 0; i < cards.length; i++) {
            this.disPokerList.push(cards[i]);
        }
        this.doHandCard();
        //show dis card
        this.showDisCard(cards);
    },
    showDisCard: function (discards) {
        cc.log('discards:' + discards);
        for (var i = 0; i < discards.length; i++) {
            var cardName = "dis_" + i;
            var cardNode = this.disPokers.getChildByName(cardName);
            cardNode.active = true;
            this.showCardContent(cardNode, discards[i]);
        }
    },
    hideDisCard: function () {
        for (var key in this.disPokers.children) {
            this.disPokers.children[key].active = false;
        }
    },
    doHandCard: function () {
        var cardlength = this.handPokerList.length;
        this.handPokerSort(this.handPokerList);
        for (var key in this.handPokers.children) {
            this.handPokers.children[key].active = false;
        }
        var i = Math.ceil(this.handPokers.childrenCount / 2) - Math.ceil(cardlength / 2);
        var parentName = this.handPokers.parent.name.substring(6);
        //cc.log('parentName:'+parentName);
        if (parentName == 'down') {
            for (var j = 0; j < cardlength; j++) {
                var cardName = "hand_" + (j + i);
                var cardNode = this.handPokers.getChildByName(cardName);
                if (cardNode == null) {
                    cc.error("can not find the card node, name is " + cardName);
                    continue;
                }

                cardNode.active = true;
                this.showCardContent(cardNode, this.handPokerList[j]);

            }
        } else {
            for (var j = 0; j < cardlength; j++) {
                var cardName = "hand_" + j;
                var cardNode = this.handPokers.getChildByName(cardName);
                if (cardNode == null) {
                    cc.error("can not find the card node, name is " + cardName);
                    continue;
                }

                cardNode.active = true;
                this.showCardContent(cardNode, this.handPokerList[j]);

            }
        }

    },
    showCardContent: function (cardNode, cardId) {
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/' + 'poker_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    handCardListRemove: function (cards) {
        var len = this.handPokerList.length;
        //cc.log('handPokerList.length1111111111:'+this.handPokerList);
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < cards.length; j++) {
                //cc.log('this.handPokerList[i] == cards[j]:'+this.handPokerList[i], cards[j]);
                if (this.handPokerList[i] == cards[j]) { //cc.log('cards[j]:'+cards[j]);
                    this.handPokerList.splice(i, 1);
                    this.handCardListRemove(cards);
                }
            }
        }
    },
    showHandCard: function (cardList) {
        this.handPokerList = [];
        if (cardList == null) {
            cc.error("cardList is null");
            return;
        }
        for (var i = 0; i < cardList.length; i++) {
            var cardId = cardList[i];
            this.handPokerList.push(cardId);
        }

        this.doHandCard();
    },
    addHolePoker: function (cards) {
        this.showHandCard(cards);
    },
    handPokerSort: function () {
        var hand = [];
        var numbers = [];
        for (var i = 0; i < this.handPokerList.length; i++) {
            numbers[i] = this.handPokerList[i] % 100;
        };

        // 所有牌按照从小到大排序
        numbers.sort(function (a, b) {
            return a - b;
        })
        for (var i = 0; i < this.handPokerList.length; i++) {
            for (var j = 0; j < numbers.length; j++) {
                if ((this.handPokerList[i] % 100) == numbers[j]) {
                    hand[j] = this.handPokerList[i];
                    this.handPokerList[i] = 0;
                    numbers[j] = 0;
                    break;
                }
            }
        }
        this.handPokerList = hand;
        return this.handPokerList;
    }
});