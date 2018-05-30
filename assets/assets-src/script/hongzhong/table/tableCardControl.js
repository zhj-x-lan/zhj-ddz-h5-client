var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var errorCode = require('errorCode');
var RuleHandler = require('ruleHandler');
var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        huiercard1: cc.Sprite,
        huiercard2: cc.Sprite,

        play_layer_up: cc.Node,
        play_layer_down: cc.Node,
        play_layer_left: cc.Node,
        play_layer_right: cc.Node,

        spineNode: cc.Node,
        actionLayer: cc.Node,
        actionSecondaryLayer: cc.Node,

        cardTemplate: cc.Prefab,
        disCardArrow: cc.Prefab,
        cardButtonPrefab: cc.Prefab,
        cardHuierPrefab: cc.Prefab,
        cardTingPrefab: cc.Prefab,
        cardMaskPrefab: cc.Prefab,

        _curGameData: undefined
    },

    onLoad: function () {
        cc.log("...table card node onLoad.");
        registEvent('onCardBtnStart',this,this.onCardBtnStart);
        registEvent('onCardBtnMove',this,this.onCardBtnMove);
        registEvent('onCardBtnEnd',this,this.onCardBtnEnd);
        registEvent('onCardBtnCancel',this,this.onCardBtnCancel);

        this.selectedCard = -1;
        this.turnUid = 0;           //该谁出牌

        this.tingData = [];         //可停牌数据（稍后做）
        this.actions = [];
        this.wildCards = [];        //混牌

        this.playersUid = {
            up: 0,             //上面
            down: 0,           //下面
            right: 0,          //右面
            left: 0            //左面
        };
        this.lastDisObject = {
            lastDisCard: -1,      //最后出牌
            lastDisUid: -1        //最后出牌玩家uid
        };
        //手牌
        this.myHandObject = {
            handCards: [],        //手牌数组
            obtainCard: 0         //摸的牌
        };
        //其他玩家手牌数量
        this.handCardsObject = {
            up: 0,             //上面
            right: 0,          //右面
            left: 0            //左面
        };
        //全部打出的牌
        this.disCardsObject = {
            up: [],             //上面
            down: [],           //下面
            right: [],          //右面
            left: []            //左面
        };
        //全部用过的牌（吃、碰、杠等）
        this.usedCardsObject = {
            up: {chi: [], peng: [], gang: []},      //上面
            down: {chi: [], peng: [], gang: []},    //下面
            right: {chi: [], peng: [], gang: []},   //右面
            left: {chi: [], peng: [], gang: []}     //左面
        };
        this.actionsObject = {      //可操作数据（吃、碰、杠等）
            data: {},
            type: false
        };

        this._cardArrow = cc.instantiate(this.disCardArrow);
        this.node.addChild(this._cardArrow);
        this._cardArrow.active = false;

        this.spineNode.active = false;

        //将混牌节点隐藏
        this.huiercard1.node.active = false;
        this.huiercard2.node.active = false;

        //将自己的手牌的初始坐标存起来
        this.myHandsInitPosition = [];
        this.saveMyHandsInitPosition();

        this.setDisCardMax();

        this.showPassActions();
        this.updateWildCards();

        this.updateMyHandCards();
        this.updatePlayerDisCards();
        this.updatePlayerUsedCards();
        this.updatePlayerHandCards();
    },
    onDestroy: function () {
        unregistEvent('onCardBtnStart',this,this.onCardBtnStart);
        unregistEvent('onCardBtnMove',this,this.onCardBtnMove);
        unregistEvent('onCardBtnEnd',this,this.onCardBtnEnd);
        unregistEvent('onCardBtnCancel',this,this.onCardBtnCancel);
    },

    setDisCardMax: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        if (roomData.opts.joinermax == 4) this.discardMax = 24;
        if (roomData.opts.joinermax == 3) this.discardMax = 36;
        if (roomData.opts.joinermax == 2) this.discardMax = 60;
    },
    setPlayersUid: function(up,down,right,left){
        this.playersUid === undefined ? this.playersUid = {} : null;
        this.playersUid.up = up;
        this.playersUid.down = down;
        this.playersUid.right = right;
        this.playersUid.left = left;
    },

    setTurnUid: function(uid){
        this.turnUid = uid;
        this.updateMyHandCards();
    },
    setWildCards: function(data){
        this.wildCards = data;
        this.updateWildCards();
    },
    setActionsObject: function(data,type){
        this.actionsObject === undefined ? this.actionsObject = {} : null;
        this.actionsObject.data = data;
        this.actionsObject.type = type;
        this.showPassActions();
    },
    setLastDisObject: function(uid,card){
        this.lastDisObject === undefined ? this.lastDisObject = {} : null;
        this.lastDisObject.lastDisUid = uid;
        this.lastDisObject.lastDisCard = card;
        this.updatePlayerDisCards();
    },
    setMyHandObject: function(cards,obtain){
        this.myHandObject === undefined ? this.myHandObject = {} : null;
        this.myHandObject.handCards = cards;
        this.myHandObject.obtainCard = obtain;
        this.updateMyHandCards();
    },
    setHandCardsObject: function(up,right,left){
        this.handCardsObject === undefined ? this.handCardsObject = {} : null;
        this.handCardsObject.up = up;
        this.handCardsObject.right = right;
        this.handCardsObject.left = left;
        this.updatePlayerHandCards();
    },
    setDisCardsObject: function(up,down,right,left){
        this.disCardsObject === undefined ? this.disCardsObject = {} : null;
        this.disCardsObject.up = up;
        this.disCardsObject.down = down;
        this.disCardsObject.right = right;
        this.disCardsObject.left = left;
        this.updatePlayerDisCards();
    },
    setUsedCardsObject: function(up,down,right,left){
        this.usedCardsObject === undefined ? this.usedCardsObject = {} : null;
        this.usedCardsObject.up = up;
        this.usedCardsObject.down = down;
        this.usedCardsObject.right = right;
        this.usedCardsObject.left = left;
        this.updatePlayerUsedCards();
    },
    showActionEffect: function(sex,direction,action){
        cc.log("...1sex:"+sex);
        cc.log("...1pos:"+direction);
        cc.log("...1action:"+action);
        this.playActionAnimation(direction, action);
        this.playAudioEffect(action, null, sex);
    },
    showDisAudioEffect: function(action, card, sex){
        this.playAudioEffect(action, card, sex);
    },

    updateMyHandCards: function () {
        var cardHandNode = cc.find('cardHand', this.play_layer_down);
        for(var jj = 0;jj < cardHandNode.getChildrenCount();jj++){
            var child = cardHandNode.getChildren()[jj];
            if(child){
                child.active = false;
            }
        }

        if(this.myHandObject == undefined){
            return;
        }
        var cardHand = this.myHandObject.handCards;
        if (cardHand == undefined){
            return;
        }

        var cardNum = cardHand.length;
        var obtainCard = this.myHandObject.obtainCard;
        var isSetObtain = false;
        var index = 1;
        var nodeIdx;
        var cardId;

        //判断是不是该自己出牌
        if(this.turnUid == GameData.player.uid)
        {
            cardNum = cardHand.length -1;
            //判断是不是吃、碰等操作以后出牌
            if(this.checkHandNumber(cardHand.length) && obtainCard <= 0){
                //设置要放在摸牌位置上的牌
                for(var i = cardHand.length -1;i >= 0;i--){
                    cardId = cardHand[i];
                    if(RuleHandler.instance.isHuier(cardId)) {
                        continue;
                    }
                    obtainCard = cardHand[i];
                    break;
                }
            }
        }

        for(var ii = cardHand.length -1;ii >= 0;ii--){
            //手牌数组是从小到大排序，从最后最大的取
            cardId = cardHand[ii];

            if(this.turnUid == GameData.player.uid
                && obtainCard == cardId
                && isSetObtain == false)
            {
                //设置摸牌
                //判断是不是摸牌并且该自己出牌,是不是已经设置过摸牌
                nodeIdx = 0;
                isSetObtain = true;
            } else if(RuleHandler.instance.isHuier(cardId)) {
                //设置混牌
                //混牌只有一种，所以不用排序，直接从最左边放就行
                nodeIdx = cardNum;
                cardNum--;
            } else {
                //正常设置手牌节点位置下标
                nodeIdx = index;
                index++;
            }
            //设置牌的节点信息
            var node = cc.find('cardHand/cardHand' + nodeIdx, this.play_layer_down);
            if(node){
                node.active = true;
                this.showCardContent(node, 'mj_face_xia_shou', cardId);
                this.setMyHandButton(node, cardId, nodeIdx);
                this.setMyHuierVisible(node, cardId, 'down');
                this.setMyTingVisible(node, cardId);
            }
        }
    },

    updatePlayerHandCards: function(){
        this.showHandCards('up',this.play_layer_up);
        this.showHandCards('right',this.play_layer_right);
        this.showHandCards('left',this.play_layer_left);
    },

    updatePlayerDisCards: function(){
        this.showDisCards(this.play_layer_up, 'mj_face_shang_shou', 'up');
        this.showDisCards(this.play_layer_down, 'mj_face_xia_chu', 'down');
        this.showDisCards(this.play_layer_right, 'mj_face_you_chu', 'right');
        this.showDisCards(this.play_layer_left, 'mj_face_zuo_chu', 'left');
    },

    updatePlayerUsedCards: function(){
        this.showUsedCards(this.play_layer_up, 'mj_face_shang_shou', 'up');
        this.showUsedCards(this.play_layer_down, 'mj_face_xia_chu', 'down');
        this.showUsedCards(this.play_layer_right, 'mj_face_you_chu', 'right');
        this.showUsedCards(this.play_layer_left, 'mj_face_zuo_chu', 'left');
    },

    showHandCards: function (direction,parent) {
        var HandNode = cc.find('cardHand',parent);
        if(HandNode == undefined){
            return;
        }
        if(this.handCardsObject == undefined){
            return;
        }
        if(this.usedCardsObject == undefined){
            return;
        }
        if(this.handCardsObject[direction] <= 0){
            HandNode.active = false;
            return;
        }
        HandNode.active = true;

        var pengCardsData = undefined;
        var gangCardsData = undefined;
        var pengCardsLength = 0;
        var gangCardsLength = 0;

        if(this.usedCardsObject[direction]){
            pengCardsData = this.usedCardsObject[direction].peng;
            gangCardsData = this.usedCardsObject[direction].gang;
        }
        pengCardsData ? pengCardsLength = pengCardsData.length : null;
        gangCardsData ? gangCardsLength = gangCardsData.length : null;

        var cardNum = this.handCardsObject[direction] + (pengCardsLength + gangCardsLength) * 3;
        var showIdx = this.checkHandNumber(cardNum) ? 0 : 1;
        var handIdx = 1,
            nodeIdx = 0;
        for (; nodeIdx <= GameData.client.handsize; nodeIdx++) {
            var node = cc.find('cardHand' +nodeIdx, HandNode);
            if (nodeIdx == showIdx && handIdx <= this.handCardsObject[direction]) {
                node.active = true;
                showIdx++;
                handIdx++;
            } else {
                node.active = false;
            }
        }
    },

    showDisCards: function (parent, cardHeader, direction) {
        var RoomData = RoomHandler.getRoomData();
        if(RoomData == undefined){
            return;
        }
        var node4 = cc.find('cardDis_4', parent);
        if (node4) {
            node4.active = false;
        }
        var node3 = cc.find('cardDis_3', parent);
        if (node3) {
            node3.active = false;
        }
        var node2 = cc.find('cardDis_2', parent);
        if (node2) {
            node2.active = false;
        }
        if(this.disCardsObject == undefined){
            return;
        }
        var cards = this.disCardsObject[direction];
        if(cards == undefined || cards.length <= 0){
            return;
        }
        var disNode = cc.find('cardDis_' +RoomData.opts.joinermax, parent);
        disNode.active = true;

        for (var i = 1; i <= this.discardMax; i++) {
            var node = cc.find('card_face' +i, disNode);
            if (node && i <= cards.length) {
                var card = cards[i - 1];
                node.active = true;

                this.showCardContent(node, cardHeader, card);

                if (this.playersUid[direction] == this.lastDisObject.lastDisUid
                    && card == this.lastDisObject.lastDisCard)
                {
                    this._cardArrow.active = true;
                    this._cardArrow.parent = node;

                    this._cardArrow.position.x = 0;
                    this._cardArrow.position.y = 0;

                    cc.find('left', this._cardArrow).active = direction == 'left' ? true : false;
                    cc.find('down', this._cardArrow).active = direction == 'down' ? true : false;
                    cc.find('right', this._cardArrow).active = direction == 'right' ? true : false;
                    cc.find('up', this._cardArrow).active = direction == 'up' ? true : false;
                }
            } else {
                node.active = false;
            }
        }
    },

    showUsedCards: function (parent, cardHeader, direction) {
        var pengNode = cc.find('cardPeng', parent);
        for(var ii = 0;ii < pengNode.getChildrenCount();ii++){
            var child = pengNode.getChildren()[ii];
            if (child){
                child.active = false;
            }
        }
        if(this.usedCardsObject == undefined){
            return;
        }
        if(this.usedCardsObject[direction] == undefined){
            return;
        }
        var chi = this.usedCardsObject[direction].chi;
        var peng = this.usedCardsObject[direction].peng;
        var gang = this.usedCardsObject[direction].gang;

        if(chi == undefined || gang == undefined || peng == undefined){
            return;
        }
        var cards = peng.concat(chi);
        var size = parseInt(GameData.client.handsize / 3);

        var index,node,n,face,back,cardsObject,cardsArray,cardId;
        //吃、碰刷新
        for (index = 0; index < cards.length; index++) {
            if(index >= size){
                break;
            }
            node = cc.find('cardPeng' +(index +1), pengNode);
            if (node) {
                for (n = 0; n < 4; n++) {
                    face = node.getChildByName('card_face' + (n +1)).getComponent("cc.Sprite");
                    cardsObject = cards[index];
                    if(cardsObject == undefined){
                        break;
                    }
                    cardsArray = cardsObject.cards;
                    if( cardsArray == undefined || cardsArray.length <= 0){
                        break;
                    }
                    if(cardsArray.length >= 1){
                        cardsArray.sort(function (a, b) { return a - b; });
                    }
                    if (n < cardsArray.length) {
                        face.node.active = true;

                        if(n == 3){
                            back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                            back.node.active = false;
                        }
                        cardId = cardsArray[n];
                        this.showCardContent(face.node, cardHeader, cardId);
                    } else {
                        face.node.active = false;
                    }
                }
                node.active = true;
            }
        }
        //杠刷新
        for (; index < gang.length; index++) {
            if(index >= size){
                break;
            }
            node = cc.find('cardPeng' +(index +1), pengNode);
            if (node) {
                for (n = 0; n < 4; n++) {
                    face = node.getChildByName('card_face' + (n +1)).getComponent("cc.Sprite");
                    cardsObject = gang[index];
                    if(cardsObject == undefined){
                        break;
                    }
                    cardsArray = cardsObject.cards;
                    if( cardsArray == undefined || cardsArray.length <= 0){
                        break;
                    }
                    if (n < cardsArray.length) {
                        face.node.active = true;
                        if(n == 3){
                            back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                            //判断是不是暗杠
                            if(cardsObject.type == GangType.Gang_An){
                                face.node.active = false;
                                back.node.active = true;
                            } else {
                                back.node.active = false;
                            }
                        }
                        cardId = cardsArray[n];
                        this.showCardContent(face.node, cardHeader, cardId);
                    } else {
                        face.node.active = false;
                    }
                }
                node.active = true;
            }
        }
    },

    addHuierIcon: function (parent, direction) {
        if (parent.childrenCount <= 0) {
            var huierIconNode = new cc.Node();
            parent.addChild(huierIconNode);

            var huierIconTx = cc.textureCache.addImage(cc.url.raw('resources/table/huier_icon.png'));
            var huierIconSprite = huierIconNode.addComponent(cc.Sprite);
            huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTx);

            if (direction == 'right') {
                huierIconNode.x = -32.6;
                huierIconNode.y = 7.1;
                huierIconNode.rotation = -101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = 11;
            } else if (direction == 'down') {
                huierIconNode.x = 0;
                huierIconNode.y = 60;
                huierIconNode.skewX = 10;
            } else if (direction == 'left') {
                huierIconNode.x = 31;
                huierIconNode.y = 8.6;
                huierIconNode.rotation = 101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = -11;
            } else if (direction == 'up') {
                huierIconNode.x = 3;
                huierIconNode.y = -6.8;
                huierIconNode.rotation = 180;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.3;
            }
        }
    },
    showCardContent: function (cardNode, cardHeader, cardId) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        this.setMaskVisible(cardNode, false);
    },
    setMyHandButton: function (cardNode, cardId, index) {
        var cardBtn = cardNode.getChildByName(cardNode.name + '_button');
        if (cardBtn == null) {
            cardBtn = cc.instantiate(this.cardButtonPrefab);
            cardNode.addChild(cardBtn);
            cardBtn.name = cardNode.name + '_button';
        }
        var cardButton = cardBtn.getComponent('CardButton');
        cardButton.setCardId(cardId);
        cardButton.setIndex(index);
    },
    setMyHuierVisible: function (cardNode, cardId, direction) {
        var show = false;
        if (RuleHandler.instance.isHuier(cardId)) {
            show = true;
        }
        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (huierNode == null) {
            if (show == true) {
                huierNode = cc.instantiate(this.cardHuierPrefab);
                cc.find('up', huierNode).active = false;
                cc.find('down', huierNode).active = false;
                cc.find('right', huierNode).active = false;
                cc.find('left', huierNode).active = false;

                cc.find(direction, huierNode).active = true;
                huierNode.y = huierNode.y - 18;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';
            }
        } else {
            huierNode.active = show;
        }
    },
    setMyTingVisible: function (cardNode, cardId) {
        if(this.tingData == undefined){
            return;
        }
        var tingDiscard = false;
        for (var i = 0; i < this.tingData.length; i++) {
            var data = this.tingData[i];
            if (data.discard == cardId) {
                tingDiscard = true;
                break;
            }
        }
        var tingNode = cardNode.getChildByName(cardNode.name + '_ting');
        if (tingNode == null) {
            if (tingDiscard == true) {
                tingNode = cc.instantiate(this.cardTingPrefab);
                tingNode.y = tingNode.y - 10;
                cardNode.addChild(tingNode);
                tingNode.name = cardNode.name + '_ting';
            }
        } else {
            tingNode.active = tingDiscard;
        }
        if (this.turnUid != GameData.player.uid) {
            if (tingNode != null) {
                tingNode.active = false;
            }
        }
    },
    updateWildCards: function () {
        if(this.wildCards == undefined || this.wildCards.length <= 0){
            return;
        }
        if(this.huiercard1.node.active == false){
            if (this.wildCards[0] > 0) {
                var url = 'resources/mjcard2d/mj_face_xia_shou_' +this.wildCards[0]+ '.png';
                var texture = cc.textureCache.addImage(cc.url.raw(url));
                if(texture){
                    this.huiercard1.spriteFrame = new cc.SpriteFrame(texture);
                    this.huiercard1.node.active = true;
                }
            }
        }
        /*if (this.wildCards[1] > 0) {
            var url = 'resources/mjcard2d/mj_face_xia_shou_' +this.wildCards[1]+ '.png';
            var texture = cc.textureCache.addImage(cc.url.raw(url));
            this.huiercard2.spriteFrame = new cc.SpriteFrame(texture);
        }*/
    },

    showMask: function (selectCard) {
        this.showPengCardMask(selectCard, this.play_layer_up, 'up');
        this.showPengCardMask(selectCard, this.play_layer_down, 'down');
        this.showPengCardMask(selectCard, this.play_layer_left, 'left');
        this.showPengCardMask(selectCard, this.play_layer_right, 'right');

        this.showDisCardMask(selectCard, this.play_layer_up, 'up');
        this.showDisCardMask(selectCard, this.play_layer_down, 'down');
        this.showDisCardMask(selectCard, this.play_layer_left, 'left');
        this.showDisCardMask(selectCard, this.play_layer_right, 'right');
    },

    showPengCardMask: function (selectCard, parent, direction) {
        var cardObject = this.usedCardsObject[direction];
        if(cardObject == undefined){
            return;
        }
        for (var i = 1; i < 5; i++) {
            var node = cc.find('cardPeng/cardPeng' + i, parent);
            if (node != null && node.active) {
                for (var k = 1; k < 5; k++) {
                    var cardNode = cc.find('card_face' + k, node);
                    if (cardNode.active) {
                        this.gotoMask(cardNode, selectCard, direction);
                    }
                }
            }
        }
    },

    showDisCardMask: function (selectCard, parent, direction) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var cardObject = this.disCardsObject[direction];
        if(cardObject == undefined || cardObject.length <= 0){
            return;
        }
        for (var i = 1; i <= this.discardMax; i++) {
            var cardNode = cc.find('cardDis_' + roomData.opts.joinermax + '/card_face' + i, parent);
            if (cardNode.active) {
                this.gotoMask(cardNode, selectCard, direction);
            }
        }
    },
    gotoMask: function (cardNode, selectCard, direction) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            var cardId = card.id;
            var show = selectCard == cardId ? true : false;
            var maskNode = this.setMaskVisible(cardNode, show);
            if (maskNode != null) {
                cc.find('up', maskNode).active = false;
                cc.find('down', maskNode).active = false;
                cc.find('right', maskNode).active = false;
                cc.find('left', maskNode).active = false;

                cc.find(direction, maskNode).active = true;
            }
        }
    },
    setMaskVisible: function (cardNode, show) {
        var maskNode = cardNode.getChildByName(cardNode.name + '_mask');
        if (maskNode == null) {
            if (show == true) {
                maskNode = cc.instantiate(this.cardMaskPrefab);
                cardNode.addChild(maskNode);
                maskNode.name = cardNode.name + '_mask';
            }
        } else {
            maskNode.active = show;
        }
        return maskNode;
    },

    onGameScore: function () {
        //this.tingTip.hide();
    },

    ////牌的操作
    onCardBtnStart: function (data) {
    },
    onCardBtnMove: function (data) {
        var card = data.detail.card;

        //显示听牌
        if (this.turnUid == GameData.player.uid) {
            //this.tingTip.show(card, this.tingData);
            this.showMask(card);
        }
    },
    onCardBtnEnd: function (data) {
        var index = data.detail.index;
        var type = data.detail.type;

        switch (type){
            case -1:{   //属于滑动出牌，但没超过指定范围，算弹起
                if(index == this.selectedCard){
                    this.selectedCard = -1;
                }
                this.onHandCardClicked(data);
                //this.tingTip.hide();
            }break;
            case 0:{    //属于点击出牌
                this.onHandCardClicked(data);
            }break;
            case 1:{    //属于滑动出牌
                this.selectedCard = index;
                this.onHandCardClicked(data);
            }break;
        }
    },

    onCardBtnCancel: function (data) {
        //this.tingTip.hide();
    },
    onHandCardClicked: function (data) {

        var card = data.detail.card;
        var index = data.detail.index;
        var node = cc.find('cardHand/cardHand' + index, this.play_layer_down);

        if (this.selectedCard == index) {
            var self = this;
            //发送出牌请求
            if (this.turnUid == GameData.player.uid) {
                this._curGameData.requestDisCard(card, function (ret) {
                    if (ret.result == errorCode.Success) {
                        node.stopAllActions();
                        self.selectedCard = -1;
                        self.moveBackMyCards();
                    }
                });
            }
            //this.tingTip.hide();
        } else {
            if (this.selectedCard >= 0) {
                var last = cc.find('cardHand/cardHand' + this.selectedCard, this.play_layer_down);
                last.runAction(cc.moveTo(0.01, this.myHandsInitPosition[this.selectedCard]));
            }
            node.runAction(cc.moveTo(0.01, cc.p(this.myHandsInitPosition[index].x, 30)));

            this.selectedCard = index;
            if (this.turnUid == GameData.player.uid) {
                //this.tingTip.show(card, this.tingData);
                this.showMask(card);
            }
        }
    },
    moveUpMyCards: function (id, popCount) {
        var count = 0;
        for (var i = 1;i <= GameData.client.handsize;i++) {
            var cardNode = cc.find('cardHand/cardHand' +i, this.play_layer_down);
            var cardId = cardNode.getComponent('Card').id;
            if (cardId == id) {
                cardNode.y = 30;
                count++;
                if (count >= popCount) {
                    return;
                }
            }
        }
    },
    saveMyHandsInitPosition:function()
    {
        for( var index = 0; index <= GameData.client.handsize; index++ ) {
            var node = cc.find('cardHand/cardHand'+index, this.play_layer_down);
            this.myHandsInitPosition.push(node.getPosition());
        }
    },
    moveBackMyCards: function () {
        this.selectedCard = -1;
        for (var i = 0; i <= GameData.client.handsize; i++) {
            var cardNode = cc.find('cardHand/cardHand' + i, this.play_layer_down);
            var cardId = cardNode.getComponent('Card').id;
            cardNode.position = this.myHandsInitPosition[i];
        }
    },

    checkAnGangAndBuGang: function(){
        var btnIdx = 0;
        this.actionGang = [];

        var anGang = RuleHandler.instance.canAnGang(GameData.player.uid);
        if(anGang != undefined || anGang.length > 0){
            for(var ii = 0;ii < anGang.length;ii++){
                this.actionGang[btnIdx] = {
                    act: 'angang',
                    card: anGang[ii]
                };
                btnIdx++;
            }
        }
        var buGang = RuleHandler.instance.canBuGang(GameData.player.uid);
        if(buGang != undefined || buGang.length > 0){
            for(var jj = 0;jj < buGang.length;jj++){
                this.actionGang[btnIdx] = {
                    act: 'bugang',
                    card: buGang[jj]
                };
                btnIdx++;
            }
        }
    },

    showPassActions: function () {
        this.actionLayer.active = false;
        if(this.actionsObject == undefined){
            return;
        }
        var actionsData = this.actionsObject.data;
        if(actionsData == undefined){
            return;
        }
        var actionType = this.actionsObject.type;
        if(actionType == false){
            if(actionsData.fromCard <= 0){
                return;
            }
        }
        if(actionsData.action == undefined || actionsData.action.length <= 0){
            return;
        }
        if(this.myHandObject == undefined){
            return;
        }
        var HandCards = this.myHandObject.handCards;
        if(HandCards == undefined){
            return;
        }
        this.actionLayer.active = true;

        for(var ii = 1;ii <= 4;ii++){
            var actionBtn = cc.find('btnAct'+ii, this.actionLayer);
            actionBtn.active = false;
        }

        //按钮位置下标
        var btnIdx = 0;
        //碰、杠牌的弹起手牌数，赋最大值
        var number = 0;
        //是否已经显示杠的按钮（针对暗、补杠）
        var IsShowGang = false;

        this.actions = [];
        for(var index = 0;index < actionsData.action.length;index++){
            var act = actionsData.action[index];
            if(act == undefined || act.length <= 0){
                continue;
            }
            var checkCardsData = [];
            switch (act){
                case 'chi':{
                    //检测可吃牌
                    checkCardsData = RuleHandler.instance.canChi(GameData.player.uid,actionsData.fromCard);
                    if(checkCardsData == undefined || checkCardsData.length <= 0){
                        continue;
                    }
                }break;
                case 'peng':{}break;
                case 'minggang':{}break;
                case 'angang':
                case 'bugang':{
                    if(IsShowGang == true){
                        continue;
                    }
                    IsShowGang = true;
                }break;
                case 'dianpao':{}break;
                case 'zimo':{
                    actionsData.fromCard = this.myHandObject.obtainCard;
                }break;
            }
            this.actions[btnIdx] = {
                act: act,
                card: actionsData.fromCard,
                checkCards: checkCardsData
            };
            this.createActionBtn(++btnIdx, act);
        }
        this.moveBackMyCards();
        //稍后再写牌的弹起
        //this.moveUpMyCards(actionsData.fromCard);
    },

    createActionBtn: function (index, act) {
        var icon = null;
        switch (act){
            case 'chi':{
                icon = 'chi';
            }break;
            case 'peng':{
                icon = 'peng';
            }break;
            case 'minggang':
            case 'angang':
            case 'bugang':{
                icon = 'gang';
            }break;
            case 'dianpao':
            case 'zimo':{
                icon = 'hu';
            }break;
        }
        cc.log('..act:' +act+ '..show btn:' +icon);

        var actionNode = cc.find('btnAct' +index, this.actionLayer);
        var url = 'resources/table/action/' +icon+ '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(url));
        actionNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
        actionNode.active = true;
    },

    onBtnPassClicked: function (evt) {
        cc.log('..onBtnPassClicked.');
        cc.log("..actions:"+JSON.stringify(this.actions));

        if( Object.keys(this.actions).length <= 0){
            cc.log("..actions is null.No Pass");
            return;
        }
        this._curGameData.requestPass(function (res) {});

        this.actionLayer.active = false;
        this.actionSecondaryLayer.active = false;
        this.moveBackMyCards();
    },

    onBtnActionClicked: function (evt, index) {
        cc.log('..actionClicked, index : ' + index);
        cc.log("..actions:"+JSON.stringify(this.actions));

        var self = this;
        var data = this.actions[index];

        if( data == undefined
            || data.act == undefined
            || data.act.length <= 0){
            cc.log("..action string is undefined.");
            return;
        }
        switch (data.act){
            case 'chi':{
                if(data.checkCards.length ==1 ){
                    cc.log("....requestChiCard:"+JSON.stringify(data.checkCards[0]));
                    this._curGameData.requestChiCard( data.checkCards[0], function (res) {
                        if (res.result == 0) {self.showEffect('chi');}
                    });
                } else {
                    this.refreshActionType(data);
                }
            }break;
            case 'peng':{
                this._curGameData.requestPengCard( data.card, function (res) {
                    if (res.result == 0) {self.showEffect('peng');}
                });
            }break;
            case 'minggang':{
                this._curGameData.requestMingGangCard( data.card, function (res) {
                    if (res.result == 0) {self.showEffect('gang');}
                });
            }break;
            case 'bugang':
            case 'angang':{
                this.checkAnGangAndBuGang();
                if(this.actionGang == undefined || Object.keys(this.actionGang).length <= 0){
                    cc.log("..no An Gang. no Bu Gang.");
                    return;
                }
                if(Object.keys(this.actionGang).length == 1){
                    this.onBtnGangActionClicked(0);
                } else {
                    this.refreshGangActionType();
                }
            }break;
            case 'dianpao':{
                this._curGameData.requestDianPao( data.card, function (res) {
                    if (res.result == 0) {self.showEffect('hu');}
                });
            }break;
            case 'zimo':{
                this._curGameData.requestHu( data.card, function (res) {
                    if (res.result == 0) {self.showEffect('hu');}
                });
            }break;
        }
        this.moveBackMyCards();
        this.actionLayer.active = false;
    },

    refreshActionType : function(data){
        cc.log("....data:"+JSON.stringify(data));
        if(data == undefined){
            return;
        }
        this.actionSecondaryLayer.active = true;
        this.actionTypeData = data;

        var cardTemp = cc.find('card',this.actionSecondaryLayer);
        var cardLayout = cc.find('cardLayout',this.actionSecondaryLayer);
        cardLayout.removeAllChildren();

        for(var i = 0; i < data.checkCards.length; i++)
        {
            var cardsArray = data.checkCards[i];
            if(cardsArray == undefined){
                continue;
            }
            switch (data.act){
                case 'chi':{
                    cardsArray.push(data.card);
                }break;
                case 'peng':{}break;
                case 'minggang':{}break;
                case 'angang':{}break;
                case 'bugang':{}break;
                case 'dianpao':{}break;
                case 'zimo':{}break;
            }
            cardsArray.sort(function (a, b) {
                return a - b;
            });
            var card = cc.instantiate(cardTemp);

            for (var j = 0;j < cardsArray.length;j++) {
                var cardId = cardsArray[j];
                var cardNode = cc.find('card_'+j,card);
                if(cardId <= 0 || cardNode == undefined){
                    continue;
                }
                var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + cardId + '.png';
                var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                if(texture){
                    cardNode.getComponent(cc.Sprite).spriteFrame = null;
                    cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                }
                if (cardId == data.card) {
                    var biaoji = cardNode.getChildByName(cardNode.name + '_biao');
                    if(biaoji == null){
                        biaoji = cc.instantiate(this.cardTingPrefab);
                        cardNode.addChild(biaoji);
                        biaoji.y -= 10;
                        biaoji.name = cardNode.name + '_biao';
                    }
                }
                cardNode.active = true;
            }
            cardLayout.addChild(card);
            card.active = true;
            card.tag = i;
            card.width = 252;
            card.getComponent(cc.Sprite).spriteFrame = null;
            card.on(cc.Node.EventType.TOUCH_START, this.onBtnChiActionClicked,this);
        }
    },

    refreshGangActionType: function(){
        cc.log("....data:"+JSON.stringify(this.actionGang));
        if(this.actionGang == undefined){
            return;
        }
        this.actionSecondaryLayer.active = true;

        var self = this;
        var cardTemp = cc.find('card',this.actionSecondaryLayer);
        var cardLayout = cc.find('cardLayout',this.actionSecondaryLayer);
        cardLayout.removeAllChildren();

        for(let i = 0; i < this.actionGang.length; i++)
        {
            var gangObject = this.actionGang[i];
            if(gangObject == undefined){
                continue;
            }
            var card = cc.instantiate(cardTemp);

            var cardId = gangObject.card;
            var cardNode = cc.find('card_'+2,card);
            if(cardId <= 0 || cardNode == undefined){
                continue;
            }
            var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + cardId + '.png';
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            if(texture){
                cardNode.getComponent(cc.Sprite).spriteFrame = null;
                cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }

            var biaoji = cardNode.getChildByName(cardNode.name + '_biao');
            if(biaoji == null){
                biaoji = cc.instantiate(this.cardTingPrefab);
                cardNode.addChild(biaoji);
                biaoji.y -= 10;
                biaoji.name = cardNode.name + '_biao';
            }
            cardNode.active = true;

            cardLayout.addChild(card);
            card.active = true;
            card.width = 252;
            card.getComponent(cc.Sprite).spriteFrame = null;
            card.on(cc.Node.EventType.TOUCH_START, function(){
                self.onBtnGangActionClicked(i);
            },this);
        }
    },

    onBtnChiActionClicked : function(e){
        var index = e.target.tag;
        var card = this.actionTypeData.card;
        var data = this.actionTypeData.checkCards[index];

        if(data != null)
        {
            var self = this;
            data = spliceArrayElementOne(data,card);
            cc.log("....requestChiCard:"+JSON.stringify(data));
            this._curGameData.requestChiCard( data, function(res){
                if (res.result == 0) self.showEffect('chi');
            });
        }
        this.actionSecondaryLayer.active = false;
    },

    onBtnGangActionClicked: function(index){
        cc.log('..gangClicked, index : ' + index);
        cc.log("..actionGang:"+JSON.stringify(this.actionGang));

        var self = this;
        var data = this.actionGang[index];

        if( data == undefined
            || data.act == undefined
            || data.act.length <= 0){
            cc.log("..actionGang string is undefined.");
            return;
        }
        switch (data.act){
            case 'angang':{
                this._curGameData.requestAnGangCard( data.card, function (res) {
                    if (res.result == 0) {self.showEffect('gang');}
                });
            }break;
            case 'bugang':{
                this._curGameData.requestBuGangCard( data.card, function (res) {
                    if (res.result == 0) {self.showEffect('gang');}
                });
            }break;
        }
        this.actionSecondaryLayer.active = false;
    },

    onBackToActionLayer: function () {
        this.actionLayer.active = true;
        this.actionSecondaryLayer.active = false;
    },

    showEffect: function (type) {
        cc.log('show effect: ' + type);
        var spineUrl = '',
            spineAnim = '';
        switch (type) {
            case 'chi':
                spineUrl = 'spine/table/chi';
                spineAnim = 'a';
                break;
            case 'peng':
                spineUrl = 'spine/table/peng';
                spineAnim = 'animation';
                break;
            case 'gang':
                spineUrl = 'spine/table/gang';
                spineAnim = 'a';
                break;
            case 'hu':
                spineUrl = 'spine/table/hu';
                spineAnim = 'a';
                break;
        }
        var spineNode = this.spineNode;
        this.spineNode.active = true;

        var spine = spineNode.getComponent('sp.Skeleton');
        spine.skeletonData = null;
        spine.animation = null;

        cc.loader.loadRes(spineUrl, sp.SkeletonData, function (err, res) {
            var spine = spineNode.getComponent('sp.Skeleton');
            spine.skeletonData = res;
            spine.animation = spineAnim;
        });
    },
    playActionAnimation: function (pos, action) {
        cc.log('...3pos: ' + pos);
        cc.log('...3action: ' + action);
        var animationNode = cc.find('actionAnimations/' +pos, this.node);
        cc.log('---> animationNode : ' + animationNode);
        if (animationNode != null) {
            cc.log('---> playActionAnimation : ' + action);
            animationNode.getComponent(cc.Animation).play(action);
        }
    },
    playAudioEffect: function(action, card, sex){
        cc.log('---> action : ' + action);
        cc.log('---> card : ' + card);
        cc.log('---> sex : ' + sex);
        soundMngr.instance.playAudio(action, card, sex);
    },

    checkHandNumber: function(length){

        var size = GameData.client.handsize;
        var usedMax = parseInt(size / 3);

        for(var ii = 0;ii <= usedMax;ii++){
            var handSize = (size+1) - ii*3;
            if(length == handSize){
                return true;
            }
        }
        return false;
    }
});