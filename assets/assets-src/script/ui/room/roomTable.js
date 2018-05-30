var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var roomHandler = require('roomHandler');
var RuleHandler = require('ruleHandler');
var errorCode = require('errorCode');

var roomTable = cc.Class({
    extends: cc.Component,

    properties: {
        direction_pos: cc.Sprite,
        direction_turn: cc.Node,

        huiercard1: cc.Sprite,
        huiercard2: cc.Sprite,
        leftCardNumLabel: cc.Label,
        // leftcard_num1: cc.Sprite,
        // leftcard_num2: cc.Sprite,

        // play_up_player: cc.Node,
        // play_down_player: cc.Node,
        // play_left_player: cc.Node,
        // play_right_player: cc.Node,

        play_layer_up: cc.Node,
        play_layer_down: cc.Node,
        play_layer_left: cc.Node,
        play_layer_right: cc.Node,

        cardsNode: cc.Node,
        spineNode: cc.Node,
        actionLayer: cc.Node,
        actionSecondaryLayer: cc.Node,

        cardTemplate: cc.Prefab,
        playerTemplate: cc.Prefab,

        selectedCard: -1,
        HuType: null,

        countdown_num1: cc.Sprite,
        countdown_num2: cc.Sprite,
        _countdown_index: 0,

        disCardArrow: cc.Prefab,
        _cardArrow: cc.Node,

        cardButtonPrefab: cc.Prefab,
        cardHuierPrefab: cc.Prefab,
        cardTingPrefab: cc.Prefab,
        cardMaskPrefab: cc.Prefab,
        //roomLabel : cc.Label,
        lastRoundLabel: cc.RichText,
        scoreLayer: cc.Node,
        roundNowNum: 0,

        mapNode: cc.Node,
        mapLayer: cc.Node,
    },

    onLoad: function () {
        //registEvent('onRoomMsg', this, this.showPlayers);
        registEvent('onGameStart', this, this.handleGameStart);
        registEvent('onGameTurn', this, this.handleTurn);
        registEvent('onGamePass', this, this.handlePass);
        registEvent('initCards', this, this.onShow);
        //registEvent('initZhuangInfo', this, this.showPlayers);
        registEvent('onCardObtain', this, this.handleObtain);
        registEvent('onCardDis', this, this.handleDisCard);
        registEvent('onCardHu', this, this.handleHuCard);
        registEvent('onCardPeng', this, this.handlePengCard);
        registEvent('onCardGang', this, this.handleGangCard);

        //registEvent('onHandCardClicked', this, this.onHandCardClicked);
        registEvent('onCardBtnStart',this,this.onCardBtnStart);
        registEvent('onCardBtnMove',this,this.onCardBtnMove);
        registEvent('onCardBtnEnd',this,this.onCardBtnEnd);
        registEvent('onCardBtnCancel',this,this.onCardBtnCancel);

        registEvent('onGameScore', this, this.onGameScore);
        //        registEvent('onJoinerLost', this, this.showJoinerLost);
        //       registEvent('onJoinerConnect', this, this.showJoinerConnect);

        this.actions = new Array();
        //this.headers = new Array();
        this.cardsNode.active = false;
        this.tingData = [];
        this.tingTip = this.node.getComponent('TingTip');
        this.playerSex = 1;
        if (GameData.room.joinermax == 4) this.discardMax = 24;
        if (GameData.room.joinermax == 3) this.discardMax = 36;
        if (GameData.room.joinermax == 2) this.discardMax = 60;

        this._cardArrow = cc.instantiate(this.disCardArrow);
        this.cardsNode.addChild(this._cardArrow);
        this._cardArrow.active = false;
        //this.schedule(function(){this.node.emit('onRoomMsg');}, 1); //1秒更新一次
        //this.roomLabel.string = '房间:' + GameData.room.id;

        //将自己的手牌的初始坐标存起来
        this.myHandsInitPosition = [];
        this.saveMyHandsInitPosition();

        
        if (GameData.game.gameStart) {
            this.handleGameStart();
        }
        if (GameData.game.initcards) {
            this.onShow();
        }
        if (GameData.game.checkPass.uid) {
            this.handlePass();
        }
        if (GameData.game.obtain > 0) {
            this.handleObtain();
        }
    },

    onDestroy: function () {
        //unregistEvent('onRoomMsg', this, this.showPlayers);
        unregistEvent('onGameStart', this, this.handleGameStart);
        unregistEvent('onGameTurn', this, this.handleTurn);
        unregistEvent('onGamePass', this, this.handlePass);
        unregistEvent('initCards', this, this.onShow);
        //unregistEvent('initZhuangInfo', this, this.showPlayers);
        unregistEvent('onCardObtain', this, this.handleObtain);
        unregistEvent('onCardDis', this, this.handleDisCard);
        unregistEvent('onCardHu', this, this.handleHuCard);
        unregistEvent('onCardPeng', this, this.handlePengCard);
        unregistEvent('onCardGang', this, this.handleGangCard);

        //unregistEvent('onHandCardClicked', this, this.onHandCardClicked);
        unregistEvent('onCardBtnStart',this,this.onCardBtnStart);
        unregistEvent('onCardBtnMove',this,this.onCardBtnMove);
        unregistEvent('onCardBtnEnd',this,this.onCardBtnEnd);
        unregistEvent('onCardBtnCancel',this,this.onCardBtnCancel);

        unregistEvent('onGameScore', this, this.onGameScore);
        // unregistEvent('onJoinerLost', this, this.showJoinerLost);
        // unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
    },

    handleGameStart: function () {
        //this.showPlayers();
        this.showPosition();
        this.cardsNode.active = false;
        this.spineNode.active = false;
        this.tingTip.hide();
        // console.log("GameData.game.roundNum + '/' + GameData.game.roundmax", GameData.game.roundNum, GameData.game.roundmax);
        // var showRoundNum = GameData.game.roundNum > GameData.game.roundmax ? GameData.game.roundmax : GameData.game.roundNum;
        // this.lastRoundLabel.string = showRoundNum + '/' + GameData.game.roundmax;
        //RuleHandler.instance.setXiangGong(false);
        this.onGameStartHandler();
    },

    onShow: function (data) {
        //this.showPlayers();
        this.moveBackMyCards();
        this.showCards();
        this.cardsNode.active = true;
        //this.spineNode.active = false;
        console.log("GameData.game.roundNum + '/' + GameData.game.roundmax", GameData.game.roundNum, GameData.game.roundmax);
        var showRoundNum = GameData.game.roundNum > GameData.game.roundmax ? GameData.game.roundmax : GameData.game.roundNum;
        this.lastRoundLabel.string = showRoundNum + '/' + GameData.game.roundmax;
    },

    handleTurn: function (data) {
        this.showTurn();
        this.startCoundDown(data);
    },

    handleObtain: function (data) {
        if (GameData.game.turn == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
            soundMngr.instance.playAudioOther('click');
        }
        this.showCards();
        if (GameData.game.turn == GameData.player.uid) {
            this.showObtainActions(GameData.player.uid, GameData.game.obtain);
        }
    },

    handleDisCard: function (data) {
        console.log("this.playerSex =  GameData.player.sex", data.detail.player, GameData.player.sex);
        // var a = GameData.getPlayerSexByUid(data.detail.player);
        // console.log("this.isPlayerSex(data.detail.player)==",a);
        this.playerSex = GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudio('dis', data.detail.card, this.playerSex);
        soundMngr.instance.playAudioOther('out');
        this.showCards();
    },

    handlePengCard: function (data) {
        if (data.detail.player == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
        }
        this.playerSex = GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudio('peng', null, this.playerSex);
        this.showCards();
        this.playActionAnimation(data.detail.player, 'peng');
    },

    handleGangCard: function (data) {
        if (data.detail.player == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
        }
        this.playerSex = GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudio('gang', null, this.playerSex);
        this.showCards();
        this.playActionAnimation(data.detail.player, 'gang');
    },

    handleHuCard: function (data) {
        cc.log("=...........................", data.detail);
        // soundMngr.instance.playAudio('hu');
        if (data.detail.player == null) return;
        this.HuType = data.detail;
        this.playerSex = GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudio('hu', data.detail, this.playerSex);
        this.scheduleOnce(function () {
            soundMngr.instance.playAudioHu(this.HuType, this.playerSex);
        }, 1);

        //setTimeout("soundMngr.instance.playeAudioHu('"+data.detail+"')",2000);
        this.playActionAnimation(data.detail.player, 'hu');
        this.actionLayer.active = false;
        this.lastRoundLabel.string = this.roundNowNum + '/' + GameData.game.roundmax;
    },

    playActionAnimation: function (uid, action) {
        if (GameData.joiners != null) {
            var pos = GameData.tablePos[uid];
            var animationNode = cc.find('layer_ui/layer_ui_table/actionAnimations/' + pos, this.node);
            cc.log('---> animationNode : ' + animationNode);
            if (animationNode != null) {
                cc.log('---> playActionAnimation : ' + action);
                animationNode.getComponent(cc.Animation).play(action);
            }
        }
    },

    handlePass: function (data) {
        // var lastCardInfo = data.detail;
        // console.log('......................lastCardInfo = '+JSON.stringify(lastCardInfo)+',GameData.game.lastdisCard= '+GameData.game.lastdisCard);
        if (GameData.game.checkPass.uid) {
            var uid = GameData.game.checkPass.uid;
            var card = GameData.game.checkPass.card;
            var show = this.showPassActions(uid, card);
            if (!show) MjHandler.getInstance().requestPass(function (res) {});
            GameData.game.checkPass = {};
        }
    },

    showPassActions: function (uid, card) {
        var btnIdx = 0;
        var self = this;
        self.actions = [];

        if (RuleHandler.instance.canPeng(uid, card)) {
            self.actions[btnIdx] = {
                act: 'peng',
                card: card
            };
            self.createActionBtn(++btnIdx, 'peng.png');
            self.moveBackMyCards();
            self.moveUpMyCards(card, 2);
        }

        var gangActions = this.checkGangAction(uid, card, false);
        if (gangActions.length > 0) {
            this.showGangAction(++btnIdx, gangActions);
        }

        if (btnIdx > 0) {
            for (; ++btnIdx <= 4;) {
                var actionBtn = cc.find('btnAct' + btnIdx, self.actionLayer);
                actionBtn.active = false;
            }
            //self.actionLayer.active = true;
            self.actionLayer.active = !this.actionSecondaryLayer.active;
        } else {
            self.actionLayer.active = false;
        }

        return (btnIdx > 0);
    },

    showObtainActions: function (uid, card) {
        var btnIdx = 0;
        var self = this;
        self.actions = [];

        cc.log('GameData.myCardObj: ' + JSON.stringify(GameData.getMyHandCards()));

        var handcards = GameData.getMyHandCards();
        var huData = RuleHandler.instance.canZimo(handcards, card, true);
        if (huData != false && huData[0] && huData[0].length > 0) {
            cc.log('client test canZimo');
            self.actions[btnIdx] = {
                act: 'hu',
                type: huData[0],
                deck: huData[1],
                obtain: huData[2]
            };
            self.createActionBtn(++btnIdx, 'hu.png');
        }
        var gangActions = this.checkGangAction(uid, card, true);
        if (gangActions.length > 0) {
            this.showGangAction(++btnIdx, gangActions);
        }

        if (btnIdx > 0) {
            for (; ++btnIdx <= 4;) {
                var actionBtn = cc.find('btnAct' + btnIdx, self.actionLayer);
                actionBtn.active = false;
            }
            //self.actionLayer.active = true;
            self.actionLayer.active = !this.actionSecondaryLayer.active;
        } else {
            self.actionLayer.active = false;
        }

        return (btnIdx > 0);
    },

    showGangAction: function (btnIdx, gangActions) {
        //cc.log('-------->>> gangActions.length ' + gangActions.length);
        if (this.actionSecondaryLayer.active) {
            this.actions[btnIdx - 1] = {
                act: 'manygang',
                card: gangActions
            };
            this.createActionBtn(btnIdx, 'gang.png');
            this.refreshGangActionBar({
                act: 'manygang',
                card: gangActions
            });
        } else {
            if (gangActions.length == 1) {
                var actionCardId = gangActions[0].card;
                this.actions[btnIdx - 1] = {
                    act: gangActions[0].act,
                    card: actionCardId
                };
                this.createActionBtn(btnIdx, 'gang.png');
                this.moveBackMyCards();
                this.moveUpMyCards(actionCardId, 4);
            } else if (gangActions.length > 1) {
                this.actions[btnIdx - 1] = {
                    act: 'manygang',
                    card: gangActions
                };
                this.createActionBtn(btnIdx, 'gang.png');
            }
        }
    },

    checkGangAction: function (uid, card, obtain) {
        var actions = new Array();
        if (obtain) {
            var minggangselfCard = RuleHandler.instance.canMingGangSelf();
            if (minggangselfCard > 0) {
                actions.push({
                    act: 'selfgang',
                    card: minggangselfCard
                });
            }

            if (GameData.game.cardleft != 0 && uid == GameData.player.uid) {
                var cards = GameData.getMyHandCards();
                for (var key in cards) {
                    if (cards[key] >= 4) {
                        actions.push({
                            act: 'angang',
                            card: key
                        });
                    }
                }
            }
        } else {
            var minggangCard = RuleHandler.instance.canMingGang(uid, card);
            if (minggangCard > 0) {
                actions.push({
                    act: 'minggang',
                    card: minggangCard
                });
            }
        }
        return actions;
    },

    createActionBtn: function (index, icon) {
        cc.log('show btn:' + icon);
        var actionNode = cc.find('btnAct' + index, this.actionLayer);
        var texture = cc.textureCache.addImage(cc.url.raw('resources/table/action/' + icon));
        actionNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
        actionNode.active = true;
    },

    onBtnActionClicked: function (evt, index) {

        cc.log('onBtnActionClicked, index : ' + index);

        for (var i = 0; i < this.actions.length; i++) {
            cc.log(this.actions[i].act + ',' + this.actions[i].card);
        }

        var self = this;
        var data = this.actions[index];
        if (data.act == 'hu') {
            MjHandler.getInstance().requestHu(data.type, data.deck, data.obtain, function (res) {
                if (res.result == 0) self.showEffect('hu');
            });
        } else if (data.act == 'peng') {
            MjHandler.getInstance().requestPengCard(data.card, function (res) {
                if (res.result == 0) self.showEffect('peng');
            });
        } else if (data.act == 'manygang') {
            cc.log('------------------> click gang, should open gang ui, data.card ' + data.card);
            this.refreshGangActionBar(data);
        } else if (data.act == 'minggang') {
            MjHandler.getInstance().requestGangMingCard(data.card, function (res) {
                if (res.result == 0) self.showEffect('gang');
            });
        } else if (data.act == 'selfgang') {
            MjHandler.getInstance().requestGangMingSelfCard(data.card, function (res) {
                if (res.result == 0) self.showEffect('gang');
            });
        } else if (data.act == 'angang') {
            MjHandler.getInstance().requestGangAnCard(data.card, function (res) {
                if (res.result == 0) self.showEffect('gang');
            });
        }

        this.moveBackMyCards();

        self.actionLayer.active = false;
    },

    refreshGangActionBar: function (data) {
        this.actionSecondaryLayer.active = true;
        var cardLayout = cc.find('cardLayout', this.actionSecondaryLayer);
        cardLayout.removeAllChildren();
        var cardTemp = cc.find('card', this.actionSecondaryLayer);
        cardTemp.active = true;
        this.gangActionList = new Array();
        for (var i = 0; i < data.card.length; i++) {
            var action = data.card[i];
            this.gangActionList.push(action);
            var card = cc.instantiate(cardTemp);
            card.name = i + '';
            card.getComponent(cc.Sprite).spriteFrame = null;
            var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action.card + '.png';
            // cc.log('load Card URL :' + iconUrl)
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            card.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

            card.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn, this);
            cardLayout.addChild(card);
        }
        cardTemp.active = false;
    },

    onBackToActionLayer: function () {
        this.actionLayer.active = true;
        this.actionSecondaryLayer.active = false;
    },

    onClickActionSecondaryBtn: function (e) {
        cc.log(e.target.name);
        var index = e.target.name;
        var data = this.gangActionList[index];
        var self = this;
        if (data != null) {
            if (data.act == 'minggang') {
                MjHandler.getInstance().requestGangMingCard(data.card, function (res) {
                    if (res.result == 0) self.showEffect('gang');
                });
            } else if (data.act == 'selfgang') {
                MjHandler.getInstance().requestGangMingSelfCard(data.card, function (res) {
                    if (res.result == 0) self.showEffect('gang');
                });
            } else if (data.act == 'angang') {
                MjHandler.getInstance().requestGangAnCard(data.card, function (res) {
                    if (res.result == 0) self.showEffect('gang');
                });
            }
        }

        if (this.gangActionList.length <= 1)
            this.actionSecondaryLayer.active = false;

        this.moveBackMyCards();
    },

    onBtnPassClicked: function (evt) {
        if (GameData.game.turn != GameData.player.uid) {
            MjHandler.getInstance().requestPass(function (res) {});
        }
        for (var i = 0; i < this.actions.length; i++) {
            // if (this.actions[i].act == 'hu') {
            //     var self = this;
            //     createMessageBox("确定要过牌吗？",function(){
            //         self.actionLayer.active = false;
            //         self.actionSecondaryLayer.active = false;
            //     }, function(){});
            // }else{
            if (this.actions[i].act == 'peng') {
                MjHandler.getInstance().requestPass(function (res) {});
            }
            this.actionLayer.active = false;
            this.actionSecondaryLayer.active = false;
            this.moveBackMyCards();
            // } 
        }
    },

    showCards: function () {
        var player = GameData.getPlayerByPos('down');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_down.active = true;
            this.showMyHandCards(player, this.play_layer_down);
            this.showDisCards(player, this.play_layer_down, 'mj_face_xia_chu', 'down');
            this.showPengCards(player, this.play_layer_down, 'mj_face_xia_chu', 'down');
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_right.active = true;
            this.showHandCards(player, this.play_layer_right);
            this.showDisCards(player, this.play_layer_right, 'mj_face_you_chu', 'right');
            this.showPengCards(player, this.play_layer_right, 'mj_face_you_chu', 'right');
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('up');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_up.active = true;
            this.showHandCards(player, this.play_layer_up);
            this.showDisCards(player, this.play_layer_up, 'mj_face_shang_shou', 'up');
            this.showPengCards(player, this.play_layer_up, 'mj_face_shang_shou', 'up');
        } else {
            this.play_layer_up.active = false;
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_left.active = true;
            this.showHandCards(player, this.play_layer_left);
            this.showDisCards(player, this.play_layer_left, 'mj_face_zuo_chu', 'left');
            this.showPengCards(player, this.play_layer_left, 'mj_face_zuo_chu', 'left');
        } else {
            this.play_layer_left.active = false;
        }

        this.showCardNum();
        this.showHuierCard();
    },

    showHandCards: function (player, parent) {
        if (player) {
            var uid = player.uid;
            var cardNum = GameData.getHandCardNum(uid) + (GameData.getChiCards(uid).length +
                GameData.getPengCards(uid).length + GameData.getGangCards(uid).length) * 3;
            var showIdx = cardNum > GameData.client.handsize ? 0 : 1;
            var handIdx = 1,
                nodeIdx = 0;
            for (; nodeIdx <= GameData.client.handsize; nodeIdx++) {
                var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                if (nodeIdx == showIdx && handIdx <= GameData.getHandCardNum(uid)) {
                    node.active = true;
                    showIdx++;
                    handIdx++;
                } else {
                    node.active = false;
                }
            }
        }
    },

    moveUpMyCards: function (id, popCount) {
        var count = 0;
        for (var i = 1; i <= GameData.client.handsize; i++) {
            var cardNode = cc.find('cardHand/cardHand' + i, this.play_layer_down);
            var cardId = cardNode.getComponent('Card').id;
            if (cardId == id) {
                cardNode.y = 43;
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

    showMyHandCards: function (player, parent) {
        var cardNum = GameData.getHandCardNum(player.uid);
        var node = cc.find('cardHand/cardHand0', parent);
        var cardHand = GameData.getMyHandCards();
        var pengcard = [];
        if (GameData.game.turn == player.uid) {
            if (GameData.game.obtain > 0) {
                var cardid = GameData.game.obtain;
                this.showCardContent(node, 'mj_face_xia_shou', cardid);
                this.setMyHandButton(node, cardid, 0);
                this.setMyHuierVisible(node, cardid, 'down');
                this.setMyTingVisible(node, cardid);
                node.active = true;
            } else {
                for (var card in cardHand) {
                    if (card == GameData.game.lastdisCard && cardHand[card] >= 2) {
                        pengcard.push(card);
                    }
                }
            }
            if (pengcard.length > 0) {
                node.active = false;
                pengcard = [];
            } else {
                cardNum--;
            }
        } else {
            node.active = false;
        }
        var cardNormal = [];
        var cardHand = GameData.getMyHandCards();
        var nodeIdx = cardNum,
            getObtain = false;

        for (var card in cardHand) {
            for (var i = 0; i < cardHand[card]; i++) {
                if (!getObtain && card == GameData.game.obtain) {
                    getObtain = true;
                    continue;
                }
                if (!RuleHandler.instance.isHuier(card)) {
                    cardNormal.push(card);
                    continue;
                }
                var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                this.showCardContent(node, 'mj_face_xia_shou', card);
                this.setMyHandButton(node, card, nodeIdx);
                this.setMyHuierVisible(node, card, 'down');
                this.setMyTingVisible(node, card);
                node.active = true;
                nodeIdx--;
            }
        }
        for (var i = 0; i < cardNormal.length; i++) {
            var card = cardNormal[i];
            var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
            // var icon = 'mj_card_xia_shou_1_'+card+'.png';
            //this.createCard(node, nodeIdx, card, icon, '', true);
            this.showCardContent(node, 'mj_face_xia_shou', card);
            this.setMyHandButton(node, card, nodeIdx);
            this.setMyHuierVisible(node, card, 'down');
            this.setMyTingVisible(node, card);
            node.active = true;
            nodeIdx--;
        }
        for (var i = cardNum + 1; i <= GameData.client.handsize; i++) {
            var node = cc.find('cardHand/cardHand' + i, parent);
            node.active = false;
        }
    },

    showDisCards: function (player, parent, cardHeader, direction) {
        var node4 = cc.find('cardDis_4', parent);
        if (node4) node4.active = false;
        var node3 = cc.find('cardDis_3', parent);
        if (node3) node3.active = false;
        var node2 = cc.find('cardDis_2', parent);
        if (node2) node2.active = false;
        console.log('22222' + GameData.room.joinermax);
        var disNode = cc.find('cardDis_' + GameData.room.joinermax, parent);
        disNode.active = true;

        var cards = GameData.getDisCards(player.uid);
        for (var i = 1; i <= this.discardMax; i++) {
            var node = cc.find('card_face' + i, disNode);
            if (i <= cards.length) {
                var iconUrl = '';
                var card = cards[i - 1];
                node.active = true;

                this.showCardContent(node, cardHeader, card);

                if (player.uid == GameData.game.lastdisUid && card == GameData.game.lastdisCard) {
                    if (node != null) {
                        this._cardArrow.active = true;
                        this._cardArrow.parent = node;
                        this._cardArrow.position.x = 0;
                        this._cardArrow.position.y = 0;
                        cc.find('left', this._cardArrow).active = direction == 'left' ? true : false;;
                        cc.find('down', this._cardArrow).active = direction == 'down' ? true : false;;
                        cc.find('right', this._cardArrow).active = direction == 'right' ? true : false;;
                        cc.find('up', this._cardArrow).active = direction == 'up' ? true : false;
                    }
                }

                /*if (player.uid == GameData.game.lastdisUid && card == GameData.game.lastdisCard) {
                    var texture = cc.textureCache.addImage(cc.url.raw(huierUrl));
                    this.huier.spriteFrame = new cc.SpriteFrame(texture);
                }*/
            } else {
                node.active = false;
            }
        }
    },

    showPengCards: function (player, parent, cardHeader, direction) {
        if (player) {
            var gang = GameData.getGangCards(player.uid);
            var peng = GameData.getPengCards(player.uid);
            var cards = gang.concat(peng);
            var size = parseInt(GameData.client.handsize / 3);

            for (var i = 0; i < size; i++) {
                var node = cc.find('cardPeng/cardPeng' + (i + 1), parent);
                if (i < cards.length) {
                    for (var n = 0; n < 4; n++) {

                        var face = node.getChildByName('card_face' + (n + 1)).getComponent("cc.Sprite");
                        //var word = node.getChildByName('card_word'+(n+1)).getComponent("cc.Sprite");
                        if (n < cards[i].length) {
                            var index = (n == 3) ? i * 3 + n - 1 : i * 3 + n + 1;
                            // var iconUrl = posflag ? (icon+index+'_'+cards[i][n]+'.png') : (icon+cards[i][n]+'.png');
                            // var texture = cc.textureCache.addImage(cc.url.raw('resources/mjcard/'+iconUrl));
                            // if(parent.name == 'layer_up')
                            // {
                            //     word.spriteFrame = new cc.SpriteFrame(texture);
                            //     word.node.active = true;
                            // }
                            // else
                            // {
                            //     face.spriteFrame = new cc.SpriteFrame(texture);
                            //     face.node.active = true;
                            // }

                            face.node.active = true;
                            var cardId = cards[i][n];
                            this.showCardContent(face.node, cardHeader, cardId);


                            var cardId = cards[i][n];
                            if (n == 3 && RuleHandler.instance.isHuier(cardId) == true) {
                                this.addHuierIcon(face.node, direction);
                            }
                        } else {
                            face.node.active = false;
                        }
                    }
                    if (cards[i].length == 5) { //暗杠
                        var face = node.getChildByName('card_face4').getComponent("cc.Sprite");
                        //var word = node.getChildByName('card_word4').getComponent("cc.Sprite");
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                        //word.node.active = false;
                        face.node.active = false;
                        back.node.active = true;
                    } else {
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                        back.node.active = false;
                    }
                    node.active = true;
                } else {
                    node.active = false;
                }
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
        // cc.log('load Card URL :' + iconUrl)
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

        if (GameData.game.turn != GameData.player.uid) {
            if (tingNode != null) {
                tingNode.active = false;
            }
        }
    },

    // createCard: function(parent, index, card, icon, bottom, enableButton) {

    //     var cardNode = cc.instantiate(this.cardTemplate);
    //     parent.addChild(cardNode);
    //     cardNode.getComponent('cardTemplate').setId(card);
    //     cardNode.getComponent('cardTemplate').setIndex(index);
    //     cardNode.getComponent('cardTemplate').enableButton(enableButton);
    //     if (icon !== '' && icon !== null)
    //         cardNode.getComponent('cardTemplate').setIcon('resources/mjcard/' + icon);
    //     if (bottom !== '' && bottom !== null) 
    //         cardNode.getComponent('cardTemplate').setBottom('resources/mjcard/' + bottom);
    //     if (RuleHandler.instance.isHuier(card))
    //         cardNode.getComponent('cardTemplate').setHuier('resources/table/huier_bg.png');

    //     this.cardSet.push(cardNode);

    //     var parentSprite = parent.getComponent(cc.Sprite);
    //     if(parentSprite != null)
    //     {
    //         // var offset = parentSprite.spriteFrame.getOffset();
    //         // cc.log(parent.name + ',' + offset.x + ',' + offset.y + ',' + icon);
    //         // cardNode.x = cardNode.x - offset.x * cardNode.getComponent('cardTemplate').icon.node.scaleX;
    //         // cardNode.y = cardNode.y - offset.y * cardNode.getComponent('cardTemplate').icon.node.scaleX;
    //     };
    // },

    showPosition: function () {
        var iconUrl = '';
        var index = GameData.getPlayerIndex(GameData.player.uid);
        var rotation = 0;

        if (index == 0) {
            rotation = 90;
        } else if (index == 3) {
            rotation = 0;
        } else if (index == 2) {
            rotation = 270;
        } else if (index == 1) {
            rotation = 180;
        }

        this.direction_pos.node.rotation = rotation;
        //cc.log('showPosition:' + index + ', icon:' + iconUrl);
    },

    showTurn: function () {
        var index = GameData.getPlayerIndex(GameData.game.turn);
        var direction;
        if (index == 0) {
            direction = 'dong';
        } else if (index == 3) {
            direction = 'nan';
        } else if (index == 2) {
            direction = 'xi';
        } else if (index == 1) {
            direction = 'bei';
        } else {
            direction = 'dong';
        }

        var texture = cc.textureCache.addImage(cc.url.raw('resources/table/' + direction + '.png'));
        this.direction_pos.spriteFrame = new cc.SpriteFrame(texture);

        cc.find('down', this.direction_turn).active = false;
        cc.find('right', this.direction_turn).active = false;
        cc.find('up', this.direction_turn).active = false;
        cc.find('left', this.direction_turn).active = false;
        cc.find(GameData.tablePos[GameData.game.turn], this.direction_turn).active = true;
    },

    showCardNum: function () {
        if (GameData.game.cardleft < 0) return;
        this.leftCardNumLabel.string = GameData.game.cardleft;
        // var n = parseInt(GameData.game.cardleft / 10);
        // var m = parseInt(GameData.game.cardleft % 10);
        // if (n > 0) {
        //     var texture1 = cc.textureCache.addImage(cc.url.raw('resources/table/leftcard/blue'+n+'.png'));
        //     this.leftcard_num1.spriteFrame = new cc.SpriteFrame(texture1);
        //     var texture2 = cc.textureCache.addImage(cc.url.raw('resources/table/leftcard/blue'+m+'.png'));
        //     this.leftcard_num2.spriteFrame = new cc.SpriteFrame(texture2);
        //     this.leftcard_num2.node.active = true;
        // } else {
        //     var texture1 = cc.textureCache.addImage(cc.url.raw('resources/table/leftcard/blue'+m+'.png'));
        //     this.leftcard_num1.spriteFrame = new cc.SpriteFrame(texture1);
        //     this.leftcard_num2.node.active = false;
        // }
    },

    showHuierCard: function () {
        var huier1 = GameData.game.cardHuier1;
        if (huier1 > 0) {
            var texture = cc.textureCache.addImage(cc.url.raw('resources/mjcard2d/mj_face_xia_shou_' + huier1 + '.png'));
            this.huiercard1.spriteFrame = new cc.SpriteFrame(texture);
        }
        var huier2 = GameData.game.cardHuier2;
        if (huier2 > 0) {
            var texture = cc.textureCache.addImage(cc.url.raw('resources/mjcard2d/mj_face_xia_shou_' + huier2 + '.png'));
            this.huiercard2.spriteFrame = new cc.SpriteFrame(texture);
        }
    },


    showEffect: function (type) {
        cc.log('show effect: ' + type);
        var spineUrl = '',
            spineAnim = '';
        switch (type) {
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

    onCardBtnStart:function(data){
    },
    onCardBtnMove:function(data){
        var card = data.detail.card;

        //显示听牌
        if (GameData.game.turn == GameData.player.uid)
        {
            this.tingTip.show(card, this.tingData);
            this.showMask(card);
        }
    },
    onCardBtnEnd:function(data){
        var index = data.detail.index;
        var type = data.detail.type;

        switch (type){
            case -1:{   //属于滑动出牌，但没超过指定范围，算弹起
                if(index == this.selectedCard){
                    this.selectedCard = -1;
                }
                this.onHandCardClicked(data);
                this.tingTip.hide();
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
    onCardBtnCancel : function(data){
        this.tingTip.hide();
    },

    onHandCardClicked: function (data) {
        var card = data.detail.card;
        var index = data.detail.index;
        var node = cc.find('cardHand/cardHand' + index, this.play_layer_down);

        var self = this;
        if (this.selectedCard == index) {
            if (RuleHandler.instance.isHuier(card)) {
                createMessageBox("您是否确认将混儿牌打出，若打出将不能胡任何牌型，请谨慎选择。", function () {
                    MjHandler.getInstance().requestDisCard(card, function (ret) {
                        if (ret.result == errorCode.Success) {
                            node.stopAllActions();
                            self.selectedCard = -1;
                            self.moveBackMyCards();
                            sendEvent('onCardHand');
                            if (RuleHandler.instance.isHuier(card)) {
                                GameData.player.isXiangGong = true;
                            }
                        }
                    });
                }, function () {
                    self.selectedCard = -1;
                    self.moveBackMyCards();
                });
            } else {
                MjHandler.getInstance().requestDisCard(card, function (ret) {
                    if (ret.result == errorCode.Success) {
                        node.stopAllActions();
                        self.selectedCard = -1;
                        self.moveBackMyCards();
                        sendEvent('onCardHand');
                        if (RuleHandler.instance.isHuier(card)) {
                            GameData.player.isXiangGong = true;
                        }
                    }
                });
            }
            this.tingTip.hide();
        } else {
            if (this.selectedCard >= 0) {
                var last = cc.find('cardHand/cardHand' + this.selectedCard, this.play_layer_down);
                last.runAction(cc.moveTo(0.01, cc.p(this.myHandsInitPosition[this.selectedCard].x, 0)));
            }
            node.runAction(cc.moveTo(0.01, cc.p(this.myHandsInitPosition[index].x, 30)));

            this.selectedCard = index;
            if (GameData.game.turn == GameData.player.uid) {
                this.tingTip.show(card, this.tingData);
                this.showMask(card);
            }
        }
    },
    showMask: function (selectCard) {
        var player = GameData.getPlayerByPos('up');
        if (player) {
            this.showPengCardMask(selectCard, this.play_layer_up, 'up');
            this.showDisCardMask(selectCard, this.play_layer_up, 'up');
        }

        player = GameData.getPlayerByPos('down');
        if (player) {
            this.showPengCardMask(selectCard, this.play_layer_down, 'down');
            this.showDisCardMask(selectCard, this.play_layer_down, 'down');
        }

        player = GameData.getPlayerByPos('left');
        if (player) {
            this.showPengCardMask(selectCard, this.play_layer_left, 'left');
            this.showDisCardMask(selectCard, this.play_layer_left, 'left');
        }

        player = GameData.getPlayerByPos('right');
        if (player) {
            this.showPengCardMask(selectCard, this.play_layer_right, 'right');
            this.showDisCardMask(selectCard, this.play_layer_right, 'right');
        }
    },

    showPengCardMask: function (selectCard, parent, direction) {
        for (var i = 1; i < 5; i++) {
            var node = cc.find('cardPeng/cardPeng' + i, parent);
            if (node != null && node.active) {
                for (var k = 1; k < 5; k++) {
                    var cardNode = cc.find('card_face' + k, node);
                    if (cardNode.active) {
                        this.gotoMask(cardNode, selectCard, parent, direction);
                    }
                }
            }
        }
    },

    showDisCardMask: function (selectCard, parent, direction) {
        for (var i = 1; i <= this.discardMax; i++) {
            var cardNode = cc.find('cardDis_' + GameData.room.joinermax + '/card_face' + i, parent);
            if (cardNode.active) {
                this.gotoMask(cardNode, selectCard, parent, direction);
            }
        }
    },

    gotoMask: function (cardNode, selectCard, parent, direction) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            var cardId = card.id;
            var show = selectCard == cardId ? true : false;
            //cc.log('------ > gotoMask cardId - > ' + cardId + ',selectCard - > ' + selectCard);
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
        //cc.log('showMaskVisible - > show ' + show);
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
        this.tingTip.hide();
        this.unschedule(this.runCountDown);
    },

    startCoundDown: function (data) {
        this.PLayerUID = data.detail;
        this._countdown_index = 10;
        this.schedule(this.runCountDown, 1);
        this.roundNowNum = GameData.game.roundNum;
    },

    runCountDown: function () {
        this.showCountDown(this._countdown_index + '');
        if (this._countdown_index <= 0) {
            this._countdown_index = 10;
        } else {
            if (this._countdown_index == 3 && this.PLayerUID == GameData.player.uid) {
                soundMngr.instance.playAudioOther('countdown');
            }
            this._countdown_index--;
        }
    },

    showCountDown: function (num) {
        var ary = num.split('');
        var url1;
        var url2;
        if (ary.length == 0) {
            return;
        }
        if (ary.length == 1) {
            url1 = cc.url.raw('resources/number/jinzi0.png');
            url2 = cc.url.raw('resources/number/jinzi' + num + '.png');
        } else if (ary.length == 2) {
            url1 = cc.url.raw('resources/number/jinzi' + ary[0] + '.png');
            url2 = cc.url.raw('resources/number/jinzi' + ary[1] + '.png');
        } else {
            return;
        }
        var texture1 = cc.textureCache.addImage(url1);
        this.countdown_num1.spriteFrame = new cc.SpriteFrame(texture1);
        var texture2 = cc.textureCache.addImage(url2);
        this.countdown_num2.spriteFrame = new cc.SpriteFrame(texture2);
    },
    showScoreLayer: function () {
        this.getComponent('roomScore').ShowPlayerScoreItem();
        this.scoreLayer.active = true;

    },
    mapCondition: function () {
        if (roomHandler.room.opts.roomType == gameDefine.roomType.Room_Match) {
            return;
        }
        this.getComponent('AMapPanel').showPlayers();
        var iconUrl;
        if (GameData.danger) {
            iconUrl = 'resources/table/map/weixian.png';
        } else {
            iconUrl = 'resources/table/map/anquan.png';
        }
        if (iconUrl != '') {
            console.log('iconUrl = ' + iconUrl);
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.mapNode.getComponent(cc.Sprite).spriteFrame = null;
            this.mapNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            this.mapNode.active = true;
        }
    },
    showMap: function (eve) {
        this.getComponent('AMapPanel').showPlayers();
        this.mapLayer.active = true;
    },
    onGameStartHandler: function () {

        if(GameData.room.opts.roomType == gameDefine.roomType.Room_Match){
            return;
        }
        this.mapCondition();
        if (GameData.room.opts.joinermax == 2) {
            this.mapNode.active = false;
        } else {
            this.mapNode.active = true;
        }
    },
});

module.exports = roomTable;