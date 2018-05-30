var soundMngr = require('SoundMngr');
var RuleHandler = require('ruleHandler');
var gameDefine = require('gameDefine');
var errorCode = require('errorCode');

var roomTable = cc.Class({
    extends: cc.Component,

    properties: {
        direction_pos: cc.Sprite,
        direction_turn: cc.Node,

        baoCardNode: cc.Node,
        huiercard1: cc.Sprite,

        leftCardNumLabel: cc.Label,

        play_layer_up: cc.Node,
        play_layer_down: cc.Node,
        play_layer_left: cc.Node,
        play_layer_right: cc.Node,

        cardsNode: cc.Node,
        spineNode: cc.Node,
        actionLayer: cc.Node,
        actionSecondaryLayer: cc.Node,

        cardTemplate: cc.Prefab,
        playerTemplate:cc.Prefab,
        cardBugangPre :cc.Prefab,

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

        //宝特效节点
        baoAnimationNode: cc.Node,
        tingStateNode:cc.Node,
        passBtn: cc.Button,
        //飘
        PiaoLayer: cc.Node
    },

    // use this for initialization
    onLoad: function () {

        registEvent('onGameStart', this, this.handleGameStart);
        registEvent('onGameReady', this, this.handleGameReady);
        registEvent('onGameTurn', this, this.handleTurn);
        //开局前加飘
        //registEvent('onStarPiao', this, this.showPiaoLayer);
        // 牌局开始
        registEvent('onMahjongStartRun', this, this.onShow);
        registEvent('onRegularCircle', this, this.onShow);
        registEvent('onHuaDianMahjongReconnecet', this, this.onShow);
        registEvent('onMahjongRunEnd', this, this.onGameScore);
        registEvent('onCardHu', this, this.handleHuCard);
        registEvent('onCardChi', this, this.handleChiCard);
        registEvent('onCardDis', this, this.handleDisCard);
        registEvent('onCardPeng', this, this.handlePengCard);
        registEvent('onCardGang', this, this.handleGangCard);
        registEvent('onCardTing', this, this.handleTingCard);
        registEvent('onCardBao', this, this.handleBao);
        registEvent('dianPao', this, this.handleDianPao);
        registEvent('onPushErrorMsg', this, this.showErrorMsg);
        registEvent('onCardBtnStart', this, this.onCardBtnStart);
        registEvent('onCardBtnMove', this, this.onCardBtnMove);
        registEvent('onCardBtnEnd', this, this.onCardBtnEnd);
        registEvent('onCardBtnCancel', this, this.onCardBtnCancel);

        this.actions = new Array();
        //handcard
        this._handCardArry = new Array();
        this._disCardArry = new Array();
        //非听下处理多个杠的数据存储
        this.gangOperations = [];
        this.cardsNode.active = false;
        this.tingData = [];
        this.tingTip = this.node.getComponent('TingTip');
        this.playerSex = 1;
        this.isZiMoHuOnly = 0;
        this.isPass = true;
        this.isTing = true;
        //cc.log('错误信息：'+GameData.room);
        if (GameData.room){
            if (GameData.room.opts.joinermax == 4) this.discardMax = 24;
            if (GameData.room.opts.joinermax == 3) this.discardMax = 36;
            if (GameData.room.opts.joinermax == 2) this.discardMax = 60;
        }

        this._cardArrow = cc.instantiate(this.disCardArrow);
        this.cardsNode.addChild(this._cardArrow);
        this._cardArrow.active = false;

        //将自己的手牌的初始坐标存起来
        this.myHandsInitPosition = [];
        this.saveMyHandsInitPosition();

        if (GameData.game.gameStart && GameData.game.zhuangUid > 0) {
            this.handleGameStart();
            this.onShow();
            this.handleTurn();
        }

        //显示飘选项
        //if (Object.keys(profileHeb.PiaoInfo).length > 0  && profileHeb.PiaoInfo.runState == HuaDian.RunStateEmnum.PIAO) {
        //    this.showPiaoLayer();
        //}
    },

    onDestroy: function () {

        unregistEvent('onGameStart', this, this.handleGameStart);
        unregistEvent('onGameTurn', this, this.handleTurn);
        //unregistEvent('onStarPiao', this, this.showPiaoLayer);
        unregistEvent('onMahjongStartRun', this, this.onShow);
        unregistEvent('onRegularCircle', this, this.onShow);
        unregistEvent('onHuaDianMahjongReconnecet', this, this.onShow);
        unregistEvent('onMahjongRunEnd', this, this.showResultLayer);
        unregistEvent('onCardHu', this, this.handleHuCard);
        unregistEvent('onCardChi', this, this.handleChiCard);
        unregistEvent('onCardDis', this, this.handleDisCard);
        unregistEvent('onCardPeng', this, this.handlePengCard);
        unregistEvent('onCardGang', this, this.handleGangCard);
        unregistEvent('onCardBao', this, this.handleBao);
        unregistEvent('dianPao', this, this.handleDianPao);
        unregistEvent('onPushErrorMsg', this, this.showErrorMsg);
        unregistEvent('onCardBtnStart', this, this.onCardBtnStart);
        unregistEvent('onCardBtnMove', this, this.onCardBtnMove);
        unregistEvent('onCardBtnEnd', this, this.onCardBtnEnd);
        unregistEvent('onCardBtnCancel', this, this.onCardBtnCancel);
    },

    handleGameStart: function () {
        this.showPosition();
        this.cardsNode.active = false;
        this.spineNode.active = false;
        this.showBaoCardNode(false);
    },

    handleGameReady: function(){
        this.showPosition();
        this.cardsNode.active = false;
        this.spineNode.active = false;
        for (var key in this.tingStateNode.children) {
            this.tingStateNode.children[key].active = false;
        }
        GameData.game.cardHuier1 = 0;
        this.showBaoCardNode(false);
        //隐藏宝牌
        this.huiercard1.spriteFrame = null;
        this.huiercard1.node.active = false;
        //this.tingTip.hide();
    },

    onShow: function () {
        this.cardsNode.active = true;
        this.saveMyHandCard();
        this.showCards();
        this.showOperations();
        if (GameData.room.status >= gameDefine.RoomState.GAMEING) {
            this.showTingState();
        }

        if (GameData.game.dataInfo.bao) {
            if (profileHuaDian.checkIsTingPlayer()) {
                this.showBaoCardNode(true);
            }else{
                this.showBaoCardNode(false);
            }
        }
        cc.log("~~~~~~~~~~~~~~~this.cardsNode.active~~~~~~~~~~~~~~~" + this.cardsNode.active);
        var showRoundNum = GameData.room.roundNum > GameData.room.opts.roundMax ? GameData.room.opts.roundMax : GameData.room.roundNum;
        this.lastRoundLabel.string = showRoundNum + '/' + GameData.room.opts.roundMax;
    },

    handleTurn: function (data) {
        this.showTurn();
        this.startCoundDown(data);
    },

    handleDisCard: function (data) {
        console.log("this.playerSex =  GameData.player.sex", data.detail.player, GameData.player.sex);
        this.playerSex = GameData.getPlayerSexByUid(data.detail.userId);
        if(data.detail.card == undefined){
            return;
        }
        soundMngr.instance.playAudioCC('dis', data.detail.card, this.playerSex);
        soundMngr.instance.playAudioOther('out');
    },

    handlePengCard: function (data) {
        this.playerSex = GameData.getPlayerSexByUid(data.detail.userId);
        soundMngr.instance.playAudioCC('cha', null, this.playerSex);

        if(data.detail.userId == GameData.player.uid) {
            var baoAnimNode = cc.find('down',this.baoAnimationNode);
            this.playBaoAnimation(baoAnimNode,'cha');
        }else{
            this.playActionAnimation(data.detail.userId, 'cha');
        }
    },

    handleChiCard: function (data) {
        this.playerSex = GameData.getPlayerSexByUid(data.detail.userId);
        soundMngr.instance.playAudioCC('chi', null, this.playerSex);
        if(data.detail.userId == GameData.player.uid) {
            this.showEffect('chi');
        }else{
            this.playActionAnimation(data.detail.userId, 'chi');
        }


    },

    handleGangCard: function (data) {
        this.playerSex = GameData.getPlayerSexByUid(data.detail.userId);

        if (data.detail.operation == HuaDian.OPERATION.OPERATION_ANGANG) {
            soundMngr.instance.playAudioCC('andan',null,this.playerSex);
        }else if (data.detail.operation == HuaDian.OPERATION.OPERATION_MINGGANG
                ||data.detail.operation == HuaDian.OPERATION.OPERATION_GONGGANG)
        {
            soundMngr.instance.playAudioCC('mingdan',null,this.playerSex);
        }else{
            soundMngr.instance.playAudioCC('dan',null,this.playerSex);
        }

        if (data.detail.userId == GameData.player.uid) {
            //播放蛋动画
            var baoAnimNode = cc.find('down',this.baoAnimationNode);
            this.playBaoAnimation(baoAnimNode,'dan');
        }else{
            this.playActionAnimation(data.detail.userId, 'dan');
        }
    },

    handleTingCard: function(data) {
        this.playerSex = GameData.getPlayerSexByUid(data.detail.userId);
        soundMngr.instance.playAudioCC('ting', null, this.playerSex);
    },

    handleHuCard: function (data) {
        cc.log("=...........................", data.detail);
        this.playerSex = GameData.getPlayerSexByUid(data.detail.userId);
        soundMngr.instance.playAudioCC('hu', data.detail, this.playerSex);
        if (data.detail.userId == GameData.player.uid) {
            this.showEffect('hu');
        }else{
            this.playActionAnimation(data.detail.userId,'hu');
        }
        this.actionLayer.active = false;
    },

    handleBao: function (data) {
        var pos = GameData.tablePos[data.detail.uid];
        var animationNode = cc.find('up', this.baoAnimationNode);
        var type = data.detail.type;
        //cc.log("data.type:"+type);
        if (type == 1) {
            this.playBaoAnimation(animationNode,'huanbao');
        }else if (type == 2){
            this.playBaoAnimation(animationNode,'dabao');
        }
        this.showBaoCardNode(true);
    },

    handleDianPao: function (data) {
        if (data.detail == GameData.player.uid) {
            this.playActionAnimation(data.detail,'dianpao');
        }
    },

    showErrorMsg: function (data) {
        if (data.detail.errorCode == 301) {
            createMoveMessage('定宝牌库没牌了!');
        }
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
        if (GameData.game.dataInfo.onGoingUserId) {
            var uid = GameData.game.dataInfo.onGoingUserId;
            var card = GameData.game.dataInfo.showCard[0];
            var show = this.showPassActions(uid, card);
            if (!show) MjHandler_Heb.getInstance().requestPass_CC(function (res) { });
            GameData.game.dataInfo = {};
        }
    },

    /**
     * 隐藏操作按钮
     */
    hideOperationBtn: function () {
        var actionNode ;
        for (var i = 0; i<4; i++) {
            actionNode = cc.find('btnAct' + (i+1), this.actionLayer);
            actionNode.active = false;
        }
    },

    createActionBtn: function (index, icon) {
        cc.log('show btn:' + icon);
        var actionNode = cc.find('btnAct' + index, this.actionLayer);
        var texture = cc.textureCache.addImage(cc.url.raw('resources/huadian/UI/btn/' + icon));
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
        //if (data.card && data.card[0] == null) {
        //    data.card = [];
        //}
        cc.log('ActionData:'+JSON.stringify(data));
        if (data.act == 'hu') {

            cc.log('------------------> click hu, should open hu ui,');
            MjHandler_Heb.getInstance().requestOperation_CC(data.type,null,null,function (res) {});
            //this.showEffect('hu');
        }
        else if (data.act == 'cha') {
            cc.log('------------------> click cha, should open cha ui,');
            MjHandler_Heb.getInstance().requestOperation_CC(HuaDian.OPERATION.OPERATION_PENG,data.card,null,function (res) {
                if(res.code == errorCode.Success){
                    //播放叉动画
                    //var baoAnimNode = cc.find('down',self.baoAnimationNode);
                    //self.playBaoAnimation(baoAnimNode,'cha');
                }
            });

        }
        else if (data.act == 'ting') {
            cc.log('------------------> click ting, should open ting ui,');
            this.actionLayer.actvie = false;
            this.isPass = true;
            this.isZiMoHuOnly = 0;
        }
        else if (data.act == 'lou') {
            cc.log('------------------> click lou, should open lou ui,');
            this.actionLayer.actvie = false;
            this.isPass = true;
            this.isZiMoHuOnly = 1;
            for (var i = 0; i<this.actions.length; i++) {
                if (this.actions[i].act == 'lou') {
                    this.actions.splice(i,1);
                    var actionNode = cc.find('btnAct' + i, this.actionLayer);
                    actionNode.active = false;
                }
            }
        }
        else if (data.act == 'chi') {
            cc.log('------------------> click chi, should open chi ui,');
            if (data.card.length <= 1) {
                var cardArry = [];
                for (var i = 0; i<data.card[0].length; i++) {
                    cardArry.push(data.card[0][i]);
                }
                MjHandler_Heb.getInstance().requestOperation_CC(HuaDian.OPERATION.OPERATION_CHI,cardArry,null,function (res) {
                    if (res.code == errorCode.Success) {
                        //self.showEffect('chi');
                    }
                });

            }else{
                this.refreshChiActionType(data);
            }

        }
        else if (data.act == 'dan') {
            var type = data.type;
            if (type instanceof Array) {
                type = data.type[0];
            }
            if (data.card.length <= 1) {
                if (data.card[0][0] instanceof Array && data.card[0].length > 1) {
                    this.refreshGangActionBar(data);
                }else if (data.card[0][0] instanceof Array && data.card[0].length == 1) {
                    MjHandler_Heb.getInstance().requestOperation_CC(type,data.card[0][0],null,function (res) {
                    });
                }else{
                    MjHandler_Heb.getInstance().requestOperation_CC(type,data.card[0],null,function (res) {
                    });
                }

                //var type = data.type;
                //if (type instanceof Array) {
                //    type = data.type[0];
                //}
                ////MjHandler_Heb.getInstance().requestOperation_CC(type,data.card[0],null,function (res) {
                //});
                //播放蛋动画
                //var baoAnimNode = cc.find('down',this.baoAnimationNode);
                //this.playBaoAnimation(baoAnimNode,'dan');
            }else{
                this.refreshGangActionBar(data);
            }

        }

        this.moveBackMyCards();
        self.actionLayer.active = false;
    },

    refreshChiActionType : function(data){
        this.chiActionList = [];
        this.actionSecondaryLayer.active = true;
        var cardLayout = cc.find('cardLayout',this.actionSecondaryLayer);
        cardLayout.removeAllChildren();
        var cardTemp = cc.find('card',this.actionSecondaryLayer);
        cardTemp.active = true;
        for(var i = 0; i < data.card.length; i++)
        {
            var action = data.card[i];
            this.chiActionList.push(action);
            var carddis = GameData.game.lastdisCard;
            var card = cc.instantiate(cardTemp);
            if (contains(action, carddis)) {
            }else{
                action.push(carddis);
            }
            action = action.sort();
            card.name = i + '';
            for (var j = 0; j < action.length; j++) {
                var cardNode = cc.find('card_'+j,card);
                cardNode.getComponent(cc.Sprite).spriteFrame = null;
                var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action[j] + '.png';
                var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                if (action[j] == carddis) {
                    var biaoji = cardNode.getChildByName(cardNode.name + '_biao');
                    if(biaoji == null){
                        biaoji = cc.instantiate(this.cardTingPrefab);
                        biaoji.y = biaoji.y -10;
                        cardNode.addChild(biaoji);
                        biaoji.name = cardNode.name + '_biao';
                    }
                }
                cardNode.active = true;
            }
            card.getComponent(cc.Sprite).spriteFrame = null;
            card.on(cc.Node.EventType.TOUCH_START, this.onClickChiActionBtn,this);
            cardLayout.addChild(card);
            card.width = 252;
        }
        cardTemp.active = false;
    },

    onClickChiActionBtn : function(e){
        var index = e.target.name;
        var data = this.chiActionList[index];
        var carddis = GameData.game.lastdisCard;
        for (var i = 0; i < data.length; i++) {
            if (data[i] == carddis) {
                data.splice(i, 1);
            }
        }
        var self = this;
        if(data != null)
        {
            MjHandler_Heb.getInstance().requestOperation_CC(HuaDian.OPERATION.OPERATION_CHI,data,null,function (res) {
                if (res.code == errorCode.Success) {
                    //self.showEffect('chi');
                }
            });
        }
        this.actionSecondaryLayer.active = false;
        this.moveBackMyCards();
    },

    refreshGangActionBar: function (data) {
        this.actionSecondaryLayer.active = true;

        var cardLayout = cc.find('cardLayout', this.actionSecondaryLayer);
        cardLayout.removeAllChildren();

        var cardTemp = cc.find('card', this.actionSecondaryLayer);
        var buCardTemp = cc.find('bucard',this.actionSecondaryLayer);
        buCardTemp.active = true;
        cardTemp.active = true;
        this.gangActionList = new Array();
        //cc.log('杠牌：'+JSON.stringify(data.card));
        for (var i = 0; i < data.card.length; i++) {
            var action = data.card[i];
            var GangData = {card:data.card[i],type:data.type[i]};
            this.gangActionList.push(GangData);
            var card = cc.instantiate(cardTemp);
            card.name = i + '_';
            card.getComponent(cc.Sprite).spriteFrame = null;

            if (data.type[i] == HuaDian.OPERATION.OPERATION_GONGGANG
             ||data.type[i] == HuaDian.OPERATION.OPERATION_ANGANG
             ||data.type[i] == HuaDian.OPERATION.OPERATION_MINGGANG) {
                //普通杠
                var gangcard = cc.find('card_2',card);
                if (gangcard && action[0]) {
                    gangcard.active = true;
                    var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action[0] + '.png';
                    var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                    gangcard.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                }
                card.width = 252;
                card.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn, this);
                cardLayout.addChild(card);
            }else{
                //特殊杠
                if (action.length == 3 && !(action[0] instanceof Array)) {
                    for (var j = 0; j<card.childrenCount; j++) {
                        var gangcard = cc.find('card_'+ j,card);
                        if (gangcard && action[j]) {
                            gangcard.active = true;
                            var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action[j] + '.png';
                            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                            gangcard.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                        }
                    }

                    card.width = 252;
                    card.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn, this);
                    cardLayout.addChild(card);
                }else {
                    for (let ii = 0; ii<action.length; ii++) {
                        var bucard = cc.instantiate(buCardTemp);
                        bucard.name = i + '_' + action[ii][0];
                        bucard.getComponent(cc.Sprite).spriteFrame = null;
                        //var bucardNode = cc.find('card_1',bucard);
                        var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action[ii][0] + '.png';
                        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                        bucard.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                        //bucard.width = 252;
                        bucard.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn, this);
                        cardLayout.addChild(bucard);
                    }
                }
                //
                //if (action.length != 3) {//补杠
                //    for (var ii = 0; ii<action.length; ii++) {
                //        var bucard = cc.instantiate(buCardTemp);
                //        bucard.name = i + '_' + action[ii];
                //        bucard.getComponent(cc.Sprite).spriteFrame = null;
                //        //var bucardNode = cc.find('card_1',bucard);
                //        var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action[ii] + '.png';
                //        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                //        bucard.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                //        //bucard.width = 252;
                //        bucard.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn, this);
                //        cardLayout.addChild(bucard);
                //    }
                //
                //}else{//非补杠的特殊杠
                //    for (var j = 0; j<card.childrenCount; j++) {
                //        var gangcard = cc.find('card_'+ j,card);
                //        if (gangcard && action[j]) {
                //            gangcard.active = true;
                //            var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action[j] + '.png';
                //            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                //            gangcard.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                //        }
                //    }
                //
                //    card.width = 252;
                //    card.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn, this);
                //    cardLayout.addChild(card);
                //}
            }
        }
        cardTemp.active = false;
        buCardTemp.active = false;
    },
    /**
     *
     * @param cards :显示的牌
     * @param type : 听牌状态 1是移除抓的牌蒙版
     */
    showTingMask: function (cards,type) {
        //cc.log('cards: type:'+cards+ type);
        this.removeCardMask();
        var myHandCardNode = cc.find('cardHand',this.play_layer_down);
        for (var key in myHandCardNode.children) {
            var cardId = myHandCardNode.children[key].getComponent('Card').id;
            ////cc.log('cardId:'+cardId);
            var num = 0;
            //检查数组是否包含当前cardId
            for (var i = 0; i<cards.length; i++) {
                if (cardId != cards[i]) {
                    num ++;
                }
            }
            if (num == cards.length) {
                this.setHandCardDisable(myHandCardNode.children[key],true);
            }
        }
        //if(type == 1){
        //    for (var key in myHandCardNode.children) {
        //        var cardId = myHandCardNode.children[key].getComponent('Card').id;
        //        ////cc.log('cardId:'+cardId);
        //        var num = 0;
        //        //检查数组是否包含当前cardId
        //        for (var i = 0; i<cards.length; i++) {
        //            if (cardId != cards[i]) {
        //                num ++;
        //            }
        //        }
        //        if (num == cards.length) {
        //            this.setHandCardDisable(myHandCardNode.children[key],true);
        //        }
        //    }
        //}else{
        //    for (var j = 0; j<myHandCardNode.childrenCount; j++) {
        //        if(j!=0){
        //            this.setHandCardDisable(myHandCardNode.children[j],true);
        //        }
        //    }
        //}
    },

    removeCardMask: function(){
        var myHandCardNode = cc.find('cardHand',this.play_layer_down);
        for (var key in myHandCardNode.children) {
            if(myHandCardNode.children[key].getChildByName('mask')){
                myHandCardNode.children[key].getChildByName('mask').removeFromParent(true);
            }
        }
    },

    onBackToActionLayer: function () {
        this.actionLayer.active = true;
        this.actionSecondaryLayer.active = false;
    },

    onClickActionSecondaryBtn: function (e) {
        //cc.log(e.target.name);
        var str = e.target.name;
        var operArray = [];
        var cards = [];
        operArray = str.split('_');
        var index = operArray[0];
        var data = this.gangActionList[index];
        if (data.type  == HuaDian.OPERATION.OPERATION_BU_JIU_GANG
            ||data.type  == HuaDian.OPERATION.OPERATION_BU_XI_GANG
            ||data.type  == HuaDian.OPERATION.OPERATION_BU_XUAN_FENG_GANG
            ||data.type  == HuaDian.OPERATION.OPERATION_BU_YAO_GANG)
        {
            cards.push(parseInt(operArray[1]));
        }else {
            cards = data.card;
        }
        //cc.log('杠牌id：'+cards);
        if (data != null) {
            MjHandler_Heb.getInstance().requestOperation_CC(data.type,cards,null,function (res) {});
            ////播放蛋动画
            //var baoAnimNode = cc.find('down',this.baoAnimationNode);
            //this.playBaoAnimation(baoAnimNode,'dan');
        }
        this.actionSecondaryLayer.active = false;
        this.moveBackMyCards();
    },

    onBtnPassClicked: function (evt) {
        //if (GameData.game.turn == GameData.player.uid) {
        //
        //}

        MjHandler_Heb.getInstance().requestPass_CC(HuaDian.OPERATION.OPERATION_PASS,[],function (res) { });
        this.isPass = false;

        var cardHand = GameData.getMyHandCards();
        for(var i = 0; i < cardHand.length;i++){
            var node = cc.find('cardHand/cardHand'+i,this.play_layer_down);
            node.active = true;
            this.setMyHandButton(node, cardHand[i], i);
        }
        this.removeCardMask();
        this.actionLayer.active = false;
        this.actionSecondaryLayer.active = false;
        this.moveBackMyCards();
    },

    showCards: function () {
        cc.log("~~~~~~~~~~~~~~~function_showcards~~~~~~~~~~~~~~~~~~~~~~")
        var player = GameData.getPlayerByPos('down');
        if (player && GameData.cards[player.uid]) {
            this.showMyHandCards(player, this.play_layer_down);
            this.showDisCards(player, this.play_layer_down, 'mj_face_xia_chu', 'down');
            this.showPengCards(player, this.play_layer_down, 'mj_face_xia_chu', 'down');
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        if (player && GameData.cards[player.uid]) {
            this.showHandCards(player, this.play_layer_right);
            this.showDisCards(player, this.play_layer_right, 'mj_face_you_chu', 'right');
            this.showPengCards(player, this.play_layer_right, 'mj_face_you_chu', 'right');
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('up');
        if (player && GameData.cards[player.uid]) {
            this.showHandCards(player, this.play_layer_up);
            this.showDisCards(player, this.play_layer_up, 'mj_face_shang_shou', 'up');
            this.showPengCards(player, this.play_layer_up, 'mj_face_shang_shou', 'up');
        } else {
            this.play_layer_up.active = false;
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameData.cards[player.uid]) {
            this.showHandCards(player, this.play_layer_left);
            this.showDisCards(player, this.play_layer_left, 'mj_face_zuo_chu', 'left');
            this.showPengCards(player, this.play_layer_left, 'mj_face_zuo_chu', 'left');
        } else {
            this.play_layer_left.active = false;
        }

        this.showCardNum();
        //显示宝牌
        if (GameData.game.cardHuier1 !=1000 && GameData.game.cardHuier1 !=-1 && GameData.game.cardHuier1 !=0) {
            this.showBaoCardImg();
        }
    },

    showHandCards: function (player, parent) {
        if (player) {
            var uid = player.uid;
            var cardNum = GameData.getHandCardNum(uid) + (GameData.getChiCards(uid).length
                + GameData.getPengCards(uid).length + GameData.getGangCards(uid).length) * 3;
            var showIdx = cardNum > GameData.client.handsize ? 0 : 1;
            var handIdx = 1, nodeIdx = 0;
            //cc.log('showIdx:'+showIdx+cardNum);
            for (; nodeIdx <= GameData.client.handsize; nodeIdx++) {
                var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                if (nodeIdx == showIdx && handIdx <= GameData.getHandCardNum(uid)) {
                    node.active = true;
                    showIdx++; handIdx++;
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

    moveBackMyCards: function () {
         this.selectedCard = -1;
         for (var i = 0; i <= GameData.client.handsize; i++) {
             var cardNode = cc.find('cardHand/cardHand' + i, this.play_layer_down);
             var cardId = cardNode.getComponent('Card').id;
             cardNode.position = this.myHandsInitPosition[i];
         }
    },

    showMyHandCards: function (player, parent) {
        var node;
        var cardHand = this._handCardArry;
        //var cardHand = GameData.getMyHandCards();
        cardHand.reverse();
        this.moveBackMyCards();
        var cardHandNode = cc.find('cardHand',parent);
        for(let key in cardHandNode.children){
            cardHandNode.children[key].getComponent(cc.Sprite).spriteFrame = null;
            cardHandNode.children[key].active = false;
        }
        var pengAndGangNum = GameData.getPengCards(GameData.player.uid).length*3
                            + GameData.getGangCards(GameData.player.uid).length*3
                            + GameData.getChiCards(GameData.player.uid).length*3;
        ////cc.log('pengAndGangNum:'+pengAndGangNum +cardHand.length);
        //cc.log('手牌数量：'+cardHand.length);
        if(cardHand.length == 14){
            //手牌14张
            for(var i = 0; i < cardHand.length;i++){
                node = cc.find('cardHand/cardHand'+i,parent);
                this.setMyHandButton(node, cardHand[i], i);
                this.showCardContent(node,'mj_face_xia_shou',cardHand[i]);
                if (i == 0) {
                    //移除宝牌标识
                    node.active = !(GameData.player[GameData.player.uid].isWin == HuaDian.WINTYPE.DIANPAOWIN);
                    var huierNode = node.getChildByName(node.name + '_huier');
                    if(huierNode){
                        huierNode.removeFromParent(true);
                    }
                    var isTing = (GameData.cards[player.uid]['tingState'] == 1 || GameData.cards[player.uid]['tingState'] == 2);
                    if (isTing) {
                        this.setMyHuierVisible(node, cardHand[i]);
                    }
                }
            }
        }else if(cardHand.length < GameData.client.handsize
            && GameData.game.turn == GameData.player.uid
            && GameData.player[GameData.player.uid].cardLastAssigned){
            //手牌小于13张
            for(var i = 0; i < cardHand.length;i++){
                node = cc.find('cardHand/cardHand'+i,parent);
                this.setMyHandButton(node, cardHand[i], i);
                this.showCardContent(node,'mj_face_xia_shou',cardHand[i]);
                if (i == 0) {
                    //移除宝牌标识
                    node.active = !(GameData.player[GameData.player.uid].isWin == HuaDian.WINTYPE.DIANPAOWIN);
                    var huierNode = node.getChildByName(node.name + '_huier');
                    if(huierNode){
                        huierNode.removeFromParent(true);
                    }
                    var isTing = (GameData.cards[player.uid]['tingState'] == 1 || GameData.cards[player.uid]['tingState'] == 2);
                    if (isTing) {
                        this.setMyHuierVisible(node, cardHand[i]);
                    }
                }
            }
        }else if(cardHand.length < GameData.client.handsize
            && GameData.game.turn == GameData.player.uid
            && !GameData.player[GameData.player.uid].cardLastAssigned
            && cardHand.length > GameData.client.handsize - pengAndGangNum){
            //手牌小于13张吃碰听时
            for(var i = 0; i < cardHand.length;i++){
                node = cc.find('cardHand/cardHand'+i,parent);
                this.setMyHandButton(node, cardHand[i], i);
                this.showCardContent(node,'mj_face_xia_shou',cardHand[i]);
                if (i == 0) {
                    //移除宝牌标识
                    node.active = !(GameData.player[GameData.player.uid].isWin == HuaDian.WINTYPE.DIANPAOWIN);
                    var huierNode = node.getChildByName(node.name + '_huier');
                    if(huierNode){
                        huierNode.removeFromParent(true);
                    }
                    var isTing = (GameData.cards[player.uid]['tingState'] == 1 || GameData.cards[player.uid]['tingState'] == 2);
                    if (isTing) {
                        this.setMyHuierVisible(node, cardHand[i]);
                    }
                }
            }
        }else if(cardHand.length < GameData.client.handsize
            && GameData.player[GameData.player.uid].fenZhangCard
            && cardHand.length > GameData.client.handsize - pengAndGangNum){
            //手牌小于13张 处理分张
            for(var i = 0; i < cardHand.length;i++){
                node = cc.find('cardHand/cardHand'+i,parent);
                this.setMyHandButton(node, cardHand[i], i);
                this.showCardContent(node,'mj_face_xia_shou',cardHand[i]);
                if (i == 0) {
                    //移除宝牌标识
                    node.active = !(GameData.player[GameData.player.uid].isWin == HuaDian.WINTYPE.DIANPAOWIN);
                    var huierNode = node.getChildByName(node.name + '_huier');
                    if(huierNode){
                        huierNode.removeFromParent(true);
                    }
                    var isTing = (GameData.cards[player.uid]['tingState'] == 1 || GameData.cards[player.uid]['tingState'] == 2);
                    if (isTing) {
                        this.setMyHuierVisible(node, cardHand[i]);
                    }
                }
            }
        }else {
            for(var i = 1; i < cardHand.length + 1;i++){
                node = cc.find('cardHand/cardHand'+i,parent);
                this.setMyHandButton(node, cardHand[i-1], i);
                this.showCardContent(node,'mj_face_xia_shou',cardHand[i-1]);
            }
        }

        var  tingState = profileHeb.getTingStateByUid(GameData.player.uid);
        this.removeCardMask();

        if (tingState) {
            var tingCards = GameData.getTingData(GameData.player.uid).outCards;
            //显示听牌遮罩层
            this.showTingMask(tingCards,1);
            //触发自动出牌机制
            var canGang = profileHeb.canGang();
            var canHu = profileHeb.canHu();
            if(!canHu && GameData.game.turn == GameData.player.uid && !canGang){
                this.autoDisCard(GameData.game.obtain);
            }
        }else{
            this.removeCardMask();
        }
    },

    showDisCards: function (player, parent, cardHeader, direction) {
        var node4 = cc.find('cardDis_4', parent);
        if (node4) node4.active = false;
        var node3 = cc.find('cardDis_3', parent);
        if (node3) node3.active = false;
        var node2 = cc.find('cardDis_2', parent);
        if (node2) node2.active = false;
        //console.log('22222' + GameData.room.opts.joinermax);
        var disNode = cc.find('cardDis_' + GameData.room.opts.joinermax, parent);
        disNode.active = true;

        var cards = GameData.getDisCards(player.uid);
        if (player.uid == GameData.player.uid) {
            cards = this._disCardArry;
        }
        //cc.log('最大出的牌数量：------' +this.discardMax);

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

            } else {
                node.active = false;
            }
        }
    },

    showPengCards: function (player, parent, cardHeader, direction) {
        if (player) {
            var chi = GameData.getChiCards(player.uid);

            for(var i = 0; i< chi.length;i++){
                //吃的牌ID
                var chiCard =chi[i].otherPlayerCard ;
                var index = chi[i].cards.indexOf(chiCard);
                if (index != 1){
                    [chi[i].cards[1],chi[i].cards[index]] = [chi[i].cards[index],chi[i].cards[1]];
                }
            }

            var gang = GameData.getGangCards(player.uid);
            //增加杠的特殊标识区分吃碰
            for (var j = 0; j<gang.length; j++) {
                gang[j].cardType = -1;
            }
            var peng = GameData.getPengCards(player.uid);
            var cards = gang.concat(peng,chi);
            var size = parseInt(GameData.client.handsize / 3);

            for (var i = 0; i < size; i++) {
                var node = cc.find('cardPeng/cardPeng' + (i + 1), parent);
                var face7 = cc.find('card_face7',node);
                face7.active = false;
                if (i < cards.length) {
                    for (var n = 0; n < 7; n++) {
                        var face = node.getChildByName('card_face' + (n + 1)).getComponent("cc.Sprite");
                        //隐藏补杠icon
                        var bugangIconNode = face.node.getChildByName(face.node.name + '_bugangIcon');
                        if (bugangIconNode) {
                            bugangIconNode.active = false;
                        }
                        //判断吃或者碰
                        var isPeng = false;
                        if (cards[i].cards.length < 4 && profileHeb.isAllEqual(cards[i].cards) && !cards[i].cardType) {
                            isPeng = true;
                        }

                        //判断明杠
                        var isMingGang = false;
                        if (cards[i].cards.length == 4 && profileHeb.isAllEqual(cards[i].cards)) {
                            isMingGang = true;
                        }
                        //判断暗杠
                        var isAnGang = false;
                        if (cards[i].cards.length == 5 && profileHeb.isAllEqual(cards[i].cards)) {
                            isAnGang = true;
                        }

                        //碰杠吃牌 显隐
                        if (n < cards[i].cards.length) {

                            face.node.active = true;
                            var cardId = cards[i].cards[n];

                            //判断牌型
                            if (isPeng) {
                                //var uid  = cards[i].pengFromUserId;
                                //var index = profileHeb.getCardIndexByUid(player.uid,uid);
                                //if ((n+1) == index) {
                                //    var mj_back = this.getCardBackImgName(player.uid);
                                //    this.showCardContent(face.node, mj_back.img1,mj_back.img2);
                                //}else{
                                //    this.showCardContent(face.node, cardHeader, cardId);
                                //}
                                this.showCardContent(face.node, cardHeader, cardId);
                            }else if (isMingGang) {
                                //显示1-3 7节点
                                if (n < 4) {
                                    if (n == 3) {
                                        this.showCardContent(face7, cardHeader, cardId);
                                        face.node.active = false;
                                    }else{
                                        //var uid  = cards[i].gangFromUserId;
                                        //var index = profileHeb.getCardIndexByUid(player.uid,uid);
                                        //if ((n+1) == index) {
                                        //    var mj_back = this.getCardBackImgName(player.uid);
                                        //    this.showCardContent(face.node, mj_back.img1,mj_back.img2);
                                        //}else{
                                        //    this.showCardContent(face.node, cardHeader, cardId);
                                        //}
                                        this.showCardContent(face.node, cardHeader, cardId);
                                    }
                                }else{
                                    face.node.active = false;
                                }
                                //添加明杠标识
                                face7.active = true;
                                this.addGangIcon(face7,direction,1);

                            }else if (isAnGang) {
                                //显示1-3 7节点
                                if (n < 4) {
                                    //增加暗杠需求 self 123(扣着)4(显示)
                                    //other 1234(扣着)
                                    if (n == 3) {
                                        if(player.uid == GameData.player.uid) {
                                            this.showCardContent(face7, cardHeader, cardId);
                                        }else{
                                            var mj_back = this.getCardBackImgName(player.uid);
                                            this.showCardContent(face7, mj_back.img1,mj_back.img2);
                                        }
                                        face.node.active = false;
                                    }else{
                                        var mj_back = this.getCardBackImgName(player.uid);
                                        this.showCardContent(face.node, mj_back.img1,mj_back.img2);
                                    }
                                }else{
                                    face.node.active = false;
                                }
                                //添加暗杠标识
                                face7.active = true;
                                this.addGangIcon(face7,direction,2);

                            }else if (cards[i].cardType
                                && cards.type != HuaDian.OPERATION.OPERATION_ANGANG
                                && cards.type != HuaDian.OPERATION.OPERATION_MINGGANG
                                && cards.type != HuaDian.OPERATION.OPERATION_GONGGANG){

                                ////判断特殊杠
                                //TODO 补杠
                                var array1 = [].concat(cards[i].cards);
                                array1.splice(3,array1.length);
                                var gangCardArray = [].concat(cards[i].cards);
                                var array2 = profileHeb.guolv(array1,gangCardArray);
                                //过滤后的数组 （前3位并不过滤哦）[1,1,2,1,1]->[1,1,2]
                                var array3 = [].concat(array1,array2);
                                //判断节点可见性
                                var isVisiable = array3.length > n;
                                var num = 1;
                                var index = 3;
                                if (n>=3) {
                                    index = cards[i].cards.indexOf(array3[n]) + 1;
                                }
                                for (index; index<cards[i].cards.length; index++) {
                                    if(array3[n] == cards[i].cards[index]) {//cards[i].cards[index] == cards[i].cards[index+1] &&
                                        if(n != 0 &&  cards[i].cards.indexOf(array3[n]) == index) {
                                            continue;
                                        }
                                        num ++;
                                    }
                                }

                                if (isVisiable) {
                                    if (num >= 2) {
                                        this.addBuGangIcon(face.node,direction,num);
                                    }
                                    this.showCardContent(face.node, cardHeader, array3[n]);
                                    face.node.active = true;
                                }else{
                                    face.node.active = false;
                                }

                            }else {
                                //普通的牌显示
                                this.showCardContent(face.node, cardHeader, cardId);
                            }

                        }
                        else if (n != 6) {
                            //1-6 为普通节点 7为特殊节点 显示明暗杠 这里只处理普通
                            face.node.active = false;
                        }

                    }

                    node.active = true;

                }else{
                    node.active = false;
                }
            }
        }
    },

    /**
     * 自动出牌
     * @param cards：右边第一张牌
     */
    autoDisCard: function (cards) {
        //cc.log('自动出牌！');
        var self = this;
        var cardArry = [];
        cardArry.push(cards);
        this.scheduleOnce(function(){
            MjHandler_Heb.getInstance().requestDisCard_CC(cardArry, function (ret) {
                if (ret.result == errorCode.Success) {
                    self.selectedCard = -1;
                    self.moveBackMyCards();
                }
            });
        },0.5)
    },

    addHuierIcon: function (parent, direction) {
        if (parent.childrenCount <= 0) {
            var GangIconNode = new cc.Node();
            parent.addChild(GangIconNode);
            var huierIconTx = cc.textureCache.addImage(cc.url.raw('resources/huadian/UI/icon/huier_icon.png'));
            var huierIconSprite = GangIconNode.addComponent(cc.Sprite);
            huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTx);

            if (direction == 'right') {
                GangIconNode.x = -32.6;
                GangIconNode.y = 7.1;
                GangIconNode.rotation = -101.2;
                GangIconNode.scaleX = 0.4;
                GangIconNode.scaleY = 0.4;
                GangIconNode.skewX = 11;
            }
            else if (direction == 'down') {
                GangIconNode.x = 0;
                GangIconNode.y = 60;
                GangIconNode.skewX = 10;
            }
            else if (direction == 'left') {
                GangIconNode.x = 31;
                GangIconNode.y = 8.6;
                GangIconNode.rotation = 101.2;
                GangIconNode.scaleX = 0.4;
                GangIconNode.scaleY = 0.4;
                GangIconNode.skewX = -11;
            }
            else if (direction == 'up') {
                GangIconNode.x = 3;
                GangIconNode.y = -6.8;
                GangIconNode.rotation = 180;
                GangIconNode.scaleX = 0.4;
                GangIconNode.scaleY = 0.3;
            }
        }
    },
    /**
     *
     * @param parent 需要添加标识的card节点
     * @param direction 方向
     * @param type 杠的类型（明暗）1明2暗
     */
    addGangIcon: function(node,direction,type){
            var gangIcon = cc.find('gangType',node);
            var Url ;
            var gangType = '';
            var gangDirection ='';
            if (direction == 'right') {
                if (type ==1){
                    gangType = 'ming'
                }else{
                    gangType = 'an'
                }
                gangDirection = '1';
            }
            else if (direction == 'down') {
                if (type ==1){
                    gangType = 'ming'
                }else{
                    gangType = 'an'
                }
                gangDirection = '0';
            }
            else if (direction == 'left') {
                if (type ==1){
                    gangType = 'ming'
                }else{
                    gangType = 'an'
                }
                gangDirection = '3';
            }
            else if (direction == 'up') {
                if (type ==1){
                    gangType = 'ming'
                }else{
                    gangType = 'an'
                }
                gangDirection = '2';
            }
            Url = cc.url.raw('resources/huadian/UI/icon/' + gangType + gangDirection + '_icon.png');
            var GangIconTx = cc.textureCache.addImage(Url);
            gangIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(GangIconTx);
    },
    /**
     * 增加补杠标识
     * @param node card节点
     * @param direction 玩家位置方向
     * @param num  补杠数
     */
    addBuGangIcon: function(node,direction,num){
        var bugangIconNodes = node.getChildByName(node.name + '_bugangIcon');
        if (bugangIconNodes == null) {
            bugangIconNodes = cc.instantiate(this.cardBugangPre);
            bugangIconNodes.name  = node.name + '_bugangIcon';
            node.addChild(bugangIconNodes);
        }
        bugangIconNodes.active = true;
        var Url ;
        var gangDirection ='';
        if (direction == 'right') {
            gangDirection = '1';
        }
        else if (direction == 'down') {
            gangDirection = '0';
        }
        else if (direction == 'left') {
            gangDirection = '3';
        }
        else if (direction == 'up') {
            gangDirection = '2';
        }
        for (var i = 0; i<bugangIconNodes.childrenCount; i++) {
            if (direction == bugangIconNodes.children[i].name) {
                bugangIconNodes.children[i].active = true;
                Url = cc.url.raw('resources/changchun/UI/icon/bugang_' + gangDirection + '_' + num + '.png');
                var GangIconTx = cc.textureCache.addImage(Url);
                bugangIconNodes.children[i].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(GangIconTx);
            }else{
                bugangIconNodes.children[i].active = false;
            }
        }
    },

    showCardContent: function (cardNode, cardHeader, cardId) {
        //cc.log('长春：'+cardNode+cardId);
        if (cardNode == undefined){
            return;
        }
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        //cc.log('cardId:'+cardId);
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        cardNode.active = true;
        this.setMaskVisible(cardNode, false);
    },
    /**
     * 显示玩家操作按钮
     */
    showOperations:function(){
        this.operationsArry = [];
        //非听下处理多个杠的数据存储
        this.gangOperations = [];
        this.actions = [];
        this.isPass1 = true;
        var isExist = true;
        this.operationsArry = profileHeb.getPlayerOperationsByUid(GameData.player.uid);
        //cc.log('this.operationsArry:'+this.operationsArry);
        //init operationBtn
        this.hideOperationBtn();
        //&& GameData.game.turn == GameData.player.uid
        if (this.operationsArry.length > 0) {
            this.actionLayer.active = true;
            var k = 0 ;
            for(var i = 0; i<this.operationsArry.length; i++){
                var operActionBtnIcon = this.getOperAction(this.operationsArry[i]);

                //添加非听下多个杠的数据类型
                if (this.operationsArry[i] == HuaDian.OPERATION.OPERATION_GONGGANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_GONGGANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_ANGANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_MINGGANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_GONGGANG_TING
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_ANGANG_TING
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_MINGGANG_TING
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_XUAN_FENG_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_XI_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_YAO_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_JIU_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_BU_XUAN_FENG_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_BU_XI_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_BU_YAO_GANG
                    ||this.operationsArry[i] == HuaDian.OPERATION.OPERATION_BU_JIU_GANG
                ) {
                    this.gangOperations.push(this.operationsArry[i]);
                }

                //cc.log('this.gangOperations:'+this.gangOperations);

                //避免重复添加操作
                isExist = true;
                for (var j = 0; j<this.actions.length; j++) {
                      if(this.actions[j].act == operActionBtnIcon.substring(0,operActionBtnIcon.length-4)){
                          isExist = false;
                          k--;
                          break;
                      }
                }
                if(isExist){
                    this.actions[k] = {act:operActionBtnIcon.substring(0,operActionBtnIcon.length-4),
                                       card:this.getOperCard(operActionBtnIcon,this.operationsArry[i]),
                                       type:this.operationsArry[i]};
                    this.createActionBtn(k+1,operActionBtnIcon);
                }
                k++;
            }

//-------------------------------------------------------分隔符--------------------------------------------------------------------//
//----------------------------------------------------特殊情况处理-----------------------------------------------------------------//
            //杠听状态下
            if (GameData.player[GameData.player.uid].gangTing) {
                for (var i = 0; i<this.actions.length; i++) {
                    if (this.actions[i].act == 'dan') {
                        this.actions[i].type =[];
                        for (var j = 0; j<GameData.player[GameData.player.uid].gangTing.gangCards.length; j++) {
                            this.actions[i].type.push(GameData.player[GameData.player.uid].gangTing.gangCards[j].operation);
                        }
                    }
                }
            }else{
                for (var j = 0; j<this.actions.length; j++) {
                    if(this.actions[j].act == 'dan'){

                        if (this.gangOperations.length > 1) {
                            this.actions[j].card = [];
                            this.actions[j].type = [];
                            for (var i = 0; i<this.gangOperations.length; i++) {
                                this.actions[j].card.push(this.getOperCard('dan.png',this.gangOperations[i]));
                                this.actions[j].type.push(this.gangOperations[i]);
                            }
                        }else{
                            this.actions[j].card = [];
                            this.actions[j].type = [];
                            this.actions[j].card.push(this.getOperCard('dan.png',this.gangOperations[0]));
                            this.actions[j].type.push(this.gangOperations[0]);
                        }
                        break;
                    }
                }

            }

            //碰听 吃听 杠听 置灰过按钮
            for (var i = 0; i<this.actions.length; i++) {
                if (!GameData.player[GameData.player.uid].isCanPass) {
                    this.passBtn.interactable = false;
                    break;
                }else{
                    this.passBtn.interactable = true;
                }
            }

            this.removeCardMask();
            //显示听牌遮罩层
            for (var k = 0; k<this.actions.length; k++) {
                if (this.actions[k].act == 'ting') {
                    if(GameData.getTingData(GameData.player.uid)){
                        var tingCards = GameData.getTingData(GameData.player.uid).outCards;
                        ////cc.log('tingCards:'+tingCards);
                        this.showTingMask(tingCards,1);
                    }
                    break;
                }
            }
        }else{
            this.actionLayer.active = false;
        }

        //cc.log('this.operaction:'+JSON.stringify(this.actions));
    },
    getOperCard: function (operAction,type) {
        var cardsArry = [];
        var operType = operAction.substring(0,operAction.length-4);
        //cc.log('操作按钮：'+operAction);
        if (operType == 'dan') {
            //杠听状态
            //处理抢补杠
            if (GameData.game.dataInfo.isQiangBuGang) {
                return cardsArry;
            }else {
                if (GameData.player[GameData.player.uid].gangTing) {
                    var gangCard = GameData.player[GameData.player.uid].gangTing.gangCards;
                    for (var i = 0; i<gangCard.length; i++) {
                        cardsArry.push(gangCard[i].gangCards);
                    }
                    return cardsArry;
                }else if(GameData.player[GameData.player.uid].buGangInfo) {
                    //听后补杠
                    for (var i = 0; i<this.gangOperations.length; i++) {
                        for (var key in GameData.player[GameData.player.uid].buGangInfo) {
                            if (key == parseInt(this.gangOperations[i])) {
                                cardsArry.push(GameData.player[GameData.player.uid].buGangInfo[key].outCards);
                            }
                        }
                        break;
                    }

                }else{
                    //非杠听状态
                    var gangData = profileHeb.getGangCardByUid(GameData.player.uid,type);
                    if (gangData) {
                        if (gangData.type == 0) {
                            //明杠
                            var cards = [];
                            for(var i = 0; i<3; i++){
                                cards.push(gangData.card);
                            }
                            cardsArry = cards;
                        }else if (gangData.type == 1){
                            //暗杠
                            var cards = [];
                            for(var i = 0; i<4; i++){
                                cards.push(gangData.card);
                            }
                            cardsArry = cards;
                        }else{
                            //其他杠
                            cardsArry = gangData.card;
                        }
                    }
                }
                return cardsArry;
            }
        }

        if (GameData.game.dataInfo.showCard) {
            var card =  GameData.game.lastdisCard;
        }else{
            return;
        }

        if (operType == 'cha') {
            //处理抢补杠
            if (GameData.game.dataInfo.isQiangBuGang) {
                return cardsArry;
            }else{
                for(var i = 0; i<2; i++){
                    cardsArry.push(card);
                }
                return cardsArry;
            }
        }
        else if (operType == 'chi') {
            cardsArry = RuleHandler.instance.canChi(GameData.player.uid,card);
            return cardsArry;

        }

    },

    getOperAction: function (operation) {
        if(operation == HuaDian.OPERATION.OPERATION_PASS){
            return 'pass.png';
        }else if (operation == HuaDian.OPERATION.OPERATION_PENG
                ||operation == HuaDian.OPERATION.OPERATION_PENG_TING) {
            return 'cha.png';
        }else if (operation == HuaDian.OPERATION.OPERATION_GONGGANG
                ||operation == HuaDian.OPERATION.OPERATION_ANGANG
                ||operation == HuaDian.OPERATION.OPERATION_MINGGANG
                ||operation == HuaDian.OPERATION.OPERATION_GONGGANG_TING
                ||operation == HuaDian.OPERATION.OPERATION_ANGANG_TING
                ||operation == HuaDian.OPERATION.OPERATION_MINGGANG_TING
                ||operation == HuaDian.OPERATION.OPERATION_XUAN_FENG_GANG
                ||operation == HuaDian.OPERATION.OPERATION_XI_GANG
                ||operation == HuaDian.OPERATION.OPERATION_YAO_GANG
                ||operation == HuaDian.OPERATION.OPERATION_JIU_GANG
                ||operation == HuaDian.OPERATION.OPERATION_BU_XUAN_FENG_GANG
                ||operation == HuaDian.OPERATION.OPERATION_BU_XI_GANG
                ||operation == HuaDian.OPERATION.OPERATION_BU_YAO_GANG
                ||operation == HuaDian.OPERATION.OPERATION_BU_JIU_GANG) {
            return 'dan.png';
        }else if (operation == HuaDian.OPERATION.OPERATION_CHI
                ||operation == HuaDian.OPERATION.OPERATION_CHI_TING) {
            return 'chi.png';
        }else if (operation == HuaDian.OPERATION.OPERATION_DIANPAO_HU
                ||operation == HuaDian.OPERATION.OPERATION_HU
                ||operation == HuaDian.OPERATION.OPERATION_QIANGGANG_HU) {
            return 'hu.png';
        }else if (operation == HuaDian.OPERATION.OPERATION_TING) {
            return 'ting.png';
        }

        return null;
    },

    setMyHandButton: function (cardNode, cardId, index) {
        if (!cardNode) {
            return;
        }
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

    setMyHuierVisible: function (cardNode, cardId) {
        ////cc.log('长春：'+cardNode,cardId);
        var show = false;
        if (RuleHandler.instance.isHuier(cardId)) {
            show = true;
        }

        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (huierNode == null) {
            if (show == true) {
                huierNode = cc.instantiate(this.cardHuierPrefab);
                //huierNode.y = huierNode.y -10;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';
            }
        }
        else {
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
        }
        else {
            tingNode.active = tingDiscard;
        }

        if (GameData.game.turn != GameData.player.uid) {
            if (tingNode != null) {
                tingNode.active = false;
            }
        }
    },

    setHandCardDisable: function(node,show) {
        //移除card按钮
        var cardButton = node.getChildByName(node.name +'_button');
        if(cardButton){
            cardButton.removeFromParent(true);
        }
        ////cc.log('Tingnode.name:'+node.name);
        var maskNode = node.getChildByName('mask');
        if (maskNode == null) {
            maskNode = new cc.Node('mask');
            var sp = maskNode.addComponent(cc.Sprite);
            var iconUrl = 'resources/table/majiangmengbai.png';
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            sp.spriteFrame = new cc.SpriteFrame(texture);
            node.addChild(maskNode);
        }
        maskNode.active = show;
        //return show;
    },
    showPosition: function () {
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
    },

    showTurn: function () {
        var turnPlayerUid = profileHeb.getTurnByUid();
        var index = GameData.getPlayerIndex(turnPlayerUid);
        //cc.log('turnPlayerUid:'+turnPlayerUid);
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
        var directionNode = cc.find(GameData.tablePos[turnPlayerUid], this.direction_turn);
        if (directionNode) {
            directionNode.active = true;
        }
        //cc.find(GameData.tablePos[turnPlayerUid], this.direction_turn).active = true;
    },

    showCardNum: function () {
        if (GameData.game.cardleft < 0) return;
        this.leftCardNumLabel.string = GameData.game.cardleft;
    },
    showBaoCardImg: function () {
        var huier1 = GameData.game.cardHuier1;
        var texture = cc.textureCache.addImage(cc.url.raw('resources/mjcard2d/mj_face_xia_shou_'+huier1+'.png'));
        this.huiercard1.spriteFrame = new cc.SpriteFrame(texture);
        if (GameData.room.opts) {
            var isTing = (GameData.cards[GameData.player.uid]['tingState'] == 1 || GameData.cards[GameData.player.uid]['tingState'] == 2);
            if (isTing && GameData.room.opts.anBao == 0) {
                this.huiercard1.node.active = true;
            }else if (GameData.room.opts.anBao == 1){
                this.huiercard1.node.active = false;
            }
        }
    },
    showBaoCardNode: function (show) {
        this.baoCardNode.active = show;
        var anbaoNode = cc.find('anbao',this.baoCardNode);
        var mingbaoNode = cc.find('mingbao',this.baoCardNode);
        if(GameData.room.opts) {
            anbaoNode.active = GameData.room.opts.anBao == 1;
            mingbaoNode.active = GameData.room.opts.anBao == 0;
        }
    },

    showEffect: function (type) {
        //cc.log('show effect: ' + type);
        var spineUrl = '', spineAnim = '';
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
            case 'chi':
                spineUrl = 'spine/table/chi';
                spineAnim = 'a';
                break;
            case 'dianpao':
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

    playBaoAnimation : function (node,animate){
       var  url = 'spine/table/' +animate ;
        cc.loader.loadResDir(url, function(err, assets)
            {
                //cc.log('loadResArray ',url);
                if (err)
                {
                    cc.log(err);
                    return;
                }
                if (assets.length <= 0)
                {
                    cc.log('assets length: ',assets.length);
                    return;
                }

                var armatureDisplay;
                if (!node.getComponent(dragonBones.ArmatureDisplay))
                {
                    cc.log('dragonBones add');
                    armatureDisplay = node.addComponent(dragonBones.ArmatureDisplay);
                }
                else
                {
                    cc.log('dragonBones get');
                    armatureDisplay = node.getComponent(dragonBones.ArmatureDisplay);
                }
                for (var elem in assets)
                {
                    if (assets[elem] instanceof dragonBones.DragonBonesAsset)
                    {
                        if (armatureDisplay.dragonAsset != assets[elem])
                        {
                            armatureDisplay.dragonAsset = assets[elem];
                        }
                    }
                    if (assets[elem] instanceof dragonBones.DragonBonesAtlasAsset)
                    {
                        if (armatureDisplay.dragonAtlasAsset != assets[elem])
                        {
                            armatureDisplay.dragonAtlasAsset = assets[elem];
                        }
                    }
                }
                armatureDisplay.armatureName  = 'armature';
                armatureDisplay.playAnimation('newAnimation', 1);

            })
    },

    onHandCardClicked: function (data) {

        var card = data.detail.card;
        var index = data.detail.index;
        var node = cc.find('cardHand/cardHand' + index, this.play_layer_down);

        var cardArry = [];
        cardArry.push(card);

        if (this.selectedCard == index) {
            var self = this;
            var canTing = false;
            if (GameData.getTingData(GameData.player.uid)) {
                canTing = GameData.getTingData(GameData.player.uid).canTing;
                //处理听中与听后的判断
                if (GameData.getTingData(GameData.player.uid).outCards.length == 0) {
                    this.isTing = false;
                }else{
                    this.isTing = true;
                }
            }

            //发送听牌请求
            /**
             * this.isPass : 触发过牌按钮
             * this.isTing ：是否上听
             */
            if (canTing && this.isPass && this.isTing) {
                this.isPass = true;
                this.isTing = false;
                GameData.getTingData(GameData.player.uid).canTing = false;
                MjHandler_Heb.getInstance().requestOperation_CC(HuaDian.OPERATION.OPERATION_TING,cardArry,this.isZiMoHuOnly,function (res){
                });
            } else {
                //发送出牌请求
                if (GameData.game.turn == GameData.player.uid){
                    MjHandler_Heb.getInstance().requestDisCard_CC(cardArry, function (ret) {
                        if (ret.result == errorCode.Success) {
                            node.stopAllActions();
                            self.selectedCard = -1;
                            this.moveBackMyCards();
                        }
                    });
                }
            }
            //client 处理出牌
            var index = this._handCardArry.indexOf(card);
            this._handCardArry.splice(index,1);
            this._handCardArry.sort(function(a,b){
                return a-b;
            });
            this._disCardArry.push(card);
            GameData.game.turn = 0;
            this.showCards();

            this.tingTip.hide();
        } else {
            if (this.selectedCard >= 0) {
                var last = cc.find('cardHand/cardHand' + this.selectedCard, this.play_layer_down);
                last.runAction(cc.moveTo(0.01,this.myHandsInitPosition[this.selectedCard]));
            }
            node.runAction(cc.moveTo(0.01, cc.p(this.myHandsInitPosition[index].x, 30)));

            this.selectedCard = index;
            if (GameData.game.turn == GameData.player.uid) {
                this.tingTip.show(card, this.tingData);
                this.showMask(card);
            }
        }
    },
    /**
     * 显示听搂状态
     * @param type：听搂类型 2听 1搂
     */
    showTingState: function () {
        //init tingNode state
        for (var key in this.tingStateNode.children) {
            this.tingStateNode.children[key].active = false;
        }
        var StateNode ;
        var Url ;
        for (var i = 0; i<GameData.joiners.length; i++) {
            var direction = GameData.tablePos[GameData.joiners[i].uid];
            StateNode = cc.find(direction,this.tingStateNode);
            var stateImg = cc.find('text',StateNode);
            var TingStateType = GameData.cards[GameData.joiners[i].uid]['tingState'];
            if (TingStateType == 1) {
                Url = cc.url.raw('resources/huadian/UI/artword/loupaizhong.png');
                var tingIconTx = cc.textureCache.addImage(Url);
                stateImg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tingIconTx);
                StateNode.active = true;
            }else if(TingStateType == 2){
                Url = cc.url.raw('resources/huadian/UI/artword/tingpaizhong.png');
                var tingIconTx = cc.textureCache.addImage(Url);
                stateImg.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tingIconTx);
                StateNode.active = true;
            }else{
                StateNode.active = false;
            }

        }
    },
    showMask: function (selectCard) {
        var player = GameData.getPlayerByPos('down');
        if (player) {
            this.showPengCardMask(selectCard, this.play_layer_down, 'down');
            this.showDisCardMask(selectCard, this.play_layer_down, 'down');
        }

        player = GameData.getPlayerByPos('up');
        if (player) {
            this.showPengCardMask(selectCard, this.play_layer_up, 'up');
            this.showDisCardMask(selectCard, this.play_layer_up, 'up');
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
            var cardNode = cc.find('cardDis_' + GameData.room.opts.joinermax + '/card_face' + i, parent);
            if (cardNode.active) {
                this.gotoMask(cardNode, selectCard, parent, direction);
            }
        }
    },

    gotoMask: function (cardNode, selectCard, parent, direction) {
        var card = cardNode.getComponent('Card');
        if(card != null)
        {
            var cardId = card.id;
            var show = selectCard == cardId;

            //cc.log('------ > gotoMask cardId - > ' + cardId + ',selectCard - > ' + selectCard);
            var maskNode = this.setMaskVisible(cardNode,show);
            if(maskNode != null)
            {
                cc.find('tipMask/up',maskNode).active = false;
                cc.find('tipMask/down',maskNode).active = false;
                cc.find('tipMask/right',maskNode).active = false;
                cc.find('tipMask/left',maskNode).active = false;

                cc.find("tipMask/"+direction,maskNode).active = true;
            }
        }
    },

    setMaskVisible: function (cardNode, show) {
        var maskNode = cardNode.getChildByName(cardNode.name + '_mask');
        if(maskNode == null)
        {
            if(show == true)
            {
                maskNode = cc.instantiate(this.cardMaskPrefab);
                cardNode.addChild(maskNode);
                maskNode.name = cardNode.name + '_mask';

                cc.find('tipMask',maskNode).active = true;
                cc.find('chipaiMask',maskNode).active = false;
            }
        }
        else
        {
            cc.find('tipMask',maskNode).active = show;
        }

        return maskNode;
    },

    onGameScore: function () {
        this.tingTip.hide();
        this.unschedule(this.runCountDown);
    },

    startCoundDown: function (data) {
        this.PLayerUID = GameData.game.turn;
        this._countdown_index = 10;
        this.schedule(this.runCountDown, 1);
    },

    runCountDown: function () {
        this.showCountDown(this._countdown_index + '');
        if (this._countdown_index <= 0) {
            this._countdown_index = 10;
        }
        else {
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
        }
        else if (ary.length == 2) {
            url1 = cc.url.raw('resources/number/jinzi' + ary[0] + '.png');
            url2 = cc.url.raw('resources/number/jinzi' + ary[1] + '.png');
        }
        else {
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
    onCardBtnStart: function (data) {
    },
    onCardBtnMove: function (data) {
        var card = data.detail.card;

        //显示听牌
        if (GameData.game.turn == GameData.player.uid) {
            this.tingTip.show(card, this.tingData);
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

    onCardBtnCancel: function (data) {
        this.tingTip.hide();
    },
    saveMyHandsInitPosition: function () {
        for( var index = 0; index <= GameData.client.handsize; index++ ) {
            var node = cc.find('cardHand/cardHand'+index, this.play_layer_down);
            this.myHandsInitPosition.push(node.getPosition());
        }
    },
    showPiaoLayer : function() {
        this.PiaoLayer.active = true;
    },
    getCardBackImgName : function (uid) {
        var pos = GameData.getPlayerPosByUid(uid);
        var imgName1 = '';
        var imgName2 = '';
        switch (pos){
            case 'down' : imgName1 = 'mj_back0';imgName2 = 'chu';
                break;
            case 'up' : imgName1 = 'mj_back2';imgName2 = 'chu';
                break;
            case 'right' : imgName1 = 'mj_back1';imgName2 = 'chu';
                break;
            case 'left' : imgName1 = 'mj_back3';imgName2 = 'chu';
                break;
            default :break;
        }
        var imgData = {img1:imgName1,
                       img2:imgName2};
        return imgData;
    },
    saveMyHandCard : function () {
        this._handCardArry = [];
        this._disCardArry = [];
        if (Object.keys(GameData.cards).length == 0) {
            return;
        }
        this._handCardArry = GameData.getHandCards(GameData.player.uid);
        this._disCardArry = GameData.getDisCards(GameData.player.uid);
        if (GameData.game.turn == GameData.player.uid && GameData.player[GameData.player.uid].cardLastAssigned) {
            var hand1 = this._handCardArry[this._handCardArry.length-1];
            this._handCardArry.pop();
            this._handCardArry.sort(function(a,b){
                return a-b;
            });
            this._handCardArry.push(hand1);
        }else{
            this._handCardArry.sort(function(a,b){
                return a-b;
            });
        }
    }

});

module.exports = roomTable;