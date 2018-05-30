var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var tdk_roomData = require('tdkRoomData');
cc.Class({
    extends: cc.Component,

    properties: {
        timeLabel: cc.Label,
        roomNum: cc.Label,
        roomNode: cc.Node,
        readyNode: cc.Node,
        deleteRoomBtn: cc.Node,
        quitRoomBtn: cc.Node,
        wifiNode: cc.Node,
        playintrNode: cc.Node,
        dianchiNode: cc.Node,
        btnRule: cc.Button,
        lostInfo: [],
        playerNodes: {
            default: [],
            type: cc.Node
        },
        ruleNode: cc.Node,
        readyBtn: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.playIntrSize = 'small';
        this.playerSex = 1;
        this.headers = new Array();
        this.RuleBtnBool = false;
        this.isReconnect = false;
        //this.showPlayers(this);
        this.initPlayers(this);
        registEvent('onTurner',this,this.onGameTurn);
        registEvent('onRoomInfo', this, this.initPlayers);
        registEvent('onCreatorQuit', this, this.onCreatorQuit);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onRoomChat', this, this.onRoomChatHandler);
        registEvent('onPlayerIncScore', this, this.initPlayers);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);
        registEvent('onIncScore', this, this.getConnectChipsScore);
        registEvent('onPlayerIncScore',this,this.getEveryOneScore);
        registEvent('onPlayerInitScore',this,this.getEveryOneScore);
        registEvent('nativePower', this, this.onNativePowerHandler);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);
        registEvent('onPrepareInfo', this, this.onRoomReadyInfoHandler);
        registEvent('AnimationDelayTime', this, this.onGameScoreHandler);
        //RoomHandler.requestReady();
        // this.handTimeLabel();
        this.updateTime();
        this.updataWifi();
        this.electricQuantity();
        var isCreator = GameData.player.uid == GameData.room.creator ? true : false;
        // this.startGameBtn.node.active = isCreator;
        this.deleteRoomBtn.active = isCreator;
        this.quitRoomBtn.active = !isCreator;
        // if (GameData.room.status === TDKPokerCard.STATUS.GAMING || GameData.room.status === TDKPokerCard.STATUS.DISSOLVE) {
        this.getConnectChipsScore();
        this.onGameTurn();
        // }
    },

    onEnable: function () {
        
    },

    onDestroy: function () {
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
        unregistEvent('onRoomChat', this, this.onRoomChatHandler);
        unregistEvent('nativePower', this, this.onNativePowerHandler);
        unregistEvent('onPrepareInfo', this, this.onRoomReadyInfoHandler);
        unregistEvent('yunwaUploaded', this, this.onYunwaUploaded)
        unregistEvent('HideReadyNode', this, this.HideReadyNode);
        unregistEvent('AnimationDelayTime', this, this.onGameScoreHandler);



        unregistEvent('onRoomInfo', this, this.initPlayers);
        unregistEvent('onTurner',this,this.onGameTurn);
        unregistEvent('onPlayerIncScore',this,this.getEveryOneScore);
        unregistEvent('onPlayerInitScore',this,this.getEveryOneScore);

        unregistEvent('onCreatorQuit', this, this.onCreatorQuit);
    },

    onGameScoreHandler: function (data) {
        //var AnimationDelayTime = data.detail;
        //     var self = this;
        //     this.scheduleOnce(function(){
        //         self.readyNode.active = true;
        //     }, AnimationDelayTime);
    },
    HideReadyNode: function () {
        //this.readyNode.active = false;
    },
    showRule: function(data){
        var rule1 = cc.find('ruleNode1/rule1',this.ruleNode);
        var playerNum = cc.find('ruleNode2/playerNum',this.ruleNode);
        var king = cc.find('ruleNode2/king',this.ruleNode);
        var keng = cc.find('ruleNode2/keng',this.ruleNode);
        var languo = cc.find('ruleNode2/languo',this.ruleNode);
        var moti = cc.find('ruleNode2/moti',this.ruleNode);
        var quanya = cc.find('ruleNode2/quanya',this.ruleNode);

        rule1.getComponent(cc.Label).string = '填大坑  共'+data.roundMax+'局';
        playerNum.getComponent(cc.Label).string = data.joinermax+'人局';
        if (data.cardType === 1) {
            keng.getComponent(cc.Label).string = '半坑(9起)';
        }else if (data.cardType === 2) {
            keng.getComponent(cc.Label).string = '半坑(10起)';
        }

        if (data.king === true) king.getComponent(cc.Label).string = '带王';
        else king.getComponent(cc.Label).string = '不带王';

        if (data.nextDouble === true) languo.getComponent(cc.Label).string = '烂锅翻倍';
        else languo.getComponent(cc.Label).string = '烂锅不翻倍';

         if (data.allin === 0) quanya.getComponent(cc.Label).string = '不带全压';
         else if (data.allin === 30) quanya.getComponent(cc.Label).string = '全压30倍';
         else if (data.allin === 60) quanya.getComponent(cc.Label).string = '全压60倍';

        var roundNum = RoomHandler.room.roundNum;
        var opts = RoomHandler.room.opts;
        var lastRoundNum = cc.find('roundBg/txt',this.roomNode);
        var nowRoundNum = roundNum > opts.roundMax ? opts.roundMax : roundNum;
        lastRoundNum.getComponent(cc.Label).string = '局数:'+nowRoundNum+'/'+opts.roundMax;

        var quanYa = cc.find('quanya/txt',this.roomNode);
        quanYa.getComponent(cc.Label).string = '全压:'+GameData.room.opts.allin;
        // var basic = cc.find('scoreBaseBg/txt',this.roomNode);
        // basic.getComponent(cc.Label).string = '底分:'+GameData.room.opts.
    },
    onGameAllScoreHandler: function (data) {
        for (var i = 0; i < this.headers.length; i++) {
            // var headerNode = this.headers[i];
            // var playerTemplate = headerNode.getComponent('DDZ-playerTemplate');
            // var uid = playerTemplate.uid;
            // var score = GameDataDDZ.allScores[uid] == undefined? 0 : GameDataDDZ.allScores[uid];

            // playerTemplate.setCoin(score,1);
        }
    },
    onYunwaUploaded: function (data) {
        var soundurl = data.detail;
        WriteLog('soundurl ：' + soundurl);
        ChatHandler.getInstance().sendRecord(soundurl);
    },
    onRoomChatHandler: function (data) {
        var uid = data.detail.uid;
        var type = data.detail.msg.type;
        this.playerSex = GameData.getPlayerSexByUid(data.detail.uid);
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            //cc.log(uid + "," + headerNode.getComponent('playerTemplate').uid);
            if (headerNode.getComponent('TDK-playerTemplate').uid == uid) {
                var chatNode = cc.find('chat', headerNode);
                if (chatNode != null) {
                    var wordNode = cc.find('word', chatNode);
                    var emoNode = cc.find('emo', chatNode);
                    var yuyinNode = cc.find('yuyinNode', chatNode);
                    if (type == 'word') {
                        var content = data.detail.msg.data;

                        var chatBg = cc.find('word/bg', chatNode);
                        var chatLabel = cc.find('word/Label', chatNode).getComponent(cc.Label);
                        var contentStr = content;
                        chatBg.width = 20 + contentStr.length * 24;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                    } else if (type == 'fast') {
                        var soundKey = data.detail.msg.data.sound;
                        var content = data.detail.msg.data.content;
                        var chatBg = cc.find('word/bg', chatNode);
                        var chatLabel = cc.find('word/Label', chatNode).getComponent(cc.Label);
                        var contentStr = getShortStr(content, 10);
                        chatBg.width = contentStr.length * 30;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                        soundMngr.instance.playAudioChat(soundKey, this.playerSex);

                    } else if (type == 'emo') {
                        var animationName = data.detail.msg.data;
                        cc.log('animationName:' + animationName);
                        emoNode.getComponent(cc.Animation).play(animationName);
                        emoNode.getComponent('HideComponent').show(3);
                    } else if (type == 'yuyin') {
                        if (!GameData.isPlayVioce) {
                            return;
                        }
                        var soundurl = data.detail.msg.data;
                        if (cc.sys.OS_ANDROID == cc.sys.os) {
                            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "playRecord", "(Ljava/lang/String;)V", soundurl);
                        } else if (cc.sys.OS_IOS == cc.sys.os) {
                            jsb.reflection.callStaticMethod("AppController", "playRecord:", String(soundurl));
                        }
                        var yuyinAnim = cc.find('yuyinAnimNode/yuyinAnim', yuyinNode);
                        yuyinAnim.getComponent(cc.Animation).play("yuyinduihua");
                        yuyinNode.getComponent('HideComponent').show(3);

                    }
                }
            }
        }

    },

    showReadyIcon: function (direction, showHand, showReading) {
        cc.find('ready_hand_' + direction, this.readyNode).active = showHand;
        cc.find('readying_' + direction, this.readyNode).active = showReading;
    },

    initPlayers: function () {
        this.headers = [];
        //profileNiuNiu.roomInfo.players
        //GameData.joiners
        for (var i = 0; i < this.playerNodes.length; i++) {
            this.playerNodes[i].active = false;
        }
        cc.log('joinersNum:' + GameData.joiners.length);
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null) {
                var userId = GameData.joiners[j].uid;
                var userInfo = tdk_roomData.getPlayerInfoByUid(userId); // 房间内玩家的信息
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                //var localIdx = j;
                cc.log('localIdx:' + localIdx);
                var headNode = this.playerNodes[localIdx].getChildByName("TableTDKPlayerTemplate");
                headNode.parent.active = true;
                var playerHeadScp = headNode.getComponent("TDK-playerTemplate");
                playerHeadScp.setPlayer(userInfo);
                playerHeadScp.setHeadIcon(userInfo.headimgurl);
                playerHeadScp.setName(userInfo.name);
                // playerHeadScp.showZhuang(false);
                playerHeadScp.setIsOnline(userId);
                this.headers.push(headNode);
            }
        }
        this.setRoomNum();
        this.onRoomReadyInfoHandler();
        this.showRule(GameData.room.opts);
    },
    onReadyBtnClick: function () {
        var self = this;
        GameNet.getInstance().request('room.roomHandler.ready', {}, function (rtn) {
            self.readyBtn.active = false;
        });
    },
    ruleClick: function () {
        // if(this.playintrNode.active == true){
        //     return;
        // }
        // this.playintrNode.active = true;
        //  this.playintrNode.runAction(cc.sequence(
        //     cc.moveTo(0.5,cc.p(30,334)),
        //     //cc.callFunc(this.isRuleBtn,this),
        //     cc.delayTime(10),
        //     cc.moveTo(0.5,cc.p(30,434)),
        //     cc.callFunc(this.isRuleBtn,this)
        //     ));

    },
    isRuleBtn: function () {
        //this.playintrNode.active = false;
    },
    onShowPlayIntrClick: function () {
        // this.playIntrSize = this.playIntrSize == 'small' ? 'big' : 'small';
        //  this.showPlayIntroduce(this.playIntrSize);
        //  cc.find('openBtn',this.playintrNode).rotation = this.playIntrSize == 'small' ? 0 : 180;


    },

    showPlayIntroduce: function (size) {

    },

    onRoomReadyInfoHandler: function () {
        cc.log('tdk_roomData.onRoomReadyInfo = '+JSON.stringify(tdk_roomData.onRoomReadyInfo));
        var continueBtn = this.readyNode.parent.getChildByName('againBtn');
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
            continueBtn.active = true;
            return;
        }

        this.readyNode.active = true;
        var readyChild = this.readyNode.children;
        for (var i = 0; i < readyChild.length; i++) {
            readyChild[i].active = false;
        }
        var readyData = tdk_roomData.onRoomReadyInfo;
        for (var key in readyData) {
            var playerInfo = tdk_roomData.getPlayerInfoByUid(key);
            if (!playerInfo) {
                delete readyData[key];
            }
        }
        cc.log('readyData = '+JSON.stringify(readyData));
        for (var i = 0; i < GameData.joiners.length; i++) {
            if (GameData.joiners[i] != null) {
                var uid = GameData.joiners[i].uid;
                if (readyData[uid] == true) {
                    var index = tdk_roomData.getLocalPosition(i);
                    this.showReadyIcon(index,true,false);
                    if (uid === GameData.player.uid) {
                        this.readyBtn.active = false;
                        continueBtn.active = false;
                    }
                }else{
                    var index = tdk_roomData.getLocalPosition(i);
                    this.showReadyIcon(index,false,true);
                    if (GameData.room.status > TDKPokerCard.STATUS.WAITING && uid === GameData.player.uid) {
                        continueBtn.active = true;
                    }
                }
            }else{
                var index = tdk_roomData.getLocalPosition(i);
                this.showReadyIcon(index,false,false);
            }
            
        }
        var readyArray = [];
        for (var index in readyData) {
            if (readyData[index] === true) {
                readyArray.push(readyData[index]);
            }
        }
        if (readyArray.length === GameData.room.opts.joinermax) {
            this.readyNode.active = false;
        }
    },

    showJoinerLost: function (data) {
        this.showHeaderDisconnect(data.detail.uid,true);
        var nameStr = GameData.getPlayerByUid(data.detail.uid).name;
        createMoveMessage('玩家[' + nameStr + ']掉线了'); 
    },

    showJoinerConnect: function () {
        this.initPlayers();
    },

    showHeaderDisconnect: function (uid, show) {
        if (this.headers == null) {
            cc.log('this.headers null');
            return;
        }
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            if (headerNode.getComponent('TDK-playerTemplate').uid == uid) {
                var disNode = cc.find('Disconnect', headerNode);
                disNode.active = show;
                return;
            }
        }
    },

    setRoomNum: function () {
        if (!GameData.room.id) return;
        var startStr = '';
        if (GameData.room.id >= 100000) {
            this.roomNum.string = startStr + GameData.room.id;
        } else if (GameData.room.id >= 10000) {
            this.roomNum.string = startStr + '0' + GameData.room.id;
        } else if (GameData.room.id >= 1000) {
            this.roomNum.string = startStr + '00' + GameData.room.id;
        } else if (GameData.room.id >= 100) {
            this.roomNum.string = startStr + '000' + GameData.room.id;
        } else if (GameData.room.id >= 10) {
            this.roomNum.string = startStr + '0000' + GameData.room.id;
        } else if (GameData.room.id >= 1) {
            this.roomNum.string = startStr + '00000' + GameData.room.id;
        } else {
            this.roomNum.string = startStr + '000000';
        }
    },

    backBtnClicked: function () {
        if (GameData.room.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            RoomHandler.quitMjRoom(GameData.room.id);
        }
    },
    startGameClick: function () {
        TDKHandler.getInstance().requestStartGame();
        cc.log('开始游戏');
    },
    wxInviteBtnClicked: function () {
        var title = "填大坑 "+"房间号:"+GameData.room.id;
        var des = this.getInviteStr();
        wxShareWeb(title, des);
    },

    getInviteStr: function () {
        var str1 = "玩法:";
        var str2 = "请您快速加入对局." ;
        var des = str1 + getRuleStrTDK(GameData.room.opts) + str2;

        console.log('des = ' + des);
        return des;
    },

    onShareResult: function () {
        //wxShareTimeline("经典斗地主","我在经典斗地主等你!");
    },

    onShareFriend: function () {
        //wxShareWeb("经典斗地主","我在经典斗地主等你!");
    },

    onDeleteRoom: function () {
        //RoomHandler.quitMjRoom(GameData.room.id);
        NiuNiuMessageBox('解散房间不扣房卡，是否确定解散？', function () {
            RoomHandler.deleteRoom(GameData.room.id, 'apply');
        }, function () {});
    },

    onQuitRoom: function () {
        if (GameData.room.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            RoomHandler.quitRoom(GameData.room.id);
        }
    },

    onCreatorQuit: function () {
        cc.log('111111');
        GameData.player.roomid = undefined;
        if (GameData.room.creator != GameData.player.uid) {
            NiuNiuMessageBox('房主已经解散房间', function () {
                cc.director.loadScene('home');
            });
        } else {
            cc.director.loadScene('home');
        }
    },
    onGameTurn: function(){
        this.scheduleOnce(this.showTurnEffect, 0.1);
    },
    showTurnEffect: function () {
        if (tdk_roomData.turn == 0) return;
        this.gotoShowTurnEffect(tdk_roomData.turn);
    },
    gotoShowTurnEffect: function (uid) {
        if (this.headers == null) {
            cc.log('this.headers null');
            return;
        }
        for (var j = 0; j < GameData.joiners.length; j++) {
            if (GameData.joiners[j] != null) {
                var userId = GameData.joiners[j].uid;
                var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                var headNode = this.playerNodes[localIdx].getChildByName("TableTDKPlayerTemplate");
                var playerHeadScp = headNode.getComponent("TDK-playerTemplate");
                if (uid === userId) {
                    playerHeadScp.getLiuGuang(true);
                }else{
                    playerHeadScp.getLiuGuang(false);
                }
            }
        }
        tdk_roomData.turn = 0;
    },

    //复制房间号
    onCopyRoomInfo: function () {
        var roomId = GameData.room.id;
        if (roomId > 0) {
            var title = "填大坑,"+"房间号:"+GameData.room.id+",";
            var des = this.getInviteStr();
            textClipboard(title+des);
            createMoveMessage('房间复制成功');
        }
    },

    electricQuantity: function () {
        try {
            if (cc.sys.OS_ANDROID == cc.sys.os) {
                jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "electricQuantity", "()V");
            } else if (cc.sys.OS_IOS == cc.sys.os) {
                jsb.reflection.callStaticMethod("AppController", "electricQuantity");
            }
            this.schedule(this.electricQuantity, 60);
        } catch (e) {
            WriteLog("electricQuantity throw: " + JSON.stringify(e));
        }
    },

    onNativePowerHandler: function (percent) {
        var node = this.dianchiNode.getChildByName("dianchi2");
        //var width=this.playintrNode1.getChildByName("dianchi2").width;
        node.scaleX = percent.detail / 100;
        //this.powerBar.setPercent(Number(d));
    },

    updataWifi: function () {
        this.callBackForWifiUI();
        this.schedule(this.callBackForWifiUI, 5);
    },

    callBackForWifiUI: function () {
        var ms = GameNet.getInstance().getPingPong() / 1000.0;
        // cc.log("ms" + ms);
        if (ms < 0.3) {
            this.showWifi(3);
        } else if (ms < 0.6) {
            this.showWifi(2);
        } else if (ms < 1) {
            this.showWifi(1);
        } else {
            this.showWifi(0);
        }
    },

    showWifi: function (index) {
        for (var i = 0; i < 4; i++) {
            var node = cc.find('WiFi-' + (i + 1), this.wifiNode)
            node.active = i == index ? true : false;
        }
    },

    updateTime: function () {
        this.schedule(this.handTimeLabel, 1);
    },

    handTimeLabel: function () {
        var da = new Date();
        var h = da.getHours() + '';
        var m = da.getMinutes() + '';
        h = h.length == 1 ? '0' + h : h;
        m = m.length == 1 ? '0' + m : m;

        this.timeLabel.string = h + ':' + m;
    },

    onGameStartHandler: function (data) {
        this.readyNode.active = !GameDataDDZ.game.gameStart;
    },

    hasName: function (name, nameArry) {
        for (var i = 0; i < nameArry.length; i++) {
            var toName = nameArry[i];
            if (toName == name) return true;
        }
        return false;
    },

    //显示每人当前分数
    getEveryOneScore:function (data){
        var turnerscore = data.detail;
        for (var j = 0; j < GameData.joiners.length; j++) {
            for (var i = 0; i < turnerscore.length; i++) {
                var turnerId = turnerscore[i].uid;
                var score = turnerscore[i].score;
                if (GameData.joiners[j] != null && GameData.joiners[j].uid === turnerId) {
                    var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                    cc.log('localIdx:' + localIdx);
                    var headNode = this.playerNodes[localIdx].getChildByName("nowChipsNum");
                    headNode.active = true;
                    headNode.getChildByName('Num').getComponent(cc.Label).string = score;
                }   
            }
        }
    },
    getConnectChipsScore:function (){
        if (Object.keys(tdk_roomData.incPokerData).length <= 0) return;
        var turnerscore = tdk_roomData.incPokerData;
        for (var j = 0; j < GameData.joiners.length; j++) {
            for (var key in turnerscore) {
                if (GameData.joiners[j] != null && GameData.joiners[j].uid === parseInt(key)) {
                    var localIdx = tdk_roomData.getLocalPosition(j); //userInfo.inIndex
                    var headNode = this.playerNodes[localIdx].getChildByName("nowChipsNum");
                    var turnerScore = arraySum(turnerscore[key]);
                    cc.log('turnerScore = '+turnerScore);
                    headNode.getChildByName('Num').getComponent(cc.Label).string = turnerScore;
                }
            }
        }
    },
});