var RoomHandler = require('roomHandler');
var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        timeLabel: cc.Label,
        roomNum: cc.Label,
        play_up_player: cc.Node,
        play_down_player: cc.Node,
        play_left_player: cc.Node,
        play_right_player: cc.Node,
        readyNode: cc.Node,
        lostNode: cc.Node,
        // playerHead1: cc.Node,
        // playerHead2: cc.Node,
        // playerHead3: cc.Node,
        // playerHead4: cc.Node,
        deleteRoomBtn: cc.Node,
        quitRoomBtn: cc.Node,
        wifiNode: cc.Node,
        playintrNode: cc.Node,
        playerTemplate: cc.Prefab,
        dianchiNode: cc.Node,
        quanNode: cc.Node,
        juNode: cc.Node,
        btnRule: cc.Button,
        lostInfo: [],
    },

    // use this for initialization
    onLoad: function () {
        /*var agent = anysdk.agentManager;
        this.share_plugin = agent.getSharePlugin();
        this.share_plugin.setListener(this.onShareResult, this);*/
        this.playIntrSize = 'small';
        this.playerSex = 1;
        this.headers = new Array();
        this.RuleBtnBool = false;
        this.isReconnect = false;
        this.showPlayers(this);
        registEvent('onRoomInfo', this, this.showPlayers);
        registEvent('initCards', this, this.showPlayers);
        registEvent('onCreatorQuit', this, this.onCreatorQuit);
        registEvent('initZhuangInfo', this, this.showPlayers);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);
        registEvent('onRoomChat', this, this.onRoomChatHandler);
        registEvent('nativePower', this, this.onNativePowerHandler);
        registEvent('onGameAllScore', this, this.onGameAllScoreHandler);
        registEvent('onNotDiscard', this, this.onNotDiscardHandler);
        registEvent('onGameStart', this, this.onGameStartHandler);
        //registEvent('onStarPiao', this, this.onGamePiaoHandler);
        registEvent('onGameTurn', this, this.onGameTurnHandler);
        registEvent('onPrepareInfo', this, this.onRoomReadyInfoHandler);
        registEvent('onMahjongRunEnd', this, this.onGameScoreHandler);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);
        registEvent('onHuaDianMahjongReconnecet', this, this.onGameStartHandler);

        MjHandler.getInstance().requestReady();

        this.handTimeLabel();
        this.updateTime();
        this.updataWifi();
        this.electricQuantity();
    },

    onEnable: function () {
        // var uid = GameData.game.turn > 0 ? GameData.game.turn : GameData.game.zhuangUid;
        // cc.log('GameData.game.turn : ' + GameData.game.turn + ' , GameData.game.zhuangUid : ' + GameData.game.zhuangUid);
        // this.onGameTurnHandler(uid); !GameData.game.gameStart;
        this.readyNode.active = !GameData.game.zhuangUid > 0 ;
        //显示飘选项
        //if (Object.keys(profileHuaDian.PiaoInfo).length>0) {
        //    this.onGamePiaoHandler();
        //}
        //显示流光
        if (GameData.game.turn > 0) {
            this.onGameTurnHandler();
        }
        //if (GameData.game.onRoomReadyInfo.data) {
        //    sendEvent('onRoomReadyInfo', GameData.game.onRoomReadyInfo.data);
        //}
    },

    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.showPlayers);
        unregistEvent('initCards', this, this.showPlayers);
        unregistEvent('onCreatorQuit', this, this.onCreatorQuit);
        unregistEvent('initZhuangInfo', this, this.showPlayers);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
        unregistEvent('onRoomChat', this, this.onRoomChatHandler);
        unregistEvent('nativePower', this, this.onNativePowerHandler);
        unregistEvent('onGameAllScore', this, this.onGameAllScoreHandler);
        unregistEvent('onNotDiscard', this, this.onNotDiscardHandler);
        unregistEvent('onGameStart', this, this.onGameStartHandler);
        //unregistEvent('onStarPiao', this, this.onGamePiaoHandler);
        unregistEvent('onGameTurn', this, this.onGameTurnHandler);
        unregistEvent('onMahjongRunEnd', this, this.onGameScoreHandler);
        unregistEvent('onHuaDianMahjongReconnecet', this, this.onGameStartHandler);
    },

    onGameScoreHandler: function () {
        var self = this;
        this.scheduleOnce(function () {
            self.readyNode.active = true;
        }, 2);
    },

    onNotDiscardHandler: function (data) {
        if (GameData.player.uid == data.detail.uid && GameData.game.turn == GameData.player.uid) {
            if (GameData.room.opts.fengtou == true) {
                //createMessageBox('请优先打单张风牌', function() {});
                createMoveMessage('请注意风头跟打');
            }
        }
    },

    onGameAllScoreHandler: function (data) {
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            var playerTemplate = headerNode.getComponent('playerTemplate');
            var uid = playerTemplate.uid;

            //如果是金币场，显示玩家身上的金币数量
            if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
                if (GameData.players[uid]) {
                    playerTemplate.setGold(GameData.players[uid].coin);
                }
            } else {
                var score = GameData.allScores[uid] == undefined ? 0 : GameData.allScores[uid];
                playerTemplate.setCoin(score, 1);
            }
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
            if (headerNode.getComponent('playerTemplate').uid == uid) {
                var direction = GameData.tablePos[uid];
                var chatNode = cc.find('chat_' + direction, headerNode);
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
                    }
                    else if (type == 'fast') {
                        var soundKey = data.detail.msg.data.sound;
                        var content = data.detail.msg.data.content;
                        var chatBg = cc.find('word/bg', chatNode);
                        var chatLabel = cc.find('word/Label', chatNode).getComponent(cc.Label);
                        var contentStr = getShortStr(content, 10);
                        chatBg.width = contentStr.length * 30;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                        soundMngr.instance.playAudioChat(soundKey, this.playerSex);

                    }
                    else if (type == 'emo') {
                        var animationName = data.detail.msg.data;
                        emoNode.getComponent(cc.Animation).play(animationName);
                        emoNode.getComponent('HideComponent').show(3);
                    }
                    else if (type == 'yuyin') {
                        if (!GameData.isPlayVioce) {
                            return;
                        }
                        var soundurl = data.detail.msg.data;
                        if (cc.sys.OS_ANDROID == cc.sys.os) {
                            jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "playRecord", "(Ljava/lang/String;)V", soundurl);
                        }
                        else if (cc.sys.OS_IOS == cc.sys.os) {
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

    showPlayers: function () {
        this.headers = [];
        cc.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!showPlayers")
        this.showPlayer('down', this.play_down_player);
        this.showPlayer('right', this.play_right_player);
        this.showPlayer('up', this.play_up_player);
        this.showPlayer('left', this.play_left_player);

        this.showPlayIntroduce(this.playIntrSize);
        this.setRoomNum();

        var isCreator = GameData.room.creator == GameData.player.uid;
        this.deleteRoomBtn.active = isCreator;
        this.quitRoomBtn.active = !isCreator;
        if (GameData.room) {
            var isQuan = GameData.room.opts.roundType == 2;
            this.quanNode.active = isQuan;
            this.juNode.active = !isQuan;
        }
        //显示流光
        if (GameData.game.turn > 0) {
            this.onGameTurnHandler();
        }
    },
    ruleClick: function () {
        if (this.playintrNode.active == true) {
            return;
        }
        this.playintrNode.active = true;
        this.playintrNode.runAction(cc.sequence(
            cc.moveTo(0.5, cc.p(30, 334)),
            //cc.callFunc(this.isRuleBtn,this),
            cc.delayTime(10),
            cc.moveTo(0.5, cc.p(30, 434)),
            cc.callFunc(this.isRuleBtn, this)
        ));

    },
    isRuleBtn: function () {
        this.playintrNode.active = false;
    },
    onShowPlayIntrClick: function () {
        this.playIntrSize = this.playIntrSize == 'small' ? 'big' : 'small';
        this.showPlayIntroduce(this.playIntrSize);
        cc.find('openBtn', this.playintrNode).rotation = this.playIntrSize == 'small' ? 0 : 180;
    },

    showPlayIntroduce: function (size) {  // console.log('GameData.room.opts '+GameData.room.opts);
        if (!GameData.room.opts) return;
        var playStr = getRuleStrCC(GameData.room.opts);
        console.log("GameData.createRoomOpts:" + GameData.createRoomOpts);

        var contentNode = cc.find(size + '/content', this.playintrNode);
        cc.log('size : ' + size + 'contentNode : ' + contentNode);
        var label = contentNode.getComponent(cc.Label);
        label.string = playStr;
    },

    showPlayer: function (direction, parent) {
        parent.removeAllChildren();
        var player = GameData.getPlayerByPos(direction);
        if (player != null) { //Disconnect
            var playerNode = cc.instantiate(this.playerTemplate);
            playerNode.getComponent('playerTemplate').setPlayer(player);
            playerNode.getComponent('playerTemplate').setName(player.name);
            playerNode.getComponent('playerTemplate').setHeadIcon(player.headimgurl);

            //如果是金币场，显示玩家身上的金币数量
            if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
                if (player.coin) {
                    playerNode.getComponent('playerTemplate').setGold(player.coin);
                }
            } else {
                var score = RoomHandler.scores[player.uid] == undefined ? 0 : RoomHandler.scores[player.uid];
                playerNode.getComponent('playerTemplate').setCoin(score, 1);
                console.log(" score: " + score);
            }

            //playerNode.getComponent('playerTemplate').enableHeadBtn(false);
            var zhuang = (GameData.game.zhuangUid == player.uid);
            cc.log('showPlayer uid:' + player.uid + ' zhuang:' + GameData.game.zhuangUid);
            playerNode.getComponent('playerTemplate').showZhuang(zhuang);
            var creator = (GameData.room.creator == player.uid);
            playerNode.getComponent('playerTemplate').showCreator(creator);

            // var num = GameData.game.zhuangNum[player.uid];
            // playerNode.getComponent('playerTemplate').showZhuangNum(zhuang, num);
            //playerNode.getComponent('playerTemplate').setPiaoIconShow(direction);
            //playerNode.scaleX = 0.7;
            //playerNode.scaleY = 0.7;
            parent.addChild(playerNode);
            parent.active = true;
            this.headers.push(playerNode);

            //设置 tag 值
            var readyState = true;
            playerNode.setTag(player.uid);
            for (var key in RoomHandler.readyData) {
                if(key == player.uid){
                    readyState =  RoomHandler.readyData[key];
                }
            }
            cc.log('readyState:'+JSON.stringify(readyState));
            if (readyState) {
                this.showReadyIcon(direction, true, false);
            }else{
                this.showReadyIcon(direction, false, true);
            }

            var disNode = cc.find('Disconnect', playerNode);
            var online = RoomHandler.isPlayerOnline(player.uid);
            disNode.active = !online;
            if (!online) {
                cc.find('lost_' + direction, this.lostNode).active = true;
            }else{
                cc.find('lost_' + direction, this.lostNode).active = false;
            }
        } else {
            parent.active = false;
            this.showReadyIcon(direction, false, false);
        }
    },

    onRoomReadyInfoHandler: function (data) {
        this.gotoShowReady('down', data.detail);
        this.gotoShowReady('up', data.detail);
        this.gotoShowReady('left', data.detail);
        this.gotoShowReady('right', data.detail);
        //this.readyNode.active = true;
        //cc.log('this.headers.length : ' + this.headers.length);
    },

    gotoShowReady: function (direction, readyInfo) {
        var player = GameData.getPlayerByPos(direction);
        if (player == null) return;
        var uid = player.uid;
        //console.log('uid = '+ uid);
        var ready = true;
        if (readyInfo[uid] == undefined || readyInfo[uid] == 0) {
            ready = false;
        }
        this.showReadyIcon(direction, ready, !ready);

        if (this.lostInfo == null || this.lostInfo == undefined) {
            return;
        } else {
            for (var i = 0; i < this.lostInfo.length; i++) {
                if (uid == this.lostInfo[i]) {
                    this.showReadyIcon(direction, false, true);
                    cc.find('lost_' + direction, this.lostNode).active = true;
                }
            }
        }
        if (player.status == 2) {
            this.showReadyIcon(direction, false, false);
            cc.find('lost_' + direction, this.lostNode).active = true;
        }
    },

    showJoinerLost: function (data) {
        //var player = GameData.getPlayerByUid(data.detail.uid);
        //console.log('disconnect uid : ' + data.detail.uid);
        this.lostInfo.push(data.detail.uid);
        this.showHeaderDisconnect(data.detail.uid, true);
        this.showDisconnectInfo(data.detail, true);
        var nameStr = GameData.getPlayerByUid(data.detail.uid).name;
        //createMessageBox('玩家[' + nameStr + ']掉线了', function() {});
        createMoveMessage('玩家[' + nameStr + ']掉线了');
        if (GameData.player.uid == data.detail.uid) {
            this.isReconnect = true;
        }
    },

    showJoinerConnect: function (data) {
        cc.log('connect uid : ' + data.detail.uid);
        if (this.lostInfo == null || this.lostInfo == undefined) {
            return;
        } else {
            for (var i = 0; i < this.lostInfo.length; i++) {
                if (data.detail.uid == this.lostInfo[i]) {
                    this.lostInfo.splice(i, 1);
                }
            }
        }
        this.showDisconnectInfo(data.detail, false);
        this.showHeaderDisconnect(data.detail.uid, false);
    },

    showHeaderDisconnect: function (uid, show) {
        if (this.headers == null) {
            cc.log('this.headers null');
            return;
        }
        //cc.log('this.headers.length : ' + this.headers.length);
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            //cc.log(uid + "," + headerNode.getComponent('playerTemplate').uid);
            if (headerNode.getComponent('playerTemplate').uid == uid) {
                var disNode = cc.find('Disconnect', headerNode);
                disNode.active = show;
                return;
            }
        }
    },

    showDisconnectInfo: function (connectInfo, isDisconnect) {
        var index = GameData.getPlayerIndex(GameData.player.uid);

        if (GameData.room.opts.joinermax == 2) {
            if (index >= 0 && index < GameData.room.opts.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('up', index, connectInfo, isDisconnect);
            }
        } else if (GameData.room.opts.joinermax == 3) {
            if (index >= 0 && index < GameData.room.opts.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('up', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('left', index, connectInfo, isDisconnect);
            }
        } else {
            if (index >= 0 && index < GameData.room.opts.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('right', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('up', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('left', index, connectInfo, isDisconnect);
            }
        }

        // this.readyNode.active = true;
    },
    showDisconnectUI: function (direction, index, connectInfo, isDisconnect) {
        if (!GameData.joiners[index]) return;

        if (GameData.joiners[index].uid != connectInfo.uid) return;
        if (isDisconnect) {
            cc.find('ready_hand_' + direction, this.readyNode).active = false;
            cc.find('readying_' + direction, this.readyNode).active = false;
        } else {
            if (GameData.game.gameStart) {
                cc.find('ready_hand_' + direction, this.readyNode).active = false;
                cc.find('readying_' + direction, this.readyNode).active = false;
            } else {
                var isReadyUid = GameData.joiners[index].uid;
                if (connectInfo[isReadyUid] == undefined || connectInfo[isReadyUid] == 0) {
                    cc.find('ready_hand_' + direction, this.readyNode).active = true;
                    cc.find('readying_' + direction, this.readyNode).active = false;
                } else {
                    cc.find('ready_hand_' + direction, this.readyNode).active = false;
                    cc.find('readying_' + direction, this.readyNode).active = true;
                }
            }
        }
        cc.find('lost_' + direction, this.lostNode).active = isDisconnect;
    },

    onGameTurnHandler: function (data) {
        this.scheduleOnce(this.showTurnEffect, 0.1);
    },

    showTurnEffect: function () {
        var turnPlayer = profileHuaDian.getTurnByUid();
        this.gotoShowTurnEffect(turnPlayer);
    },

    gotoShowTurnEffect: function (uid) {
        if (this.headers == null) {
            cc.log('this.headers null');
            return;
        }
        //cc.log('this.headers.length : ' + this.headers.length);
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            //cc.log(uid + "," + headerNode.getComponent('playerTemplate').uid);
            var disNode = cc.find('liuguang', headerNode);
            disNode.active = headerNode.getComponent('playerTemplate').uid == uid ? true : false;
        }
    },

    setRoomNum: function () {
        cc.log("~~~~~~~~~~~设置房间号~~~~~~~~~~~~~")
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
        if (inCD(2000)) { return; }
        if (GameData.room.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            RoomHandler.quitRoom(GameData.room.id);
        }
    },

    wxInviteBtnClicked: function () {
        var title = "哈尔滨麻将 " + "房间号:" + GameData.room.id;
        if (GameData.room.opts.costType == 4) {
            title = "哈尔滨麻将 " + "房间号:" + GameData.room.id + "(代开)";
        }
        var des = this.getInviteStr();
        wxShareWeb(title, des);
    },

    getInviteStr: function () {
        var str1 = "玩法:";
        var inviteStr = getRuleStrCC(GameData.room.opts);
        if (GameData.room.opts.joinermax) { inviteStr += "," + GameData.joiners.length + "等" + (GameData.room.opts.joinermax - GameData.joiners.length); }

        var str2 = ",请您快速加入对局.";
        var des = str1 + inviteStr + str2;
        console.log('des = ' + des);
        return des;
    },

    onShareResult: function () {
        wxShareTimeline("哈尔滨麻将", "我在哈尔滨麻将等你!");
    },

    onShareFriend: function () {
        wxShareWeb("哈尔滨麻将", "我在哈尔滨麻将等你!");
    },

    onDeleteRoom: function () {
        if (inCD(2000)) { return; }
        createMessageBox('解散房间不扣房卡，是否确定解散？', function () { RoomHandler.deleteRoom(GameData.room.id); }, function () { });
    },

    onQuitRoom: function () {
        if (GameData.room.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            RoomHandler.quitRoom(GameData.room.id);
        }
    },

    onCreatorQuit: function () {
        GameData.player.roomid = undefined;
        if (GameData.room.creator != GameData.player.uid) {
            createMessageBox('房主已经解散房间', function () { cc.director.loadScene('home'); });
        }
        else {
            cc.director.loadScene('home');
        }
    },

    //复制房间号
    onCopyRoomInfo: function () {
        var roomId = GameData.room.id;
        if (roomId > 0) {
            var title = "哈尔滨麻将," + "房间号:" + GameData.room.id + ",";
            var des = this.getInviteStr();
            textClipboard(title + des);

            createMoveMessage("复制信息成功。");
        }
    },

    electricQuantity: function () {
        try {
            if (cc.sys.OS_ANDROID == cc.sys.os) {
                jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "electricQuantity", "()V");
            }
            else if (cc.sys.OS_IOS == cc.sys.os) {
                jsb.reflection.callStaticMethod("AppController", "electricQuantity");
            }
            this.schedule(this.electricQuantity, 60);
        }
        catch (e) {
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
        //cc.log("ms" + ms);
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
            var node = cc.find('WiFi-' + (i + 1), this.wifiNode);
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
        if (GameData.room.status == gameDefine.RoomState.READY) {
            this.readyNode.active = true;
        }else{
            this.readyNode.active = false;
        }
        this.showPlayers();
        //this.readyNode.active = !GameData.game.gameStart;
    },
    onGamePiaoHandler: function () {
        this.readyNode.active = false;
    },
    hasName: function (name, nameArry) {
        for (var i = 0; i < nameArry.length; i++) {
            var toName = nameArry[i];
            if (toName == name) return true;
        }
        return false;
    },
});
