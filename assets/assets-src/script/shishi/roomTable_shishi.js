var soundMngr = require('SoundMngr');
var RuleHandler = require('ruleHandler');

var roomTable = cc.Class({
    extends: cc.Component,

    properties: {
        direction_turn: cc.Node,

        huiercard1: cc.Sprite,
        huiercard2: cc.Sprite,

        leftCardNumLabel : cc.Label,
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
        actionSecondaryLayer : cc.Node,
        chashuiLayer : cc.Node,

        cardTemplate: cc.Prefab,
        playerTemplate: cc.Prefab,

        selectedCard: -1,
        HuType: null,

        countdown_num1 : cc.Sprite,
        countdown_num2 : cc.Sprite,
        _countdown_index : 0,

        disCardArrow : cc.Prefab,
        _cardArrow : cc.Node,

        cardButtonPrefab : cc.Prefab,
        cardHuierPrefab : cc.Prefab,
        cardTingPrefab : cc.Prefab,
        cardMaskPrefab : cc.Prefab,
        //roomLabel : cc.Label,
        lastRoundLabel : cc.RichText,
        scoreLayer : cc.Node,
        chaShuiLayer : cc.Node,
        chiActionList : [],

        mapNode : cc.Node,
        mapLayer : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        //registEvent('onRoomMsg', this, this.showPlayers);
        registEvent('onGameStart', this, this.handleGameStart);
        registEvent('onGameTurn', this, this.handleTurn);
        registEvent('onGamePass', this, this.handlePass);
        registEvent('initCards', this, this.onShow);
        registEvent('initCardHua',this,this.showHuaAction);
        //registEvent('initZhuangInfo', this, this.showPlayers);
        registEvent('onCardObtain', this, this.handleObtain);
        registEvent('onCardDis', this, this.handleDisCard);
        registEvent('onCardHu', this, this.handleHuCard);
        registEvent('onCardChi', this, this.handleChiCard);
        registEvent('onCardPeng', this, this.handlePengCard);
        registEvent('onCardGang', this, this.handleGangCard);
        registEvent('onYoujin', this, this.showCards);

        registEvent('onCardBtnStart',this,this.onCardBtnStart);
        registEvent('onCardBtnMove',this,this.onCardBtnMove);
        registEvent('onCardBtnEnd',this,this.onCardBtnEnd);
        registEvent('onCardBtnCancel',this,this.onCardBtnCancel);

        registEvent('onGameScore', this, this.onGameScore);
        registEvent('allYoujinInfo', this, this.allYouJinShow);
        registEvent('startWater', this, this.showChaShuiLayer());
        // registEvent('allYoujinInfo', this, this.allYoujinInfo);
        // registEvent('onJoinerLost', this, this.showJoinerLost);
        // registEvent('onJoinerConnect', this, this.showJoinerConnect);

        RuleHandler.instance.setGameType(GameData.client.gameType);

        this.actions = new Array();
        //this.headers = new Array();
        this.cardsNode.active = false;
        this.tingData = [];
        this.tingTip = this.node.getComponent('TingTip-shishi');
        this.playerSex = 1;

        //胡按钮操作的显示（临时添加）
        this.huBtnIsShow = true;

        if (GameData.room.joinermax == 4) this.discardMax = 24;
        if (GameData.room.joinermax == 3) this.discardMax = 36;
        if (GameData.room.joinermax == 2) this.discardMax = 60;

        this._cardArrow = cc.instantiate(this.disCardArrow);
        this.cardsNode.addChild(this._cardArrow);
        this._cardArrow.active = false;
        //this.schedule(function(){this.node.emit('onRoomMsg');}, 1); //1秒更新一次
        //this.roomLabel.string = '房间:' + GameData.room.id;
        cc.log('roomTable onLoad, gameStart='+GameData.game.gameStart+' initcards='
            +GameData.game.initcards+' checkPass='+GameData.game.checkPass.uid+' obtain='+GameData.game.obtain);

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
        cc.log('GameData.cards '+JSON.stringify(GameData.cards));
    },

    onDestroy: function() {
        //unregistEvent('onRoomMsg', this, this.showPlayers);
        unregistEvent('onGameStart', this, this.handleGameStart);
        unregistEvent('onGameTurn', this, this.handleTurn);
        unregistEvent('onGamePass', this, this.handlePass);
        unregistEvent('initCards', this, this.onShow);
        unregistEvent('initCardHua',this,this.showHuaAction);
        //unregistEvent('initZhuangInfo', this, this.showPlayers);
        unregistEvent('onCardObtain', this, this.handleObtain);
        unregistEvent('onCardDis', this, this.handleDisCard);
        unregistEvent('onCardHu', this, this.handleHuCard);
        unregistEvent('onCardChi', this, this.handleChiCard);
        unregistEvent('onCardPeng', this, this.handlePengCard);
        unregistEvent('onCardGang', this, this.handleGangCard);
        unregistEvent('onYoujin', this, this.showCards);

        unregistEvent('onCardBtnStart',this,this.onCardBtnStart);
        unregistEvent('onCardBtnMove',this,this.onCardBtnMove);
        unregistEvent('onCardBtnEnd',this,this.onCardBtnEnd);
        unregistEvent('onCardBtnCancel',this,this.onCardBtnCancel);

        unregistEvent('onGameScore', this, this.onGameScore);
        unregistEvent('allYoujinInfo', this, this.allYouJinShow);
        unregistEvent('startWater', this, this.showChaShuiLayer);
        // unregistEvent('allYoujinInfo', this, this.allYoujinInfo);
       // unregistEvent('onJoinerLost', this, this.showJoinerLost);
       // unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
    },

    handleGameStart: function() {
        //this.showPlayers();
        this.tingData = [];
        this.cardsNode.active = false;
        this.spineNode.active = false;
        this.tingTip.hide();
        //RuleHandler.instance.setXiangGong(false);
        this.onGameStartHandler();
    },

    saveMyHandsInitPosition:function()
    {
        for( var index = 0; index <= GameData.client.handsize; index++ ) {
            var node = cc.find('cardHand/cardHand'+index, this.play_layer_down);
            this.myHandsInitPosition.push(node.getPosition());
        }
    },

    onShow: function(data) {
        //this.showPlayers();
        //复位所有牌的位置（未弹起状态）
        this.moveBackMyCards();
        this.showCards();
        this.allYouJinShow();
        this.cardsNode.active = true;
        //this.spineNode.active = false;
        console.log("GameData.game.roundNum + '/' + GameData.game.roundmax",GameData.game.roundNum ,GameData.game.roundmax,GameData.room.opts.scoreBase);
        var showRoundNum = GameData.game.roundNum > GameData.game.roundmax ? GameData.game.roundmax : GameData.game.roundNum;
        if(GameData.room.opts.scoreBase > 0){
            this.lastRoundLabel.string = GameData.game.roundNum +1 + '';
        }else{
            this.lastRoundLabel.string = showRoundNum+1 + '/' + GameData.game.roundmax;
            if(GameData.game.roundNum == GameData.game.roundmax){
            this.lastRoundLabel.string = GameData.game.roundmax + '/' + GameData.game.roundmax;
            }
        }
    },

    showHuaAction : function(data){
        this.playerSex =  GameData.getPlayerSexByUid(data.detail.player);
        var hua = data.detail.hua;
        if (hua.length == 0) return;
		if (!data.detail.effect) return;
        if (data.detail.uid == GameData.player.uid) this.showEffect('bu');
        else this.playActionAnimation(data.detail.uid, 'buhua');
        soundMngr.instance.playAudioShiShi('buhua',null,this.playerSex);
    },

    handleTurn: function(data) {
        this.showTurn();
        this.startCoundDown(data);

        if (GameData.game.turn == GameData.player.uid) {
            this.showObtainActions(GameData.player.uid, GameData.game.obtain);
        }
    },

    handleObtain: function(data) {
        this.playerSex =  GameData.getPlayerSexByUid(GameData.game.turn);
        if (GameData.game.turn == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
            soundMngr.instance.playAudioOther('click');

            this.showObtainActions(GameData.player.uid, GameData.game.obtain);
        }
        var hua = GameData.game.obtainHua;
        if (hua instanceof Array && hua.length > 0) {
            if (GameData.game.turn == GameData.player.uid) {
                this.showEffect('bu');
            } else {
                this.playActionAnimation(GameData.game.turn, 'buhua');
            }
            soundMngr.instance.playAudioShiShi('buhua',null,this.playerSex);
        }
        this.showCards();
    },

    handleDisCard: function(data) {
        console.log("this.playerSex =  GameData.player.sex",data.detail.player,GameData.player.sex);
        // var a = GameData.getPlayerSexByUid(data.detail.player);
        // console.log("this.isPlayerSex(data.detail.player)==",a);
        this.playerSex =  GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudioShiShi('dis', data.detail.card,this.playerSex);
        soundMngr.instance.playAudioOther('out');
        this.showCards();
    },

    handleChiCard: function(data) {
        if (data.detail.player == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
        }
        this.showCards();
        this.playerSex =  GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudioShiShi('chi',null,this.playerSex);
        this.playActionAnimation(data.detail.player,'chi');
        this.moveBackMyCards();

        this.actionLayer.active = false;
        this.actionSecondaryLayer.active = false;
        this.showYoujinActin();
    },

    handlePengCard: function(data) {
        if (data.detail.player == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
        }
        this.playerSex =  GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudioShiShi('peng',null,this.playerSex);
        this.showCards();
        this.playActionAnimation(data.detail.player,'peng');
        this.moveBackMyCards();

        this.actionLayer.active = false;
        this.actionSecondaryLayer.active = false;
        this.showYoujinActin();
    },

    handleGangCard: function(data) {
        if (data.detail.player == GameData.player.uid) {
            var handcards = GameData.getMyHandCards();
            this.tingData = RuleHandler.instance.discardTip(handcards);
        }
        this.playerSex =  GameData.getPlayerSexByUid(data.detail.player);
        soundMngr.instance.playAudioShiShi('gang',null,this.playerSex);

        this.showCards();
        this.playActionAnimation(data.detail.player,'gang');
        this.moveBackMyCards();

        this.actionLayer.active = false;
        this.actionSecondaryLayer.active = false;

        this.showYoujinActin();
    },

    showYoujin: function(player, parent) {
        var node, iconUrl = '';
        var pos = GameData.tablePos[player.uid];
        var youNum = GameData.cards[player.uid]['youNum'];

        if (pos == 'down') {
            node = cc.find('youjin', parent);
            if (youNum == YoujinType.Ming) iconUrl = 'resources/shishi/image/youjinzhong.png';
            else if (youNum == YoujinType.An1) iconUrl = 'resources/shishi/image/youjinzhong.png';
            else if (youNum == YoujinType.An2) iconUrl = 'resources/shishi/image/eryouzhong.png';
            else if (youNum == YoujinType.An3) iconUrl = 'resources/shishi/image/sanyouzhong.png';
            } else if (pos == 'left') {
            node = cc.find('youjin', parent);
            if (youNum == YoujinType.Ming) iconUrl = 'resources/shishi/image/youjinzhong2.png';
            else if (youNum == YoujinType.An2) iconUrl = 'resources/shishi/image/eryouzhong2.png';
            else if (youNum == YoujinType.An3) iconUrl = 'resources/shishi/image/sanyouzhong2.png';
            } else if (pos == 'up') {
            node = cc.find('youjin', parent);
            if (youNum == YoujinType.Ming) iconUrl = 'resources/shishi/image/youjinzhong.png';
            //else if (youNum == YoujinType.An1) iconUrl = 'resources/shishi/image/youjinzhong.png';
            else if (youNum == YoujinType.An2) iconUrl = 'resources/shishi/image/eryouzhong.png';
            else if (youNum == YoujinType.An3) iconUrl = 'resources/shishi/image/sanyouzhong.png';
            } else if (pos == 'right') {
            node = cc.find('youjin', parent);

            if (youNum == YoujinType.Ming) iconUrl = 'resources/shishi/image/youjinzhong2.png';

            //else if (youNum == YoujinType.An1) iconUrl = 'resources/shishi/image/youjinzhong.png';
            else if (youNum == YoujinType.An2) iconUrl = 'resources/shishi/image/eryouzhong2.png';
            else if (youNum == YoujinType.An3) iconUrl = 'resources/shishi/image/sanyouzhong2.png';
            }

        if (iconUrl != '') {
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            node.active = true;
        } else {
            node.active = false;
        }
    },

    handleHuCard: function(data) {
        cc.log("=...........................",data.detail);

        this.HuType = data.detail;
        this.playerSex =  GameData.getPlayerSexByUid(data.detail.player);

        soundMngr.instance.playAudioShiShi('hu',null,this.playerSex);
        this.playActionAnimation(data.detail.player,'hu');
        this.moveBackMyCards();

        this.huiercard1.node.active = false;
        this.actionLayer.active = false;
        this.actionSecondaryLayer.active = false;
    },

    playActionAnimation:function(uid,action)
    {   
        if(GameData.joiners != null)
        {
           var pos = GameData.tablePos[uid];
           var animationNode = cc.find('layer_ui/layer_ui_table/actionAnimations/' + pos,this.node);
           cc.log('---> animationNode : ' + animationNode);
           if(animationNode != null)
           {
              cc.log('---> playActionAnimation : ' + action);
              animationNode.getComponent(cc.Animation).play(action);
           }
        }   
    },

    handlePass: function(data) {
        if (GameData.game.checkPass.uid) {
            var uid = GameData.game.checkPass.uid;
            var card = GameData.game.checkPass.card;
            var show = this.showPassActions(uid, card);
            if (!show) MjHandler.getInstance().requestPass(function(res){});
            GameData.game.checkPass = {};
        }
    },

    showYoujinActin: function() {
        var btnIdx = 0;
        this.actions = [];

        var handcards = GameData.getMyHandCards();
        var huData = RuleHandler.instance.canZimo(handcards, 0);

        if (huData.length > 0 && huData[0].length > 0) {
            if (huData[3]) {
                var youNum = GameData.cards[GameData.player.uid]['youNum'];
                cc.log('showYoujinActin youNum:'+youNum);
                if (youNum != 10) {
                    this.actions[btnIdx] = {act: 'youjin', deck: huData[4], zimo: true};
                    this.createActionBtn(++btnIdx, 'youjin.png');
                }
            }
        }

        if (GameData.game.turn == GameData.player.uid) {
            var youUid = 0;
            for (var i in GameData.cards) {
                var you = GameData.cards[i]['youNum'];
                if (you == 10 || you == 3) {
                    youUid = i;
                    break;
                }
            }

            //明游和暗游3只能胡牌
            if (youUid <= 0) {
                var gangActions = this.checkGangAction(GameData.player.uid, GameData.game.obtain, true);
                if(gangActions.length > 0)
                {
                    this.showGangAction(++btnIdx,gangActions);
                }
            }
        }

        if (btnIdx > 0) {
            for (; ++btnIdx<=4;) {
                var actionBtn = cc.find('btnAct'+btnIdx, this.actionLayer);
                actionBtn.active = false;
            }
            var passBtn = cc.find('btnPass', this.actionLayer);
            passBtn.active = true;

            this.actionLayer.active = !this.actionSecondaryLayer.active;
        } else {
            this.actionLayer.active = false;
        }
    },

    showPassActions: function(uid, card) {

        var btnIdx = 0;
        var self = this;
        self.actions = [];

        var qiangGang = GameData.game.checkPass.qiang;

        var chiData = RuleHandler.instance.canChi(uid, card);
        //console.log('chiData = '+JSON.stringify(chiData));
        if (qiangGang <= 0 && chiData.length > 0) {
            this.showChiAction(++btnIdx,card,chiData);
            /*self.actions[btnIdx] = {act: 'chi', card: card, myCards: chiData[0]};
            self.createActionBtn(++btnIdx, 'chi.png');
            for (var i=0; i<chiData.length; i++) {
                var cards = chiData[i];
                for (var n=0; n<cards.length; n++) {
                    self.moveUpMyCards(cards[n], 1);
                }
            }*/
        }

        var gangActions = this.checkGangAction(uid, card, false);
        if (qiangGang <= 0 && gangActions.length > 0)
        {
            this.showGangAction(++btnIdx,gangActions);
        }

        if (qiangGang <= 0 && RuleHandler.instance.canPeng(uid, card)) {
            self.actions[btnIdx] = {act: 'peng', card: card};
            self.createActionBtn(++btnIdx, 'peng.png');
            if (btnIdx >= 2) {
            }else{
                self.moveBackMyCards();
                self.moveUpMyCards(card,2);
            }
        }

        if (btnIdx >= 2) {
        }else{
            if (chiData.length == 1) {
                this.moveBackMyCards();

                 for (var i=0; i<chiData.length; i++) {
                    var cards = chiData[i];
                    for (var n=0; n<cards.length; n++) {
                        this.moveUpMyCards(cards[n], 1);
                    }
                }
            }
        }

        var huData = RuleHandler.instance.canDianPao(uid, card);
        cc.log('client test canDianPao:'+JSON.stringify(huData));
        if (huData.length > 0 && huData[0].length > 0) {
            self.actions[btnIdx] = {act: 'dianpao', type: huData[0], deck: huData[1], obtain: huData[2]};
            self.createActionBtn(++btnIdx, 'hu.png');

            /*if (huData[3]) {
             var youNum = GameData.cards[GameData.player.uid]['youNum'];
             if (youNum != 10) {
             self.actions[btnIdx] = {act: 'youjin', deck: huData[4], zimo: false};
             self.createActionBtn(++btnIdx, 'youjin.png');
             }
             }*/
        }

        var passBtn = cc.find('btnPass', self.actionLayer);
        passBtn.active = true;

        if (btnIdx > 0) {
            for (; ++btnIdx<=4;) {
                var actionBtn = cc.find('btnAct'+btnIdx, self.actionLayer);
                actionBtn.active = false;
            }
            //self.actionLayer.active = true;
            self.actionLayer.active = !this.actionSecondaryLayer.active;
        } else {
            self.actionLayer.active = false;
        }

        return (btnIdx > 0);
    },

    showObtainActions: function(uid, card) {

        var btnIdx = 0;
        var self = this;
        self.actions = [];

        var youUid = 0;
        for (var i in GameData.cards) {
            var you = GameData.cards[i]['youNum'];
            if (you == 10 || you == 3) {
                youUid = i;
                break;
            }
        }

        var handcards = GameData.getMyHandCards();
        var youNum = GameData.cards[GameData.player.uid]['youNum'];

        var huData = RuleHandler.instance.canZimo(handcards, card, true);
        cc.log('canZimo huData:'+JSON.stringify(huData));
        if (huData.length > 0 && huData[0].length > 0) {

            if(this.huBtnIsShow == true){
                self.actions[btnIdx] = {act: 'hu', type: huData[0], deck: huData[1], obtain: huData[2]};
                self.createActionBtn(++btnIdx, 'hu.png');
            }

            if (huData[3]) {
                var youRound = GameData.cards[GameData.player.uid]['youRound'];
                if (youRound != GameData.game.cardleft) {
                    if (youUid == 0) {
                        self.actions[btnIdx] = {act: 'youjin', deck: huData[4], zimo: true};
                        self.createActionBtn(++btnIdx, 'youjin.png');
                    }
                }
            }
        }

        //明游和暗游3只能胡牌
        if (youUid <= 0) { 
            var gangActions = this.checkGangAction(uid, card, true);
            if(gangActions.length > 0)
            {
                this.showGangAction(++btnIdx,gangActions);
            }

            var passBtn = cc.find('btnPass', self.actionLayer);
            passBtn.active = true;
        } else {
            var passBtn = cc.find('btnPass', self.actionLayer);
            passBtn.active = false;
        }

        if (btnIdx <= 0) {
            if (youUid > 0 && youUid != GameData.player.uid) {
                MjHandler.getInstance().requestDisCard(0, function(){});
                return;
            }
            self.actionLayer.active = false;
        } else {
            for (; ++btnIdx<=4;) {
                var actionBtn = cc.find('btnAct'+btnIdx, self.actionLayer);
                actionBtn.active = false;
            }
            self.actionLayer.active = !this.actionSecondaryLayer.active;
        }

        return (btnIdx > 0);
    },

    showGangAction : function(btnIdx,gangActions)
    {
        //cc.log('-------->>> gangActions.length ' + gangActions.length);
        if(this.actionSecondaryLayer.active)
        {
            this.actions[btnIdx-1] = {act: 'manygang', card: gangActions};
            this.createActionBtn(btnIdx, 'gang.png');
            this.refreshGangActionBar({act: 'manygang', card: gangActions});
        }
        else
        {
            if(gangActions.length == 1)
            {
                var actionCardId = gangActions[0].card;
                this.actions[btnIdx-1] = {act: gangActions[0].act, card: actionCardId};
                this.createActionBtn(btnIdx, 'gang.png');
                if (btnIdx >= 2) {
                    
                }else{
                    this.moveBackMyCards();
                    this.moveUpMyCards(actionCardId,4);
                } 
            }
            else if(gangActions.length > 1)
            {
                this.actions[btnIdx-1] = {act: 'manygang', card: gangActions};
                this.createActionBtn(btnIdx, 'gang.png');
            }           
        }
    },

    checkGangAction : function(uid, card, obtain)
    {
        var actions = new Array();
        if (obtain) 
        {
            var minggangselfCard = RuleHandler.instance.canMingGangSelf();
            if (minggangselfCard > 0)
            {
                actions.push({act: 'selfgang', card: minggangselfCard});
            }

            if (GameData.game.cardleft != 0 && uid == GameData.player.uid)
            {
                var cards = GameData.getMyHandCards();
                for (var key in cards) 
                {
                    if(cards[key] >= 4)
                    {
                        actions.push({act: 'angang', card: key});
                    }
                }
            }
        }
        else
        {
            var minggangCard = RuleHandler.instance.canMingGang(uid, card);
            if (minggangCard > 0)
            {
                actions.push({act: 'minggang', card: minggangCard});
            }
        }
        return actions;
    },

    showChiAction : function(btnIndx, card, chiAction){
        if (chiAction.length == 1) {
            this.actions[btnIndx - 1] = {act: 'chi', card: card, myCards: chiAction};
            this.createActionBtn(btnIndx, 'chi.png');
        }else if (chiAction.length > 1) {
            this.actions[btnIndx - 1] = {act: 'chi', card: card, myCards: chiAction};
            //console.log('this.actions = ' + JSON.stringify(this.actions));
            this.createActionBtn(btnIndx, 'chi.png');
        }
    },

    refreshChiActionType : function(data){
        this.chiActionList = [];
        //console.log('data.myCards = '+JSON.stringify(data.myCards));
        this.actionSecondaryLayer.active = true;
        var cardLayout = cc.find('cardLayout',this.actionSecondaryLayer);
        cardLayout.removeAllChildren();
        var cardTemp = cc.find('card',this.actionSecondaryLayer);
        cardTemp.active = true;
        for(var i = 0; i < data.myCards.length; i++)
        {
            var action = data.myCards[i];
            //console.log('data.myCards = '+JSON.stringify(data.myCards[i]));
            this.chiActionList.push(action);
            var carddis = GameData.game.lastdisCard;
            //console.log('carddis = ' + carddis);
            var card = cc.instantiate(cardTemp);
            if (contains(action, carddis)) {
            }else{
                action.push(carddis);
            }
            action = action.sort();
            //console.log('action = ' + JSON.stringify(action));
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
            MjHandler.getInstance().requestChiCard(carddis, data, function(res){
                if (res.result == 0) self.showEffect('chi');
            });
        }
        this.actionSecondaryLayer.active = false;
        this.moveBackMyCards();
    },

    createActionBtn: function(index, icon) {
        cc.log('show btn:' + icon);
        var actionNode = cc.find('btnAct'+index, this.actionLayer);
        var texture = cc.textureCache.addImage(cc.url.raw('resources/table/action/'+icon));
        actionNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
        actionNode.active = true;
    },

    onBtnActionClicked: function(evt, index) {

        /*cc.log('onBtnActionClicked, index : ' + index);

        for(var i = 0; i < this.actions.length; i++)
        {
            cc.log(this.actions[i].act + ',' + this.actions[i].card);
        }*/

        var self = this;
        var data = this.actions[index];
        if (data.act == 'hu') 
        {
            MjHandler.getInstance().requestHu(data.type, data.deck, data.obtain, function(res){
                if (res.result == 0) self.showEffect('hu');
            });
        } 
        if (data.act == 'dianpao') 
        {
            MjHandler.getInstance().requestDianPao(data.type, data.deck, data.obtain, function(res){
                if (res.result == 0) self.showEffect('hu');
            });
        } 
        else if (data.act == 'youjin') 
        {   
             if( GameData.game.cardleft <= ( 16 + GameData.joiners.length + GameData.getAllGangNumber() ) ) {
                 createMessageBox('如果继续游金，可能会荒庄', function () {
                         MjHandler.getInstance().requestYoujin(data.deck, data.zimo, function (res) {
                             if (res.result == 0) {
                                 self.showEffect('youjin');
                                 var youNum = GameData.cards[GameData.player.uid]['youNum'];
                                 // if (youNum == 2 || youNum == 3) {
                                 //     MjHandler.getInstance().requestDisCard(GameData.game.cardHuier1, function (res) {
                                 //     });
                                 // }
                             }
                         });
                     },
                     function () {
                         self.actionLayer.active = true;
                         return;
                     });
             }
            else{
                 MjHandler.getInstance().requestYoujin(data.deck, data.zimo, function(res){
                     if (res.result == 0) {
                         self.showEffect('youjin');
                         var youNum = GameData.cards[GameData.player.uid]['youNum'];
                         if (youNum == 2 || youNum == 3) {
                             MjHandler.getInstance().requestDisCard(GameData.game.cardHuier1, function(res){});
                         }
                     }
                 });
             }
        }
        else if (data.act == 'chi') 
        {
            this.huBtnIsShow = false;
            //console.log('data.myCards.length = ' + data.myCards.length);
            if (data.myCards.length <= 1) {
                MjHandler.getInstance().requestChiCard(data.card, data.myCards[0], function(res){
                    if (res.result == 0) {
                        self.showEffect('chi');

                    }
                });
            }else{
                this.refreshChiActionType(data);
            }   
        }
        else if (data.act == 'peng') 
        {
            this.huBtnIsShow = false;
            MjHandler.getInstance().requestPengCard(data.card, function(res){
                if (res.result == 0) {
                    self.showEffect('peng');
                }
            });
        }
        else if (data.act == 'manygang') 
        {
            cc.log('------------------> click gang, should open gang ui, data.card ' + data.card);
            this.refreshGangActionBar(data);
        } 
        else if (data.act == 'minggang') 
        {
            this.huBtnIsShow = true;
            MjHandler.getInstance().requestGangMingCard(data.card, function(res){
                if (res.result == 0) {
                    self.showEffect('gang');
                }
            });
        } 
        else if (data.act == 'selfgang') 
        {
            this.huBtnIsShow = true;
            MjHandler.getInstance().requestGangMingSelfCard(data.card, function(res){
                if (res.result == 0) {
                    self.showEffect('gang');
                }
            });
        } 
        else if (data.act == 'angang') 
        {
            this.huBtnIsShow = true;
            MjHandler.getInstance().requestGangAnCard(data.card, function(res){
                if (res.result == 0) {
                    self.showEffect('gang');
                }
            });
        }

        this.moveBackMyCards();

        self.actionLayer.active = false;
    },

    refreshGangActionBar : function(data)
    { 
        this.actionSecondaryLayer.active = true;
        var cardLayout = cc.find('cardLayout',this.actionSecondaryLayer);
        cardLayout.removeAllChildren();
        var cardTemp = cc.find('card',this.actionSecondaryLayer);
        cardTemp.active = true;
        this.gangActionList = new Array();
        for(var i = 0; i < data.card.length; i++)
        {
            var action = data.card[i];
            this.gangActionList.push(action);
            var card = cc.instantiate(cardTemp);
            card.name = i + '';
            card.getComponent(cc.Sprite).spriteFrame = null;
            var iconUrl = 'resources/mjcard2d/mj_face_xia_shou_' + action.card + '.png';
            // cc.log('load Card URL :' + iconUrl)
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            card.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 

            card.on(cc.Node.EventType.TOUCH_START, this.onClickActionSecondaryBtn,this);
            cardLayout.addChild(card);
        }
        cardTemp.active = false;
    },

    onBackToActionLayer : function()
    {
        this.actionLayer.active = true;
        this.actionSecondaryLayer.active = false;
    },

    onClickActionSecondaryBtn : function(e)
    {
        cc.log(e.target.name);
        var index = e.target.name;
        var data = this.gangActionList[index];
        var self = this;
        if(data != null)
        {
            if (data.act == 'minggang') 
            {
                MjHandler.getInstance().requestGangMingCard(data.card, function(res){
                    if (res.result == 0) self.showEffect('gang');
                });
            } 
            else if (data.act == 'selfgang') 
            {
                MjHandler.getInstance().requestGangMingSelfCard(data.card, function(res){
                    if (res.result == 0) self.showEffect('gang');
                });
            } 
            else if (data.act == 'angang') 
            {
                MjHandler.getInstance().requestGangAnCard(data.card, function(res){
                    if (res.result == 0) self.showEffect('gang');
                });
            }
        }

        if(this.gangActionList.length <= 1)
        this.actionSecondaryLayer.active = false;

        this.moveBackMyCards();
    },

    onBtnPassClicked: function(evt) {
        cc.log('onBtnPassClicked');
        cc.log('GameData.cards '+JSON.stringify(GameData.cards));
        var self = this;
        var youUid = 0;
        for (var i in GameData.cards) {
            var you = GameData.cards[i]['youNum'];
            if (you == 10 || you == 3) {
                youUid = i;
                break;
            }
        }
        var data = this.actions;
        var isHuAndYoujin = false;
        cc.log('data '+JSON.stringify(data));
        for(var key in data){
            if(data[key].act == 'hu'||data[key].act == 'youjin'||data[key].act == 'dianpao'){
                isHuAndYoujin = true;   
                break;   
            }
         }
         if(isHuAndYoujin){
            createMessageBox('确定要过牌吗？', function(){
                
                if (youUid > 0) {
                    
                    if (youUid == GameData.player.uid) {
                        MjHandler.getInstance().requestCancelYoujin(function(res){});
                        } else {
                            MjHandler.getInstance().requestDisCard(0, function(){});
                           MjHandler.getInstance().requestPass(function(res){});
                        }
                    } 
                else {
                    MjHandler.getInstance().requestPass(function(res){});
                }
                
                self.actionLayer.active = false;
                self.actionSecondaryLayer.active = false;
                self.moveBackMyCards();
                self.selectedCard = -1;
             },function(){
                return;
             });
    
         }else{
            if (youUid > 0) {
                        
                if (youUid == GameData.player.uid) {
                    MjHandler.getInstance().requestCancelYoujin(function(res){});
                    } else {
                        // MjHandler.getInstance().requestDisCard(0, function(){});
                        MjHandler.getInstance().requestPass(function(res){});
                    }
                } 
            else {
                MjHandler.getInstance().requestPass(function(res){});
            }
            self.actionLayer.active = false;
            self.actionSecondaryLayer.active = false;
            self.moveBackMyCards();
            self.selectedCard = -1;
         }   
        //var huData = RuleHandler.instance.canDianPao(uid, card);
        cc.log('onBtnPassClicked turn:'+GameData.game.turn+' uid:'+GameData.player.uid);
        
    },

    allYouJinShow: function(){
        // console.log('allYouJinShow  data = ' + JSON.stringify(GameData.allYouJinInfo.length));
        // this.showCards();
        if (GameData.allYouJinInfo) {
            console.log("-------allYoujin data---------  " + JSON.stringify(GameData.allYouJinInfo.length));
            if(GameData.allYouJinInfo.length == 0) {
                // this.showObtainActions(GameData.player.uid, GameData.game.obtain);
                this.showYoujinActin();
                return;
            }
            for(var i=0;i<GameData.allYouJinInfo.length;i++){
                if(GameData.allYouJinInfo[i].uid == GameData.player.uid){
                    var selfYoujinData = GameData.allYouJinInfo[i];
                    if(selfYoujinData.youNum == 0){
                        // this.showObtainActions(GameData.player.uid, GameData.game.obtain);
                        this.showYoujinActin();
                        if(selfYoujinData.isSelectYou1) this.actionLayer.active = false;
                        // else this.showObtainActions(GameData.player.uid, GameData.game.obtain);
                        else this.showYoujinActin();
                    }
                    else if(selfYoujinData.youNum == 10){
                        this.actionLayer.active = false;
                    }else if(selfYoujinData.youNum == 1){
                        if(selfYoujinData.isSelectYou2) this.actionLayer.active = false;
                        // else this.showObtainActions(GameData.player.uid, GameData.game.obtain);
                        else this.showYoujinActin();
                    }else if(selfYoujinData.youNum == 2){
                        if(selfYoujinData.isSelectYou3) this.actionLayer.active = false;
                        // else this.showObtainActions(GameData.player.uid, GameData.game.obtain);
                        else this.showYoujinActin();
                    }
                    // GameData.cards[GameData.allYouJinInfo[i].uid]['youNum'] = 0;
                    GameData.allYouJinInfo = null;
                    return;
                }   
            }
        }
    } ,

    showCards: function() {
        var player = GameData.getPlayerByPos('down');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_down.active = true;
            this.showMyHandCards(player, this.play_layer_down);
            this.showDisCards(player, this.play_layer_down, 'mj_face_xia_chu','down');
            this.showPengCards(player, this.play_layer_down, 'mj_face_xia_chu','down');
            this.showHua(player, this.play_layer_down,'down');
            this.showYoujin(player, this.play_layer_down);
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_right.active = true;
            this.showHandCards(player, this.play_layer_right);
            this.showDisCards(player, this.play_layer_right, 'mj_face_you_chu','right');
            this.showPengCards(player, this.play_layer_right, 'mj_face_you_chu','right');
            this.showHua(player, this.play_layer_right,'right');
            this.showYoujin(player, this.play_layer_right);
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('up');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_up.active = true;
            this.showHandCards(player, this.play_layer_up);
            this.showDisCards(player, this.play_layer_up, 'mj_face_shang_shou','up');
            this.showPengCards(player, this.play_layer_up, 'mj_face_shang_shou','up');
            this.showHua(player, this.play_layer_up,'up');
            this.showYoujin(player, this.play_layer_up);
        } else {
            this.play_layer_up.active = false;
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameData.cards[player.uid]) {
            this.play_layer_left.active = true;
            this.showHandCards(player, this.play_layer_left);
            this.showDisCards(player, this.play_layer_left, 'mj_face_zuo_chu','left');
            this.showPengCards(player, this.play_layer_left, 'mj_face_zuo_chu','left');
            this.showHua(player, this.play_layer_left,'left');
            this.showYoujin(player, this.play_layer_left);
        } else {
            this.play_layer_left.active = false;
        }

        this.showCardNum();
        this.showHuierCard();
    },

    showHua: function(player, parent, direction) {
        if (player) {
            var uid = player.uid;
            //console.log('GameData.cards[' + uid + '] = ' + JSON.stringify(GameData.cards[uid]));
            var huacard = GameData.cards[uid]['hua'].sort();
            console.log('huacard = ' + JSON.stringify(huacard));
            var huaNode = cc.find('cardhua',parent);
            var huaChild = huaNode.children;
            for (var i = 0; i < huaChild.length; i++) {
                huaChild[i].active = false;
            }
            for (var i = 0; i < huacard.length; i++) {
                var index = i + 1;
                var childNode = cc.find('cardhua/'+index,parent);
                childNode.getComponent(cc.Sprite).spriteFrame = null;
                var iconUrl = this.showHuaTexture(huacard[i],direction);
                var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                childNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
                childNode.active = true;
            }
        }
    },

    showHuaTexture : function(huaId, direction){
        var textureUrl = 'resources/shishi/image/';
        var tetureType = '';
        if (huaId == 111) tetureType = 'chun';
        else if (huaId == 112) tetureType = 'xia';
        else if (huaId == 113) tetureType = 'qiu';
        else if (huaId == 114) tetureType = 'dong';
        else if (huaId == 121) tetureType = 'mei';
        else if (huaId == 122) tetureType = 'lan';
        else if (huaId == 123) tetureType = 'zhu';
        else if (huaId == 124) tetureType = 'ju';
        var texturedirec = '';
        if (direction == 'down') texturedirec = '';
        else if (direction == 'right') texturedirec = '4';
        else if (direction == 'up') texturedirec = '3';
        else if (direction == 'left') texturedirec = '2';
        textureUrl = textureUrl + tetureType + texturedirec + '.png';
        // console.log('textureUrl = ' + textureUrl);
        return textureUrl;
    },

    showHandCards: function(player, parent) {
        if (player) {
            var uid = player.uid;
            var cardNum = GameData.getHandCardNum(uid) + (GameData.getChiCards(uid).length 
                + GameData.getPengCards(uid).length + GameData.getGangCards(uid).length) * 3;
            var showIdx = cardNum > GameData.client.handsize ? 0 : 1;
            var handIdx = 1, nodeIdx = 0;
            for (; nodeIdx<=GameData.client.handsize; nodeIdx++) {
                var node = cc.find('cardHand/cardHand'+nodeIdx, parent);
                if (nodeIdx == showIdx && handIdx <= GameData.getHandCardNum(uid)) {
                    node.active = true;
                    showIdx++; handIdx++;
                } else {
                    node.active = false;
                }
            }
        }
    },

    moveUpMyCards: function(id, popCount)
    {
        var count = 0;
        for(var i = 1; i <= GameData.client.handsize; i++)
        {
           var cardNode = cc.find('cardHand/cardHand' + i,this.play_layer_down);
           var cardId = cardNode.getComponent('Card').id;
           if(cardId == id)
           {
                cardNode.y = 30;
                count++;
                if(count >= popCount)
                {
                    return;
                }
           }
        }
    },

    moveBackMyCards : function()
    {
        this.selectedCard = -1;
        for (var i = 0; i <= GameData.client.handsize; i++) {
            var cardNode = cc.find('cardHand/cardHand' + i, this.play_layer_down);
            var cardId = cardNode.getComponent('Card').id;
            cardNode.position = this.myHandsInitPosition[i];
        }
    },

    showMyHandCards: function(player, parent) {
        var cardNormal = [], getObtain = false;
        var cardHand = GameData.getMyHandCards();
        var handNum = GameData.getHandCardNum(player.uid)
        var cardNum = handNum + (GameData.getChiCards(player.uid).length 
                + GameData.getPengCards(player.uid).length + GameData.getGangCards(player.uid).length) * 3;
        var nodeIdx = cardNum > GameData.client.handsize ? handNum-1 : handNum;

        cc.log('handNum:'+handNum+', cardNum:'+cardNum+', nodeIdx:'+nodeIdx);
        for (var card in cardHand) {
            for (var i=0; i<cardHand[card]; i++) {
                if (!getObtain && card == GameData.game.obtain) {
                    getObtain = true;
                    continue;
                }
                if (!RuleHandler.instance.isHuier(card)) {
                    cardNormal.push(card);
                    continue;
                }
                cc.log('showMyHandCards '+nodeIdx+' '+card);
                var node = cc.find('cardHand/cardHand'+nodeIdx, parent);
                var disable = this.setHandCardDisable(node, card);
                this.showCardContent(node,'mj_face_xia_shou',card);
                this.setMyHandButton(node,card,nodeIdx);
                this.setMyHuierVisible(node,card);
                if (!disable) this.setMyTingVisible(node,card);
                node.active = true;
                nodeIdx--;
            }
        }
        for (var i=0; i<cardNormal.length; i++) {
            var card = cardNormal[i];
            var node = cc.find('cardHand/cardHand'+nodeIdx, parent);
            //cc.log('show hand card:'+card+' idx:'+nodeIdx);
           // var icon = 'mj_card_xia_shou_1_'+card+'.png';
            //this.createCard(node, nodeIdx, card, icon, '', true);
            var disable = this.setHandCardDisable(node, card);
            this.showCardContent(node,'mj_face_xia_shou',card);
            this.setMyHandButton(node,card,nodeIdx);
            this.setMyHuierVisible(node,card);
            if (!disable) this.setMyTingVisible(node,card);
            node.active = true;
            nodeIdx--;
        }
        if (getObtain) {
            var cardid = GameData.game.obtain;
            var node = cc.find('cardHand/cardHand0', parent);
            var disable = this.setHandCardDisable(node, cardid);
            this.showCardContent(node,'mj_face_xia_shou',cardid);
            this.setMyHandButton(node,cardid,0);
            this.setMyHuierVisible(node,cardid);
            if (!disable) this.setMyTingVisible(node,cardid);
            node.active = true;
        } else {
            cc.log('showMyHandCards disable cardHand0');
            var node = cc.find('cardHand/cardHand0', parent);
            node.active = (cardNum > GameData.client.handsize);
        }
        //cc.log('showMyHandCards cardNum='+cardNum);
        var disIdx = cardNum > GameData.client.handsize ? handNum : handNum+1;
        for (var i=disIdx; i<=GameData.client.handsize; i++) {
            var node = cc.find('cardHand/cardHand'+i, parent);
            node.active = false;
            cc.log('showMyHandCards disable cardHand'+i);
        }
    },

    setHandCardDisable: function(node, card) {
        var show = false;
        if (GameData.game.turn == GameData.player.uid) {
            var youNum = GameData.cards[GameData.player.uid]['youNum'];
            if (youNum == 10 || youNum == 1 || youNum == 2) {
                show = !RuleHandler.instance.checkYoujin(card);
            } else if (youNum == 3) {
                show = !RuleHandler.instance.isHuier(card);
            }
        }

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
        return show;
    },

    showDisCards: function(player, parent, cardHeader,direction) {
        var node4 = cc.find('cardDis_4', parent);
        if (node4) node4.active = false;
        var node3 = cc.find('cardDis_3', parent);
        if (node3) node3.active = false;
        var node2 = cc.find('cardDis_2', parent);
        if (node2) node2.active = false;

        var disNode = cc.find('cardDis_'+GameData.room.joinermax, parent);
        disNode.active = true;
        
        var cards = GameData.getDisCards(player.uid);
        for (var i=1; i<=this.discardMax; i++) {
            var node = cc.find('card_face'+i, disNode);
            if (i <= cards.length) {
                var iconUrl = '';
                var card = cards[i-1];
                node.active = true;

                this.showCardContent(node,cardHeader,card);

                if (player.uid == GameData.game.lastdisUid && card == GameData.game.lastdisCard)
                {
                    if(node != null)
                    {
                        this._cardArrow.active = true;
                        this._cardArrow.parent = node;
                        this._cardArrow.position.x = 0;
                        this._cardArrow.position.y = 0;
                        cc.find('left',this._cardArrow).active =  direction == 'left' ? true : false;;
                        cc.find('down',this._cardArrow).active =  direction == 'down' ? true : false;;
                        cc.find('right',this._cardArrow).active =  direction == 'right' ? true : false;;
                        cc.find('up',this._cardArrow).active = direction == 'up' ? true : false;
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

    //判断是不是吃牌
    checkIsChiArray: function( array )
    {
        if( array == undefined
            || array.length != 3 ) {
            return false;
        }
        //如果数组中有两个及以上相同的牌，就不是吃牌
        if( parseInt(array[0]) == parseInt( array[1] ) ) {
            return false;
        }
        return true;
    },

    //判断是不是吃的那张牌
    checkIsChiDePai:function(array,allData)
    {
        if( array == undefined
            || allData == undefined ) {
            return -1;
        }
        for( var key in allData )
        {
            var data = allData[key][0];
            if( false == this.checkArrayIsSame( array,data ) )
                continue;

            return allData[key][1];
        }
        return -1;
    },

    //判断两组牌是不是相同
    checkArrayIsSame:function(array_1,array_2)
    {
        if( array_1 == undefined
            || array_2 == undefined
            || array_1.length != array_2.length ) {
            return false;
        }
        //将两组数组排序
        array_1.sort(function(a,b){
            return a-b;
        });
        array_2.sort(function(a,b){
            return a-b;
        });
        //遍历依次判断
        var key = 0;
        for(  var ii = 0; ii < array_1.length; ii++ ) {
            if( array_1[ii] == array_2[ii] ) {
                key++;
            }
        }
        if( key != array_1.length ) {
            return false;
        }
        return true;
    },

    //将已刷新的吃牌数组移除
    removeUsedChiArray : function( array,allData )
    {
        if( array == undefined) {
            return;
        }
        for( var key in allData )
        {
            var data = allData[key][0];
            if( false == this.checkArrayIsSame( array,data ) )
                continue;

            allData.splice( key,1 );
            return;
        }
    },

    showPengCards: function(player, parent, cardHeader, direction) {
        if (player) {
            var chi = GameData.getChiCards(player.uid);
            var allChiData = GameData.getSelfChiCards( player.uid );

            for(var i = 0; i< chi.length;i++){
                chi[i].sort(function(a,b){
                return a-b;
            });
            }

            var gang = GameData.getGangCards(player.uid);
            var peng = GameData.getPengCards(player.uid);

            var cards = gang.concat(peng, chi);
            var size = parseInt(GameData.client.handsize/3);

            //复制数组，创建一个临时数组
            var tempData = [];
            for( var key in allChiData ) {
                tempData.push(allChiData[key]);
            }

            for (var i=0; i<size; i++)
            {
                var node = cc.find('cardPeng/cardPeng'+(i+1), parent);

                //设置标签，用以判断一组吃牌只添加一次覆盖
                var flag = false;

                if (i < cards.length) 
                {
                        for (var n=0; n<4; n++) 
                        {
                            var face = node.getChildByName('card_face'+(n+1)).getComponent("cc.Sprite");
                            //var word = node.getChildByName('card_word'+(n+1)).getComponent("cc.Sprite");
                            if (n < cards[i].length) 
                            {       
                                console.log('n and cards[i].length'+n,cards[i].length);

                                face.node.active = true;

                                var cardId = cards[i][n];
                                this.showCardContent(face.node,cardHeader,cardId);

                                //判断是不是吃牌
                                if( true == this.checkIsChiArray(cards[i])) {
                                    //判断是不是吃的那张牌，添加遮罩
                                    //判断这组牌是不是已经添加过
                                    if( flag == false ) {
                                        var chiCard = this.checkIsChiDePai( cards[i], tempData );
                                        if( chiCard == cardId ) {
                                            //将此吃牌数组数据 从临时 数组中删除
                                            this.removeUsedChiArray(cards[i], tempData);
                                            //添加遮罩
                                            this.showChiPaiMask(face.node,cardId,direction);

                                            flag = true;
                                        }
                                    }
                                }

                                if(n == 3 && RuleHandler.instance.isHuier(cardId) == true)
                                {
                                    this.addHuierIcon(face.node,direction);
                                }
                            } 
                            else 
                            {
                                face.node.active = false;
                            } 
                        }
                        if (cards[i].length == 5) { //暗杠
                                //判断当前玩家是否为down
                            if(player.uid != GameData.player.uid){
                                //显示暗杠控件
                                var back1 = node.getChildByName('card_back1').getComponent("cc.Sprite");
                                back1.node.active = true;
                                var back2 = node.getChildByName('card_back2').getComponent("cc.Sprite");
                                back2.node.active = true;
                                var back3 = node.getChildByName('card_back3').getComponent("cc.Sprite");
                                back3.node.active = true;
                                var back4 = node.getChildByName('card_back4').getComponent("cc.Sprite");
                                back4.node.active = true;
                                //隐藏明杠控件
                                var face1 = node.getChildByName('card_face1').getComponent("cc.Sprite");
                                face1.node.active = false;
                                var face2 = node.getChildByName('card_face2').getComponent("cc.Sprite");
                                face2.node.active = false;
                                var face3 = node.getChildByName('card_face3').getComponent("cc.Sprite");
                                face3.node.active = false; 
                                var face4 = node.getChildByName('card_face4').getComponent("cc.Sprite");
                                face4.node.active = false;  
                            }else{
                                //隐藏暗杠控件
                                var back1 = node.getChildByName('card_back1').getComponent("cc.Sprite");
                                back1.node.active = false;
                                var back2 = node.getChildByName('card_back2').getComponent("cc.Sprite");
                                back2.node.active = false;
                                var back3 = node.getChildByName('card_back3').getComponent("cc.Sprite");
                                back3.node.active = false;
                                var back4 = node.getChildByName('card_back4').getComponent("cc.Sprite");
                                back4.node.active = true;
                                //显示明杠控件
                                var face1 = node.getChildByName('card_face1').getComponent("cc.Sprite");
                                face1.node.active = true;
                                var face2 = node.getChildByName('card_face2').getComponent("cc.Sprite");
                                face2.node.active = true;
                                var face3 = node.getChildByName('card_face3').getComponent("cc.Sprite");
                                face3.node.active = true;
                                var face4 = node.getChildByName('card_face4').getComponent("cc.Sprite");
                                face4.node.active = false;  
                            }
                            
                        } 
                        else {  
                            var back1 = node.getChildByName('card_back1').getComponent("cc.Sprite");
                            back1.node.active = false;
                            var back2 = node.getChildByName('card_back2').getComponent("cc.Sprite");
                            back2.node.active = false;
                            var back3 = node.getChildByName('card_back3').getComponent("cc.Sprite");
                            back3.node.active = false;
                            var back4 = node.getChildByName('card_back4').getComponent("cc.Sprite");
                            back4.node.active = false;
                        }
                    node.active = true;
                } else {
                    node.active = false;
                }
            }
        }
    },

    addHuierIcon : function(parent,direction)
    {
        if(parent.childrenCount <= 0)
        {
            var huierIconNode = new cc.Node();
            parent.addChild(huierIconNode);
            var huierIconTx = cc.textureCache.addImage(cc.url.raw('resources/shishi/image/youjinbiao_big.png'));
            var huierIconSprite = huierIconNode.addComponent(cc.Sprite);
            huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTx);
            
            if(direction == 'right')
            {
                huierIconNode.x = -32.6;
                huierIconNode.y = 7.1;
                huierIconNode.rotation = -101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = 11;
            }
            else if(direction == 'down')
            {
                huierIconNode.x = 0;
                huierIconNode.y = 60;
                huierIconNode.skewX = 10;
            }
            else if(direction == 'left')
            {
                huierIconNode.x = 31;
                huierIconNode.y = 8.6;
                huierIconNode.rotation = 101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = -11;
            }
            else if(direction == 'up')
            {
                huierIconNode.x = 3;
                huierIconNode.y = -6.8;
                huierIconNode.rotation = 180;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.3;
            }
        }
    },

    showCardContent : function(cardNode,cardHeader,cardId)
    {
        cc.log('showCardContent:'+cardId+' '+cardHeader);
        var card = cardNode.getComponent('Card');
        if(card != null)
        {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
        this.setMaskVisible(cardNode,false);
        this.setChiPaiMaskVisible(cardNode,false);
    },

    setMyHandButton : function(cardNode,cardId,index)
    {
        var cardBtn = cardNode.getChildByName(cardNode.name + '_button');
        if(cardBtn == null)
        {
            cardBtn = cc.instantiate(this.cardButtonPrefab);
            cardNode.addChild(cardBtn);
            cardBtn.name = cardNode.name + '_button';
        }
        var cardButton = cardBtn.getComponent('CardButton');
        cardButton.setCardId(cardId);
        cardButton.setIndex(index);
    },

    setMyHuierVisible : function(cardNode,cardId)
    {
        var show = false;
        if (RuleHandler.instance.isHuier(cardId))
        {
            //cc.log('setMyHuierVisible card:'+cardId);
            show = true;
        }

        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if(huierNode == null)
        {
            if(show == true)
            {
                huierNode = cc.instantiate(this.cardHuierPrefab);
                //huierNode.y = huierNode.y -10;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';    
                var texture = cc.textureCache.addImage(cc.url.raw("resources/shishi/image/youjinbiao_big.png"));
                var headerNodeIcon = cc.find('huier_icon',huierNode)
                headerNodeIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        }
        else
        {
            huierNode.active = show;
        }
    },

    setMyTingVisible : function(cardNode,cardId)
    {
        cc.log('setMyTingVisible card:'+cardId);
        var tingDiscard = false;
        for(var i = 0; i < this.tingData.length; i++)
        {
            var data = this.tingData[i];
            if(data.discard == cardId)
            {
                tingDiscard = true;
                break;
            }
        }

        var tingNode = cardNode.getChildByName(cardNode.name + '_ting');
        if(tingNode == null)
        {
            if(tingDiscard == true)
            {
                tingNode = cc.instantiate(this.cardTingPrefab);
                tingNode.y = tingNode.y -10;
                cardNode.addChild(tingNode);
                tingNode.name = cardNode.name + '_ting';
            }
        }
        else
        {
            tingNode.active = tingDiscard;
        }

        if(GameData.game.turn != GameData.player.uid)
        {
            if(tingNode != null)
            {
                tingNode.active = false;
            }
        }        
    },

    showTurn: function() 
    {
        cc.find('down',this.direction_turn).active = false;
        cc.find('right',this.direction_turn).active = false;
        cc.find('up',this.direction_turn).active = false;
        cc.find('left',this.direction_turn).active = false;
        cc.find('downArrow',this.direction_turn).active = false;
        cc.find('rightArrow',this.direction_turn).active = false;
        cc.find('upArrow',this.direction_turn).active = false;
        cc.find('leftArrow',this.direction_turn).active = false;
        console.log('GameData.game.turn = '+GameData.game.turn);
        console.log('GameData.tablePos[GameData.game.turn] = ' + GameData.tablePos[GameData.game.turn]);
        cc.find(GameData.tablePos[GameData.game.turn],this.direction_turn).active = true;
        cc.find(GameData.tablePos[GameData.game.turn]+'Arrow',this.direction_turn).active = true;
    },

    showCardNum: function() {
        if (GameData.game.cardleft < 0) return;
        this.leftCardNumLabel.string = GameData.game.cardleft;
    },

    showHuierCard: function() {
        var huier1 = GameData.game.cardHuier1;
        if (huier1 > 0) {
            var texture = cc.textureCache.addImage(cc.url.raw('resources/mjcard2d/mj_face_xia_shou_'+huier1+'.png'));
            this.huiercard1.node.active = true;
            this.huiercard1.spriteFrame = new cc.SpriteFrame(texture);
        }
    },

    showEffect: function(type) {
        cc.log('show effect: ' + type);
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
            case 'dianpao':
                spineUrl = 'spine/table/hu';
                spineAnim = 'a';
                break;
            case 'chi':
                spineUrl = 'spine/table/chi';
                spineAnim = 'a';
                break;
            case 'bu':
                spineUrl = 'shishi/animation/bu/bu';
                spineAnim = 'animation';
                break;
            default: 
                return;
        }

        var spineNode = this.spineNode;
        this.spineNode.active = true;
        var spine = spineNode.getComponent('sp.Skeleton');
        spine.skeletonData = null;
        spine.animation = null;
        cc.loader.loadRes(spineUrl, sp.SkeletonData, function(err, res) {
            var spine = spineNode.getComponent('sp.Skeleton');
            spine.skeletonData = res;
            spine.animation = spineAnim;
        });
    },

    setAllHandCardsBack:function(node){
        for( var key = 0; key < node.parent.childrenCount; key++ ){
            var tempNode = cc.find('cardHand/cardHand'+key, this.play_layer_down);
            if( tempNode ) {
                tempNode.setPosition(this.myHandsInitPosition[key]);
            }
        }
    },

    onCardBtnStart:function(data){
    },
    onCardBtnMove:function(data){
        var card = data.detail.card;

        //显示听牌
        if(GameData.game.turn == GameData.player.uid)
        {
            if( this.tingTip.getTingNodeActive() == false
                || this.tingTip.getTingSelectCard() != card )
            {
                this.tingTip.show(card,this.tingData);
                this.showMask(card);
            }
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

    onHandCardClicked: function(data) {
        var card = data.detail.card;
        var index = data.detail.index;
        var node = cc.find('cardHand/cardHand'+index, this.play_layer_down);

        var maskNode = node.getChildByName('mask');
        var mask = maskNode ? maskNode.active : false;

        var self = this;
        if (this.selectedCard == index)
        {
            this.selectedCard = -1;
            this.tingTip.hide();

            if (!mask) {
                MjHandler.getInstance().requestDisCard(card, function(ret) {
                    node.stopAllActions();
                    self.moveBackMyCards();
                    self.huBtnIsShow = true;
                });
            }
            else{
                this.moveBackMyCards();
            }
        } else {
            if (this.selectedCard >= 0) {
                var last = cc.find('cardHand/cardHand'+this.selectedCard, this.play_layer_down);
                last.runAction(cc.moveTo(0.01, cc.p(this.myHandsInitPosition[this.selectedCard].x, 0)));
                this.tingTip.hide();
            }
            node.runAction(cc.moveTo(0.01, cc.p(this.myHandsInitPosition[index].x, 30)));

            this.selectedCard = index;
            if(GameData.game.turn == GameData.player.uid && !mask)
            {
                if( this.tingTip.getTingNodeActive() == false
                    || this.tingTip.getTingSelectCard() != card)
                {
                    this.tingTip.show(card,this.tingData);
                    this.showMask(card);
                }
            }
        }
    },

    showMask : function(selectCard)
    {
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

    showPengCardMask : function(selectCard,parent,direction)
    {
        for(var i = 1; i < 5; i++)
        {
            var node = cc.find('cardPeng/cardPeng'+i, parent);
            if(node != null && node.active)
            {
                for(var k = 1; k < 5; k++)
                {
                    var cardNode = cc.find('card_face'+k, node);
                    if(cardNode.active)
                    {
                        this.gotoMask(cardNode,selectCard,parent,direction);
                    }
                }
            }
        }
    },

    showDisCardMask : function(selectCard,parent,direction)
    {
        for(var i = 1; i <= this.discardMax; i++)
        {
            var cardNode = cc.find('cardDis_'+GameData.room.joinermax+'/card_face'+i, parent);
            if(cardNode.active)
            {
                this.gotoMask(cardNode,selectCard,parent,direction);
            }
        }
    },

    gotoMask : function(cardNode,selectCard,parent,direction)
    {
        var card = cardNode.getComponent('Card');
        if(card != null)
        {
            var cardId = card.id;
            var show = selectCard == cardId ? true : false;

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

    setMaskVisible : function(cardNode,show)
    {
        //cc.log('showMaskVisible - > show ' + show);
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

    setChiPaiMaskVisible : function(cardNode,show)
    {
        var maskNode = cardNode.getChildByName(cardNode.name + '_mask');
        if(maskNode == null)
        {
            if(show == true)
            {
                maskNode = cc.instantiate(this.cardMaskPrefab);
                cardNode.addChild(maskNode);
                maskNode.name = cardNode.name + '_mask';

                cc.find('tipMask',maskNode).active = false;
                cc.find('chipaiMask',maskNode).active = true;
            }
        }
        else
        {
            cc.find('chipaiMask',maskNode).active = show;
        }

        return maskNode;
    },

    showChiPaiMask:function(cardNode,selectCard,direction)
    {
        var card = cardNode.getComponent('Card');
        if(card != null)
        {
            var cardId = card.id;
            var show = selectCard == cardId ? true : false;

            var maskNode =this.setChiPaiMaskVisible(cardNode,show);

            if(maskNode != null)
            {
                cc.find('chipaiMask/up',maskNode).active = false;
                cc.find('chipaiMask/down',maskNode).active = false;
                cc.find('chipaiMask/right',maskNode).active = false;
                cc.find('chipaiMask/left',maskNode).active = false;

                cc.find('chipaiMask/'+direction,maskNode).active = true;
            }
        }
    },

    onGameScore : function()
    {
        this.tingTip.hide();
        this.unschedule(this.runCountDown);
        this.PLayerUID = null;
    },

    startCoundDown : function(data)
    {   
        this.PLayerUID = data.detail;
        this._countdown_index = 10;
        this.schedule(this.runCountDown, 1);
    },

    runCountDown : function()
    {
        this.showCountDown(this._countdown_index + '');
        if(this._countdown_index <= 0)
        {
            this._countdown_index = 10;
        }
        else
        {   //console.log('this.PLayerUID '+this.PLayerUID);
            if(this._countdown_index == 3 && this.PLayerUID == GameData.player.uid)
            {
                soundMngr.instance.playAudioOther('countdown');
            }
            this._countdown_index--;
        } 
    },

    showCountDown : function(num)
    {
        var ary = num.split('');
        var url1;
        var url2;
        if(ary.length == 0)
        {
            return;
        }
        if(ary.length == 1)
        {
            url1 = cc.url.raw('resources/number/jinzi0.png');
            url2 = cc.url.raw('resources/number/jinzi' + num + '.png');
        }
        else if(ary.length == 2)
        {
            url1 = cc.url.raw('resources/number/jinzi' + ary[0] + '.png');
            url2 = cc.url.raw('resources/number/jinzi' + ary[1] + '.png');
        }
        else
        {
            return;
        }
        var texture1 = cc.textureCache.addImage(url1);
        this.countdown_num1.spriteFrame = new cc.SpriteFrame(texture1);
        var texture2 = cc.textureCache.addImage(url2);
        this.countdown_num2.spriteFrame = new cc.SpriteFrame(texture2);       
    },
    onGameStartHandler : function(){
        // this.mapCondition();
        // if (GameData.room.opts.joinermax == 2) {
            this.mapNode.active = false;
        // }else{
        //     this.mapNode.active = true;
        // }

        // if (GameData.player.uid == GameData.room.creator) {
        //     if (cc.sys.localStorage.getItem("creatorIsCheckIp") == "true") return;
        // }else{
        //     if (cc.sys.localStorage.getItem("isCheckIp") == "true") return;
        // }
        // var ipMap = {};
        // for (var i = 0; i<GameData.joiners.length; i++) {
        //     var player = GameData.joiners[i];
        //     if (player.remoteAddr != null && player.uid > 0 && player.uid != GameData.player.uid) {
        //       if (ipMap[player.remoteAddr]) ipMap[player.remoteAddr].push(player.name);
        //       else ipMap[player.remoteAddr] = [player.name];
        //     }
        // }

        // var ipStr = '';
        // for (var i in ipMap) {
        //     if (ipMap[i].length >= 2) ipStr += ipMap[i]+",正在使用同一IP地址进行游戏!\n";
        // }
        // console.log('ipStr = '+ipStr);
        // if (ipStr!='') createMessageBox(ipStr, function() {});

        // if (GameData.danger && GameData.joiners.length > 2 ) {
        //     this.mapLayer.active = true;
        // }else{
        //     this.mapLayer.active = false;
        // }

        // if (GameData.player.uid == GameData.room.creator) {
        //     cc.sys.localStorage.setItem("creatorIsCheckIp",true);
        // }else{
        //     cc.sys.localStorage.setItem("isCheckIp",true);
        // }
    },
    showScoreLayer :function(){
        this.getComponent('roomScore-shishi').ShowPlayerScoreItem();
        this.scoreLayer.active = true;
    },
    mapCondition : function(){
        /*WriteLog('GameData.joiners.length = '+GameData.joiners.length);
        this.getComponent('AMapPanel').showPlayers();
        var iconUrl;
        if (GameData.danger) {
            iconUrl = 'resources/table/map/weixian.png';
        }else{
            iconUrl = 'resources/table/map/anquan.png';
        } 
        if (iconUrl != '') {
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.mapNode.getComponent(cc.Sprite).spriteFrame = null;
            this.mapNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            this.mapNode.active = true;
        } */
    },
    showMap : function(eve){
        // this.getComponent('AMapPanel').showPlayers();
        // this.mapLayer.active = true;
    },
    showChaShuiLayer : function() {
        this.chashuiLayer.active = true;
        cc.log("showChaShuiLayer");
    },
});

module.exports = roomTable;