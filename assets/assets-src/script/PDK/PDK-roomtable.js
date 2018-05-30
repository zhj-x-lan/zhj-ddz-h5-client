var soundMngr = require('SoundMngr');
var PDKHandler = require('PDK-handler');
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
        passNode: {
            default: null,
            type: cc.Node
        },
    },
    onLoad: function () {
        WriteLog('PDK-roomtable onLoad');
        this.initData();
        this.initUI();
        this.registListenr();

        for (var key in this.handCardLayOut.children) {
            this.defaultPokerY = this.handCardLayOut.children[key].y;
        }

        //叫分断线处理start//
        if (GameDataPDK.game.initcards) {
            this.cardsNode.active = true;
            this._dealEnd = true;
            this.onShow();
        }
        //叫分断线处理End//

        //游戏开始断线处理
        if (GameDataPDK.game.gameStartZhuang) {
            this.showObtainNode();
            this.showDisPoker();
            this.showBuchuNode();
            this.reconneShowWarning();
        }
        this.connectRecurrence();
    },
    registListenr: function () {
        registEvent('onPrepareInfo', this, this.showRoomRule);
        registEvent('pdk-onGameInfo', this, this.onShow);
        registEvent('showFirstCard', this, this.showZhuangInfo);
        registEvent('pdk-initCardHands', this, this.onShow);
        registEvent('pdk-initCardHand', this, this.initCardHand);
        // registEvent('pdk-initCardHandNum', this, this.showCards);
        registEvent('pdk-initCardHandNum', this, this.showCardNum);
        registEvent('pdk-initCardHandNums', this, this.showCardNum);
        registEvent('pdk-onGameStart', this, this.handleGameStart);
        registEvent('pdk-onShowObtainNode', this, this.showObtainNode);
        registEvent('pdk-showDisPoker', this, this.showDisPoker);
        registEvent('initTableNode', this, this.initTableNode);
        registEvent('pdk-onGameScore', this, this.showWinNode);
        registEvent('pdk-cardWarning', this, this.showWarningNode);
        registEvent('pdk-onDiscardType', this, this.showDisCardType);
        registEvent('pdk-disPokerArry', this, this.setDisPokerArry);
        registEvent('pdk-passcb', this, this.playPassEffect);
        registEvent('pdk-hintCard', this, this.showHintCard);
        registEvent('pdk-hideCard', this, this.hidePlayerCard);
        registEvent('onShowSummary', this, this.stopClockMusic);
        registEvent('pdk-showWatch', this, this.showWatch);
        registEvent('pdk-reconnectionInfo', this, this.reconnectionInfo);
        registEvent('runFlipAction', this, this.runFlipAction);
        registEvent('initObtainNode', this, this.initObtainNode);
        registEvent('showDisBtnAndClook', this, this.showDisBtnAndClook);

        var self = this;
        this.maskNode.on(cc.Node.EventType.TOUCH_END, function () {
            self.DoubleClick();
        })
    },
    onDestroy: function () {
        unregistEvent('onPrepareInfo', this, this.showRoomRule);
        unregistEvent('pdk-onGameInfo', this, this.onShow);
        unregistEvent('showFirstCard', this, this.showZhuangInfo);
        unregistEvent('pdk-initCardHands', this, this.onShow);
        unregistEvent('pdk-initCardHand', this, this.initCardHand);
        // unregistEvent('pdk-initCardHandNum', this, this.showCards);
        unregistEvent('pdk-initCardHandNum', this, this.showCardNum);
        unregistEvent('pdk-initCardHandNums', this, this.showCardNum);
        unregistEvent('pdk-onGameStart', this, this.handleGameStart);
        unregistEvent('pdk-onShowObtainNode', this, this.showObtainNode);
        unregistEvent('pdk-showDisPoker', this, this.showDisPoker);
        unregistEvent('initTableNode', this, this.initTableNode);
        unregistEvent('pdk-onGameScore', this, this.showWinNode);
        unregistEvent('pdk-cardWarning', this, this.showWarningNode);
        unregistEvent('pdk-onDiscardType', this, this.showDisCardType);
        unregistEvent('pdk-disPokerArry', this, this.setDisPokerArry);
        unregistEvent('pdk-passcb', this, this.playPassEffect);
        unregistEvent('pdk-hintCard', this, this.showHintCard);
        unregistEvent('pdk-hideCard', this, this.hidePlayerCard);
        unregistEvent('onShowSummary', this, this.stopClockMusic);
        unregistEvent('pdk-showWatch', this, this.showWatch);
        unregistEvent('pdk-reconnectionInfo', this, this.reconnectionInfo);
        unregistEvent('runFlipAction', this, this.runFlipAction);
        unregistEvent('initObtainNode', this, this.initObtainNode);
        unregistEvent('showDisBtnAndClook', this, this.showDisBtnAndClook);

        var self = this;
        this.maskNode.off(cc.Node.EventType.TOUCH_END, function () {
            self.DoubleClick();
        })
    },
    initData: function () {
        this.disCardArry = [];
        this.disPokerArry = [];
        this._dragonAnimtaionNum = 0;
        this._cardHandPosArr = [];
        this._angularArr = [];
        this._dealActionIndex = 0;
        this._flipActionIndex = 0;
        this._cardHand = [];
        this._dealEnd = false;
        this._kickingArr = [];
        this._buJiao = 1;
        this._passFlag = 0; // 0不出   1要不起
    },
    initUI: function () {
        this.HoleCardsNode.active = true;
        this.cardsNode.active = false;
        this.jiaofenNode.active = false;
        this.ruleLb.string = this.getRuleStr();
        this.hideDisCards();
        this.changeMultiple(0);
        this.lastRoundLabel.string = '局数:' + GameData.room.roundNum + '/' + GameData.room.opts.roundMax;
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
        // this.hideNodeChild(this.multipleNode);
        this.changeMultiple(0);

        GameDataPDK.game.zhuangUid = 0;
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
        this.ruleLb.string = this.getRuleStr();
    },
    hideNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
    },
    handleGameStart: function () {
        GameDataPDK.clearObject(GameDataPDK.hideDisCard);
        GameDataPDK.clearObject(GameDataPDK.currObtainPlayerData);
        this.cardsNode.active = true;
        //开局显示poker底牌背景
        this.hideHoleCards();
    },
    initCardHand: function() {
        GameDataPDK.getHandCardSize();
        cc.log('---------------------hand card size: ', GameDataPDK.handCardSize);
        if (GameDataPDK.getMyHandCards().length == GameDataPDK.handCardSize && GameDataPDK.deal == true)
        {
            this._firstInit = true;
        }
        this.onShow();
    },
    initObtainNode: function() {
        var ObtainNode = cc.find('actions', this.cardsNode);
        this.hideNodeChild(ObtainNode);
    },
    onShow: function () {
        WriteLog('onShow');
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
        WriteLog('showCards');
        var player = GameData.getPlayerByPos('down');
        if (player && GameDataPDK.cards[player.uid]) {
            if (this._firstInit)
            {
                this.dealActionMngr();
            }
            else
            {
                this.showMyHandCards(player, this.play_layer_down);
            }
            this.play_layer_down.active = true;
        } else {
            this.play_layer_down.active = false;
        }
    },
    showCardNum: function() {
        var posList = ['right', 'left'];
        var play_layer_list = [this.play_layer_right, this.play_layer_left];
        for (var index = 0; index < GameData.room.opts.joinermax - 1; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            if (player && GameDataPDK.cards[player.uid]) {
                this.showOtherHandCards(player, play_layer_list[index]);
                play_layer_list[index].active = true;
            } else {
                play_layer_list[index].active = false;
            }
        }
    },
    showMyHandCards: function (player, parent) {
        WriteLog('showMyHandCards');
        this.resetPokerPos(); //扑克复位
        var cardHand = GameDataPDK.getMyHandCards();
        // cc.log('cardHand '+JSON.stringify(cardHand));
        var cardsHandNode = cc.find('cardHand/handLayout', parent);
        for (var key in cardsHandNode.children) {
            cardsHandNode.children[key].active = false;
        }
        // var time = 1.5 / cardHand.length;
        var i = Math.ceil(cardsHandNode.childrenCount / 2) - Math.ceil(cardHand.length / 2);
        for (let j = 0; j < cardHand.length; j++) {
            let node = cc.find('cardHand/handLayout/hand_' + (i + j), parent);
            node.active = true;
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
            var cardHand = GameDataPDK.getHandCardNum(uid);
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
    showPokerBack: function() {
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        for (var key in cardsHandNode.children) 
        {
            this.showCardContent(cardsHandNode.children[key], 'back');
            cardsHandNode.children[key].active = false;
        }
    },
    showZhuangInfo: function() {
        
        var pos = GameDataPDK.getPosByUid(GameDataPDK.game.zhuangUid);
        if (pos == 'left')
        {
            var node = cc.find('firstCard', this.play_layer_left);
            node.active = true;
            this.scaleEffectsOfNode(node, 1.5, 1.5, 1, 1, 0.3, function(){});
        }
        else if (pos == 'right')
        {
            var node = cc.find('firstCard', this.play_layer_right);
            node.active = true;
            this.scaleEffectsOfNode(node, 1.5, 1.5, 1, 1, 0.3, function(){});
        }
    },
    hideFirstCardNode: function(parent) {
        if (parent == this.play_layer_down)
        {
            return;
        }
        var node = cc.find('firstCard', parent);
        node.active = false;
    },

    /**
     * 节点缩放效果
     * @param node:要缩放的节点
     * @param fromScale:起始缩放偏移量 fromScaleX fromScaleY
     * @param toScale:目标缩放偏移量  toScaleX toScaleY
     * @param time:时间
     * @param func:缩放过程中的行为
     */
    scaleEffectsOfNode: function(node, fromScaleX, fromScaleY, toScaleX, toScaleY, time, func) {
        var fromAction = cc.scaleTo(time, fromScaleX, fromScaleY);
        var toAction = cc.scaleTo(time, toScaleX, toScaleY);
        var callFunc = cc.callFunc(func, this);
        var seq = cc.sequence(callFunc, fromAction, toAction);
        node.runAction(seq);
    },
    
    dealActionMngr: function() {
        this._firstInit = false;
        this._cardHandPosArr.splice(0, this._cardHandPosArr.length);
        this._angularArr.splice(0, this._angularArr.length);
        this._dealActionIndex = 0;
        this._flipActionIndex = 0;
        var point = cc.director.getWinSize();
        var midpoint = {
            x: point.width/2,
            y: point.height,
        };
        this._cardHand = GameDataPDK.getMyHandCards();
        var cardHand = GameDataPDK.getMyHandCards();
        this.showPokerBack();
        
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        
        var i = Math.ceil(cardsHandNode.childrenCount / 2) - Math.ceil(cardHand.length / 2);
        // for (let j = 0; j < cardHand.length; j++) 
        // {
        //     let cardNode = cc.find('cardHand/handLayout/hand_' + (i+j), this.play_layer_down);
        //     this._cardHandPosArr.push(cardNode.getPosition());
        //     cardNode.setPosition(cc.p(midpoint.x, midpoint.y));
        // }
        // for (var index = 0; index < this._cardHandPosArr.length; index++)
        // {
        //     this._angularArr.push(this.angularByCoord(midpoint, this._cardHandPosArr[index]));
        // }
        
        this.schedule(this.dealAction, 0.01);
    },
    dealAction: function() {
        sendEvent('initObtainNode');
        var handCard_len = GameDataPDK.getMyHandCards().length;
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        var i = Math.ceil(cardsHandNode.childrenCount / 2) - Math.ceil(handCard_len / 2);

        let cardNode = cc.find('cardHand/handLayout/hand_' + (i+this._dealActionIndex), this.play_layer_down);
        this.removeDizhuSign(cardNode);
        cardNode.active = true;
        cardNode.ratationY = 180;
        // var moveTo = cc.moveTo(0.05, this._cardHandPosArr[this._dealActionIndex]);
        // cardNode.runAction(moveTo);
        this._dealActionIndex++;
        if (this._dealActionIndex >= handCard_len)
        {
            var that = this;
            this.unschedule(this.dealAction);
            if (GameData.room.opts.zhuangType == true)
            {
                sendEvent('rotateAction');
            }
            else if (GameData.room.opts.zhuangType == false)
            {
                sendEvent('runFlipAction');
            }
        }
    },
    runFlipAction: function() {
        var self = this;
        self.schedule(this.flipAction, 0.02);
    },
    flipAction: function() {
        var handCard_len = GameDataPDK.getMyHandCards().length;
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        var i = Math.ceil(cardsHandNode.childrenCount / 2) - Math.ceil(handCard_len / 2);

        let cardNode = cc.find('cardHand/handLayout/hand_' + (i+this._flipActionIndex), this.play_layer_down);
        cardNode.active = true;
        var rotateTo = cc.rotateTo(0.01, 0, 0);
        var that = this;
        var index = this._flipActionIndex;
        var callFunc = cc.callFunc(function() {
            that.removeDizhuSign(cardNode);
            that.showCardContent(cardNode, that._cardHand[index]);
        }, this);
        var seq = cc.sequence(rotateTo, callFunc);
        cardNode.runAction(seq);
        this._flipActionIndex++;
        if (this._flipActionIndex >= handCard_len)
        {
            this.unschedule(this.flipAction);
            that._dealEnd = true;
            sendEvent('showDisBtnAndClook');
        }
    },
    angularByCoord : function(coord1, coord2) {
        var pi = 3.14159;
        var radian;
        var x = Math.abs(coord1.x) - Math.abs(coord2.x);
        var y = Math.abs(coord1.y) - Math.abs(coord2.y);
        radian = Math.atan( Math.abs(y) / Math.abs(x) );
        if (coord1.x < coord2.x)
        {
            return 90 - radian / pi * 180;
        }
        else 
        {
            return radian / pi * 180;
        }
    },
    showWatch: function() {
        this.stopClockMusic();
        for (var index = 0; index < GameDataPDK.currtiChuaiPlayerData.length; index++)
        {
            this.showClock(GameDataPDK.currtiChuaiPlayerData[index]);
        }
    },
    reconnectionInfo:function(){
        this._dealEnd = true;
    },
    
    //隐藏底牌
    hideHoleCards: function () {
        var HoleCardsNode = cc.find('cards', this.HoleCardsNode);
        for (var key in HoleCardsNode.children) {
            this.showHoleCardContent(HoleCardsNode.children[key], 'back');
        }
    },
    //显示底牌
    
    showHoleCardContent: function (cardNode, cardId) {
        cc.log('cardNode,cardId:' + cardNode, cardId);
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showDisBtnAndClook: function() {
        var disBtn = cc.find('actions/btnDisCard', this.cardsNode);
        disBtn.active = true;
        var uid = GameDataPDK.currObtainPlayerData.uid;
        this.showClocks(uid);
    },
    //显示当前玩家操作按钮控件
    showObtainNode: function () {
        WriteLog('PDK-roomtable showObtainNode');
        this.disCardArry = [];
        var uid = GameDataPDK.currObtainPlayerData.uid;
        var isPass = GameDataPDK.currObtainPlayerData.flag;
        var hintFlag = GameDataPDK.currObtainPlayerData.hintFlag;
        //播放特殊音效 不出大你压死
        this._effcetFlag = isPass;
        var ObtainNode = cc.find('actions', this.cardsNode);
        var passBtn = cc.find('actions/btnPass', this.cardsNode);
        var hintBtn = cc.find('actions/btnTishi', this.cardsNode);
        var disBtn = cc.find('actions/btnDisCard', this.cardsNode);
        if (GameData.player.uid == uid) {
            ObtainNode.active = true;
            //设置不出 提示按钮状态
            if (isPass) {
                // passBtn.active = true;
                if (GameData.room.opts.passFlag == 1)
                {
                    passBtn.active = false;
                }
                else if (GameData.room.opts.passFlag == 2)
                {
                    passBtn.active = true;
                }
                hintBtn.active = true
                if (!hintFlag) {
                    // createMoveMessage('没有大过上家的牌!');
                    ObtainNode.active = false;
                    this._passFlag = 1;
                    this.passNode.active = true;
                    var that = this;
                    this.scheduleOnce(function() {
                        // that.passNode.active = false;
                        that.easeCubicAction(that.passNode);
                    }, 2);
                    this.scheduleOnce(function() {
                        that.onPassCardClick();
                    }, 1);
                }
                else
                {
                    if (GameDataPDK.currObtainPlayerData.endCardFlag)
                    {
                        passBtn.active = false;
                        hintBtn.active = false;
                        disBtn.active = false;
                        this.disEndCard();
                    }
                    else
                    {
                        this.onHintClick();
                    }
                }
            } else {
                passBtn.active = false;
                hintBtn.active = false;
                if (this._dealEnd == true)
                {
                    disBtn.active = true;
                }
                if (GameDataPDK.currObtainPlayerData.endCardFlag)
                {
                    disBtn.active = false;
                    this.disEndCard();
                }
            }
        } else {
            if (!hintFlag)
            {
                this._passFlag = 1;
            }
            ObtainNode.active = false;
        }

        this.stopClockMusic();
        //显示闹钟 
        if (this._dealEnd == true)
        {
            this.showClocks(uid); 
        } 
        //一轮后隐藏当前玩家出的poker
        var pos = GameData.tablePos[uid];
        cc.log('pos :'+pos);
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
        // this.hidePassNode(pos);
        if (dispokerNode != undefined) {
            this.hideNodeChild(dispokerNode);
        }

        // var myPokerNum = GameDataPDK.getMyHandCards().length;
        // cc.log('myPokerNum:' + myPokerNum, hintBtn.active, passBtn.active);
        // //当玩家剩余排数为1时默认谈起
        // if (!passBtn.active && !hintBtn.active && myPokerNum == 1) {
            // for (var key in this.handCardLayOut.children) {
            //     if (this.handCardLayOut.children[key].active == true && GameData.player.uid == uid) {
            //         if (this.handCardLayOut.children[key].y == this.defaultPokerY)
            //         {
            //             this.handCardLayOut.children[key].y += 30;
            //             this.disPokerArry.push(this.handCardLayOut.children[key]);
            //         }
            //     }
            // }

        // }
    },
    disEndCard: function() {
        var cardHand = GameDataPDK.getMyHandCards();
        for (var index = 0; index < cardHand.length; index++)
        {
            var cardId = cardHand[index];
            this.disCardArry.push(cardId);
        }
        var data = {detail: {
            cards:this.disCardArry,
            uid:0
        }}
        this.showHintCard(data);
        this.scheduleOnce(function(){
            PDKHandler.requestOnDisCard(this.disCardArry, function () {});
        }, 1);
        
    },
    hidePlayerCard: function(data) {
        var uid = data.detail.uid;
        var pos = GameDataPDK.getPosByUid(uid);
        var dispokerNode;
        if (pos)
        {
            dispokerNode = cc.find('layer_'+pos+'/cardDis', this.cardsNode);
        }
        if (dispokerNode != undefined) {
            this.hideNodeChild(dispokerNode);
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
        this.disCardArry.splice(0, this.disCardArry.length);
        for (var key in this.disPokerArry) {
            var cardId = this.disPokerArry[key].getComponent('Card').id;
            cc.log("cardId "+cardId);
            this.disCardArry.push(cardId);
        }
        //poker复位
        // this.resetPokerPos();
        PDKHandler.requestOnDisCard(this.disCardArry, function () {});
        // this.disPokerArry.splice(0, this.disPokerArry.length);
        cc.log("disCardArry: ", this.disCardArry);
        cc.log('disPokerArry: ', this.disPokerArry);
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
        PDKHandler.requestOnPassCard(function () {});
        //poker复位
        this.resetPokerPos();
    },
    //提示
    onHintClick: function () {
        PDKHandler.requestOnHintCard(function (data) {});
    },
    //不出音效and文字
    playPassEffect: function (data) {
        var uid = data.detail.uid;
        var playerSex = GameData.getPlayerSexByUid(uid);
        soundMngr.instance.playOtherAudioPoker('pdk-buyao', playerSex);
        this.showBuchuNode();
    },
    showBuchuNode: function () {
        var posList = ['down','right', 'left'];
        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            var cards = GameDataPDK.getDisPoker(player.uid);
            var parent;
            if (this._passFlag == 1)
            {
                parent = cc.find('yaobuqi' + index, this.buchuNodes);
            }
            else
            {
                // parent = cc.find('buchuLb0', this.buchuNodes);
                parent = cc.find('yaobuqi' + index, this.buchuNodes);
            }
            this.showbuchuStr(player, parent, cards);
        }
    },
    showbuchuStr: function (player, node, cards) {
        
        if (cards == undefined) return;
        if (cards[0] == 0) {
            node.active = true;
            var that = this;
            this.scheduleOnce(function() {
                that.easeCubicAction(node);
            }, 2);
        } 
        else if (cards.length == 0) {
            node.active = false;
        }
    },
    easeCubicActionTimer: function(node) {
        node.opacity = node.opacity - 51;
    },
    
    easeCubicAction: function(node) {
        var index = 0;
        var that = this;
        var timerCall = function(){
            index++;
            that.easeCubicActionTimer(node);
            if (index >= 5)
            {
                node.active = false;
                node.opacity = 255;
                that.unschedule(timerCall);
            }
        }
        this.schedule(timerCall, 0.1);
    },
    //显示桌面出的牌
    showDisPoker: function () {
        var posList = ['down','right', 'left'];
        var play_layer_list = [this.play_layer_down, this.play_layer_right, this.play_layer_left];
        
        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            var cards = GameDataPDK.getDisPoker(player.uid);
            
            if (player && GameDataPDK.cards[player.uid]) {
                play_layer_list[index].active = true;
                this.showPokerCards(player, play_layer_list[index], cards);
            } else {
                play_layer_list[index].active = false;
            }
        }
        
        this.hideDisPoker();
        this.changeMultiple(GameDataPDK.boomNum);
    },
    hideDisPoker: function() {
        var disCardNode;
        if (!GameDataPDK.isEmptyObject(GameDataPDK.hideDisCard))
        {
            var pos = GameDataPDK.getPosByUid(GameDataPDK.hideDisCard.uid);
            switch (pos) {
                case 'down':
                    // this.play_layer_down.active = false;
                    disCardNode = cc.find('cardDis', this.play_layer_down);
                    break;
                case 'right':
                    // this.play_layer_right.active = false;
                    disCardNode = cc.find('cardDis', this.play_layer_right);
                    break;
                case 'left':
                    // this.play_layer_left.active = false;
                    disCardNode = cc.find('cardDis', this.play_layer_left);
                    break;
                default:
                    break;
            }
            this.hideNodeChild(disCardNode);
        }
    },
    //显示桌面Poker的信息
    showPokerCards: function (player, parent, cards) {
        var uid = GameDataPDK.currObtainPlayerData.uid;
        var cardNode = cc.find('cardDis', parent);

        //一轮后隐藏当前玩家出的poker
        if (cards == undefined) return;
        this.hideNodeChild(cardNode);
        this.hideFirstCardNode(parent);
        //出牌位置显示居中
        if (parent == this.play_layer_down) {
            var i = Math.ceil(cardNode.childrenCount / 2) - Math.ceil(cards.length / 2);
            for (var j = 0; j < cards.length; j++) {
                
                var node = cc.find('dis_' + (i + j), cardNode)
                //判断不出条件
                if (cards[0] == 0) {
                    node.active = false;
                } else {
                    node.active = true;
                }
                this.showCardContent(node, cards[j]);
            }
        } else {
            for (var k = 0; k < cards.length; k++) {
                
                var node = cc.find('dis_' + k, cardNode)
                //判断不出条件
                if (cards[0] == 0) {
                    node.active = false;
                } else {
                    node.active = true;
                }
                this.showCardContent(node, cards[k]);
            }
        }
    },
    //显示钟表倒计时
    showClocks: function (uid) {
        if (uid == undefined) return;
        var posList = ['down', 'right', 'left'];
        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            var clockNodes = cc.find('cloock' + index, this.clockNodes)
            this.showClockContent(player, clockNodes, uid);
        }
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
        this.showCountDown(this._countdown_index + '', this._currClockNodes);
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
    showCountDown: function (num, cloockNode) {
        var timeStr = num;
        var timeLabel = cc.find('timeLb', cloockNode);
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
        WriteLog('showWinNode');
        var uid = data.detail.winner;
        this._dealEnd = false;
        this._kickingArr.splice(0, this._kickingArr.length);
        this.passNode.active = false;
        this.resetPokerPos();
        //关闭倒计时
        this.stopClockMusic();
        //隐藏报警icon
        this.hideNodeChild(this.warningNode);
        //隐藏不出文本节点
        this.hideNodeChild(this.buchuNodes);
        this.actionLayer.active = false;
        sendEvent('HideReadyNode');
        
        //播放勝利失败音效
        var myScore = GameDataPDK.resultData.score[GameData.player.uid];
        if (uid == GameData.player.uid) {
            soundMngr.instance.playOtherAudioPoker('shengli', null);
        } else if (uid != GameData.player.uid) {
            soundMngr.instance.playOtherAudioPoker('shibai', null);
        }

        var posList = ['down', 'right', 'left'];
        var play_layer_list = [this.play_layer_down, this.play_layer_right, this.play_layer_left];
        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            if (player && GameDataPDK.cards[player.uid]) {
                play_layer_list[index].active = true;
                this.showWinnerIcon(player, data);
            } else {
                play_layer_list[index].active = false;
            }
        }
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
        var myScore = GameDataPDK.resultData.score[GameData.player.uid];
        if (uid == GameData.player.uid) {
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
        } else if (uid != GameData.player.uid) {
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
        var posList = ['down', 'right', 'left'];
        var play_layer_list = [this.play_layer_down, this.play_layer_right, this.play_layer_left];

        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            var warningNode = cc.find('warning' + index, this.warningNode);
            var lastCardNode = null;
            if (index >= 1)
            {
                lastCardNode = cc.find('lastCard' + index, this.warningNode);
            }
            if (player && GameDataPDK.cards[player.uid]) {
                this.showWarningContent(player, warningNode, data, lastCardNode);
                play_layer_list[index] = true;
            } else {
                play_layer_list[index] = false;
            }
        }
    },
    //显示报警
    showWarningContent: function (player, node, data, lastCardNode) {
        var uid = data.detail.uid;
        var playerSex = GameData.getPlayerSexByUid(uid);
        var baodanNum = data.detail.baodan;
        if (lastCardNode != null)
        {
            if (uid == player.uid)
            {
                lastCardNode.active = true;   
            }
        }
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
        var posList = ['down', 'right', 'left'];
        var play_layer_list = [this.play_layer_down, this.play_layer_right, this.play_layer_left];

        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            var player = GameData.getPlayerByPos(posList[index]);
            var warningNode = cc.find('warning' + index, this.warningNode);
            var lastCardNode = null;
            if (index >= 1)
            {
                lastCardNode = cc.find('lastCard' + index, this.warningNode);
            }
            if (player && GameDataPDK.cards[player.uid]) {
                this.reconneShowWarningContent(player, warningNode, lastCardNode);
                play_layer_list[index] = true;
            } else {
                play_layer_list[index] = false;
            }
        }
    },
    reconneShowWarningContent: function (player, node, lastCardNode) {
        var cardNum = GameDataPDK.getHandCardNum(player.uid);
        if (cardNum <= 2 && cardNum > 0) {
            node.active = true;
            if (lastCardNode != null)
            {
                lastCardNode.active = true;
            }
            var anima = node.getComponent(cc.Animation);
            anima.play('warningAnimation');
        } else {
            node.active = false;
            if (lastCardNode != null)
            {
                lastCardNode.active = false;
            }
        }
    },
    hideWarningNode: function(uid) {
        var warningNode;
        var lastCardNode = null;
        var cardNum = GameDataPDK.getHandCardNum(uid);
        var pos = GameDataPDK.getPosByUid(uid);
        switch(pos)
        {
            case 'down':
                warningNode = cc.find('warning0', this.warningNode);
                break;
            case 'right':
                warningNode = cc.find('warning1', this.warningNode);
                lastCardNode = cc.find('lastCard1', this.warningNode);
                break;
            case 'left':
                warningNode = cc.find('warning2', this.warningNode);
                lastCardNode = cc.find('lastCard2', this.warningNode);
                break;
            default:
                break;
        }
        if (cardNum == 0)
        {
            warningNode.active = false;
            if (lastCardNode != null)
            {
                lastCardNode.active = false;
            }
        }
    },
    //判断出牌牌型
    showDisCardType: function (data) {
        var DiscardType = data.detail.type;
        var multiple = data.detail.multiple;
        //隱藏警報
        this.hideWarningNode(data.detail.uid);
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
        // this.changeMultiple(multiple);
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
            return getRuleStrPDK(GameData.room.opts);
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
        if (GameData.room.opts.zhuangType == false)
        {
            return;
        }
        GameDataPDK.getHandCardSize();
        if (GameDataPDK.game.zhuangUid == GameData.player.uid)
        {
            if (GameDataPDK.getHandCards(GameDataPDK.game.zhuangUid).length == GameDataPDK.handCardSizeMax)
            {
                sendEvent('showFirstCard');
            }
        }
        else
        {
            if (GameDataPDK.getHandCardNum(GameDataPDK.game.zhuangUid) == GameDataPDK.handCardSizeMax)
            {
                sendEvent('showFirstCard');
            }
        }
        this.changeMultiple(GameDataPDK.boomNum);
    },


    onTiBtnChecked: function(evt, customEventData) {
        this.tiBtnNode.active = false;
        this.stopClockMusic();
        PDKHandler.requestTiChuai(customEventData, function(rtn) {
            cc.log('tiBtn rtn: ', rtn);
        });
    },

    onChuaiBtnChecked: function(evt, customEventData) {
        this.chuaiBtnNode.active = false;
        this.stopClockMusic();
        PDKHandler.requestTiChuai(customEventData, function(rtn) {
            cc.log('chuaiBtn rtn: ', rtn);
        });
    },
})