var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        playerCardNodes: {
            default: [],
            type: [cc.Node]
        },

        playerDownNode: cc.Node,
        playerRightNode: cc.Node,
        playerLeftNode: cc.Node,
        otherNode: cc.Node,
        holePokerNode: cc.Node,
        multipleNode: cc.Node,
        chuaiIcon_right: cc.Node,
        chuaiIcon_left: cc.Node,
        tiIcon_right: cc.Node,
        tiIcon_left: cc.Node,
        stopBtn: cc.Button,
        playBtn: cc.Button,
        exitBtn: cc.Button,
        quick_btn: cc.Button,
        overBtn: cc.Button,

        _actionIndex: -1,
        _playerCardList: [],
        _effectController: null,

        //playintrNode : cc.Node,
        roomNum: cc.Label,
        runSum: cc.Label,
        detain: cc.Label,

        ruleLabel: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        //this.playIntrSize = 'small';
        this.initNum = 1;
        this.stopBtn.node.active = false;
        this.playBtn.node.active = true;
        this.ruleLabel.string = getRuleStrDDZ(ReplayRoomData.opts);

        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('ddz-onGameStart', this, this.showTableLayer);
        registEvent('tjddz-onGameStart', this, this.showTableLayer);
        registEvent('onServerNotice', this, handlerServerNotice);

        scheduleLamp(this);

        this.detain_left = 0;
        this.detain_right = 0;
        this.detain_down = 0;
        
        if (ReplayRoomData.opts.detain > 0)
        {
            this.detain.node.active = true;
            if (ReplayData.game.opts.detain == undefined)
            {
                this.detain.string = '押底：' + 0;
            }
            else
            {
                this.detain.string = '押底：' + ReplayData.game.opts.startDetain;
            }
        }
        else 
        {
            this.detain.node.active = false;
        }
    },

    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        unregistEvent('ddz-onGameStart', this, this.showTableLayer);
        unregistEvent('tjddz-onGameStart', this, this.showTableLayer);
        registEvent('onServerNotice', this, handlerServerNotice);
    },

    onEnable: function () {
        cc.director.getScheduler().setTimeScale(1)
        //this._effectController = this.node.getComponent('ReplayEffectController');
        this.roomNum.getComponent(cc.Label).string = ReplayRoomData.roomid;
        //this.showPlayIntroduce(this.playIntrSize);
        //this.initData();
        this.initStopPanel();
        //隐藏pokerNode
        for (var i = 0; i < this.playerCardNodes.length; i++) {
            var handPoker = cc.find('cardHand', this.playerCardNodes[i]);
            var disPoker = cc.find('cardDis', this.playerCardNodes[i]);
            this.hideChildNode(handPoker);
            this.hideChildNode(disPoker);
        }

        for (var i = 0; i < this._playerCardList.length; i++) {
            var headerNode = this._playerCardList[i];
            var score = this.getScore(headerNode.uid);
            headerNode.setCoin(score);
        }
        this.schedule(this.runAction, 1);
    },

    showTableLayer: function () {
        if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
            cc.director.loadScene('table');
        } else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_DDZ) {
            cc.director.loadScene('table-DDZ');
        }
        else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ) {
            cc.director.loadScene('table-TJDDZ');
        }
    },

    runAction: function () {
        this.runNextAction();
    },

    initData: function () {
        cc.log('replayDataJson: ', JSON.stringify(replayDataJson));
        ReplayData = JSON.parse(replayDataJson);
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
    onClose: function () {
        ReplayDataCenter.openReplayPanel = true;
        cc.director.getScheduler().setTimeScale(1);
        cc.director.loadScene('home');
    },
    overBtnClick: function () {
        this.unschedule(this.runAction);
        for (var i = this._actionIndex + 1; i < ReplayData.game.actions.length; i++) {
            var actionObject = ReplayData.game.actions[i];
            var uid = actionObject.uid;
            var action = actionObject.action;
            var card = actionObject.card;
            cc.log(i, uid, action, card);
            //var cardController = this.getCardController(uid);
        }
        ReplayDataCenter.resultCard = this.getAllCards();
        var resultData;
        for (var key in ReplayData.game.actions) {
            if (ReplayData.game.actions[key].action == 'over') {
                resultData = ReplayData.game.actions[key];
                break;
            }
        }
        if (resultData.data.dissovlt != undefined)
        {
            createMoveMessage('房间已解散');
            var that = this;
            this.scheduleOnce(function() {
                that.onClose();
            }, 1);
        }
        else
        {
            openView('DDZ-replayResult', gameDefine.GameType.Game_Poker_DDZ);
        }
    },
    showCardContent: function (cardNode, cardId) {
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/' + 'poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    getScore: function (uid) {
        var index;
        for (var i = 0; i < ReplayRoomData.players.length; i++) {
            if (ReplayData.id == ReplayRoomData.players[i].id) {
                index = i;
            }
        }
        var nowScore = 0;
        if (index != 0) {
            for (var i = 0; i < index; i++) {
                nowScore += ReplayRoomData.players[i].score[uid];
            }
        }
        //console.log('................nowScore ='+nowScore);
        return nowScore;
    },

    runNextAction: function () {
        // var self = this;
        this._actionIndex++;
        cc.log('ReplayData: ', JSON)
        if (this._actionIndex < ReplayData.game.actions.length) {
            var actionObject = ReplayData.game.actions[this._actionIndex];
            var uid = actionObject.uid;
            var action = actionObject.action;
            var card = actionObject.card;
            cc.log(this._actionIndex, uid, action, card);
            this.whoDoSomething(actionObject);
        } else if (this._actionIndex == ReplayData.game.actions.length) {
            cc.log('replay over');
            var actionindex = this._actionIndex - 1;
            //var cardController = ReplayData.game.actions[actionindex];

            for (var i = 0; i < this._playerCardList.length; i++) {
                var headerNode = this._playerCardList[i];
                var score = this.getScore(headerNode.uid);
                score += ReplayData.scores[headerNode.uid];
                headerNode.setCoin(score);
            }
            this.lastTime = 2;
            this.schedule(this.updateLastTime, 1);
        } else {
            this.unschedule(this.runAction);
        }
    },

    updateLastTime: function () {
        this.lastTime--;
        if (this.lastTime <= 0) {
            ReplayDataCenter.resultCard = this.getAllCards();
            var resultData;
            for (var key in ReplayData.game.actions) {
                if (ReplayData.game.actions[key].action == 'over') {
                    resultData = ReplayData.game.actions[key];
                    break;
                }
            }
            if (resultData.data.dissovlt != undefined)
            {
                createMoveMessage('房间已解散');
                var that = this;
                this.scheduleOnce(function() {
                    that.onClose();
                }, 1);
            }
            else
            {
                openView('DDZ-replayResult', gameDefine.GameType.Game_Poker_DDZ);
            }
            this.unschedule(this.updateLastTime);
        }
    },

    getAllCards: function () {
        var list = [];
        for (var i = 0; i < this.playerCardNodes.length; i++) {
            var cardNode = this.playerCardNodes[i];
            list.push(cardNode.getComponent('DDZ-ReplayCardController').getList());
        }
        return list;
    },

    setHeadScore: function(uid, data) {
        var score = 0;
        var pos = this.getPosByUid(uid);
        if (pos == 'down')
        {
            score = this.detain_down += data;
        }
        else if (pos == 'right')
        {
            score = this.detain_right += data;
        }
        else if (pos == 'left')
        {
            score = this.detain_left += data;
        }
        for (var key in ReplayData.game.opts.startScore)
        {
            if (uid == key)
            {
                score += ReplayData.game.opts.startScore[key];
            }
        }
        return score;
    },

    initHeadScore: function() {
        for (var i = 0; i < this._playerCardList.length; i++) {
            var headerNode = this._playerCardList[i];
            var score = 0;
            for (var key in ReplayData.game.opts.startScore)
            {
                if (key == headerNode.uid)
                {
                    score = ReplayData.game.opts.startScore[key];
                    headerNode.setCoin(score);
                    break;
                }
            }
        }
    },

    showDetain: function(data) {
        for (var i = 0; i < this._playerCardList.length; i++) {
            var headerNode = this._playerCardList[i];
            var score = 0;
            for (var key in data.score)
            {
                if (key == headerNode.uid)
                {
                    score = this.setHeadScore(key, data.score[key]);
                    headerNode.setCoin(score);
                    break;
                }
            }
        }
        var detainScore = Math.abs(this.detain_down + this.detain_left + this.detain_right);
        detainScore = detainScore + ReplayData.game.opts.startDetain;
        this.detain.string = '押底：' + detainScore;
    },

    showHandCards: function (data) {
        this._playerCardList = [];
        // var cards = ReplayData.cards;
        cc.log('data:' + JSON.stringify(data));
        var cards = data.card;
        var index;
        if (otherReplay[0] == true) {
            for (var key = 0; key < ReplayRoomData.players.length; key++) {
                if (ReplayRoomData.players[key]) {
                    index = key;
                    break;
                }
            }
        }else{
            // Uid = GameData.player.uid.toString();
            for (var key = 0; key < ReplayRoomData.players.length; key++)
            {
                if (ReplayRoomData.players[key].uid == GameData.player.uid)
                {
                    index = key;
                    break;
                }
            }
        }
        var playerInfo = {};
        var ownerIndex = 0;
        playerInfo = ReplayRoomData.players;
        ownerIndex = index;
        if (ownerIndex == null || ownerIndex == undefined) return;
        var indexList = [];
        this.playerNum = ReplayData.players.length;
        if (this.playerNum == 4) {
            // if(ownerIndex == 0)indexList = [0,1,2,3];
            // if(ownerIndex == 1)indexList = [1,2,3,0];
            // if(ownerIndex == 2)indexList = [2,3,0,1];
            // if(ownerIndex == 3)indexList = [3,0,1,2];  
        } else if (this.playerNum == 3) {
            if (ownerIndex == 0) indexList = [0, 1, 2];
            if (ownerIndex == 1) indexList = [1, 2, 0];
            if (ownerIndex == 2) indexList = [2, 0, 1];
            //this.playerCardNodes[1].removeFromParent(true);
            //this.playerCardNodes.splice(1,1);
        } else if (this.playerNum == 2) {
            // if(ownerIndex == 0)indexList = [0,1];
            // if(ownerIndex == 1)indexList = [1,0];
            // this.playerCardNodes[1].removeFromParent(true);
            // this.playerCardNodes[3].removeFromParent(true);
            // this.playerCardNodes.splice(1,1);
            // this.playerCardNodes.splice(3,1);
        }
        for (var i = 0; i < indexList.length; i++) {
            var needindex = indexList[i];
            var cardList = cards[needindex];
            // console.log('cardList = ' + JSON.stringify(cardList));
            if (this.playerCardNodes != null && this.playerCardNodes.length > 0 && this.playerCardNodes[i] != null) {
                var playerCards = this.playerCardNodes[i].getComponent('DDZ-ReplayCardController');
                playerCards.showHandCard(cardList.card);

                var uid = cards[needindex].uid;
                var name = playerInfo[needindex].name;
                var headimgurl = playerInfo[needindex].headimgurl;
                playerCards.uid = uid;
                playerCards.showHead(name + "", headimgurl);
                // 右侧玩家
                if (i == 1) {
                    playerCards.setNamePositionByDir('right');
                }

                this._playerCardList.push(playerCards);
            }
        }
        if (this.initNum == 1)
        {
            this.initHeadScore();
            this.initNum++;
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
    showPlayerTiChuai: function(pos, dizhuUid, uid, data) {
        var that = this;
        if (data.num == 1 && uid == dizhuUid)
        {
            if (pos == 'right')
            {
                cc.log('showPlayerTiChuai pos right');
                this.tiChuaiAction(this.chuaiIcon_right);
            }
            else if (pos == 'left')
            {
                cc.log('showPlayerTiChuai pos left');
                this.tiChuaiAction(this.chuaiIcon_left);
            }
        }
        else if (data.num == 1 && uid != dizhuUid)
        {
            if (pos == 'right')
            {
                cc.log('showPlayerTiChuai dizhu pos right');
                this.tiChuaiAction(this.tiIcon_right);
            }
            else if (pos == 'left')
            {
                cc.log('showPlayerTiChuai dizhu pos left');
                this.tiChuaiAction(this.tiIcon_left);
            } 
        }
    },
    showKicking: function(data) {
        cc.log('showKicking');
        var pos = this.getPosByUid(data.uid);
        this.showPlayerTiChuai(pos, ReplayData.game.opts.dizhu, data.uid, data);
    },

    showHeadTiChuai: function(parent, dizhuUid, uid, data) {
        var playerNode = parent.getChildByName('TablePlayerTemplate');
        var tiChuaiNode = cc.find('tiChuaiNode', playerNode);
        if (data.num == 1 && uid != dizhuUid)
        {
            var tiIcon = cc.find('tiIcon', tiChuaiNode);
            tiIcon.active = true;
            if (parent == this.playerRightNode)
            {
                tiIcon.x = -67;
            }
        }
        else if (data.num == 1 && uid == dizhuUid)
        {
            var chuaiIcon = cc.find('chuaiIcon', tiChuaiNode);
            chuaiIcon.active = true;
            if (parent == this.playerRightNode)
            {
                chuaiIcon.x = -67;
            }
        }
    },
    //TablePlayerTemplate
    showPlayerKicking: function(data) {
        cc.log('showPlayerKicking');
        var pos = this.getPosByUid(data.uid);
        if (pos == 'down')
        {
            this.showHeadTiChuai(this.playerDownNode, ReplayData.game.opts.dizhu, data.uid, data);
        }
        else if (pos == 'right')
        {
            this.showHeadTiChuai(this.playerRightNode, ReplayData.game.opts.dizhu, data.uid, data);
        }
        if (pos == 'left')
        {
            this.showHeadTiChuai(this.playerLeftNode, ReplayData.game.opts.dizhu, data.uid, data);
        }
    },

    getPosByUid: function(uid) {
        var index;
        if (otherReplay[0] == true) {
            for (var key = 0; key < ReplayRoomData.players.length; key++) {
                if (ReplayRoomData.players[key]) {
                    index = key;
                    break;
                }
            }
        }else{
            // Uid = GameData.player.uid.toString();
            for (var key = 0; key < ReplayRoomData.players.length; key++)
            {
                if (ReplayRoomData.players[key].uid == GameData.player.uid)
                {
                    index = key;
                    break;
                }
            }
        }
        var ownerIndex = 0;
        var indexList = [];
        ownerIndex = index;
        if (ownerIndex == 0) indexList = [0, 1, 2];
        if (ownerIndex == 1) indexList = [1, 2, 0];
        if (ownerIndex == 2) indexList = [2, 0, 1];

        var posList = ['down', 'right', 'left'];

        for (var key = 0; key < indexList.length; key++)
        {
            if (this._playerCardList[key].uid == uid)
            {
                return posList[key];
            }
        }
    },


    whoDoSomething: function (data) {

        //cc.log('dasd:'+JSON.stringify(data));
        // uid, action, cards
        this.runSum.getComponent(cc.Label).string = '进度: ' + this._actionIndex + '/' + (ReplayData.game.actions.length - 1);
        cc.log('data = '+JSON.stringify(data));
        var cardController = this.getCardController(data.uid);
        //发牌
        if (data.action == 'deal') {
            this._handPokers = [];
            this._handPokers = data.card;
            this.showHandCards(data);
            if (this._actionIndex > 1) {
                createMoveMessage('无人叫分,重新发牌');
            }
        }
        if (data.action == 'holePokers') {
            var handPoker = [];
            for (var key in this._handPokers) {
                if (data.uid == this._handPokers[key].uid) {
                    handPoker = this._handPokers[key].card;
                }
            }
            var cards = data.card.concat(handPoker);
            cardController.addHolePoker(cards);
            //隐藏叫分文本node
            var jiaofenNodes = cc.find('jiaofenSps', this.otherNode);
            this.hideChildNode(jiaofenNodes);
            //显示底牌
            this.showHolePoker(data);
            //显示倍数
            this.showMultiple(1);
            //显示身份icon
            this.showPlayerIdentity(data);
        }
     
        if (data.action == 'jiaofen') {
            this.showJiaofen(data);
        }
        else if (data.action == 'detain')
        {
            this.showDetain(data);
        }
        else if (data.action == 'startTi' || data.action == 'startChuai')
        {
            this.showKicking(data);
            this.showPlayerKicking(data);
        } 
        else if (data.action == 'discard') {
            //cc.log('111111111:'+data.card);
            this.hideOtherNode(data);
            cardController.discard(data.card);
            cc.log('data.multiple:' + data.multiple + JSON.stringify(data));
            this.changeMultiple(data.multiple);
        } else if (data.action == 'pass') {
            cardController.hideDisCard();
            this.showPass(data);
        } else if (data.action == 'over') {
            cc.log('over:' + JSON.stringify(data));

            this.changeMultiple(data.data.boomNum);
            //ReplayDataCenter.resultData  = data;
        }
    },
    showHolePoker: function (data) {
        cc.log('data.cards:' + data.card);
        var index = 0;
        for (var key in this.holePokerNode.children) {
            this.showCardContent(this.holePokerNode.children[key], data.card[index]);
            index++;
        }
    },
    showJiaofen: function (data) {
        //cc.log('data.num:'+data.num);
        for (var i = 0; i < this._playerCardList.length; i++) {
            if (this._playerCardList[i].uid == data.uid) {
                this.showJiaofenText(i, data.num);
            } else {
                this.hideJiaofenText(i);
            }
        }
    },
    showJiaofenText: function (index, num) {
        //cc.log('num:'+num);
        var passNode = cc.find('jiaofenSps/jiaofen' + index, this.otherNode);
        var iconUrl = '';
        switch (num) {
            case 1:
                iconUrl = 'resources/ddz/UI/common/artword/artword_1fen.png';
                break;
            case 2:
                iconUrl = 'resources/ddz/UI/common/artword/artword_2fen.png';
                break;
            case 3:
                iconUrl = 'resources/ddz/UI/common/artword/artword_3fen.png';
                break;
            case 4:
                iconUrl = 'resources/ddz/UI/common/artword/artword_bujiao.png';
                break;
            default:
                break;
        }
        //cc.log('iconUrl:'+iconUrl);
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        passNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        passNode.active = true;
    },
    hideJiaofenText: function (index) {
        var passNode = cc.find('jiaofenSps/jiaofen' + index, this.otherNode);
        passNode.active = false;
    },
    showPass: function (data) {
        for (var i = 0; i < this._playerCardList.length; i++) {
            if (data.uid == this._playerCardList[i].uid) {
                this.showPassText(i);
            } else {
                this.hidePassText(i);
            }
        }
    },
    showPassText: function (index) {
        var passNode = cc.find('buchuNodes/buchuLb' + index, this.otherNode);
        passNode.active = true;
    },
    hidePassText: function (index) {
        var passNode = cc.find('buchuNodes/buchuLb' + index, this.otherNode);
        passNode.active = false;
    },
    showMultiple: function (data) {
        this.showChildNode(this.multipleNode);
        this.changeMultiple(data);

    },
    changeMultiple: function (num) {
        cc.log('num:' + num);
        var multiple = cc.find('multipleNum', this.multipleNode);
        multiple.getComponent(cc.Label).string = num;
    },
    hideOtherNode: function (data) {
        for (var i = 0; i < this._playerCardList.length; i++) {
            if (data.uid == this._playerCardList[i].uid) {
                this.hidePassText(i);
            }
        }
    },
    showPlayerIdentity: function (data) {
        var playerCards = this.getCardController(data.uid);
        for (var i = 0; i < this._playerCardList.length; i++) {
            if (playerCards.uid == ReplayData.game.opts.dizhu && playerCards.uid == this._playerCardList[i].uid) {
                this._playerCardList[i].showPlayerIdentity(true, 1);
            } else {
                this._playerCardList[i].showPlayerIdentity(true, 2);
            }
        }

    },
    removeDisFromLast: function (cardId) {
        var actionObject = ReplayData.game.actions[this._actionIndex - 1];
        var lastuid = actionObject.uid;
        var lastCardController = this.getCardController(lastuid);
        lastCardController.removeDisCard(cardId);
    },
    getAnimationIndex: function (uid) {
        var actionPos = '';
        for (var i = 0; i < this.playerCardNodes.length; i++) {
            var playerCards = this.playerCardNodes[i].getComponent('DDZ-ReplayCardController');
            // if (this.playerNum == 4 && this.playerCardNodes[i] != null) {
            //         playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            // }else{
            //     if (i == 0) {
            //         playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            //     }else{
            //         playerCards = this.playerCardNodes[i+1].getComponent('ReplayCardController');
            //     }
            // }
            if (this.playerNum == 4) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    } else if (i == 1) {
                        actionPos = 'right';
                    } else if (i == 2) {
                        actionPos = 'up';
                    } else if (i == 3) {
                        actionPos = 'left';
                    }
                }
            } else if (this.playerNum == 3) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    } else if (i == 1) {
                        actionPos = 'up';
                    } else if (i == 2) {
                        actionPos = 'left';
                    }
                }
            } else if (this.playerNum == 2) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    } else if (i == 1) {
                        actionPos = 'up';
                    }
                }
            }

        }
        return actionPos;
    },
    //隐藏子节点
    hideChildNode: function (node) {
        for (var key in node.children) {
            node.children[key].active = false;
        }
    },
    //显示子节点
    showChildNode: function (node) {
        for (var key in node.children) {
            node.children[key].active = true;
        }
    },
    cardActionAnimation: function (uid, action) {
        // var pos = this.getAnimationIndex(uid);
        // var animationNode = cc.find('layer_ui/actionAnimations/' + pos,this.node);
        // if(animationNode != null)
        // {
        //     animationNode.getComponent(cc.Animation).play(action);
        // }
    },
    getCardController: function (uid) {
        for (var i = 0; i < this._playerCardList.length; i++) {
            var cardController = this._playerCardList[i];
            if (cardController.uid == uid) {
                return cardController;
            }
        }
        return null;
    },
    ruleClick: function () {
        // if(this.playintrNode.active == true){
        //     return;
        // }
        // this.playintrNode.active = true;
        //  this.playintrNode.runAction(cc.sequence(
        //     cc.moveTo(0.5,cc.p(30,334)),
        //     //cc.callFunc(this.isRuleBtn,this),
        //     cc.delayTime(5),
        //     cc.moveTo(0.5,cc.p(30,434)),
        //     cc.callFunc(this.isRuleBtn,this)
        //     ));

    },
    isRuleBtn: function () {
        // this.playintrNode.active = false;
    },
    onShowPlayIntrClick: function () {
        // this.playIntrSize = this.playIntrSize == 'small' ? 'big' : 'small';
        // this.showPlayIntroduce(this.playIntrSize);
        // cc.find('openBtn',this.playintrNode).rotation = this.playIntrSize == 'small' ? 0 : 180;
    },
    showPlayIntroduce: function (size) {
        // var roomRule = ReplayRoomData.opts;
        // console.log('roomRule = '+JSON.stringify(roomRule));
        // var playStr = getRoomRuleStr(roomRule);
        // // rule = getShortStr(playStr,27);
        // var contentNode = cc.find(size + '/content',this.playintrNode);
        // cc.log('size : ' + size + ',contentNode : ' + contentNode);
        // var label = contentNode.getComponent(cc.Label);
        // label.string = playStr;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});