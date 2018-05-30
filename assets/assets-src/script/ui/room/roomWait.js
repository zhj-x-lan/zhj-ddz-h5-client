var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
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
        roomRule: cc.Node,
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

        this.showPlayers(this);
        registEvent('onRoomMsg', this, this.showPlayers);
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
        registEvent('onGameTurn', this, this.onGameTurnHandler);
        registEvent('onRoomReadyInfo', this, this.onRoomReadyInfoHandler);
        registEvent('onGameScore', this, this.onGameScoreHandler);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);


        MjHandler.getInstance().requestReady();

        this.handTimeLabel();
        this.updateTime();
        this.updataWifi();
        this.electricQuantity();
    },

    onEnable: function () {
        // var uid = GameData.game.turn > 0 ? GameData.game.turn : GameData.game.zhuangUid;
        // cc.log('GameData.game.turn : ' + GameData.game.turn + ' , GameData.game.zhuangUid : ' + GameData.game.zhuangUid);
        // this.onGameTurnHandler(uid);

        this.readyNode.active = !GameData.game.gameStart;
        if (GameData.game.onRoomReadyInfo.data) {
            sendEvent('onRoomReadyInfo', GameData.game.onRoomReadyInfo.data);
        }
    },

    onDestroy: function () {
        unregistEvent('onRoomMsg', this, this.showPlayers);
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
        unregistEvent('onGameTurn', this, this.onGameTurnHandler);
    },

    onGameScoreHandler: function () {
        var self = this;
        this.scheduleOnce(function () {
            self.readyNode.active = !GameData.game.gameStart;
        }, 2);
    },

    onNotDiscardHandler: function (data) {
        if (GameData.player.uid == data.detail.uid && GameData.game.turn == GameData.player.uid) {
            if (GameData.room.opts.disfeng == true) {
                //createMessageBox('请优先打单张风牌', function() {});
                createMoveMessage('请优先打单张风牌');
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
                playerTemplate.setCoin(score);
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
                        // var contentStrFontSize = chatLabel.fontSize;
                        // console.log("contentStrFontSize",contentStrFontSize);
                        // for(var i = 0 ; i<contentStr.length; i++){
                        //     var strindex = contentStr.charAt(i);
                        //     var p1 = /[0-9]/; var b1 = p1.test(strindex);//true,说明是数字
                        //     var p2 = /[A-Z]/; var b2 = p2.test(strindex);//true,说明是英文字母(大写)
                        //     var p3 = /[\u4E00-\u9FA5]/; var b3 = p3.test(strindex);//true,说明是汉子
                        //     var p4 = /[a-z]/; var b4 = p4.test(strindex);//true,说明是英文字母(小写)
                        //     var p5 =  /[~!@#\$%\^&\*\(\)_+\-=\[\]\{\}\\\|\'\";:,\<\.\>\/\?\s+]/; var b5 = p5.test(strindex);//true,说明是特殊字符


                        //     if(b1){
                        //          chatBg.width+= contentStrFontSize/2;
                        //     }else if(b2){
                        //         chatBg.width+= contentStrFontSize;
                        //     }else if (b3){
                        //         chatBg.width+= contentStrFontSize;
                        //     }else if(b4){
                        //         chatBg.width+= contentStrFontSize/2;
                        //     }
                        //     else if(b5){
                        //         chatBg.width+= contentStrFontSize/2;
                        //     }
                        //     console.log("chatBg.width",chatBg.width);
                        // }

                        chatBg.width = 20 + contentStr.length * 24;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                    } else if (type == 'fast') {
                        var soundKey = data.detail.msg.data.sound;
                        var content = data.detail.msg.data.content;
                        var chatBg = cc.find('word/bg', chatNode);
                        var chatLabel = cc.find('word/Label', chatNode).getComponent(cc.Label);
                        var contentStr = getShortStr(content, 20);
                        chatBg.width = contentStr.length * 30;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                        soundMngr.instance.playAudioChat(soundKey, this.playerSex);
                    } else if (type == 'emo') {
                        var animationName = data.detail.msg.data;
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
        cc.log('showReadyIcon:' + direction + ' ' + showHand + ' ' + showReading);
    },

    showPlayers: function () {
        this.headers = [];

        this.showPlayer('down', this.play_down_player);
        this.showPlayer('right', this.play_right_player);
        this.showPlayer('up', this.play_up_player);
        this.showPlayer('left', this.play_left_player);
        this.roomRule.getComponent('cc.Label').string = getRoomRuleStr(GameData.room.opts);
        this.showPlayIntroduce(this.playIntrSize);
        this.setRoomNum();

        var isCreator = GameData.room.creator == GameData.player.uid;
        this.deleteRoomBtn.active = isCreator;
        //this.quitRoomBtn.active = !isCreator;

        if (GameData.room.opts) {
            if (GameData.room.opts.roundRule >= 4) {
                this.quanNode.active = true;
                this.juNode.active = false;
            } else {
                this.quanNode.active = false;
                this.juNode.active = true;
            }
        }

    },

    ruleClick: function () {
        if (this.playintrNode.active == true) {
            //console.log("2222222222222222222222");
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

    showPlayIntroduce: function (size) {
        if (!GameData.room.opts) return;
        var playStr = getRoomRuleStr(GameData.room.opts);
        //var target = size == 'small' ? 'big' : 'small';

        // cc.find(target,this.playintrNode).active = false;
        // cc.find(size,this.playintrNode).active = true;
        var contentNode = cc.find(size + '/content', this.playintrNode);
        cc.log('size : ' + size + 'contentNode : ' + contentNode);
        var label = contentNode.getComponent(cc.Label);
        // if(size == 'small')
        // {
        //     if(playStr.length > 20)
        //     {
        //         playStr = playStr.substr(0,20) + '...';
        //     }
        // 
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
                if (GameData.players[player.uid]) {
                    playerNode.getComponent('playerTemplate').setGold(GameData.players[player.uid].coin);
                }
            } else {
                var score = GameData.allScores[player.uid] == undefined ? 0 : GameData.allScores[player.uid];
                playerNode.getComponent('playerTemplate').setCoin(score);
            }

            //playerNode.getComponent('playerTemplate').enableHeadBtn(false);
            var zhuang = (GameData.game.zhuangUid == player.uid);
            cc.log('showPlayer uid:' + player.uid + ' zhuang:' + GameData.game.zhuangUid);
            playerNode.getComponent('playerTemplate').showZhuang(zhuang);
            var num = GameData.game.zhuangNum[player.uid];
            playerNode.getComponent('playerTemplate').showZhuangNum(zhuang, num);
            //playerNode.scaleX = 0.7;
            //playerNode.scaleY = 0.7;
            parent.addChild(playerNode);
            parent.active = true;
            this.headers.push(playerNode);
            this.showReadyIcon(direction, true, false);
            var disNode = cc.find('Disconnect', playerNode);
            disNode.active = player.status == 2 ? true : false;
            if (player.status == 2) {
                this.showReadyIcon(direction, false, false);
                cc.find('lost_' + direction, this.lostNode).active = true;
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
                    this.showReadyIcon(direction, false, false);
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
        //var pos = GameData.tablePos[data.detail.uid];
        //cc.find('lost_' + pos,this.lostNode).active = true;   
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
        //var pos = GameData.tablePos[data.detail.uid];
        //cc.find('lost_' + pos,this.lostNode).active = false;  
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

        if (GameData.room.joinermax == 2) {
            if (index >= 0 && index < GameData.room.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('up', index, connectInfo, isDisconnect);
            }
        } else if (GameData.room.joinermax == 3) {
            if (index >= 0 && index < GameData.room.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('up', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('left', index, connectInfo, isDisconnect);
            }
        } else {
            if (index >= 0 && index < GameData.room.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('right', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('up', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.joinermax || (index = 0) >= 0) {
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
                    cc.find('ready_hand_' + direction, this.readyNode).active = false;
                    cc.find('readying_' + direction, this.readyNode).active = true;
                } else {
                    cc.find('ready_hand_' + direction, this.readyNode).active = true;
                    cc.find('readying_' + direction, this.readyNode).active = false;
                }
            }
        }
        cc.find('lost_' + direction, this.lostNode).active = isDisconnect;
    },

    onGameTurnHandler: function (data) {
        this.scheduleOnce(this.showTurnEffect, 0.1);
    },

    showTurnEffect: function () {
        this.gotoShowTurnEffect(GameData.game.turn);
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
            RoomHandler.quitRoom(GameData.room.id);
        }
    },

    wxInviteBtnClicked: function () {
        var title = "天津攒局麻将 " + "房间号:" + GameData.room.id;
        if (GameData.room.opts.costType == 4) {
            title = "天津攒局麻将 " + "房间号:" + GameData.room.id + "(代开)";
        }
        var des = this.getInviteStr();
        WriteLog('分享内容：'+title+des);
        wxShareWeb(title, des);
    },

    getInviteStr: function () {
        var gameTypeStr = '';
        var limitStr = '';
        var str1 = "玩法:";

        if(GameData.room.opts.currencyType == gameDefine.currencyType.Currency_Coin){
            gameTypeStr = '金币场 ';

            var serverConfig = configMgr.getServerConfig();
            if(serverConfig && serverConfig.roomCoin){
                var spendData = serverConfig.roomCoin[gameDefine.GameType.Game_Mj_Tianjin];
                if(spendData){
                    var index = GameData.room.opts.roundRule -1;
                    if(spendData[index]){
                        var cost = spendData[index].enter;
                        var final = cost[GameData.room.opts.joinermax];
                        if(final){
                            limitStr = '进入条件：'+final[GameData.room.opts.scorelv];
                        }
                    }
                }
            }
        }

        var playStr = getRoomRuleStr(GameData.room.opts);

        var str2 = ",请您快速加入对局.";
        var des = gameTypeStr + limitStr + str1 + playStr + str2;
        return des;
    },

    onShareResult: function () {
        wxShareTimeline("天津攒局麻将", "还等嘛!我在天津攒局麻将等你!");
    },

    onShareFriend: function () {
        wxShareWeb("天津攒局麻将", "还等嘛!我在天津攒局麻将等你!");
    },

    onDeleteRoom: function () {
        createMessageBox('解散房间不扣房卡，是否确定解散？', function () {
            RoomHandler.deleteRoom(GameData.room.id, 'close');
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
        GameData.player.roomid = undefined;
        if (GameData.room.creator != GameData.player.uid) {
            createMessageBox('房主已经解散房间', function () {
                cc.director.loadScene('home');
            });
        } else {
            cc.director.loadScene('home');
        }
    },

    //复制房间号
    onCopyRoomInfo: function () {
        var roomId = GameData.room.id;
        if (roomId > 0) {
            var title = "天津攒局麻将," + "房间号:" + GameData.room.id + ",";
            var des = this.getInviteStr();
            WriteLog('复制内容：'+title+des);
            textClipboard(title + des);
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
            jsclient.native.HelloOC("electricQuantity throw: " + JSON.stringify(e));
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
        this.readyNode.active = !GameData.game.gameStart;
    },

    hasName: function (name, nameArry) {
        for (var i = 0; i < nameArry.length; i++) {
            var toName = nameArry[i];
            if (toName == name) return true;
        }
        return false;
    },
});