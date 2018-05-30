var soundMngr = require('SoundMngr');
var errorCode = require('errorCode');
var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

var roomTable = cc.Class({
    extends: cc.Component,
    properties: {
        play_layer_down: cc.Node,
        play_layer_left: cc.Node,
        play_layer_right: cc.Node,
        //房间规则
        ruleLb: cc.Label,
        //相关控件
        handCardLayOut: cc.Node,
        cardsNode: cc.Node,
        actionLayer: cc.Node,
        jiaofenNode: cc.Node,
        HoleCardsNode: cc.Node,
        clockNodes: cc.Node,
        buchuNodes: cc.Node,
        warningNode: cc.Node,
        multipleNode: cc.Node,
        _countdown_index: 0,
        _currClockNodes: cc.Node,
        lastRoundLabel: cc.Label,
        //动画node
        dragonAnimations: cc.Node,
        winAnimation: cc.Node,
        loseAnimation: cc.Node,
        planeNode: cc.Node,
        chuntianNode: cc.Node,
        bobmAinmation: cc.Node,
        huojianAinmation: cc.Node,
        //音效flag判断除了单对 随机播放、大你、管上、
        _effcetFlag: false,
        //触摸空白位置复位poker位置的节点
        maskNode: cc.Node,
        //当前时间
        _currTime: null,
        //地主poker标识
        dizhuSign: {
            default: null,
            type: cc.Prefab
        },
        tiBtnNode: {
            default: null,
            type: cc.Node
        },
        chuaiBtnNode: {
            default: null,
            type: cc.Node
        },
        chuaiIcon_right: {
            default: null,
            type: cc.Node
        },
        chuaiIcon_left: {
            default: null,
            type: cc.Node
        },
        tiIcon_right: {
            default: null,
            type: cc.Node
        },
        tiIcon_left: {
            default: null,
            type: cc.Node
        },
    },
    onLoad: function () {
        WriteLog('DDZ-roomtable onLoad');
        this.initData();
        this.initUI();
        this.registListenr();

        for (var key in this.handCardLayOut.children) {
            this.defaultPokerY = this.handCardLayOut.children[key].y;
        }

        //叫分断线处理start//
        if (GameDataDDZ.game.initcards) {
            this.cardsNode.active = true;
            this.onShow();
        }
        if (GameDataDDZ.currJiaofenPlayerData != null) {
            this.showJiaoFenNode();
        }
        //叫分断线处理End//

        //游戏开始断线处理
        if (GameDataDDZ.game.gameStartDizhu) {
            this.showDizhuInfo();
            this.showObtainNode();
            this.showDisPoker();
            this.showBuchuNode();
            this.reconneShowWarning();
        }
        this.connectRecurrence();
    },
    registListenr: function () {
        registEvent('ddz-onGameInfo', this, this.onShow);
        registEvent('ddz-onDiZhu', this, this.showDizhuInfo);
        registEvent('ddz-initCardHand', this, this.onShow);
        // registEvent('ddz-initCardHandNum', this, this.showCards);
        registEvent('ddz-initCardHandNum', this, this.showCardNum);
        registEvent('ddz-initCardHandNums', this, this.showCardNum);
        registEvent('ddz-initCardHands', this, this.onShow);
        registEvent('ddz-onGameStart', this, this.handleGameStart);
        registEvent('ddz-onJiaoFen', this, this.showJiaoFenNode);
        registEvent('ddz-jiaoFencb', this, this.playJiaofenEffect);
        registEvent('ddz-onShowObtainNode', this, this.showObtainNode);
        registEvent('ddz-showDisPoker', this, this.showDisPoker);
        registEvent('initTableNode', this, this.initTableNode);
        registEvent('ddz-onGameScore', this, this.showWinNode);
        registEvent('ddz-cardWarning', this, this.showWarningNode);
        registEvent('ddz-onDiscardType', this, this.showDisCardType);
        registEvent('ddz-disPokerArry', this, this.setDisPokerArry);
        registEvent('ddz-passcb', this, this.playPassEffect);
        registEvent('ddz-hintCard', this, this.showHintCard);
        registEvent('onShowSummary', this, this.stopClockMusic);
        registEvent('ddz-startTi', this, this.showTiChuai);
        registEvent('ddz-startChuai', this, this.showTiChuai);
        registEvent('ddz-showKicking', this, this.showKicking);
        registEvent('ddz-showWatch', this, this.showWatch);
        registEvent('ddz-reconnectionInfo', this, this.showJiaoFenNode);
        registEvent('coinEndEvent', this, this.coinEndEvent);

        var self = this;
        this.maskNode.on(cc.Node.EventType.TOUCH_END, function () {
            self.DoubleClick();
        })
    },
    onDestroy: function () {
        unregistEvent('ddz-onGameInfo', this, this.onShow);
        unregistEvent('ddz-onDiZhu', this, this.showDizhuInfo);
        unregistEvent('ddz-initCardHand', this, this.onShow);
        // unregistEvent('ddz-initCardHandNum', this, this.showCards);
        unregistEvent('ddz-initCardHandNum', this, this.showCardNum);
        unregistEvent('ddz-initCardHandNums', this, this.showCardNum);
        unregistEvent('ddz-initCardHands', this, this.onShow);
        unregistEvent('ddz-onGameStart', this, this.handleGameStart);
        unregistEvent('ddz-onJiaoFen', this, this.showJiaoFenNode);
        unregistEvent('ddz-jiaoFencb', this, this.playJiaofenEffect);
        unregistEvent('ddz-onShowObtainNode', this, this.showObtainNode);
        unregistEvent('ddz-showDisPoker', this, this.showDisPoker);
        unregistEvent('initTableNode', this, this.initTableNode);
        unregistEvent('ddz-onGameScore', this, this.showWinNode);
        unregistEvent('ddz-cardWarning', this, this.showWarningNode);
        unregistEvent('ddz-onDiscardType', this, this.showDisCardType);
        unregistEvent('ddz-disPokerArry', this, this.setDisPokerArry);
        unregistEvent('ddz-passcb', this, this.playPassEffect);
        unregistEvent('ddz-hintCard', this, this.showHintCard);
        unregistEvent('onShowSummary', this, this.stopClockMusic);
        unregistEvent('ddz-startTi', this, this.showTiChuai);
        unregistEvent('ddz-startChuai', this, this.showTiChuai);
        unregistEvent('ddz-showKicking', this, this.showKicking);
        unregistEvent('ddz-showWatch', this, this.showWatch);
        unregistEvent('ddz-reconnectionInfo', this, this.showJiaoFenNode);
        unregistEvent('coinEndEvent', this, this.coinEndEvent);

        var self = this;
        this.maskNode.off(cc.Node.EventType.TOUCH_END, function () {
            self.DoubleClick();
        })
    },
    initData: function () {
        this.disCardArry = [];
        this.disPokerArry = [];
        this._dragonAnimtaionNum = 1;
        this._kickingArr = [];
        this._buJiao = 0;
    },
    initUI: function () {
        this.cardsNode.active = false;
        this.jiaofenNode.active = false;
        this.ruleLb.string = this.getRuleStr();
        this.hideDisCards();
    },
    //开局初始化牌局节点
    initTableNode: function () {
        //隐藏牌桌的poker
        var leftLastCardNode = cc.find('lastpokerNum', this.play_layer_left);
        var rightLastCardNode = cc.find('lastpokerNum', this.play_layer_right);
        this.hideNodeChild(leftLastCardNode);
        this.hideNodeChild(rightLastCardNode);

        this.hideDisCards();
        this.hideHandCards();
        //开局隐藏叫分文本
        var jiaofenTextNode = cc.find('jiaofenSps', this.cardsNode);
        this.hideNodeChild(jiaofenTextNode);
        //隐藏按钮
        this.actionLayer.active = false;
        this.hideNodeChild(this.clockNodes);
        //this.hideNodeChild(this.winIconNode);
        this.hideNodeChild(this.multipleNode);

        GameDataDDZ.game.dizhuUid = 0;
        this.chuntianNode.active = false;
        this.winAnimation.active = false;
        this.loseAnimation.active = false;
        this.planeNode.active = false;
        this.bobmAinmation.active = false;
        this.huojianAinmation.active = false;
        //隐藏报警icon
        this.hideNodeChild(this.warningNode);
        //隐藏不出文本节点
        this.hideNodeChild(this.buchuNodes);
        //关闭调度器
        this.stopClockMusic();
        //this.unschedule(this.runCountDown);
    },
    showRoomRule: function() {
        WriteLog('DDZ-roomtable showRoomRule');
        this.ruleLb.string = this.getRuleStr();
    },
    hideNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
    },
    handleGameStart: function () {
        this.cardsNode.active = true;
        //开局显示poker底牌背景
        this.hideHoleCards();
    },
    onShow: function () {
        var downHandCardNode = cc.find('cardHand/handLayout', this.play_layer_down);
        for (var key in downHandCardNode.children) {
            downHandCardNode.children[key].y = this.defaultPokerY;
        }
        this.showCards();
        this.cardsNode.active = true;
        this.HoleCardsNode.active = true;
        this.lastRoundLabel.string = '局数:' + GameData.room.roundNum + '/' + GameData.room.opts.roundMax;

    },
    showCards: function () {
        var player = GameData.getPlayerByPos('down');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showMyHandCards(player, this.play_layer_down);
            this.play_layer_down.active = true;
        } else {
            this.play_layer_down.active = false;
        }

        // player = GameData.getPlayerByPos('right');
        // if (player && GameDataDDZ.cards[player.uid]) {
        //     this.showOtherHandCards(player, this.play_layer_right);
        //     this.play_layer_right.active = true;
        // } else {
        //     this.play_layer_right.active = false;
        // }

        // player = GameData.getPlayerByPos('left');
        // if (player && GameDataDDZ.cards[player.uid]) {
        //     this.showOtherHandCards(player, this.play_layer_left);
        //     this.play_layer_left.active = true;
        // } else {
        //     this.play_layer_left.active = false;
        // }

    },
    showTiChuai: function() {
        if (GameDataDDZ.tiFlag == true)
        {
            this.tiBtnNode.active = true;
        }
        else if (GameDataDDZ.chuaiFlag = true) 
        {
            this.chuaiBtnNode.active = true;
        }
    },
    tiChuaiAction: function(tiChuaiNode) {
        var callFunc1 = cc.callFunc(function() {
            tiChuaiNode.active = true;
        }, this);
        var callFunc2 = cc.callFunc(function() {
            tiChuaiNode.active = false;
        }, this);
        var delayTime = cc.delayTime(1);
        var seq = cc.sequence(callFunc1, delayTime, callFunc2);
        tiChuaiNode.parent.runAction(seq);
    },
    showPlayerTiChuai: function(pos, dizhuUid, uid) {
        var that = this;
        if (GameDataDDZ.kicking.kicking[uid] == 1 && uid == dizhuUid)
        {
            if (pos == 'right')
            {
                this.tiChuaiAction(this.chuaiIcon_right);
            }
            else if (pos == 'left')
            {
                this.tiChuaiAction(this.chuaiIcon_left);
            }
        }
        else if (GameDataDDZ.kicking.kicking[uid] == 1 && uid != dizhuUid)
        {
            if (pos == 'right')
            {
                this.tiChuaiAction(this.tiIcon_right);
            }
            else if (pos == 'left')
            {
                this.tiChuaiAction(this.tiIcon_left);
            } 
        }
    },
    showKicking: function() {
        for (var key in GameDataDDZ.kicking.kicking)
        {
            var uid = 0;
            var flag = false;
            for (var index = 0; index < this._kickingArr.length; index++)
            {
                if (key == this._kickingArr[index])
                {
                    flag = true;
                }
            }
            if (flag == false)
            {
                uid = key;
                this._kickingArr.push(key);
            }
            var pos = 0;
            if (uid != 0)
            {
                pos = GameDataDDZ.getPosByUid(uid);
            }
            if (pos != 0)
            {
                this.showPlayerTiChuai(pos, GameDataDDZ.kicking.dizhu, uid);
                break;
            }
        }
    },
    showCardNum: function() {
        var player = GameData.getPlayerByPos('right');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showOtherHandCards(player, this.play_layer_right);
            this.play_layer_right.active = true;
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showOtherHandCards(player, this.play_layer_left);
            this.play_layer_left.active = true;
        } else {
            this.play_layer_left.active = false;
        }
    },
    showMyHandCards: function (player, parent) {
        WriteLog('showMyHandCards');
        this.resetPokerPos();
        var cardHand = GameDataDDZ.getMyHandCards();
        if (cardHand == undefined)
        {
            return;
        }
        //cc.log('cardHand '+JSON.stringify(cardHand));
        var cardsHandNode = cc.find('cardHand/handLayout', parent);
        for (var key in cardsHandNode.children) {
            //cc.log('333333333');
            cardsHandNode.children[key].active = false;
        }
        var time = 1.5 / cardHand.length;
        var i = Math.ceil(cardsHandNode.childrenCount / 2) - Math.ceil(cardHand.length / 2);
        for (let j = 0; j < cardHand.length; j++) {
            let node = cc.find('cardHand/handLayout/hand_' + (i + j), parent);
            node.active = true;
            if (player.uid == GameDataDDZ.game.dizhuUid) {
                this.addDizhuSign(node);
            } else {
                this.removeDizhuSign(node);
            }
            this.showCardContent(node, cardHand[j]);
            // if(cardHand){
            //     this.scheduleOnce(function(){
            //         cc.log('animation:'+j);
            //         node.active = true;
            //     },time*j); 
            //     this.showCardContent(node,cardHand[j]);
            // }
            //node.active = true;
        }

    },
    showOtherHandCards: function (player, parent) {
        if (player) {
            var uid = player.uid;
            var cardHand = GameDataDDZ.getHandCardNum(uid);
            var handNumLb = cc.find('lastpokerNum/pokerNum', parent);
            handNumLb.active = true;
            handNumLb.getComponent(cc.Label).string = cardHand;
            var node = cc.find('cardHand/hand_0', parent);
            node.active = true;
        }
    },
    showCardContent: function (cardNode, cardId) {
        if (cardId == 0) return;
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showWatch: function() {
        this.stopClockMusic();
        for (var index = 0; index < GameDataDDZ.currtiChuaiPlayerData.length; index++)
        {
            this.showClock(GameDataDDZ.currtiChuaiPlayerData[index]);
        }
    },
    //显示叫分节点
    showJiaoFenNode: function () {
        var uid = GameDataDDZ.currJiaofenPlayerData.uid;
        var maxNum = GameDataDDZ.currJiaofenPlayerData.maxNum;

        if (GameDataDDZ.game.isJiaofenAgain) {
            GameDataDDZ.game.isJiaofenAgain = !GameDataDDZ.game.isJiaofenAgain;
            if (this._buJiao == 1)
            {
                createMessageBox(null, function () {}, null, 'resources/ddz/UI/common/artword/artword_resendPoker.png');
            }
            this._buJiao++;
        }
        this.actionLayer.active = false;
        var jiaofenTextNode = cc.find('jiaofenSps', this.cardsNode);
        this.hideNodeChild(jiaofenTextNode);
        for (var i = 1; i < 5; i++) {
            var BtnNode = cc.find('btn' + i, this.jiaofenNode);
            BtnNode.getComponent(cc.Button).interactable = true;
        }
        cc.log('GameData.player.uid == uid : ' + GameData.player.uid, uid);
        if (GameData.player.uid == uid) {
            this.jiaofenNode.active = true;
            for (; maxNum > 0; maxNum--) {
                var BtnNode1 = cc.find('btn' + maxNum, this.jiaofenNode);
                BtnNode1.getComponent(cc.Button).interactable = false;
            }
        } else {
            this.jiaofenNode.active = false;
        }
        this.disabledJiaoFenBtn();
        this.stopClockMusic();
        //显示闹钟     
        this.showClocks(uid);
        this.showJianfenText(GameDataDDZ.currJiaofenPlayerData);
    },
    disabledJiaoFenBtn: function() {
        if (GameDataDDZ.currJiaofenPlayerData == null)
        {
            return;
        }
        if (GameDataDDZ.currJiaofenPlayerData.fullMark != undefined)
        {
            for (var index = 1; index <= 4; index++)
            {
                var BtnNode1 = cc.find('btn' + index, this.jiaofenNode);
                BtnNode1.getComponent(cc.Button).interactable = false;
            }
            var BtnNode2 = cc.find('btn3', this.jiaofenNode);
            BtnNode2.getComponent(cc.Button).interactable = true;
        }
        else if (GameDataDDZ.currJiaofenPlayerData.suppress != undefined)
        {
            for (var index = 1; index <= 3; index++)
            {
                var BtnNode1 = cc.find('btn' + index, this.jiaofenNode);
                BtnNode1.getComponent(cc.Button).interactable = false;
            }
            var BtnNode2 = cc.find('btn3', this.jiaofenNode);
            BtnNode2.getComponent(cc.Button).interactable = true;
        }
    },
    //显示叫分文本
    showJianfenText: function (data) {
        cc.log('data  : ' + JSON.stringify(data));
        if (data.allJiaoFen == undefined || data.allJiaoFen == null || !data.allJiaoFen) return;

        var player = GameData.getPlayerByPos('down');
        var jiaofenNode = cc.find('jiaofenSps/downSp', this.cardsNode);
        var texture;
        if (player && GameDataDDZ.cards[player.uid]) {
            //cc.log('GameData.getJianfenNum(player.uid)  player.uid: '+GameData.getJiaofenNum(player.uid),player.uid)
            if (GameDataDDZ.getJiaofenNum(player.uid) != undefined) {
                jiaofenNode.active = true;
                texture = cc.textureCache.addImage(cc.url.raw(this.getJiaofenImg(GameDataDDZ.getJiaofenNum(player.uid))));
                jiaofenNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        } else {
            jiaofenNode.active = false;
        }

        player = GameData.getPlayerByPos('right');
        jiaofenNode = cc.find('jiaofenSps/rightSp', this.cardsNode);
        if (player && GameDataDDZ.cards[player.uid]) {
            if (GameDataDDZ.getJiaofenNum(player.uid) != undefined) {
                jiaofenNode.active = true;
                texture = cc.textureCache.addImage(cc.url.raw(this.getJiaofenImg(GameDataDDZ.getJiaofenNum(player.uid))));
                jiaofenNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        } else {
            jiaofenNode.active = false;
        }

        player = GameData.getPlayerByPos('left');
        jiaofenNode = cc.find('jiaofenSps/leftSp', this.cardsNode);
        if (player && GameDataDDZ.cards[player.uid]) {
            if (GameDataDDZ.getJiaofenNum(player.uid) != undefined) {
                jiaofenNode.active = true;
                texture = cc.textureCache.addImage(cc.url.raw(this.getJiaofenImg(GameDataDDZ.getJiaofenNum(player.uid))));
                jiaofenNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        } else {
            jiaofenNode.active = false;
        }
    },
    //叫地主环节（叫分）1,2,3 分 4:不叫
    selectScroe: function (eve, data) {
        switch (parseInt(data)) {
            case 1:
                DDZHandler.getInstance().requestSelectScore(1, function (data) {});
                this.jiaofenNode.active = false;
                break;
            case 2:
                DDZHandler.getInstance().requestSelectScore(2, function (data) {});
                this.jiaofenNode.active = false;
                break;
            case 3:
                DDZHandler.getInstance().requestSelectScore(3, function (data) {});
                this.jiaofenNode.active = false;
                break;
            case 4:
                DDZHandler.getInstance().requestSelectScore(4, function (data) {});
                this.jiaofenNode.active = false;
                break;
            default:
                break;
        }
        this._buJiao = 1;
    },
    //播放叫分音效
    playJiaofenEffect: function (data) {
        var uid = data.detail.uid;
        var num = data.detail.num;
        var playerSex = GameData.getPlayerSexByUid(uid);
        var fenStr = '';
        switch (num) {
            case 1:
                fenStr = 'yifen';
                break;
            case 2:
                fenStr = 'liangfen';
                break;
            case 3:
                fenStr = 'sanfen';
                break;
            case 4:
                fenStr = 'bujiao';
                break;
        }
        soundMngr.instance.playOtherAudioPoker(fenStr, playerSex);

    },
    //叫地主环节结束显示底牌和隐藏叫分文本
    showDizhuInfo: function () {
        var cards = GameDataDDZ.gameStartData.cards;
        var multipleNum = GameDataDDZ.gameStartData.multiple;
        this.showHoleCards(cards);
        var jiaofenTextNode = cc.find('jiaofenSps', this.cardsNode);
        this.hideNodeChild(jiaofenTextNode);
        this.changeMultiple(multipleNum);
    },
    //隐藏底牌
    hideHoleCards: function () {
        var HoleCardsNode = cc.find('cards', this.HoleCardsNode);
        for (var key in HoleCardsNode.children) {
            this.showHoleCardContent(HoleCardsNode.children[key], 'back');
        }
    },
    //显示底牌
    showHoleCards: function (cards) {
        if (cards != undefined) {
            var HoleCardsNode = cc.find('cards', this.HoleCardsNode);
            for (let i = 0; i < HoleCardsNode.childrenCount; i++) {
                let cardNode = cc.find('dipai_card' + i, HoleCardsNode);
                //播放翻牌效果
                var action1 = cc.scaleTo(0.25, 0, 0.5);
                var action2 = cc.scaleTo(0.25, 0.45, 0.5);
                cardNode.runAction(cc.sequence(action1, action2));
                var that = this;
                this.scheduleOnce(function () {
                    that.showHoleCardContent(cardNode, cards[i])
                }, 0.3)
            }
            //播放插牌效果
            // var DownHandCard = cc.find('layer_down/cardHand/handLayout',this.cardsNode);

            //  for(let i = 0;i<cards.length;i++){
            //     for(let key in DownHandCard.children){
            //         var cardId = DownHandCard.children[key].getComponent('Card').id;
            //         if(cardId == cards[i]){
            //             //cc.log('ssssssss');
            //             let poker = cc.instantiate(DownHandCard.children[key]);
            //             poker.x = DownHandCard.children[key].x;
            //             poker.y = DownHandCard.children[key].y;
            //             poker.parent = DownHandCard.children[key].parent;
            //             poker.zIndex  =  DownHandCard.children[key].zIndex;
            //             DownHandCard.children[key].active = false;
            //             var action1 = cc.fadeOut(0.1);
            //             var action2 = cc.moveTo(0.1,cc.p(600,600));
            //             var action3 = cc.fadeIn(0.2);
            //             cc.log('this.defaultPokerY:'+this.defaultPokerY);
            //             var action4 = cc.spawn(cc.moveTo(0.6,cc.p(DownHandCard.children[key].x,this.defaultPokerY+60)),cc.scaleTo(0.6,0.3));
            //             var action5 = cc.callFunc(function () {
            //                 cc.log('111:'+poker.name);
            //                 poker.removeFromParent(true);
            //             },this);
            //             var action6 = cc.callFunc(function () {
            //                 cc.log('222:'+DownHandCard.children[key].name);
            //                 DownHandCard.children[key].active=true;
            //             },this);  
            //             poker.runAction(cc.sequence(action1,action2,action3,action4,action5));
            //             this.scheduleOnce(function () {
            //                DownHandCard.children[key].active = true;
            //             },1);
            //         }
            //     }   
            // }
            this.jiaofenNode.active = false;
        }
    },
    showHoleCardContent: function (cardNode, cardId) {
        cc.log('cardNode,cardId:' + cardNode, cardId);
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    //显示当前玩家操作按钮控件
    showObtainNode: function () {
        this.disCardArry = [];
        //this.disPokerArry = [];
        var uid = GameDataDDZ.currObtainPlayerData.uid;
        var isPass = GameDataDDZ.currObtainPlayerData.flag;
        var hintFlag = GameDataDDZ.currObtainPlayerData.hintFlag;
        //cc.log('hintFlag:'+hintFlag);
        //播放特殊音效 不出大你压死
        this._effcetFlag = isPass;
        //cc.log('isPass :'+isPass);
        var ObtainNode = cc.find('actions', this.cardsNode);
        var passBtn = cc.find('actions/btnPass', this.cardsNode);
        var hintBtn = cc.find('actions/btnTishi', this.cardsNode);
        var disBtn = cc.find('actions/btnDisCard', this.cardsNode);
        if (GameData.player.uid == uid) {
            ObtainNode.active = true;
            //设置不出 提示按钮状态
            if (isPass) {
                passBtn.active = true;
                hintBtn.active = true
                if (!hintFlag) {
                    createMoveMessage('没有大过上家的牌!');
                    // hintBtn.active = false;
                    // disBtn.active = false;
                } else {
                    //disBtn.active = true;
                }
            } else {
                passBtn.active = false;
                hintBtn.active = false;
                //disBtn.active = true;
            }
        } else {
            ObtainNode.active = false;
        }

        this.stopClockMusic();
        //显示闹钟     
        this.showClocks(uid);
        //一轮后隐藏当前玩家出的poker
        var pos = GameData.tablePos[uid];
        //cc.log('pos :'+pos);
        var dispokerNode;
        switch (pos) {
            case 'down':
                dispokerNode = cc.find('layer_down/cardDis', this.cardsNode);
                break;
            case 'right':
                dispokerNode = cc.find('layer_right/cardDis', this.cardsNode);
                break;
            case 'left':
                dispokerNode = cc.find('layer_left/cardDis', this.cardsNode);
                break;
            case 'up':
                dispokerNode = cc.find('layer_up/cardDis', this.cardsNode);
                break;
            default:
                break;
        }
        //隐藏不出文本
        this.hidePassNode(pos);
        if (dispokerNode != undefined) {
            this.hideNodeChild(dispokerNode);
        }

        var myPokerNum = GameDataDDZ.getMyHandCards().length;
        cc.log('myPokerNum:' + myPokerNum, hintBtn.active, passBtn.active);
        //当玩家剩余排数为1时默认谈起
        if (!passBtn.active && !hintBtn.active && myPokerNum == 1) {
            for (var key in this.handCardLayOut.children) {
                if (this.handCardLayOut.children[key].active == true && GameData.player.uid == uid) {
                    if (this.handCardLayOut.children[key].y == this.defaultPokerY)
                    {
                        this.handCardLayOut.children[key].y += 30;
                        this.disPokerArry.push(this.handCardLayOut.children[key]);
                    }
                }
            }

        }
    },
    hidePassNode: function(pos) {
        var show = false;
        switch (pos) {
            case 'down':
                var node = cc.find('buchuLb0', this.buchuNodes);
                node.active = show;
                break;
            case 'right':
                var node = cc.find('buchuLb1', this.buchuNodes);
                node.active = show;
                break;
            case 'left':
                var node = cc.find('buchuLb2', this.buchuNodes);
                node.active = show;
                break;
            default:
                break;
        }
    },
    // 出牌
    onDisCardClick: function () {
        var cardsNode = cc.find('cardHand/handLayout', this.play_layer_down);
        //获得出牌的数组
        this.disCardArry = [];
        for (var key in this.disPokerArry) {
            var cardId = this.disPokerArry[key].getComponent('Card').id;
            //cc.log("cardId "+cardId);
            this.disCardArry.push(cardId);
        }
        //poker复位
        // this.resetPokerPos();
        var that = this;
        DDZHandler.getInstance().requestOnDisCard(this.disCardArry, function (rtn) {});

        var i = 0;
        for (var key in cardsNode.children) {
            if (cardsNode.children[key].y == this.defaultPokerY) {
                i++;
            }
        }
        if (i > 0 && this.disCardArry.length == 0) {
            createMoveMessage('请选择要出的牌!');
        }
    },
    //不出
    onPassCardClick: function () {
        DDZHandler.getInstance().requestOnPassCard(function () {});
        //poker复位
        this.resetPokerPos();
    },
    //提示
    onHintClick: function () {
        DDZHandler.getInstance().requestOnHintCard(function (data) {});
    },
    //不出音效and文字
    playPassEffect: function (data) {
        var uid = data.detail.uid;
        var playerSex = GameData.getPlayerSexByUid(uid);
        soundMngr.instance.playOtherAudioPoker('buyao', playerSex);
        this.showBuchuNode();
    },
    showBuchuNode: function () {
        var player = GameData.getPlayerByPos('down');
        var cards = GameDataDDZ.getDisPoker(player.uid);
        
        var parent = cc.find('buchuLb0', this.buchuNodes);
        this.showbuchuStr(player, parent, cards);

        player = GameData.getPlayerByPos('right');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        parent = cc.find('buchuLb1', this.buchuNodes);
        this.showbuchuStr(player, parent, cards);

        player = GameData.getPlayerByPos('left');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        parent = cc.find('buchuLb2', this.buchuNodes);
        this.showbuchuStr(player, parent, cards);
    },
    showbuchuStr: function (player, node, cards) {
        //cc.log('cards:ssssss'+cards);
        if (cards == undefined) return;
        if (cards[0] == 0) {
            node.active = true;
        } else if (cards.length == 0) {
            node.active = false;
        }
    },
    //显示桌面出的牌
    showDisPoker: function () {
        // var uid = data.detail.uid;
        var player = GameData.getPlayerByPos('down');
        var cards = GameDataDDZ.getDisPoker(player.uid);
        
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_down.active = true;
            this.showPokerCards(player, this.play_layer_down, cards);
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_right.active = true;
            this.showPokerCards(player, this.play_layer_right, cards);
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_left.active = true;
            this.showPokerCards(player, this.play_layer_left, cards);
        } else {
            this.play_layer_left.active = false;
        }

    },
    //显示桌面Poker的信息
    showPokerCards: function (player, parent, cards) {
        var uid = GameDataDDZ.currObtainPlayerData.uid;
        var cardNode = cc.find('cardDis', parent);

        //一轮后隐藏当前玩家出的poker
        if (cards == undefined) return;
        this.hideNodeChild(cardNode)
        //出牌位置显示居中
        if (parent == this.play_layer_down) {
            var i = Math.ceil(cardNode.childrenCount / 2) - Math.ceil(cards.length / 2);
            for (var j = 0; j < cards.length; j++) {
                //cc.log('asdasda ');
                var node = cc.find('dis_' + (i + j), cardNode)
                //判断不出条件
                if (cards[0] == 0) {
                    node.active = false;
                } else {
                    node.active = true;
                }
                if (player.uid == GameDataDDZ.game.dizhuUid) {
                    this.addDizhuSign(node, 'dis');
                } else {
                    this.removeDizhuSign(node);
                }
                this.showCardContent(node, cards[j]);
            }
        } else {
            for (var k = 0; k < cards.length; k++) {
                //cc.log('asdasda ');
                var node = cc.find('dis_' + k, cardNode)
                //判断不出条件
                if (cards[0] == 0) {
                    node.active = false;
                } else {
                    node.active = true;
                }
                if (player.uid == GameDataDDZ.game.dizhuUid) {
                    this.addDizhuSign(node, 'dis');
                } else {
                    this.removeDizhuSign(node);
                }
                this.showCardContent(node, cards[k]);
            }
        }

    },
    //显示钟表倒计时
    showClocks: function (uid) {
        if (uid == undefined) return
        var player = GameData.getPlayerByPos('down');
        var clockNodes = cc.find('cloock0', this.clockNodes)
        this.showClockContent(player, clockNodes, uid);

        player = GameData.getPlayerByPos('right');
        clockNodes = cc.find('cloock1', this.clockNodes)
        this.showClockContent(player, clockNodes, uid);

        player = GameData.getPlayerByPos('left');
        clockNodes = cc.find('cloock2', this.clockNodes)
        this.showClockContent(player, clockNodes, uid);

    },
    showClock: function(uid) {
        if (uid == undefined) return
        var player = GameData.getPlayerByPos('down');
        var clockNodes = cc.find('cloock0', this.clockNodes)
        this.showClockContent(player, clockNodes, uid);
    },
    showClockContent: function (player, parent, uid) {
        if (player.uid == uid) {
            parent.active = true;
            this.PLayerUID = uid;
            this._currClockNodes = parent;
            this.startCoundDown();
        }
    },
    startCoundDown: function () {
        this._countdown_index = 14;
        this.schedule(this.runCountDown, 1);
    },
    runCountDown: function () {
        this.showCountDown(this._countdown_index + '');
        if (this._countdown_index <= 0) {
            cc.log('结束');
            this._countdown_index = 15;
        } else {
            var action1 = cc.blink(0.5, 3);
            //只有当前玩家能听到倒计时
            if (this._countdown_index == 3 && this.PLayerUID == GameData.player.uid) {
                this._currClockNodes.runAction(action1);
                soundMngr.instance.playAudioOther('countdown');
            }
            this._countdown_index--;
        }
    },
    showCountDown: function (num) {
        var timeStr = num;
        var timeLabel = cc.find('timeLb', this._currClockNodes);
        if (num < 10) {
            timeStr = '0' + num;
        }
        timeLabel.getComponent(cc.Label).string = timeStr;
    },
    hideDisCards: function () {
        var downDisCardNode = cc.find('cardDis', this.play_layer_down);
        var leftDisCardNode = cc.find('cardDis', this.play_layer_left);
        var rightDisCardNode = cc.find('cardDis', this.play_layer_right);
        this.hideNodeChild(downDisCardNode);
        this.hideNodeChild(leftDisCardNode);
        this.hideNodeChild(rightDisCardNode);
    },
    hideHandCards: function () {
        var downHandCardNode = cc.find('cardHand/handLayout', this.play_layer_down);
        var leftHandCardNode = cc.find('cardHand', this.play_layer_left);
        var rightHandCardNode = cc.find('cardHand', this.play_layer_right);
        this.hideNodeChild(downHandCardNode);
        this.hideNodeChild(leftHandCardNode);
        this.hideNodeChild(rightHandCardNode);
    },
    //显示赢家img节点
    showWinNode: function (data) {
        this._kickingArr.splice(0, this._kickingArr.length);
        //关闭倒计时
        this.stopClockMusic();
        //隐藏报警icon
        this.hideNodeChild(this.warningNode);
        //隐藏不出文本节点
        this.hideNodeChild(this.buchuNodes);
        this.actionLayer.active = false;
        sendEvent('HideReadyNode');
        var player = GameData.getPlayerByPos('down');
        //var winIconNode = cc.find('winicon0',this.winIconNode)

        var myScore = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin){
                myScore = coinData.coin[GameData.player.uid];
            }
        } else {
            myScore = GameDataDDZ.resultData.score[GameData.player.uid];
        }

        //播放勝利失败音效
        if (myScore > 0) {
            soundMngr.instance.playOtherAudioPoker('shengli', null);
        } else {
            soundMngr.instance.playOtherAudioPoker('shibai', null);
        }
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_down.active = true;
            this.showWinnerIcon(player, data);
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        //winIconNode = cc.find('winicon1',this.winIconNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_right.active = true;
            this.showWinnerIcon(player, data);
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        //winIconNode = cc.find('winicon2',this.winIconNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_left.active = true;
            this.showWinnerIcon(player, data);
        } else {
            this.play_layer_left.active = false;
        }
    },
    coinEndEvent: function(data) {
        var chuntianTime = 0;
        if (data.detail.chuntian == true)
        {
            chuntianTime = 2;
        }
         this.scheduleOnce(function() {
            sendEvent('AnimationDelayTime', data.detail);
        }, 4 + this._dragonAnimtaionNum * 3);
    },
    //显示输赢动画和是否春天动画
    showWinnerIcon: function (player, data) {
        var uid = data.detail.winner;
        var ischuntian = data.detail.chuntian;
        var chuntianTime = 0;
        if (ischuntian) {
            chuntianTime = 2;
            this.scheduleOnce(function () {
                this.chuntianNode.active = true;
                var chuntianAnimation = this.chuntianNode.getComponent(dragonBones.ArmatureDisplay);
                chuntianAnimation.playAnimation('newAnimation', 1);
                soundMngr.instance.playOtherAudioPoker('chuntian', null);
            }, this._dragonAnimtaionNum * 1.5)
            //隐藏春天动画
            this.scheduleOnce(function () {
                this.chuntianNode.active = false;
            }, this._dragonAnimtaionNum * 1.5 + 2);
        }

        var myScore = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin){
                myScore = coinData.coin[GameData.player.uid];
            }
        } else {
            myScore = GameDataDDZ.resultData.score[GameData.player.uid];
        }

        if (myScore > 0) {
            //你赢了动画
            var self = this;
            this.scheduleOnce(function () {
                this.winAnimation.active = true;
                var anim = this.winAnimation.getComponent(dragonBones.ArmatureDisplay);
                anim.playAnimation('newAnimation', 1);
            }, chuntianTime + this._dragonAnimtaionNum * 1.5)
            this.scheduleOnce(function () {
                self.winAnimation.active = false;
            }, 4.5 + this._dragonAnimtaionNum * 1.5);
        } else {
            //你输了动画
            this.scheduleOnce(function () {
                this.loseAnimation.active = true;
                var anim = this.loseAnimation.getComponent(dragonBones.ArmatureDisplay);
                anim.playAnimation('newAnimation', 1);
            }, chuntianTime + this._dragonAnimtaionNum * 1.5)
        }
        var AnimationDelayTime = this._dragonAnimtaionNum * 3 + 2 + chuntianTime;
        sendEvent('AnimationDelayTime', AnimationDelayTime);
    },
    getJiaofenImg: function (num) {
        var img = '';
        switch (parseInt(num)) {
            case 1:
                img = 'resources/ddz/UI/common/artword/artword_1fen.png';
                break;
            case 2:
                img = 'resources/ddz/UI/common/artword/artword_2fen.png';
                break;
            case 3:
                img = 'resources/ddz/UI/common/artword/artword_3fen.png';
                break;
            case 4:
                img = 'resources/ddz/UI/common/artword/artword_bujiao.png';
                break;
        }
        return img;
    },
    //显示报警节点
    showWarningNode: function (data) {
        var player = GameData.getPlayerByPos('down');
        var warningNode = cc.find('warning0', this.warningNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showWarningContent(player, warningNode, data);
            this.play_layer_down.active = true;
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        warningNode = cc.find('warning1', this.warningNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showWarningContent(player, warningNode, data);
            this.play_layer_right.active = true;
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        warningNode = cc.find('warning2', this.warningNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showWarningContent(player, warningNode, data);
            this.play_layer_left.active = true;
        } else {
            this.play_layer_left.active = false;
        }
    },
    //显示报警
    showWarningContent: function (player, node, data) {
        var uid = data.detail.uid;
        var playerSex = GameData.getPlayerSexByUid(uid);
        var baodanNum = data.detail.baodan;
        //soundMngr.instance.playOtherAudioPoker('baojing',null);
        this.scheduleOnce(function () {
            soundMngr.instance.playOtherAudioPoker('baojing' + baodanNum, playerSex);
        }, 1);

        if (uid == player.uid) {
            node.active = true;
            // var action = cc.blink(2,5);
            // node.runAction(cc.repeatForever(action));
            var anima = node.getComponent(cc.Animation);
            anima.play('warningAnimation');
        }
    },
    reconneShowWarning: function () {
        var player = GameData.getPlayerByPos('down');
        var warningNode = cc.find('warning0', this.warningNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_down.active = true;
            this.reconneShowWarningContent(player, warningNode);
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        warningNode = cc.find('warning1', this.warningNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.reconneShowWarningContent(player, warningNode);
            this.play_layer_right.active = true;
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        warningNode = cc.find('warning2', this.warningNode)
        if (player && GameDataDDZ.cards[player.uid]) {
            this.reconneShowWarningContent(player, warningNode);
            this.play_layer_left.active = true;
        } else {
            this.play_layer_left.active = false;
        }
    },
    reconneShowWarningContent: function (player, node) {
        var cardNum = GameDataDDZ.getHandCardNum(player.uid);
        if (cardNum <= 2) {
            node.active = true;
            var anima = node.getComponent(cc.Animation);
            anima.play('warningAnimation');
        } else {
            node.active = false;
        }


    },
    //判断出牌牌型
    showDisCardType: function (data) {
        var DiscardType = data.detail.type;
        var multiple = data.detail.multiple;
        //清空动作队列
        this._dragonAnimtaionNum = 0;
        var playerSex = GameData.getPlayerSexByUid(data.detail.uid);
        //播放出牌类型音效
        soundMngr.instance.playAudioPokerDisType(data, playerSex, this._effcetFlag);
        //播放出牌音效
        soundMngr.instance.playOtherAudioPoker('discard', null);
        //飞机
        if (DiscardType.substring(0, DiscardType.length - 1) == 'aircraft' || DiscardType == 'aircraft' || DiscardType == 'tribletraights') {
            //播放飞机音效
            soundMngr.instance.playOtherAudioPoker('plane', null);
            this.planeNode.active = true;
            this._dragonAnimtaionNum++;
            this.DDZplayAnimation(this.planeNode, 1.5);
        }
        //炸弹
        if (DiscardType == 'bomb') {
            this._dragonAnimtaionNum++;
            //播放炸弹音效
            soundMngr.instance.playOtherAudioPoker('bomb', null);
            this.DDZplayAnimation(this.bobmAinmation, 2);
        }
        //王炸
        if (DiscardType == 'jokerBomb') {
            this._dragonAnimtaionNum++;
            //播放炸弹音效
            soundMngr.instance.playOtherAudioPoker('bomb', null);
            this.DDZplayAnimation(this.huojianAinmation, 1.7);
        }
        this.changeMultiple(multiple);

    },
    //改变顶部倍数显示
    changeMultiple: function (num) {
        if (num == undefined) return;
        var multipleNum = cc.find('multipleNum', this.multipleNode);
        this.showNodeChild(this.multipleNode);
        multipleNum.getComponent(cc.Label).string = "X" + num;
    },
    showNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = true;
        }
    },
    //添加poker到出牌数组
    setDisPokerArry: function (data) {
        var pokerArry = data.detail;
        this.disPokerArry = [];
        cc.log('pokerArry:' + pokerArry);
        for (var i = 0; i < pokerArry.length; i++) {
            var pokerName = pokerArry[i];
            for (var key in this.handCardLayOut.children) {
                if (pokerName == this.handCardLayOut.children[key].name && this.handCardLayOut.children[key].active == true) {
                    this.disPokerArry.push(this.handCardLayOut.children[key]);
                }
            }
        }
    },
    //相关动画飞机、炸弹、火箭
    DDZplayAnimation: function (animNode, delaytime) {
        //var self = this;
        animNode.active = true;
        var anima = animNode.getComponent(dragonBones.ArmatureDisplay);
        anima.playAnimation('newAnimation', 1);
        this.scheduleOnce(function () {
            animNode.active = false;
        }, delaytime);
    },
    //poker复位
    resetPokerPos: function () {
        var cardsNode = cc.find('cardHand/handLayout', this.play_layer_down);
        for (var key in cardsNode.children) {
            cardsNode.children[key].y = this.defaultPokerY;
        }
        this.disPokerArry.splice(0, this.disPokerArry.length);
    },
    //增加连点重置poker的位置方法
    DoubleClick: function () {
        var time = (new Date()).getTime();
        if (time - this._currTime < 500) {
            this.resetPokerPos();
            this.disPokerArry = [];
        }
        this._currTime = time;
    },
    //显示提示能出的poker
    showHintCard: function (data) {
        var cards = data.detail.cards;
        var uid = data.detail.uid;
        this.disPokerArry = [];
        var downHandCardNode = cc.find('layer_down/cardHand/handLayout', this.cardsNode);
        for (var key in downHandCardNode.children) {
            downHandCardNode.children[key].y = this.defaultPokerY;
        }
        for (var key in downHandCardNode.children) {
            var card = downHandCardNode.children[key].getComponent('Card');
            for (var i = 0; i < cards.length; i++) {
                if (card.id == cards[i] && downHandCardNode.children[key].active == true) {
                    downHandCardNode.children[key].y += 30;
                    this.disPokerArry.push(downHandCardNode.children[key]);
                }
            }
        }
    },
    stopClockMusic: function () {
        this.unschedule(this.runCountDown);
        //隐藏闹钟节点
        this.hideNodeChild(this.clockNodes);
    },
    getRuleStr: function () {
        if (GameData.room.opts)
        {
            return getRuleStrDDZ(GameData.room.opts);
        }
    },
    //增加地主标识
    addDizhuSign: function (node, type) {
        var dizhuSign = cc.instantiate(this.dizhuSign);
        if (type == 'dis') {
            dizhuSign.setPosition(cc.p(-40, 45));
        }
        node.addChild(dizhuSign);
    },
    //移除地主标识
    removeDizhuSign: function (node) {
        //cc.log('remove'+node.name);
        node.removeAllChildren(true);
    },

    connectRecurrence: function() {
        var flag = false;
        if (GameData.room.opts)
        {
            flag = true;
        }
        if (!flag)
        {
            return;
        }
        if (GameData.room.opts.kicking == true)
        {
            this.connectTiChuai();
        }
    },

    connectTiChuai: function() {
        if (GameDataDDZ.isEmptyObject(GameData.joinContact))
        {
            return;
        }
        if (GameDataDDZ.isEmptyObject(GameDataDDZ.kicking))
        {
            return;
        }
        if (GameData.joinContact.uid != GameData.player.uid)
        {
            return;
        }
        for (var key in GameDataDDZ.kicking.kicking)
        {
            if (key == GameData.player.uid)
            {
                this.tiBtnNode.active = false;
                this.chuaiBtnNode.active = false;
                return;
            }
        }
        if (GameDataDDZ.game.dizhuUid == GameData.player.uid)
        {
            if (GameDataDDZ.objectLen(GameDataDDZ.kicking.kicking) == 2)
            {
                this.showWatch();
                var index = 0;
                for (var key in GameDataDDZ.kicking.kicking)
                {
                    if (GameDataDDZ.kicking.kicking[key] == 0)
                    {
                        index++;
                    }
                }
                if (index == 2)
                {
                    this.chuaiBtnNode.active = false;
                }
                else
                {
                    this.chuaiBtnNode.active = true;
                }
            }
            else if (GameDataDDZ.kicking.flag == true)
            {
                this.chuaiBtnNode.active = false;
            }
            else
            {
                this.chuaiBtnNode.active = false;
            }
        }
        else 
        {
            this.showWatch();
            this.tiBtnNode.active = true;
        }
    },

    onTiBtnChecked: function(evt, customEventData) {
        this.tiBtnNode.active = false;
        this.stopClockMusic();
        DDZHandler.getInstance().requestTiChuai(customEventData, function(rtn) {
            cc.log('tiBtn rtn: ', rtn);
        });
    },

    onChuaiBtnChecked: function(evt, customEventData) {
        this.chuaiBtnNode.active = false;
        this.stopClockMusic();
        DDZHandler.getInstance().requestTiChuai(customEventData, function(rtn) {
            cc.log('chuaiBtn rtn: ', rtn);
        });
    },
})