cc.Class({
    extends: cc.Component,

    properties: {
        //回放控制按钮
        stopBtn: cc.Button,
        playBtn: cc.Button,
        exitBtn: cc.Button,
        quick_btn: cc.Button,
        overBtn: cc.Button,

        //players
        playerNodes: {
            default: [],
            type: cc.Node
        },
        continueBtn: cc.Node,

        //cards
        playCardsNode: cc.Node, 
        escapeNode: cc.Node,
        winnerNode: cc.Node,
        borrowPokerPre: cc.Prefab,
        //result
        languo: cc.Node,
        scoreNode: cc.Prefab,//飘分分数
        scoreParent: cc.Node,//飘分父节点

        chips: [cc.Node], //筹码节点
        chipsNode: cc.Node, //存放筹码的节点

        //run
        _actionIndex: -1,
        runSum: cc.Label,
        roomNode: cc.Node,
    },
    onLoad: function () {
        this.stopBtn.node.active = false;
        this.playBtn.node.active = true;
        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('ddz-onGameStart', this, this.showTableLayer);
        registEvent('tjddz-onGameStart', this, this.showTableLayer);
    },

    onEnable: function () {
        cc.director.getScheduler().setTimeScale(1);
        this.initPlayers();
        this.initStopPanel();
        this.schedule(this.runAction, 1);
        this.showRoomRule();
    },
    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        unregistEvent('ddz-onGameStart', this, this.showTableLayer);
        unregistEvent('tjddz-onGameStart', this, this.showTableLayer);
    },
    showTableLayer: function () {
        if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
            cc.director.loadScene('table');
        } else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_DDZ) {
            cc.director.loadScene('table-DDZ');
        }else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ) {
            cc.director.loadScene('table-TJDDZ');
        }
    },
    initStopPanel: function () {
        var self = this;
        this.stopBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.getScheduler().setTimeScale(1);
            self.stopBtn.node.active = false;
            self.playBtn.node.active = true;
        });
        this.playBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.getScheduler().setTimeScale(0);
            self.stopBtn.node.active = true;
            self.playBtn.node.active = false;
        });
        this.exitBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ReplayDataCenter.openRoundPanel = true;
            cc.director.getScheduler().setTimeScale(1);
            cc.director.loadScene('home');
        });
        this.quick_btn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.getScheduler().setTimeScale(2);
            self.stopBtn.node.active = false;
            self.playBtn.node.active = true;
        });
        this.overBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.overBtnClick();
        });
    },

    overBtnClick: function () {
        this.unschedule(this.runAction);
        ReplayDataCenter.openRoundPanel = true;
        cc.director.loadScene('home');
    },

    //初始化
    initPlayers: function () {
        this.headers = [];
        this.continueBtn.active = false;
        for (var i = 0; i < this.playerNodes.length; i++) {
            this.playerNodes[i].active = false;
        }
        for (var j = 0; j < ReplayData.players.length; j++) {
            if (ReplayData.players[j] != null) {
                var userId = ReplayData.players[j].uid;
                var userInfo = this.getPlayerInfoByUid(userId); // 房间内玩家的信息
                var localIdx = this.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("TableTDKPlayerTemplate");
                headNode.parent.active = true;
                var playerHeadScp = headNode.getComponent("TDK-playerTemplate");
                playerHeadScp.setPlayer(userInfo);
                playerHeadScp.setHeadIcon(userInfo.headimgurl);
                playerHeadScp.setName(userInfo.name);
                this.headers.push(headNode);
            }
        }
        this.initPokerNode();
    },
    initPokerNode: function () {
        //poker
        for (var key in this.playCardsNode.children) {
            this.hideNodeChild(this.playCardsNode.children[key]);
        }
        //扣牌标记
        for (var key in this.escapeNode.children) {
            this.escapeNode.children[key].active = false;
        }
        //胜利动画
        for (var key in this.escapeNode.children) {
            this.winnerNode.children[key].active = false;
        }

        for (var i = 0; i < ReplayData.players.length; i++) {
            var localIdex = this.getLocalPosition(i); //userInfo.inIndex
            var headNode = this.playerNodes[localIdex].getChildByName("pokerBg");
            var chipNum = this.playerNodes[localIdex].getChildByName("nowChipsNum");
            chipNum.getChildByName('Num').getComponent(cc.Label).string = '0';
            chipNum.active = false;
            headNode.active = false;
        }
    },
    hideNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
    },
    showRoomRule: function () {
        var roomNum = cc.find('roomNum',this.roomNode);
        roomNum.getComponent(cc.Label).string = ReplayData.room;

        var opts = ReplayData.opts;
        var lastRoundNum = cc.find('roundBg/txt',this.roomNode);
        lastRoundNum.getComponent(cc.Label).string = '局数:' + opts.roundMax;

        var quanYa = cc.find('quanya/txt',this.roomNode);
        quanYa.getComponent(cc.Label).string = '全压:'+opts.allin;
    },
    //run
    runAction: function () {
        this.runNextAction();
    },
    runNextAction: function () {
        this._actionIndex++;
        if (this._actionIndex < ReplayData.game.length) {
            var actionNum = this._actionIndex+1;
            this.runSum.getComponent(cc.Label).string = '进度: ' + actionNum + '/' + (ReplayData.game.length);
            var replayAction = ReplayData.game[this._actionIndex];
            if (replayAction.type) {
                switch(replayAction.type){
                    case 'sendCards':
                        this.showPokers(replayAction.data);
                        this.showPokerScore();
                    break;
                    case 'initIncScore':
                        this.basicScore(replayAction.data);
                    break;
                    case 'result':
                        cc.log('game over');
                        this.getResultScore(replayAction.data);
                        this.gameResult(replayAction.data);
                    break;
                    default:
                        cc.log('data error');
                    break;
                }
            } else if (replayAction.action) {
                var actionUid = replayAction.uid;
                var actionType = replayAction.action;
                var chipScore = replayAction.score;
                this.turnerActionEffect(actionType, chipScore, actionUid);
                this.getEveryOneScore(actionUid, chipScore);
            }
        }
    },
    //显示牌型
    showPokers: function (cardParent) {
        this.pokerScore = {};
        this.darkPoker = {};
        for (var i = 0; i < ReplayData.players.length; i++) {
            var userId = ReplayData.players[i].uid;
            for (var key in cardParent) {
                if (cardParent[userId]) {
                    var handPokers = cardParent[userId];
                    var scoreSum = TDKPokerCard.calcScore(handPokers);
                    if (!this.pokerScore[userId]) {
                        this.pokerScore[userId] = scoreSum;
                    }
                    var localindex = this.getLocalPosition(i);
                    this.showHandPokers(handPokers, this.playCardsNode.children[localindex], userId);
                    var chipNum = this.playerNodes[localindex].getChildByName("nowChipsNum");
                    chipNum.active = true;
                }
            }
        }
    },
    showHandPokers: function (poker, parent, Uid) {
        var darkArray = [];
        for (var i = 0; i < poker.length; i++) {
            if (i < 2) {
                darkArray.push(poker[i]);
            }
            parent.children[i].active = true;
            this.showPokerContent(parent.children[i], poker[i]);
        }
        var darkNum = TDKPokerCard.calcScore(darkArray);
        if (!this.darkPoker[Uid]) {
            this.darkPoker[Uid] = darkNum;
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
    showBorrowPoker: function (pokerNode, pokerId) {
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
    //筹码分值
    getEveryOneScore: function (Uid, score) {
        for (var j = 0; j < ReplayData.players.length; j++) {
            if (ReplayData.players[j] != null && ReplayData.players[j].uid === Uid) {
                var localIdx = this.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("nowChipsNum");
                var haveScore = headNode.getChildByName('Num').getComponent(cc.Label).string;
                var scoreToNum = parseInt(haveScore)+score;
                cc.log('scoreToNum = '+scoreToNum);
                headNode.getChildByName('Num').getComponent(cc.Label).string = scoreToNum;
            }   
        }
    },
    showPokerScore: function(){
        for (var j = 0; j < ReplayData.players.length; j++) {
            if (ReplayData.players[j] != null) {
                var userId = ReplayData.players[j].uid;
                var localIdx = this.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("pokerBg");
                var pokerLb = headNode.getChildByName('pokerScore');
                headNode.active = true;
                var define;
                if (this.pokerScore[userId] && this.darkPoker[userId]) {
                    define = this.darkPoker[userId];
                    pokerLb.getComponent(cc.Label).string = this.pokerScore[userId] + '('+define+')';
                }
            }
        }
    },
    //初始底分
    basicScore: function (bscScore) {
        for (var i = 0; i < bscScore.length; i++) {
            var score = bscScore[i].score;
            this.clipClick(score, bscScore[i].uid);
            this.getEveryOneScore(bscScore[i].uid, score);
        }
    },
    //游戏过程操作
    turnerActionEffect: function (action, score, uid) {
        this.showActionType(uid, action);
        if (action === 2){
            this.escapePoker(uid);
        }else if(action === 6){
            cc.log('buti');
        }else{
            this.clipClick(score, uid);
        }
    },
    showActionType: function (turnerId, action) {
        //显示操作步骤
        for (var j = 0; j < ReplayData.players.length; j++) {
            if (ReplayData.players[j] != null && ReplayData.players[j].uid === turnerId) {
                var localIdx = this.getLocalPosition(j); //userInfo.inIndex
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
    escapePoker: function (escapeUid) {
        //扣牌动画
        for (var i = 0; i < ReplayData.players.length; i++) {
            var uid = ReplayData.players[i].uid;
            var localIdx = this.getLocalPosition(i);
            if (ReplayData.players[i].uid === escapeUid) {
                this.escapeNode.children[localIdx].active = true;
                return;
            }
        }
    },
    //结果
    gameResult: function (result) {
        if (result === null || Object.keys(result).length <= 0) return;
        var winner = result.winner;
        var posX,posY;
        if (winner === 0) {
            //烂锅
            this.languo.active = true;
            var armDisp = this.languo.getComponent(dragonBones.ArmatureDisplay);
            armDisp.playAnimation('newAnimation',1);
            this.continueBtn.active = true;
            return;
        }else{
            var self = this;
            //胜利动画
            this.scheduleOnce(function(){
                for (var j = 0; j < ReplayData.players.length; j++) {
                    if (ReplayData.players[j] != null && ReplayData.players[j].uid === winner) {
                        var localIdx = this.getLocalPosition(j); //userInfo.inIndex
                        var headPos = self.playerNodes[localIdx].position;
                        posX = headPos.x;
                        posY = headPos.y;
                        self.winnerNode.children[localIdx].active = true;
                        var armDisp = self.winnerNode.children[localIdx].getComponent(dragonBones.ArmatureDisplay);
                        armDisp.playAnimation('newAnimation',1);
                    }
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
                self.moveAboutScore(winner);
                self.continueBtn.active = true;
            },3);  
            return;
        }
    },
    resultChipsAnimation: function (node, position) {
        var action1 = cc.moveTo(0.4,position);
        var action2 = cc.callFunc(function () {
            node.active = false;
            node.destroy();
        }, node);
        node.runAction(cc.sequence(action1, action2));
    },
    moveAboutScore: function(winner){
        //小结算金币移动和飘分
        cc.log('this.preScore = '+JSON.stringify(this.preScore));
        var self = this;
        this.scheduleOnce(function () {
            // self.scoreMask.active = true;
            for (var j = 0; j < ReplayData.players.length; j++) {
                var userId = ReplayData.players[j].uid;
                var localIdx = self.getLocalPosition(j);
                var headNode = self.scoreParent.getChildByName("score"+localIdx);
                var playerGetScore = headNode.getChildByName("resultScore");
                if (playerGetScore == null) {
                    playerGetScore = cc.instantiate(self.scoreNode);
                    if (winner === userId) {
                        var winscore = 0;
                        for (var key in self.preScore) {
                            if (key != winner){
                                winscore += self.preScore[key];
                            }
                        }
                        playerGetScore.getComponent('tdk-resultFlyScore').getScoreColor(winscore);
                    }else{
                        playerGetScore.getComponent('tdk-resultFlyScore').getScoreColor(0-self.preScore[userId]);
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
    changeSumScore: function(){
        for (var j = 0; j < ReplayData.players.length; j++) {
            if (ReplayData.players[j] != null) {
                var userId = ReplayData.players[j].uid;
                var userInfo = this.getPlayerInfoByUid(userId); // 房间内玩家的信息
                var localIdx = this.getLocalPosition(j); //userInfo.inIndex
                //var localIdx = j;
                var headNode = this.playerNodes[localIdx].getChildByName("TableTDKPlayerTemplate");
                var playerHeadScp = headNode.getComponent("TDK-playerTemplate");
                playerHeadScp.setCoin(ReplayData.scores[userId]);
            }
        }
    },
    getResultScore: function (data) {
        var resultscore = data.result;
        this.preScore = {};
        for (var key in resultscore) {
            var turnerScore = arraySum(resultscore[key]);
            if (!this.preScore[key]) {
                this.preScore[key] = turnerScore;
            }else{
                this.preScore[key] = turnerScore;
            }
        }
    },
    //筹码移动模块
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
                for (var index = 0; index < ReplayData.players.length; index++) {
                    var localIdx = this.getLocalPosition(index);
                    if (ReplayData.players[index].uid === turnerUid) {
                        var handenode = this.playCardsNode.children[localIdx];
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
    clipFlyToTableAnimation: function (node) {
        //筹码移动动画
        var x = this.randomNum(0, 400) - 200;
        var y = this.randomNum(0, 100)-100;
        var action1 = cc.moveTo(0.3, cc.p(x, y));
        var action3 = cc.callFunc(function () {
            node.removeFromParent(true);
        }, node);
        var action4 = cc.fadeOut(0.1);
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
        return arry;
    },
    randomNum: function (min, max) {
        var distance = max - min;
        var num = Math.random() * distance + min;
        return parseInt(num, 10);
    },
    //继续按钮
    continueClick: function () {
        ReplayDataCenter.openReplayPanel = true;
        cc.director.loadScene('home');
    },
    //获取信息
    getPlayerInfoByUid: function (uid) {
        for (var i = 0; i < ReplayData.players.length; i++) {
            if (ReplayData.players[i].uid == uid) {
                return ReplayData.players[i];
            }
        }
        return null;
    },
    getPlayerPosByUid: function (uid) {
        for (var i = 0; i < ReplayData.players.length; i++) {
            if (ReplayData.players[i].uid == uid) {
                return i;
            }
        }
        return null;
    },
    getLocalPosition: function (index) {
        var selfIndex = 0;
        var temp = [];
        for (var i = 0; i < ReplayData.players.length; i++) {
            temp.push(i);
        }
        var selfIndx = this.getPlayerPosByUid(GameData.player.uid);
        var prev = temp.slice(temp.indexOf(selfIndx));
        prev = prev.concat(temp.slice(0, temp.indexOf(selfIndx)));
        return prev.indexOf(index);
    },
});
