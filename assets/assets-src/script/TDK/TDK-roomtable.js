var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var tdk_roomData = require('tdkRoomData');
var gameDefine = require('gameDefine');
var roomTable = cc.Class({
    extends: cc.Component,
    properties: {
        operationBtns: cc.Node, //操作按钮
        pokersNode: cc.Node, //poker节点
        escapeNode: cc.Node,
        chips: [cc.Node], //筹码节点
        chipsNode: cc.Node, //存放筹码的节点
        clipSlider: cc.Slider,
        isMask: cc.Node,
        _clipNum: 0,
        allScore: cc.Label, //桌面上的总筹码分数
        _spaces: 68.1,
        playerNodes: {
            default: [],
            type: cc.Node
        },
        operationNode: cc.Node,
        pokerType: 0,
        genNum: cc.Label,
        languo: cc.Node,
        scoreNode: cc.Prefab,//飘分分数
        scoreParent: cc.Node,//飘分父节点
        winShow: cc.Node,
        continueBtn: cc.Node,
        borrowPokerPre: cc.Prefab,
    },

    onLoad: function () {
        this.dropPokersInfo = {};
        this.pokerScore = {};
        this.initUI();
        this.registListenr();
        this.isSeePoker = false;
        this.seePokerClick1 = false;
        // var myhandPokerNode = cc.find('handCard0',this.pokersNode);
        // this.playDealAnimation(myhandPokerNode,this._spaces);
        if (GameData.room.status != TDKPokerCard.STATUS.WAITING) {
            if(GameData.room.status === TDKPokerCard.STATUS.READY){
                this.initPokerNode();
                this.initBtn();
            }else{
                this.onShow();
                this.otherActionEffect();
                this.showObtainNode();
                this.showConnectDrop();
            }
            this.addChips();
            this.changeSumScore();
        }
    },

    registListenr: function () {
        var self = this;
        this.isMask.on(cc.Node.EventType.TOUCH_END, function () {
            self.closeClipSlider();
        })
        registEvent('onPlayerInitScore',this,this.basicScore);
        registEvent('onPlayerCards', this, this.onShow);
        registEvent('onActionBtn',this,this.showObtainNode);
        registEvent('onTurner',this,this.initBtn);
        registEvent('onTurnerAction',this,this.otherActionEffect);
        registEvent('onGameResult',this,this.gameResult);
        registEvent('onPrepareInfo', this, this.initUI);
        registEvent('onIncScore', this, this.addChips);
        registEvent('onDropPlayerInfo', this, this.showConnectDrop);
    },

    onDestroy: function () {
        unregistEvent('onPlayerInitScore',this,this.basicScore);
        unregistEvent('onPlayerCards', this, this.onShow);
        unregistEvent('onActionBtn',this,this.showObtainNode);
        unregistEvent('onTurner',this,this.initBtn);
        unregistEvent('onTurnerAction',this,this.otherActionEffect);
        unregistEvent('onGameResult',this,this.gameResult);
        unregistEvent('onPrepareInfo', this, this.initUI);
        unregistEvent('onIncScore', this, this.addChips);
        unregistEvent('onDropPlayerInfo', this, this.showConnectDrop);
    },

    initUI: function () {
        this.changeSumScore();
        var cantReady = 0;
        for (var i = 0; i < GameData.joiners.length; i++) {
            var userid = GameData.joiners[i].uid;
            for (var key in tdk_roomData.onRoomReadyInfo) {
                if (key == userid && tdk_roomData.onRoomReadyInfo[key] == false) {
                    cc.log('cantReady = '+cantReady);
                    cantReady ++;
                }
            }
        }
        if (cantReady == GameData.room.opts.joinermax && GameData.room.status > TDKPokerCard.STATUS.WAITING) {
            return;
        }

        this._clipNum = 0;
        this.dropPokersInfo = {};
        this.initPokerNode();
        this.initBtn();
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null) {
                var userId = GameData.joiners[j].uid;
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("pokerBg");
                var chipNum = this.playerNodes[localIdx].getChildByName("nowChipsNum");
                chipNum.active = false;
                headNode.active = false;
            }
        }
        for (var i = 0; i < this.winShow.children.length; i++) {
            this.winShow.children[i].active = false;
        }
    },
    initBtn:function(){
        for (var i = 0; i < this.operationNode.children.length; i++) {
            this.operationNode.children[i].active = false;
        } 
        this.clipSlider.node.active = false;
    },
    initPokerNode: function () {
        for (var key in this.pokersNode.children) {
            this.hideNodeChild(this.pokersNode.children[key]);
        }
        for (var key in this.escapeNode.children) {
            this.escapeNode.children[key].active = false;
        }
    },

    hideNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
    },

    onShow: function () {
        this.showPokers();
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null) {
                var userId = GameData.joiners[j].uid;
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                var chipNum = this.playerNodes[localIdx].getChildByName("nowChipsNum");
                chipNum.active = true;
            }
        }
    },

    showPokers: function () {
        this.pokerScore = {};
        this.revealPoker = 0;
        this.darkPoker = 0;
        for (var i = 0; i < GameData.joiners.length; i++) {
            var userId = GameData.joiners[i].uid;
            for (var key in tdk_roomData.pokers) {
                if (tdk_roomData.pokers[userId]) {
                    if (this.dropPokersInfo[userId]) {
                        var isDrop = this.dropPokersInfo[userId];
                        if (isDrop === true) { }
                        else{
                            this.delayShowPoker(i);
                        }
                    }else{
                        this.delayShowPoker(i);
                    }
                }
            }
        }
        var self = this;
        var joinLen = GameData.joiners.length*150;
        setTimeout(function(){
            self.showPokerScore(false);
        },joinLen);
    },
    delayShowPoker: function(index){
        var j = index;
        var self = this;
        setTimeout(function(){
            var uid = GameData.joiners[j].uid;
            var handPoker = tdk_roomData.getHandPokerByUid(uid);
            var scoreSum = TDKPokerCard.calcScore(handPoker);
            if (!self.pokerScore[uid]) {
                self.pokerScore[uid] = scoreSum;
            }
            soundMngr.instance.playTDKOther('fapai');
　　　　    var localIdx = tdk_roomData.getLocalPosition(j);
            if (GameData.joiners[j].uid === GameData.player.uid) {
                self.showMyHandPokers(handPoker, self.pokersNode.children[localIdx]);
            } else {
                self.showOtherHandPokers(handPoker, self.pokersNode.children[localIdx]);
            }
        },index*150);
    },
    showMyHandPokers: function (poker, parent) {
        var showArray = [];
        var darkArray = [];
        for (var i = 0; i < poker.length; i++) {
            parent.children[i].active = true;
            if (i < 2) {
                darkArray.push(poker[i]);
                this.showPokerContent(parent.children[i], '0');
            } else {
                showArray.push(poker[i]);
                this.showPokerContent(parent.children[i], poker[i]);
            }
        }
        this.darkPoker = TDKPokerCard.calcScore(darkArray);
        this.revealPoker = TDKPokerCard.calcScore(showArray);
        //播放自己发牌动画
        // var myhandPokerNode = cc.find('handCard0',this.pokersNode);
        // this.playDealAnimation(myhandPokerNode,this._spaces);

    },

    showOtherHandPokers: function (poker, parent) {
        for (var i = 0; i < poker.length; i++) {
            parent.children[i].active = true;
            this.showPokerContent(parent.children[i], poker[i]);
        }
        //播放其他玩家发牌动画
        // for(let j = 0;j<this.pokersNode.childrenCount;j++){
        //     if(j != 0){
        //        this.playDealAnimation(this.pokersNode.children[j],this._spaces); 
        //     }
        // }
    },
    //继续
    continueClick: function(){
        for (var i = 0; i < this.scoreParent.children.length; i++) {
           this.scoreParent.children[i].removeAllChildren();
        }
        this.unscheduleAllCallbacks();
        this.changeSumScore();
        this.continueBtn.active = false;
        if (!tdk_roomData.close) {
            var resultData = tdk_roomData.gameResult;
            var winner = resultData.winner;
            if ((winner && winner > 0) || tdk_roomData.connectWin > 0) {
                this.initUI();
                this.chipsNode.removeAllChildren();
            } 
            GameNet.getInstance().request('room.roomHandler.ready', {}, function (rtn) {
            });
        }else{
            this.node.getComponent('TDK-roomMain').showSummaryLayer();
        } 
    },
    //显示当前玩家操作按钮控件
    showObtainNode: function () {
        cc.log('111');
        if (tdk_roomData.actionBtn === null || Object.keys(tdk_roomData.actionBtn).length <= 0) return;
        var actionData = tdk_roomData.actionBtn;
        var action = actionData.action;
        var score = actionData.score;
        if (tdk_roomData.addpokersRight === true) {
            var self = this;
            var joinLen = GameData.joiners.length*150;
            setTimeout(function(){
                for (var j = 0; j < action.length; j++) {
                    self.operationNode.getChildByName('operationBtn'+action[j]).active = true;
                    if (action[j] === 4) {
                        self.genNum.string = score;
                    }
                }
            },joinLen);
            tdk_roomData.addpokersRight = false;
        }else{
            for (var j = 0; j < action.length; j++) {
                this.operationNode.getChildByName('operationBtn'+action[j]).active = true;
                if (action[j] === 4) {
                    this.genNum.string = score;
                }
            }
        }
        tdk_roomData.actionBtn = {};
    },
    //显示自己的手牌
    seePokerClick: function () {
        cc.log('seePokerClick');
        this.isSeePoker = !this.isSeePoker;
        var myPokerNode = cc.find('handCard0', this.pokersNode);
        var changePokerNum = 2;
        var myPoker = tdk_roomData.getHandPokerByUid(GameData.player.uid);
        for (var i = 0; i < changePokerNum; i++) {
            if (this.isSeePoker) {
                this.showPokerContent(myPokerNode.children[i], myPoker[i]);
                this.showPokerScore(true);
            } else {
                this.showPokerContent(myPokerNode.children[i], '0');
                this.showPokerScore(false);
            }
        }
    },

    showPokerContent: function (cardNode, pokerId) {
        var pokerNum = 0;
        pokerNum = pokerId > 1000 ? (pokerId - 1000) : pokerId;
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/TDK/UI/poker/poker_' + pokerNum + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        this.showBorrowPoker(cardNode,pokerId);
    },
    showBorrowPoker: function(pokerNode, pokerId){
        var show = false;
        if (pokerId > 1000) {
            show = true;
        }

        var borrowNode = pokerNode.getChildByName(pokerNode.name + '_borrow');
        if (borrowNode == null) {
            if (show == true) {
                borrowNode = cc.instantiate(this.borrowPokerPre);
                cc.find('borrow', borrowNode).active = true;
                pokerNode.addChild(borrowNode);
                borrowNode.name = pokerNode.name + '_borrow';
            }
        } else {
            borrowNode.active = show;
        }
    },

    showConnectDrop:function(){
        var dropInfo = tdk_roomData.DropPlayerInfo;
        var self = this;
        var index = GameData.joiners.length;
        setTimeout(function(){
            for (var i = 0; i < GameData.joiners.length; i++) {
                var userId = GameData.joiners[i].uid;
                var localIdx = tdk_roomData.getLocalPosition(i);
                var parent = self.pokersNode.children[localIdx];
                for (var key in dropInfo) {
                    if (dropInfo[userId]) {
                        if (!self.dropPokersInfo[userId]) {
                            self.dropPokersInfo[userId] = true;
                        }else{
                            self.dropPokersInfo[userId] = true;
                        }
                        cc.log('dropInfo[userId] = '+dropInfo[userId]);
                        cc.log('tdk_roomData.pokers[userId] = '+JSON.stringify(tdk_roomData.pokers[userId]));
                        var pokerDrop = tdk_roomData.pokers[userId];
                        for (var len = 0; len < pokerDrop.length; len++) {
                            cc.log('len = '+len);
                            parent.children[len].active = true;
                            self.showPokerContent(parent.children[len], '0');
                        }
                        self.escapeNode.children[localIdx].active = true;
                    }
                }
            }
        },index*150);
    },
    //扣牌动画
    escapePoker: function(escapeUid){
        for (var i = 0; i < GameData.joiners.length; i++) {
            var uid = GameData.joiners[i].uid;
            var handPoker = tdk_roomData.getHandPokerByUid(uid);
            var localIdx = tdk_roomData.getLocalPosition(i);
            if (GameData.joiners[i].uid === escapeUid) {
                if (!this.dropPokersInfo[uid]) {
                    this.dropPokersInfo[uid] = true;
                }else{
                    this.dropPokersInfo[uid] = true;
                }
                for (var i = 0; i < handPoker.length; i++) {
                    this.showPokerContent(this.pokersNode.children[localIdx].children[i], '0');
                    this.escapeNode.children[localIdx].active = true;
                }
                return;
            }
        }
    },
    //扣牌
    escapeClick: function () {
        //此处需要添加请求
        var self = this;
        NiuNiuMessageBox('您确认要扣牌吗？', function () {
            TDKHandler.getInstance().requestDrop();
            self.turnerActionEffect(2, null, GameData.player.uid);
        }, function () {});
    },

    //不踢
    PassClick: function () {
        this.turnerActionEffect(6, null, GameData.player.uid);
        TDKHandler.getInstance().requestPass();
    },

    //all in 全押
    allInClick: function () {
        this.turnerActionEffect(8, tdk_roomData.allInscore, GameData.player.uid);
        TDKHandler.getInstance().requestAllInc();
    },

    //跟注
    followClick: function(){
        this.turnerActionEffect(4, tdk_roomData.maxScore, GameData.player.uid);
        TDKHandler.getInstance().requestFollowBet();
    },

    //押注
    showClipSlider: function (eve,data) {
        this.pokerType = parseInt(data);
        this.initClipViewLen();
        this.clipSlider.node.active = true;
    },
    initClipViewLen: function(){
        var sumScore = tdk_roomData.maxScore;
        this.clipSlider.progress = 1;
        var nowclick = Math.ceil(this.clipSlider.progress*sumScore);
        var handle = this.clipSlider.node.getChildByName('Handle');
        var clipLable = this.clipSlider.node.getChildByName('clipNum');
        clipLable.getComponent(cc.Label).string = nowclick;
        var back = this.clipSlider.node.getChildByName('beijing');
        back.height = 173.5 + handle.y;
        this._clipNum = nowclick;
    },
    onSliderHEvent:function (sender, eventType) {
        var nowclick = Math.ceil(sender.progress*tdk_roomData.maxScore);
        if (nowclick === 0) {
            nowclick = 1;
        }
        var handle = this.clipSlider.node.getChildByName('Handle');
        var clipLable = this.clipSlider.node.getChildByName('clipNum');
        clipLable.getComponent(cc.Label).string = nowclick;
        var back = this.clipSlider.node.getChildByName('beijing');
        back.height = 173.5 + handle.y;
        this._clipNum = nowclick;
    },

    //初始底分
    basicScore: function(){
        for (var i = 0; i < tdk_roomData.initScore.length; i++) {
            var score = tdk_roomData.initScore[i].score;
            this.clipClick(score, tdk_roomData.initScore[i].uid);
        }
    },

    addChips: function(){
        cc.log('tdk_roomData.incPokerData = '+JSON.stringify(tdk_roomData.incPokerData));
        this.chipsNode.removeAllChildren();
        if (Object.keys(tdk_roomData.incPokerData).length <= 0) return;
        var chipsData = tdk_roomData.incPokerData;
        for (var key in chipsData) {
            var chipsArr = chipsData[key];
            for (var i = 0; i < chipsArr.length; i++) {
                this.clipClick(chipsArr[i], key);
            }
        }
    },
    //压筹码
    clipClick: function (data, turnerUid) {
        var score = data;
        var clip1Num = 0;
        var clip2Num = 0;
        var clip5Num = 0;
        var clip10Num = 0;
        var scoreArry = [clip10Num, clip5Num, clip2Num, clip1Num];
        for (var i = 0; i < scoreArry.length; i++) {
            scoreArry[i] = this.spliceScore(score)[i];
        }
        for (var i = 0; i < scoreArry.length; i++) {
            for (var j = 0; j < scoreArry[i]; j++) {
                for (var index = 0; index < GameData.joiners.length; index++) {
                    var localIdx = tdk_roomData.getLocalPosition(index);
                    if (GameData.joiners[index].uid === turnerUid) {
                        var handenode = this.pokersNode.children[localIdx];
                        this.chips[i].x = handenode.x;
                        this.chips[i].y = handenode.y;
                    }
                }
                var clipNode = cc.instantiate(this.chips[i]);
                clipNode.parent = this.chipsNode;
                clipNode.x = this.chips[i].x;
                clipNode.y = this.chips[i].y;
                clipNode.active = true;
                this.clipFlyToTableAnimation(clipNode);
            }
        }
        cc.log('筹码数量：' + this.chipsNode.childrenCount);
        //this.allScore.string = ;
    },
    //筹码移动动画
    clipFlyToTableAnimation: function (node) {
        var x = this.randomNum(0, 400) - 200;
        var y = this.randomNum(0, 100)-100;
        //cc.log('x，y：'+x,y);
        var action1 = cc.moveTo(0.3, cc.p(x, y));
        // var action2 = cc.scaleTo(0.5, 0.25);
        var action3 = cc.callFunc(function () {
            node.removeFromParent(true);
            //node.active = false;
        }, node);
        var action4 = cc.fadeOut(0.1);
        // var spawn = cc.spawn(action1);
        soundMngr.instance.playTDKOther('xiaguo');
        if (this.chipsNode.childrenCount > 80) {
            node.runAction(cc.sequence(action1, action4, action3)).easing(cc.easeCubicActionOut());
        } else {
            node.runAction(action1).easing(cc.easeCubicActionOut());
        }
    },

    spliceScore: function (score) {
        //筹码分值
        var clip1 = 1;
        var clip2 = 2;
        var clip5 = 5;
        var clip10 = 10;
        var arry = [];
        var coinArry = [clip10, clip5, clip2, clip1];
        for (var i = 0; i < coinArry.length; i++) {
            var num = Math.floor(score / coinArry[i]);
            arry.push(num);
            score -= Math.floor(score / coinArry[i]) * coinArry[i];
        }
        //cc.log('arry:'+arry);
        return arry;
    },

    randomNum: function (min, max) {
        var distance = max - min;
        var num = Math.random() * distance + min;
        return parseInt(num, 10);
    },

    clipSliderOKClick: function () {
        this.closeClipSlider();
        this.turnerActionEffect(this.pokerType, this._clipNum, GameData.player.uid);
        TDKHandler.getInstance().requestIncBet(this._clipNum);
    },

    closeClipSlider: function () {
        this.clipSlider.node.active = false;
    },

    playOnePokerAnimation: function (node, space) {
        var deafultX = node.x;
        node.x += space;
        node.active = true;
        var action1 = cc.moveTo(0.2, cc.p(deafultX, node.y));
        var action2 = cc.delayTime(2);
        var action3 = cc.callFunc(function () {
            node.active = false;
        }, node);
        node.runAction(cc.sequence(action1, action2, action3));
    },

    testAnimation: function () {
        for (var key in this.pokersNode.children) {
            var node = cc.find('poker3', this.pokersNode.children[key]);
            if (this.seePokerClick1) {
                node = cc.find('poker4', this.pokersNode.children[key]);
            }
            this.playOnePokerAnimation(node, this._spaces);
        }
        this.seePokerClick1 = !this.seePokerClick1;
    },
    
    otherActionEffect:function(){
        if (tdk_roomData.turnerAction === null ||Object.keys(tdk_roomData.turnerAction).length <= 0) return;
        var uid = tdk_roomData.turnerAction.uid;
        var playerSex = tdk_roomData.getPlayerSexByUid(uid);
        var score = tdk_roomData.turnerAction.score;
        var action = tdk_roomData.turnerAction.action;
        this.turnerActionEffect(action, score, uid);
        tdk_roomData.turnerAction = {};
    },
    turnerActionEffect: function(action, score, uid){
        var playerSex = tdk_roomData.getPlayerSexByUid(uid);
        soundMngr.instance.playTDKAudio(action, playerSex);
        this.showActionType(uid, action);
        if (action === 2){
            this.escapePoker(uid);
        }else if(action === 6){
            cc.log('buti');
        }else{
            this.clipClick(score, uid);
        }
        this.initBtn();
    },

    //显示操作步骤
    showActionType: function(turnerId, action){
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null && GameData.joiners[j].uid === turnerId) {
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("actionType");
                for (var i = 0; i < headNode.children.length; i++) {
                    var index = i + 2;
                    if (index === action) {
                        headNode.getChildByName('action'+index).active = true;
                    }else{
                        headNode.getChildByName('action'+index).active = false;
                    }
                }
                this.scheduleOnce(function () {
                    for (var i = 0; i < headNode.children.length; i++) {
                        var index = i + 2;
                        headNode.getChildByName('action'+index).active = false;
                    }
                },1);
            }
        }
    },
    showPokerScore: function(isSee){
        var self = this;
        var GetScoreMaxUid = function() {
            var maxScore = [];
            for (var key in self.pokerScore) {
                if (parseInt(key) === GameData.player.uid) {
                    var score = self.revealPoker;
                    maxScore.push(score);
                }else{
                    maxScore.push(self.pokerScore[key]);
                }
            }
            var index = 0;
            for (var i = 1; i < maxScore.length; i++) {
                if (maxScore[i] && maxScore[i] > maxScore[index]) {
                    index = i;
                }
            }
            return maxScore[index];
        }
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null) {
                var userId = GameData.joiners[j].uid;
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("pokerBg");
                var pokerLb = headNode.getChildByName('pokerScore');
                headNode.active = true;
                var define;
                if (this.pokerScore[userId]) {
                    if (userId === GameData.player.uid) {
                        if (isSee) {
                            define = this.darkPoker;
                            pokerLb.getComponent(cc.Label).string = this.pokerScore[userId] + '('+define+')';
                        }else{
                            define = this.revealPoker - GetScoreMaxUid();
                            pokerLb.getComponent(cc.Label).string = this.revealPoker + '('+define+')';
                        } 
                    }else{
                        define = this.pokerScore[userId] - GetScoreMaxUid();
                        pokerLb.getComponent(cc.Label).string = this.pokerScore[userId]+'('+define+')';
                    }
                }
            }
        }
    },
    //结果
    gameResult: function(){
        this.initBtn();
        if (tdk_roomData.gameResult === null || Object.keys(tdk_roomData.gameResult).length <= 0) return;
        var resultData = tdk_roomData.gameResult;
        var winner = resultData.winner;
        var posX,posY;
        //开牌
        if (resultData.cards) {
            var mingCards = resultData.cards;
            this.resultMingPokerScore(mingCards);
        }

        if (winner === 0) {
            //烂锅
            this.languo.active = true;
            var armDisp = this.languo.getComponent(dragonBones.ArmatureDisplay);
            armDisp.playAnimation('newAnimation',1);
            this.scheduleOnce(function(){
                this.initUI();  
            },3);  
            return;
        }else{
            var self = this;
            //胜利动画
            this.scheduleOnce(function(){
                for (var j = 0; j < GameData.joiners.length; j++) {
                    if (GameData.joiners[j] != null && GameData.joiners[j].uid === winner) {
                        var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                        var headPos = self.playerNodes[localIdx].position;
                        posX = headPos.x;
                        posY = headPos.y;
                        self.winShow.children[localIdx].active = true;
                        var armDisp = self.winShow.children[localIdx].getComponent(dragonBones.ArmatureDisplay);
                        armDisp.playAnimation('newAnimation',1);
                    }
                }
                if (winner === GameData.player.uid) {
                    soundMngr.instance.playTDKOther('win');
                }else{
                    soundMngr.instance.playTDKOther('lost');
                }
            },1);  
            // //飘分、飞筹码
            this.scheduleOnce(function(){
                for (var i = 0; i < self.chipsNode.children.length; i++) {
                    var childNode = self.chipsNode.children[i];
                    var flyPos = {};
                    cc.log('posX = '+posX+',posY = '+posY);
                    flyPos.x = posX+(this.randomNum(0, 180) - 90);
                    flyPos.y = posY+(this.randomNum(0, 90) - 45);
                    self.resultChipsAnimation(childNode, flyPos);
                }
                self.moveAboutScore(resultData.winner);
            },3);  
            return;
        }
    },
    moveAboutScore: function(winner){
        //小结算金币移动和飘分
        var preScore = tdk_roomData.presentScore;
        var self = this;
        this.scheduleOnce(function () {
            // self.scoreMask.active = true;
            for (var j = 0; j < GameData.joiners.length; j++) {
                var userId = GameData.joiners[j].uid;
                var localIdx = tdk_roomData.getLocalPosition(j);
                var headNode = self.scoreParent.getChildByName("score"+localIdx);
                var playerGetScore = headNode.getChildByName("resultScore");
                if (playerGetScore == null) {
                    playerGetScore = cc.instantiate(self.scoreNode);
                    if (winner === userId) {
                        var winscore = 0;
                        for (var key in preScore) {
                            if (key != winner){
                                winscore += preScore[key];
                            }
                        }
                        playerGetScore.getComponent('tdk-resultFlyScore').getScoreColor(winscore);
                    }else{
                        playerGetScore.getComponent('tdk-resultFlyScore').getScoreColor(0-preScore[userId]);
                    }
                    playerGetScore.active = true;
                    headNode.addChild(playerGetScore);
                }
                var move1 = cc.moveBy(0.75,cc.p(0,60));
                playerGetScore.runAction(move1);
            }
        },0.5);
        this.scheduleOnce(function () {
            for (var i = 0; i < self.scoreParent.children.length; i++) {
               self.scoreParent.children[i].removeAllChildren();
            }
            self.changeSumScore();
            // self.scoreMask.active = false;
        },1.5);
    },
    resultChipsAnimation: function (node, position) {
        soundMngr.instance.playTDKOther('chouma');
        var action1 = cc.moveTo(0.4,position);
        var action2 = cc.callFunc(function () {
            node.active = false;
            node.destroy();
        }, node);
        node.runAction(cc.sequence(action1, action2));
    },
    changeSumScore: function(){
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null) {
                var userId = GameData.joiners[j].uid;
                var userInfo = tdk_roomData.getPlayerInfoByUid(userId); // 房间内玩家的信息
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                //var localIdx = j;
                var headNode = this.playerNodes[localIdx].getChildByName("TableTDKPlayerTemplate");
                var playerHeadScp = headNode.getComponent("TDK-playerTemplate");
                var scoreData;
                var eveScore = 0;
                if (GameData.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
                    eveScore = GameData.joiners[j].coin;
                }else if (GameData.room.opts.currencyType == gameDefine.currencyType.Currency_Card) {
                    scoreData = RoomHandler.scores;
                    if (scoreData[userId]) {
                        eveScore = scoreData[userId];
                    }
                }
                cc.log('eveScore = '+eveScore);
                playerHeadScp.setCoin(eveScore);
            }
        }
    },
    //小结算牌型分数显示
    resultMingPokerScore: function(mingCards){
        for (var i = 0; i < GameData.joiners.length; i++) {
            var userId = GameData.joiners[i].uid;
            for (var key in mingCards) {
                if (mingCards[userId]) {
                    var scoreSum = TDKPokerCard.calcScore(mingCards[userId]);
                    if (!this.pokerScore[userId]) {
                        this.pokerScore[userId] = [];
                    }
                    this.pokerScore[userId] = scoreSum;
                    var localIdx = tdk_roomData.getLocalPosition(i);
                    this.showResultHandPokers(mingCards[userId], this.pokersNode.children[localIdx]);
                }
            }
            var posIndex = tdk_roomData.getLocalPosition(i);
            var headNode = this.playerNodes[posIndex].getChildByName("pokerBg");
            var pokerLb = headNode.getChildByName('pokerScore');
            headNode.active = true;
            if (this.pokerScore[userId]) {
                var define = this.darkPoker;
                pokerLb.getComponent(cc.Label).string = this.pokerScore[userId] + '('+define+')';
            }
        }
    },
    showResultHandPokers: function(pokers, parent){
        var showArray = [];
        var darkArray = [];
        for (var i = 0; i < pokers.length; i++) {
            parent.children[i].active = true;
            if (i < 2) {
                darkArray.push(pokers[i]);
                this.showPokerContent(parent.children[i], pokers[i]);
            } else {
                showArray.push(pokers[i]);
                this.showPokerContent(parent.children[i], pokers[i]);
            }
        }
        this.darkPoker = TDKPokerCard.calcScore(darkArray);
        this.revealPoker = TDKPokerCard.calcScore(showArray);
    },
});