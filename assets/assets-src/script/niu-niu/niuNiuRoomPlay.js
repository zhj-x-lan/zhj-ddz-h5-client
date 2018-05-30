var soundMngr = require('SoundMngr');
var roomHandler = require('roomHandler');
var niuNiuHandler = require('niuNiuHandler');
var gameDefine = require('gameDefine');
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        qiangzhuangNode: cc.Node,   //叫分节点
        multipleNode: cc.Node, // 下注的节点
        otherHandCardNode: cc.Node, // 其它玩家手牌的节点
        selfHandCardNode: cc.Node, // 自己的手牌 (已出和未出牌)
        // 倒计时相关组件
        countdown_num1 : cc.Sprite,
        countdown_num2 : cc.Sprite,
        adviseBtn: cc.Node, //提示按钮
        sendBtn: cc.Node,  //出牌按钮
        actionNode: cc.Node, // 动画节点

        fiveAct: cc.Node,
        tenAct: cc.Node,
        selfPokerTypePrefab : cc.Prefab, //自己牌型
        otherPokerTypePrefab: cc.Prefab,
        betSp: cc.Sprite,//下注提示img
        pinNiuSp :cc.Sprite, //拼牛中img
        qiangzhuangSp: cc.Sprite, //抢庄imag


        winAnim:cc.Node, //胜利动画
        loseAnim:cc.Node,//失败动画

        playerHeads: [cc.Node],
        scoreMask: cc.Node,
        scoreNode: cc.Prefab,
        scoreParent: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.scoreMask.active = false;
        this.handlerMsg();
        this.directionNode = cc.find('/direction', this.node);
        this.remainSeconds = 0; // 倒计时结束时间
        this.initUI();
        this.initNodeActive();
        this._selfHandCards = []; //自己的手牌

        this._selfHandCardInitialPos = []; //记录玩家手牌界面里的位置

        var handCardNode = cc.find("/handCard",this.selfHandCardNode);
        for (var i = 0; i < handCardNode.childrenCount; i++) {
            this._selfHandCardInitialPos.push(handCardNode.children[i].getPosition())
        }
    },
    initNodeActive : function () {
        this.qiangzhuangSp.node.active = false;
        this.pinNiuSp.node.active = false;
        this.betSp.node.active = false;
        this.qiangzhuangNode.active = false;
        this.otherHandCardNode.active = false;
        this.selfHandCardNode.active = false
        this.multipleNode.active = false;
        this.adviseBtn.active = false;
        this.sendBtn.active = false;
        this.fiveAct.active = false;
        this.tenAct.active = false;
    },
    // 初始化界面
    initUI: function () {

        //this.initUI();

        var self = this;
        var runInfo = GameData.room; //回合信息

        if (!runInfo || runInfo.id == "") {
            return;
        }

        if (!runInfo) {
            return;
        }

        // 游戏的状态 : -1 初始化 0 定庄 1 下注 2 发牌 3 拼牛 4 结算 5 回合结束
        var runState = runInfo.status;
        this.qiangzhuangNode.active = false;
        this.otherHandCardNode.active = false;
        this.selfHandCardNode.active = false;
        if (niuNiuHandler.isStartAnimationPlayed == true  && runState < niuNiuHandler.NIU_NIU.GAMESTATUS.CHIPS) { //是否播放过开出动画
            this.handleGameStart();
            return;
        }
        var niuniuStayType = niuNiuHandler.NIU_NIU.GAMESTATUS;
        if ((niuNiuHandler.status < niuniuStayType.ZHUANG && roomHandler.room.status <= gameDefine.RoomState.READY) || niuNiuHandler.status > niuniuStayType.COMPARE) return;
        this.showHandCards();
        var niuNiustatus = niuNiuHandler.status;
        if (niuNiustatus < niuNiuHandler.NIU_NIU.GAMESTATUS.CHIPS) {
            this.showGetZhuangUI();
        }
        this.getGameInfo();
        //this.actionNode.active = false;

    },

    // start: function () {
    //     this.playCountDownAnimation(1,0);
    // },


    start: function () {

       this.initUI();
    },
    showGetZhuangUI: function () {
        for (var i = 0; i < this.qiangzhuangNode.childrenCount; i++) {
            var button = this.qiangzhuangNode.children[i].getComponent('cc.Button');
            button.interactable = true;
        }
        this.qiangzhuangNode.active = true;
    },
    clickGetZhuang: function(eve, data){
        var zhuangNum = data;
        this.qiangzhuangNode.active = false;
        niuNiuHandler.requestZhuang(zhuangNum);
    },
    //获取游戏状态
    getGameInfo: function () {
        var runInfo = GameData.room;
        var niuNiustatus = niuNiuHandler.status;
        if (niuNiustatus > niuNiuHandler.NIU_NIU.GAMESTATUS.ZHUANG && niuNiustatus <= niuNiuHandler.NIU_NIU.GAMESTATUS.SETTLE) {
            // var remainSecond = runInfo.betEndTimeStamp - Date.now() / 1000;
            // console.warn("下注剩余时间:   " + remainSecond);
            this.showBetUI();
            if (niuNiustatus >= niuNiuHandler.NIU_NIU.GAMESTATUS.COMPARE) {
                this.showDisCardUI();
                // this.handleRegulareCircle();
            }
        }
        this.showHintImg();
    },
    // 显示下注阶段的界面
    showBetUI: function () {
        var chipsData = niuNiuHandler.playerChips;
        if (chipsData[GameData.player.uid] === -1 && niuNiuHandler.zhuangUid != GameData.player.uid) {
            // 表示当前自己还没有下注
            var betType = roomHandler.room.opts.multipleType;
            this.multipleNode.getChildByName("multipleType" +betType).active = true;
            this.multipleNode.active = true;
            this.fiveAct.active = true;
            var armDisp = this.fiveAct.getComponent(dragonBones.ArmatureDisplay);
            armDisp.playAnimation('newAnimation',0);  
        }else {
            this.multipleNode.active = false;
            this.fiveAct.active = false
        }
    },

    //显示自己出牌的状态
    showDisCardUI: function () {
        var isNeedShow = false;
        var sendList = niuNiuHandler.playerSendCard;
        if (Object.keys(sendList).length > 0) {
            if (niuNiuHandler.status === niuNiuHandler.NIU_NIU.GAMESTATUS.COMPARE && sendList[GameData.player.uid] === false) {
                isNeedShow = true;
                this.tenAct.active = true;
                var armDisp = this.tenAct.getComponent(dragonBones.ArmatureDisplay);
                armDisp.playAnimation('newAnimation',1);
            }else{
                isNeedShow = false;
            }
        }
        this.adviseBtn.active = isNeedShow;
        this.sendBtn.active = isNeedShow;
    },

    // 显示玩家的手牌
    showHandCards: function () {
        var players = roomHandler.players;
        if (!players || players.length == 0) {
            return;
        }
         //隐藏下注提示img
        this.fiveAct.active = false
        // this.betSp.node.active =false;
        // this.pinNiuSp.node.active =false;
        this.otherHandCardNode.active = true;
        for (var i = 0; i < this.otherHandCardNode.children.length; i++) {
            this.otherHandCardNode.children[i].active = false;
        }
        
        var bossGameSeatInfo = niuNiuHandler.playerZhuang;
        var playerCards = niuNiuHandler.playerCards;
        for (var i = 0; i < players.length; i++) {
            var userId = players[i].uid;
            var localIndex = roomHandler.getLocalPosition(i);
            if (localIndex == 0) {
                this.showSelfHandCards(playerCards[userId], 1);
                continue;
            }
            var handCardNode = this.otherHandCardNode.getChildByName("handCard"+localIndex);
            handCardNode.active = true;
            for (var j = 0; j < handCardNode.children.length; j++) {
                var pokerScp = handCardNode.children[j].getComponent("niuNiuPoker");
                if (playerCards[userId] && playerCards[userId].length == 0) {
                    pokerScp.initCardInfo(null);

                }else if(playerCards[userId] && playerCards[userId].length > 0){
                    var cardInfo = playerCards[userId];
                    var playCard = cardInfo[j];
                    if (playCard != null) {
                        var zhuangUserId = niuNiuHandler.zhuangUid;
                        var sendData = niuNiuHandler.playerSendCard;
                        if (zhuangUserId > 0 && sendData[zhuangUserId] == true) { //如果是自己或者庄家已经出牌
                            pokerScp.turnOver(true);
                        }else{
                            pokerScp.turnOver(false);
                        }
                        pokerScp.initCardInfo(playCard);
                    }else{
                        pokerScp.initCardInfo(null);
                    }
                }

            }
        }
    },

    // 显示自己的手牌
    showSelfHandCards: function (playerInfo, type) {
        this.adviseBtn.active = false; // 隐藏提示按钮
        this.sendBtn.active = false;  // 隐藏出牌按钮

        this._selfHandCards = [];
        for (var i = 0; i < this.selfHandCardNode.childrenCount; i++) {
            this.selfHandCardNode.children[i].active = false;
        }
        this.selfHandCardNode.active = false;
        if (!playerInfo) {
            return;
        }
        this.selfHandCardNode.active = true;
        var sendList = niuNiuHandler.playerSendCard;
        var srtNodeName;
        if (type == 1) {
            if (niuNiuHandler.playerSendCard[GameData.player.uid] == true) {
                srtNodeName = "handCardDis";
            }else{
                srtNodeName = "handCard";
            }
        }else if (type == 2) {
            srtNodeName = "handCardDis";
        }
        var handCardNode = this.selfHandCardNode.getChildByName(srtNodeName);
        if (handCardNode) {
            handCardNode.active = true;
            for (var j = 0; j < handCardNode.children.length; j++) {
                var pokerScp = handCardNode.children[j].getComponent("niuNiuPoker");
                if (playerInfo.length == 0) {
                    pokerScp.initCardInfo(null);
                }else if( playerInfo.length){
                    var cardInfo = playerInfo[j];
                    if (cardInfo != null) {
                        pokerScp.turnOver();
                        pokerScp.initCardInfo(cardInfo);
                    }else{
                        pokerScp.initCardInfo(null);
                    }
                }
                this._selfHandCards.push(pokerScp);
            }
        }
    },

    // 准备按钮的回调函数
    onReadyBtnClick: function () {
        this.clearUI();
        roomHandler.setReady();
    },

    /**
     * 当用户点击提示按钮
     * @param event
     * @param customEventData
     */
    onAdviseBtnClick: function (event, customEventData) {
        var selfGameSeatInfo = roomHandler.getPlayerByUid(GameData.player.uid);
        niuNiuHandler.isSelfClickAdviseBtn = true;
        // if (selfGameSeatInfo)
        this.actionNode.active = true;
        var animationNode = this.actionNode.getChildByName("act0");
        // var titleLbl = animationNode.getChildByName("title").getComponent(cc.Label);
        // titleLbl.string = selfGameSeatInfo.pokerInfo.fan.desc;
        createMoveMessage(selfGameSeatInfo.pokerInfo.fan.desc);

        if (selfGameSeatInfo.pokerInfo) {
            var towCards = selfGameSeatInfo.pokerInfo.towCards.concat();
            if (towCards.length > 0 && selfGameSeatInfo.pokerInfo.type != NIU_NIU.POKER_TYPE.DOUBLE_COW) {
                for (var i = 0; i < this._selfHandCards.length; i ++) {
                    var pokerScp = this._selfHandCards[i];
                    if (parseInt(pokerScp.cardInfo.value) == parseInt(towCards[0])) {
                        towCards[0] = -1;
                        continue;
                    }
                    if (parseInt(pokerScp.cardInfo.value) == parseInt(towCards[1])) {
                        towCards[1] = -1;
                        continue;
                    }
                    pokerScp.showTipAction();
                }
            }
        }
        event.target.active = false;
    },

    /**
     *  下注按钮
     * @param event
     * @param customEventData
     */
    onBetBtnClick: function (event, customEventData) {
        var self = this;
        var succes = niuNiuHandler.requestChips(customEventData);
        if (succes == 0) {
            this.showBetUI();
        }
    },

    // 玩家点击出牌按钮
    onSendBtnClick: function () {
        var self = this;
        this.tenAct.active = false;
        GameNet.getInstance().request("room.niuNiuHandler.setShow",{},function(res) {
            if (res.result == 0) {
                self.adviseBtn.active = false;
                self.sendBtn.active = false;
            }
        });
    },

    /**
     *
     * @param seconds 倒计时持续时间
     * @param isRepeat 是否循环显示
     */
    startCountDown : function (seconds, isRepeat) {
        isRepeat = isRepeat || false
        if (this.countDownID) {
            this.unschedule(this.countDownID);
        }
        var self = this;
        this.remainSeconds = Math.floor(seconds);

        var showTime = function (second) {
            second = second + "";
            var ary = second.split('');
            var url1;
            var url2;
            if(ary.length == 0)
            {
                return;
            }
            if(ary.length == 1)
            {
                url1 = cc.url.raw('resources/number/jinzi0.png');
                url2 = cc.url.raw('resources/number/jinzi' + second + '.png');
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
            self.countdown_num1.spriteFrame = new cc.SpriteFrame(texture1);
            var texture2 = cc.textureCache.addImage(url2);
            self.countdown_num2.spriteFrame = new cc.SpriteFrame(texture2);
        };

        this.countDownID = this.schedule(function () {
            if (self.remainSeconds == 0 && isRepeat) {
                self.remainSeconds = seconds;
            }
            else
            {
                // 此处需要判断是否需要提醒
                if(this.remainSeconds == 3 ) //&& this.PLayerUID == GameData.player.uid)
                {
                    //soundMngr.instance.playAudioOther('countdown');
                }
                if (this.remainSeconds < 0) {
                    this.unschedule(this.countDownID);
                    return;
                }
                showTime(this.remainSeconds);
            }
            this.remainSeconds--;
        },1);
    },

    handleGameStart : function () {
        // 播放开场动画
        soundMngr.instance.playNiuNiuAudio(-1);
        var self = this;
        this.actionNode.active = true;
        var starActNode = cc.find('/actGameStart',this.actionNode);
        starActNode.active = true;


        var handCardNode = cc.find("/handCard",this.selfHandCardNode);
        for (var i = 0; i < handCardNode.childrenCount; i++) {
            handCardNode.children[i].position = this._selfHandCardInitialPos[i];
        }
        var anim = starActNode.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('newAnimation',1);
        this.scheduleOnce(function(){
            niuNiuHandler.isStartAnimationPlayed = false;
            starActNode.active = false;
            self.initUI();
        },1.5);
    },

    //监听有玩家操作
    handleRegulareCircle: function (data) {
        if (!data) return;
        var showUid = data.detail;
        for (var key in niuNiuHandler.playerSendCard) {
            if (key == showUid.uid) {
                this.onUserDisCard(key, niuNiuHandler.playerCards[key]);
            }
        }
    },

    /**
     * 显示玩家出牌
     */
    onUserDisCard: function (uid, cardInfo) {
        var index = roomHandler.getPlayerPosByUid(uid);
        var localIndex = roomHandler.getLocalPosition(index);
        if (uid == GameData.player.uid) {
            // 如果需要显示的是自己的手牌
            this.showSelfHandCards(cardInfo, 2);
        }else {
            var handCardNode = this.otherHandCardNode.getChildByName("handCard" + localIndex);
            handCardNode.active = true;
            for (var i = 0; i < handCardNode.childrenCount; i++) {
                var pokerScp = handCardNode.children[i].getComponent("niuNiuPoker");
                if (cardInfo.length === 0) {
                    pokerScp.initCardInfo(null);

                }else if(cardInfo.length > 0){
                    var card = cardInfo[i];
                    pokerScp.turnOver(true);
                    pokerScp.initCardInfo(card);
                }
            }
        }
        var playerInfo = roomHandler.getPlayerByUid(uid);
        var record = niuNiuHandler.recordType[uid];
        //播放牌型动画和 声音
        soundMngr.instance.playNiuNiuAudio(record,playerInfo.sex);
        var actNode = cc.find("actionAnimations/act" + localIndex,this.node);
        actNode.removeAllChildren();
        var pokerTypePrefab = localIndex == 0 ? this.selfPokerTypePrefab : this.otherPokerTypePrefab;
        pokerTypePrefab = cc.instantiate(pokerTypePrefab);
        actNode.addChild(pokerTypePrefab);
        pokerTypePrefab.getComponent("pokerTypeAnimation").initFanInfo(record);
    },


    clearUI: function () {
        niuNiuHandler.isSelfClickAdviseBtn = false;
        this.initNodeActive();
        for (var i = 0; i < 6; i++) {
            var pokerActNode = cc.find('/act' + i, this.actionNode);
            if (pokerActNode) {
                pokerActNode.removeAllChildren();
            }
        }
        var winNode = cc.find('win',this.actionNode);
        var loseNode = cc.find('lose',this.actionNode);
        winNode.active = false;
        loseNode.active = false;
        this.initUI();
    },
    //显示操作提示img
    showHintImg:function () {
        var gameStatus = niuNiuHandler.NIU_NIU.GAMESTATUS;
        var zhuangData = niuNiuHandler.playerZhuang;
        var chipsData = niuNiuHandler.playerChips;
        if (niuNiuHandler.status == gameStatus.ZHUANG) {
            var zhuangAct = true;
            var Url = '';
            if (zhuangData[GameData.player.uid] && zhuangData[GameData.player.uid] != -1) {
                Url = 'resources/niuNiuTable/artword/dengdaiqitaqiangzhuang.png';
            }else{
                Url = 'resources/niuNiuTable/artword/qingqiangzhuang.png';
            }
            var texture = cc.textureCache.addImage(cc.url.raw(Url));  
            this.qiangzhuangSp.spriteFrame = new cc.SpriteFrame(texture);
            this.qiangzhuangSp.node.active = zhuangAct;
            this.betSp.node.active = !zhuangAct;
            this.pinNiuSp.node.active = !zhuangAct;
        }else if (niuNiuHandler.status == gameStatus.CHIPS) {
            var xiazhuAct = true;
            var zhuangUid = niuNiuHandler.zhuangUid;
            var Url = '';
            if(zhuangUid == GameData.player.uid){
                Url = 'resources/niuNiuTable/artword/dengdaixiazhuzi.png';
            }else{
                if (chipsData[GameData.player.uid] && chipsData[GameData.player.uid] != -1) {
                    Url = 'resources/niuNiuTable/artword/dengdaiqita.png';
                }else {
                    Url = '';
                }
            }
            var texture = cc.textureCache.addImage(cc.url.raw(Url));  
            this.betSp.spriteFrame = new cc.SpriteFrame(texture);
            this.betSp.node.active = xiazhuAct;
            this.qiangzhuangSp.node.active = !xiazhuAct;
            this.pinNiuSp.node.active = !xiazhuAct;
        }else if (niuNiuHandler.status == gameStatus.COMPARE) {
            var pinniuAct = true;
            this.pinNiuSp.node.active = pinniuAct;
            this.betSp.node.active = !pinniuAct;
            this.qiangzhuangSp.node.active = !pinniuAct;
        }
    },

    // 监听小结算
    handleRunEnd: function () {
        this.moveAboutScore();
        var self = this;
        // 获取自己在游戏内的信息
        var runScore = niuNiuHandler.playerScore[GameData.player.uid];
        var str = runScore > 0 ? "胜利" : "失败";
        if(runScore > 0){
            
            this.scheduleOnce(function () {
                this.winAnim.active  = true;
                var anim = this.winAnim.getComponent(dragonBones.ArmatureDisplay);
                anim.playAnimation('newAnimation',1);
                soundMngr.instance.playNiuNiuAudio(-3,null);
            },3.5)

            this.scheduleOnce(function () {
                self.winAnim.active = false;
                self.initScore(); //初始化头像里积分
                self.clearUI();
            },7.5)
        }else if(runScore <= 0){
            
            this.scheduleOnce(function () {
                this.loseAnim.active  = true;
                var anim = this.loseAnim.getComponent(dragonBones.ArmatureDisplay);
                anim.playAnimation('newAnimation',1);
                soundMngr.instance.playNiuNiuAudio(-4,null);
            },3.5)
            
            this.scheduleOnce(function () {
                self.loseAnim.active = false;
                this.initScore(); //初始化头像里积分
                self.clearUI();
            },7.5)
        }
    }, 
    moveAboutScore: function(){
        //小结算金币移动和飘分
        var self = this;
        this.scheduleOnce(function () {
            self.scoreMask.active = true;
            var players = roomHandler.players;
            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                var playerPos = roomHandler.getLocalPosition(j);
                var runScore = niuNiuHandler.playerScore[player.uid];
                var headNode = self.scoreParent.getChildByName("score"+playerPos);
                var playerGetScore = headNode.getChildByName("resultScore");
                if (playerGetScore == null) {
                    playerGetScore = cc.instantiate(self.scoreNode);
                    playerGetScore.getComponent('resultRunScore').getScoreColor(runScore);
                    playerGetScore.active = true;
                    headNode.addChild(playerGetScore);
                }
                var move1 = cc.moveBy(1,cc.p(0,60));
                playerGetScore.runAction(move1);
            }
        },1.5);
        this.scheduleOnce(function () {
            for (var i = 0; i < self.scoreParent.children.length; i++) {
               self.scoreParent.children[i].removeAllChildren();
            }
            self.scoreMask.active = false;
        },3.5);
    },

    initScore: function () {
        var players = roomHandler.players;
        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            if (player == null) continue;

            var localIndex = roomHandler.getLocalPosition(j);
            var headNode = this.playerHeads[localIndex].getChildByName("TableNiuNiuPlayerTemplate");
            var playerHeadScp = headNode.getComponent("playerTemplate");
            var roomScore = roomHandler.scores[player.uid];
            playerHeadScp.setCoin(roomScore);
        }
    },
    handlerMsg : function () {
        registEvent('douniu-onGameStart', this, this.handleGameStart);
        registEvent('douniu-onGameInfo', this, this.getGameInfo);
        registEvent('douniu-onGameEnd',this, this.handleRunEnd);
        registEvent('douniu-onGameCards', this, this.showHandCards);
        registEvent('douniu-onShowCards', this, this.handleRegulareCircle);
    },

    onDestroy: function (){
        unregistEvent('douniu-onGameStart', this, this.handleGameStart);
        unregistEvent('douniu-onGameInfo', this, this.getGameInfo);
        unregistEvent('douniu-onGameEnd',this, this.handleRunEnd);
        unregistEvent('douniu-onGameCards', this, this.showHandCards);
        unregistEvent('douniu-onShowCards', this, this.handleRegulareCircle);
    }
});
