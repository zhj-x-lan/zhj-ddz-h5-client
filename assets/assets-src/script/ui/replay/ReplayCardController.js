cc.Class({
    extends: cc.Component,

    properties: {
        uid: 0,
        pengCardList: [],
        gangCardList: [],
        handCardList: [],
        disCardList: [],
        chiCardList: [],
        handNode: cc.Node,
        pengNode: cc.Node,
        disNode: cc.Node,
        headNode: cc.Node,
        headPrefab: cc.Prefab,
        headComponent: null,
        cardHuierPrefab: cc.Prefab,
        direction: 'right',
    },

    getList: function () {
        return {
            uid: this.uid,
            peng: this.pengCardList,
            chi: this.chiCardList,
            gang: this.gangCardList,
            hand: this.handCardList.sort(this.sortNumber)
        };
    },

    // use this for initialization
    onLoad: function () {
        // this.hideObtainCard();
        // this.pengNode.active = false;
        // this.disNode.active = false;
        this.joinermax = Object.keys(ReplayData.players).length;
        if (this.joinermax == 4) this.discardMax = 24;
        else if (this.joinermax == 3) this.discardMax = 36;
        else if (this.joinermax == 2) this.discardMax = 60;
    },

    showHead: function (data,playername, headimgurl) {
        this.getHeadComponent().setName(playername);
        this.getHeadComponent().setHeadIcon(headimgurl);
        this.getHeadComponent().setPlayer(data);
    },

    showZhuang: function (show) {
        this.getHeadComponent().showZhuang(show);
    },

    showZhuangNum: function (zhuang, num) {
        this.getHeadComponent().showZhuangNum(zhuang, num);
    },

    getLiuGuang: function (isPlay) {
        this.getHeadComponent().getLiuGuang(isPlay);
    },

    setCoin: function (value) {
        this.getHeadComponent().setCoin(value);
    },

    setChashuiState:function(uid){

        var show = false;
        if(ReplayData.opts.water == undefined || Object.keys(ReplayData.opts.water).length <= 0){
            show = false;
        }else if ( ReplayData.opts.water[uid] == 2 ){
            show = true;
        }
        this.getHeadComponent().setChaShuiShow(show);
    },

    getHeadComponent: function () {
        if (this.headComponent == null) {
            var head = cc.instantiate(this.headPrefab);
            head.parent = this.headNode;
            this.headComponent = head.getComponent('playerTemplate');
        }
        return this.headComponent;
    },

    sortNumber: function (a, b) {
        return a - b;
    },

    obtain: function (cards) {
        if (cards == null || cards.length != 1) {
            cc.log('ReplayCardController,can not obtain the card, the card is null or length is not 1');
            return;
        }
        var cardId = cards[0];
        this.handCardList.push(cardId);
        this.getObtainCardNode().active = true;
        // this.getObtainCardNode().getComponent('HandCard').setIcon(cardId);
        // var showHuier = ReplayDataCenter.isHuier(cardId);
        // this.getObtainCardNode().getComponent('HandCard').showHuier(showHuier);
        this.showCardContent(this.getObtainCardNode(), this.getHeader(), cardId);
        this.setHuierVisible(this.getObtainCardNode(), cardId);
    },

    discard: function (cards) {
        if (cards == null || cards.length != 1) {
            cc.log('ReplayCardController,can not discard the card, the card is null or length is not 1');
            return;
        }

        var discardCardId = cards[0];

        this.handCardListRemove(discardCardId);
        this.disCardList.push(discardCardId);
        // 0 - 12,
        //
        //hide obtain card
        this.hideObtainCard();

        this.doHandCard();

        //show dis card
        this.showDisCard(discardCardId);
    },

    showDisCard: function (discardId) {
        var node4 = cc.find('cardDis_4', this.node);
        if (node4) node4.active = false;
        var node3 = cc.find('cardDis_3', this.node);
        if (node3) node3.active = false;
        var node2 = cc.find('cardDis_2', this.node);
        if (node2) node2.active = false;

        this.disNode = cc.find('cardDis_' + this.joinermax, this.node);
        this.disNode.active = true;

        for (var j = 0; j < this.discardMax; j++) {
            var disCardNode = this.disNode.getChildByName('card_face' + j);
            if (disCardNode == null || disCardNode.active == true) {
                continue;
            } else {
                disCardNode.active = true;

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

                this.showCardContent(disCardNode, cardHeader, discardId);
                break;
            }
        }
    },

    chi: function (cards) {
        if (cards == null || cards.length != 3) {
            cc.log('ReplayCardController, chi, cards is null or card length is not 3');
            return;
        }
        for (var i = 0; i < 2; i++) {
            this.handCardListRemove(cards[i]);
        }

        var pengCardNode = this.getPengCard();
        pengCardNode.active = true;
        pengCardNode.getComponent('PengCard').chi(cards);

        this.doHandCard();
        this.chiCardList.push(cards);
    },

    peng: function (cards) {
        if (cards == null || cards.length != 3) {
            cc.log('ReplayCardController, peng, cards is null or card length is not 3');
            return;
        }


        cc.log('peng before - this.handCardList.length : ' + this.handCardList.length);

        for (var i = 0; i < 2; i++) {
            this.handCardListRemove(cards[0]);
        }

        cc.log('peng after - this.handCardList.length : ' + this.handCardList.length);

        var pengCardNode = this.getPengCard();
        pengCardNode.active = true;
        pengCardNode.getComponent('PengCard').peng(cards);

        this.doHandCard();

        this.pengCardList.push(cards);
    },

    minggang: function (cards) {
        if (cards == null || cards.length != 4) {
            cc.log('ReplayCardController, minggang, cards is null or card length is not 4');
            return;
        }

        var pengCardNode = this.getPengCard();
        pengCardNode.active = true;
        pengCardNode.getComponent('PengCard').gang(cards);

        for (var i = 0; i < 3; i++) {
            this.handCardListRemove(cards[i]);
        }

        this.doHandCard();

        this.gangCardList.push(cards);
    },

    minggangself: function (cards) {
        if (cards == null || cards.length != 4) {
            cc.log('ReplayCardController, minggangself, cards is null or card length is not 4');
            return;
        }

        var pengCardNode = this.getAlreadyPengCard(cards[0]);
        pengCardNode.active = true;
        pengCardNode.getComponent('PengCard').gang(cards);

        this.handCardListRemove(cards[0]);

        this.hideObtainCard();
        this.doHandCard();

        this.gangCardList.push(cards);

        for (var i = 0; i < 3; i++) {
            var len = this.pengCardList.length;
            for (var j = 0; j < len; j++) {
                var pengCardId = this.pengCardList[j][0];
                cc.log('pengCardId : ' + pengCardId);
                if (pengCardId == cards[0]) {
                    this.pengCardList.splice(j, 1);
                    return;
                }
            }
        }
    },

    angang: function (cards) {
        if (cards == null || cards.length == 0) {
            return;
        }

        var pengCardNode = this.getPengCard();
        pengCardNode.active = true;
        pengCardNode.getComponent('PengCard').angang(cards);

        for (var i = 0; i < 4; i++) {
            this.handCardListRemove(cards[0]);
        }

        this.doHandCard();

        this.gangCardList.push(cards);
    },

    hu: function (cards) {

    },

    getPengCard: function () {
        for (var i = 0; i < 4; i++) {
            var pengCardNode = this.pengNode.getChildByName('cardPeng' + i);
            if (pengCardNode == null || pengCardNode.active == true) {
                continue;
            } else {
                return pengCardNode;
            }
        }
        return null;
    },

    getAlreadyPengCard: function (cardId) {
        for (var i = 0; i < 4; i++) {
            var pengCardNode = this.pengNode.getChildByName('cardPeng' + i);
            if (pengCardNode != null && pengCardNode.active == true) {
                var has = pengCardNode.getComponent('PengCard').hasCard(cardId);
                if (has == true) {
                    return pengCardNode;
                }
            }
        }
        return null;
    },

    doHandCard: function () {
        var sortCardList = this.getSortCardList();
        cc.log('replay hand cart list ==>> ' + sortCardList.length);
        //var startIndex = GameData.client.handsize - sortCardList.length;
        //show hand cards
        var index = 0;
        var cardlength = ReplayData.cards[0].cards.length;
        for (var i = cardlength; i >= 1; i--) {
            var cardName = "cardHand" + i;
            //cc.log('find card  : ' + cardName);
            var cardNode = this.handNode.getChildByName(cardName);
            if (cardNode == null) {
                cc.error("can not find the card node, name is " + cardName);
                continue;
            }

            if (i > sortCardList.length) {
                cardNode.active = false;
            } else {
                cardNode.active = true;
                //var handCardComponent = cardNode.getComponent('HandCard');
                var cardId = sortCardList[index];
                // handCardComponent.setIcon(cardId);
                //var showHuier = ReplayDataCenter.isHuier(cardId);
                //handCardComponent.showHuier(showHuier);

                this.showCardContent(cardNode, this.getHeader(), cardId);
                // if(this.direction == 'down')
                this.setHuierVisible(cardNode, cardId);
                index++;
            }
        }
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
            cardHeader = 'mj_face_xia_shou';
        }
        return cardHeader;
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

    setHuierVisible: function (cardNode, cardId) {
        var show = false;
        if (ReplayDataCenter.isHuier(cardId)) {
            show = true;
        }

        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (huierNode == null) {
            if (show == true) {
                huierNode = cc.instantiate(this.cardHuierPrefab);
                // this.changeHuierTexture(huierNode);
                cc.find('up', huierNode).active = false;
                cc.find('down', huierNode).active = false;
                cc.find('right', huierNode).active = false;
                cc.find('left', huierNode).active = false;
                cc.find(this.direction, huierNode).active = true;
                if (this.direction == 'down') {
                    huierNode.y = huierNode.y - 18;
                } else if (this.direction == 'up') {
                    huierNode.y = huierNode.y + 6;
                }
                // else if (this.direction == 'left') {
                //     huierNode.x = huierNode.x + 6;
                //     huierNode.y = huierNode.y + 6;
                // }
                // huierNode.scaleX = 0.8;
                // huierNode.scaleY = 0.8; 
                //huierNode.y = huierNode.y -10;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';
            }
        } else {
            huierNode.active = show;
        }
    },

    removeDisCard: function (cardId) {
        for (var i = this.disNode.childrenCount - 1; i >= 0; i--) {
            var disCardNode = this.disNode.getChildByName('card_face' + i);
            if (disCardNode == null) {
                continue;
            }
            if (disCardNode.active == true) {
                disCardNode.active = false;
                return;
            }
        }
        var len = this.disCardList.length;
        for (var i = 0; i < len; i++) {
            if (this.disCardList[i] == cardId) {
                this.disCardList.splice(i, 1);
                return;
            }
        }
        for (var i = 0; i < len; i++) {
            this.showDisCard(this.disCardList[i]);
        }
    },

    handCardListRemove: function (cardId) {
        var len = this.handCardList.length;
        for (var i = 0; i < len; i++) {
            if (this.handCardList[i] == cardId) {
                this.handCardList.splice(i, 1);
                return;
            }
        }
    },

    hideObtainCard: function () {
        this.handNode.getChildByName('cardHand0').active = false;
    },

    getObtainCardNode: function () {
        return this.handNode.getChildByName('cardHand0');
    },

    showHandCard: function (cardList) {
        if (cardList == null) {
            cc.error("cardList is null");
            return;
        }
        // if(cardList.length != GameData.client.handsize)
        // {
        //     cc.error("cardList length is " + cardList.length);
        //     return;
        // }

        for (var i = 0; i < cardList.length; i++) {
            var cardId = cardList[i];
            this.handCardList.push(cardId);
            // var cardName = "handCard" + i;
            // var cardNode = this.handNode.getChildByName(cardName);


            // if(cardNode == null)
            // {
            //     cc.error("can not find the card node, name is " + cardName);
            //     continue;
            // }

            // var handCardComponent = cardNode.getComponent('HandCard');
            // handCardComponent.getComponent('HandCard').setIcon(cardId);
        }

        this.doHandCard();
    },


    getSortCardList: function () {
        var huierList = HuierList;

        var myHuilist = [];
        var otherList = [];
        for (var i = 0; i < this.handCardList.length; i++) {
            var id = this.handCardList[i];
            if (ReplayDataCenter.isHuier(id) == true) {
                myHuilist.push(id);
            } else {
                otherList.push(id);
            }
        }
        var sortHuilist = myHuilist.sort(this.sortNumber);
        var sortOtherlist = otherList.sort(this.sortNumber);

        var list = sortHuilist.concat(sortOtherlist);
        return list;
    },
    // changeHuierTexture : function(parent){
    //     var cardlength = ReplayData.cards[0].cards.length;
    //     var texture = cc.textureCache.addImage(cc.url.raw("resources/table/huier_icon.png"));
    //     var headerNodeIcon = cc.find('huier_icon',parent)
    //     headerNodeIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

    // },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

/*
1 - 9 1条 - 9 条
11 - 19 1万-9万
21 - 29 1饼-9饼
*/