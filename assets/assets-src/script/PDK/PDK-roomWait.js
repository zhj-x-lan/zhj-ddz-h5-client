var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var PDKHandler = require('PDK-handler');
cc.Class({
    extends: cc.Component,

    properties: {
        timeLabel: cc.Label,
        roomNum: cc.Label,
        play_down_player: cc.Node,
        play_left_player: cc.Node,
        play_right_player: cc.Node,
        readyNode: cc.Node,
        lostNode: cc.Node,
        deleteRoomBtn: cc.Node,
        quitRoomBtn: cc.Node,
        wifiNode: cc.Node,
        playintrNode: cc.Node,
        playerTemplate: cc.Prefab,
        dianchiNode: cc.Node,
        btnRule: cc.Button,
        lostInfo: [],
        readyBtn: cc.Node,
        rotateCard: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        WriteLog('TJDDZ-roomWait onLoad');
        this.playIntrSize = 'small';
        this.playerSex = 1;
        this.headers = new Array();
        this.RuleBtnBool = false;
        this.isReconnect = false;
        this.showPlayers(this);
        registEvent('onRoomInfo', this, this.showPlayers);
        registEvent('pdk-onReady', this, this.onReady);
        registEvent('onCreatorQuit', this, this.onCreatorQuit);
        registEvent('rotateAction', this, this.rotateAction);
        registEvent('initTableNode', this, this.showPlayers);
        registEvent('onPrepareInfo', this, this.onPrepareInfo);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);
        registEvent('onRoomChat', this, this.onRoomChatHandler);
        registEvent('nativePower', this, this.onNativePowerHandler);
        registEvent('pdk-onGameAllScore', this, this.onGameAllScoreHandler);
        registEvent('pdk-onGameStart', this, this.onGameStartHandler);
        registEvent('onRoomReadyInfo', this, this.onRoomReadyInfoHandler);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);
        registEvent('HideReadyNode', this, this.HideReadyNode);
        registEvent('AnimationDelayTime', this, this.onGameScoreHandler);
        registEvent('pdk-showKicking', this, this.showKicking);

        this.handTimeLabel();
        this.updateTime();
        this.updataWifi();
        this.electricQuantity();
        // this.connectRecurrence();
        PDKHandler.requestReady();
    },

    onEnable: function () {
        this.readyNode.active = !GameDataPDK.game.gameStart;
        if (GameData.game.onRoomReadyInfo.data) {
            // sendEvent('onRoomReadyInfo', GameData.game.onRoomReadyInfo.data);
        }
    },

    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.showPlayers);
        unregistEvent('pdk-onReady', this, this.onReady);
        unregistEvent('onCreatorQuit', this, this.onCreatorQuit);
        unregistEvent('rotateAction', this, this.rotateAction);
        unregistEvent('initTableNode', this, this.showPlayers);
        unregistEvent('onPrepareInfo', this, this.onPrepareInfo);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
        unregistEvent('onRoomChat', this, this.onRoomChatHandler);
        unregistEvent('nativePower', this, this.onNativePowerHandler);
        unregistEvent('pdk-onGameAllScore', this, this.onGameAllScoreHandler);
        unregistEvent('pdk-onGameStart', this, this.onGameStartHandler);
        unregistEvent('onRoomReadyInfo', this, this.onRoomReadyInfoHandler);
        unregistEvent('pdk-onGameScore', this, this.onGameScoreHandler);
        unregistEvent('yunwaUploaded', this, this.onYunwaUploaded)
        unregistEvent('HideReadyNode', this, this.HideReadyNode);
        unregistEvent('AnimationDelayTime', this, this.onGameScoreHandler);
        unregistEvent('pdk-showKicking', this, this.showKicking);
    },

    onReady: function() {
        GameDataPDK.clearObject(GameDataPDK.kicking);
        sendEvent('initTableNode');
        PDKHandler.getInstance().requestReady();
    },

    onGameScoreHandler: function (data) {
        var AnimationDelayTime = data.detail;
        var self = this;
        this.scheduleOnce(function () {
            self.readyNode.active = true;
        }, AnimationDelayTime);
    },
    HideReadyNode: function () {
        this.readyNode.active = false;
    },
    onGameAllScoreHandler: function (data) {
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            var playerTemplate = headerNode.getComponent('DDZ-playerTemplate');
            var uid = playerTemplate.uid;
            var score = GameDataPDK.allScores[uid] == undefined ? 0 : GameDataPDK.allScores[uid];

            playerTemplate.setCoin(score, 1);
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
            if (headerNode.getComponent('DDZ-playerTemplate').uid == uid) {
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
                    } else if (type == 'fast') {
                        var soundKey = data.detail.msg.data.sound;
                        var content = data.detail.msg.data.content;
                        var chatBg = cc.find('word/bg', chatNode);
                        var chatLabel = cc.find('word/Label', chatNode).getComponent(cc.Label);
                        var contentStr = getShortStr(content, 10);
                        chatBg.width = contentStr.length * 30;
                        wordNode.getComponent('HideComponent').show(3);
                        chatLabel.string = contentStr;
                        soundMngr.instance.playAudioPokerChat(soundKey, this.playerSex);

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

    rotateAction: function() {
        var pos = GameDataPDK.getPosByUid(GameDataPDK.game.zhuangUid);
        if (pos == 'left')
        {
            
            this.runRotateCard(this.play_left_player);
        }
        else if (pos == 'right')
        {
            
            this.runRotateCard(this.play_right_player);
        }
        else if (pos == 'down')
        {
            this.rotateCard.active = true;
            var moveTo = cc.moveTo(1, cc.p(0, -254));
            var that = this;
            var callFunc = cc.callFunc(function(){
                that.easeCubicAction(that.rotateCard);
            }, this);
            var delayTime = cc.delayTime(1.5);
            var seq = cc.sequence(delayTime, moveTo, callFunc);
            this.rotateCard.runAction(seq);
        }
    },

    runRotateCard: function(parent) {
        this.rotateCard.active = true;
        var playerPosition = parent.getPosition();
        var rotateTo = cc.rotateTo(1, 1080);
        var scaleTo = cc.scaleTo(1, 0.3);
        var moveTo = cc.moveTo(1, cc.p(playerPosition.x, playerPosition.y));
        var spawnAction = cc.spawn(rotateTo, scaleTo, moveTo);
        
        var that = this;
        var callFunc = cc.callFunc(function(){
            that.rotateCard.active = false;
            that.rotateCard.x = 0;
            that.rotateCard.y = 0;
            that.rotateCard.scaleX = 1;
            that.rotateCard.scaleY = 1;
            sendEvent('showFirstCard');
            sendEvent('runFlipAction');
        }, this);
        var delayTime = cc.delayTime(1.5);
        var seq = cc.sequence(delayTime, spawnAction, callFunc);
        this.rotateCard.runAction(seq);
    },

    scaleRotateCard: function(dt) {
        this.scaleEffectsOfNode(this.rotateCard, 1.3, 1.3, 1, 1, 0.4, function(){});
        if (dt >= 1)
        {
            this.unschedule(this.scaleRotateCard);
        }
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
                node.x = 0;
                node.y = 0;
                node.opacity = 255;
                that.unschedule(timerCall);
                sendEvent('runFlipAction');
            }
        }
        this.schedule(timerCall, 0.1);
    },

    showReadyIcon: function (direction, showHand, showReading) {
        cc.find('ready_hand_' + direction, this.readyNode).active = showHand;
        cc.find('readying_' + direction, this.readyNode).active = showReading;
    },

    hideAllReadyStatus: function() {
        cc.find('ready_hand_' + 'left', this.readyNode).active = false;
        cc.find('readying_' + 'left', this.readyNode).active = false;
        cc.find('ready_hand_' + 'right', this.readyNode).active = false;
        cc.find('readying_' + 'right', this.readyNode).active = false;
        cc.find('ready_hand_' + 'down', this.readyNode).active = false;
        cc.find('readying_' + 'down', this.readyNode).active = false;
    },

    onPrepareInfo: function(data) {
        this.hideAllReadyStatus();
        this.readyNode.active = true;
        this.hideTiChuai();
        for (var key in GameDataPDK.game.onRoomReadyInfo)
        {
            if (GameDataPDK.game.onRoomReadyInfo[key] == true)
            {
                var tablePos = GameDataPDK.getPosByUid(key);
                this.showReadyIcon(tablePos, true, false);
            }
        }
        this.onRoomReadyInfoHandler(data);
    },

    showPlayers: function () {
        WriteLog('showPlayers');
        this.headers = [];
        var posList = ['down','right', 'left'];
        var play_layer_list = [this.play_down_player, this.play_right_player, this.play_left_player];
        play_layer_list.push(this.play_down_player);
        play_layer_list.push(this.play_right_player);
        play_layer_list.push(this.play_left_player);

        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            this.showPlayer(posList[index], play_layer_list[index]);
        }

        this.showPlayIntroduce(this.playIntrSize);
        this.setRoomNum();

        var isCreator = GameData.room.creator == GameData.player.uid;
        this.deleteRoomBtn.active = isCreator;
        //this.quitRoomBtn.active = !isCreator;
        if (!isCreator) {
            this.quitRoomBtn.x = 6;
        } else {
            this.quitRoomBtn.x = 107;
        }
        this.connectRecurrence();
    },
    ruleClick: function () {
        if (this.playintrNode.active == true) {
            return;
        }
        this.playintrNode.active = true;
        this.playintrNode.runAction(cc.sequence(
            cc.moveTo(0.5, cc.p(30, 334)),
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
        // if(!GameData.room.opts)return;
        // var playStr = "德莱联盟";
        // var contentNode = cc.find(size + '/content',this.playintrNode);
        // cc.log('size : ' + size + 'contentNode : ' + contentNode);
        // var label = contentNode.getComponent(cc.Label);
        // playStr += ",人数:" + GameData.room.opts.joinermax + "人";
        // label.string = playStr;
    },

    showPlayer: function (direction, parent) {
        WriteLog('showPlayer');
        parent.removeAllChildren();
        var player = GameData.getPlayerByPos(direction);
        if (player != null) { //Disconnect
            var playerNode = cc.instantiate(this.playerTemplate);
            cc.log('playerNode:' , playerNode);
            playerNode.getComponent('DDZ-playerTemplate').setPlayer(player);
            playerNode.getComponent('DDZ-playerTemplate').setName(player.name);
            playerNode.getComponent('DDZ-playerTemplate').setHeadIcon(player.headimgurl);
            playerNode.getComponent('DDZ-playerTemplate').setNamePositionByDir(direction);
            var score = 0;
            if (GameDataPDK.roomsummaryData.score != undefined) {
                score = GameDataPDK.roomsummaryData.score[player.uid] == undefined ? 0 : GameDataPDK.roomsummaryData.score[player.uid];
            }
            playerNode.getComponent('DDZ-playerTemplate').setCoin(score, 1);
            playerNode.getComponent('DDZ-playerTemplate').setIsPlayerIcon(false);
            playerNode.getComponent('DDZ-playerTemplate').showPlayerIdentity(false, 0);
            parent.addChild(playerNode);
            parent.active = true;
            this.headers.push(playerNode);

            //设置 tag 值
            playerNode.setTag(player.uid);

            // this.showReadyIcon(direction, true, false);
            if (player.status == 2) {
                this.showReadyIcon(direction, false, false);
            }
            var isOnLine = RoomHandler.isPlayerOnline(player.uid);
            var disHanderNode = cc.find('Disconnect', playerNode);
            var disNode = cc.find('lost_' + direction, this.lostNode);
            disNode.active = !isOnLine;
            disHanderNode.active = !isOnLine;
        } else {
            parent.active = false;
            this.showReadyIcon(direction, false, false);
        }
    },

    hideTiChuai: function() {
        for (var index = 0; index < this.headers.length; index++)
        {
            var tiChuaiNode = cc.find('tiChuaiNode', this.headers[index]);
            var tiIcon = cc.find('tiIcon', tiChuaiNode);
            var chuaiIcon = cc.find('chuaiIcon', tiChuaiNode);
            tiIcon.active = false;
            chuaiIcon.active = false;
        }
    },
    showPlayerTiChuai: function(parent, dizhuUid, uid) {
        var playerNode = parent.getChildByName('TablePlayerTemplate');
        var tiChuaiNode = cc.find('tiChuaiNode', playerNode);
        if (GameDataPDK.kicking.kicking[uid] == 1 && uid != dizhuUid)
        {
            var tiIcon = cc.find('tiIcon', tiChuaiNode);
            tiIcon.active = true;
            if (parent == this.play_right_player)
            {
                tiIcon.x = -67;
            }
        }
        else if (GameDataPDK.kicking.kicking[uid] == 1 && uid == dizhuUid)
        {
            var chuaiIcon = cc.find('chuaiIcon', tiChuaiNode);
            chuaiIcon.active = true;
            if (parent == this.play_right_player)
            {
                chuaiIcon.x = -67;
            }
        }
    },
    //TablePlayerTemplate
    showKicking: function() {
        for (var key in GameDataPDK.kicking.kicking)
        {
            var pos = GameDataPDK.getPosByUid(key);
            if (pos == 'down')
            {
                this.showPlayerTiChuai(this.play_down_player, GameDataPDK.kicking.dizhu, key);
            }
            else if (pos == 'right')
            {
                this.showPlayerTiChuai(this.play_right_player, GameDataPDK.kicking.dizhu, key);
            }
            if (pos == 'left')
            {
                this.showPlayerTiChuai(this.play_left_player, GameDataPDK.kicking.dizhu, key);
            }
        }
    },

    connectRecurrence: function() {
        this.showKicking();
        // this.onGameAllScoreHandler();
    },

    onRoomReadyInfoHandler: function (data) {
        var posList = ['down', 'right', 'left'];
        for (var index = 0; index < GameData.room.opts.joinermax; index++)
        {
            this.gotoShowReady(posList[index], data.detail);
        }
    },

    gotoShowReady: function (direction, readyInfo) {
        var player = GameData.getPlayerByPos(direction);
        if (player == null) return;
        var uid = player.uid;
        var ready = true;
        if (readyInfo[uid] == undefined || readyInfo[uid] == 0 || readyInfo[uid] == false) {
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
        this.lostInfo.push(data.detail.uid);
        this.showHeaderDisconnect(data.detail.uid, true);
        this.showDisconnectInfo(data.detail, true);
        var nameStr = GameData.getPlayerByUid(data.detail.uid).name;
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
        // this.showHeaderDisconnect(data.detail.uid, false);
        // this.connectRecurrence();
        this.showPlayers();
    },

    showHeaderDisconnect: function (uid, show) {
        if (this.headers == null) {
            cc.log('this.headers null');
            return;
        }
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            if (headerNode.getComponent('DDZ-playerTemplate').uid == uid) {
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
                this.showDisconnectUI('right', index, connectInfo, isDisconnect);
            }
        } else if (GameData.room.opts.joinermax == 3) {
            if (index >= 0 && index < GameData.room.opts.joinermax) {
                this.showDisconnectUI('down', index, connectInfo, isDisconnect);
            }
            if (++index < GameData.room.opts.joinermax || (index = 0) >= 0) {
                this.showDisconnectUI('right', index, connectInfo, isDisconnect);
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
    },
    showDisconnectUI: function (direction, index, connectInfo, isDisconnect) {
        if (!GameData.joiners[index]) return;

        if (GameData.joiners[index].uid != connectInfo.uid) return;
        if (isDisconnect) {
            cc.find('ready_hand_' + direction, this.readyNode).active = false;
            cc.find('readying_' + direction, this.readyNode).active = false;
        } else {
            if (GameDataPDK.game.gameStart) {
                cc.find('ready_hand_' + direction, this.readyNode).active = false;
                cc.find('readying_' + direction, this.readyNode).active = false;
            } else {
                var isReadyUid = GameData.joiners[index].uid;
                if (connectInfo.uid != isReadyUid || connectInfo.uid == 0) {
                    cc.find('ready_hand_' + direction, this.readyNode).active = false;
                    cc.find('readying_' + direction, this.readyNode).active = true;
                } else {
                    cc.find('ready_hand_' + direction, this.readyNode).active = true;
                    cc.find('readying_' + direction, this.readyNode).active = false;
                }
            }
        }
        cc.log('direction :' + direction + isDisconnect);
        cc.find('lost_' + direction, this.lostNode).active = isDisconnect;
    },
    setRoomNum: function () {
        cc.log('setRoomNum: ', JSON.stringify(GameData.room));
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
            PDKHandler.quitMjRoom(GameData.room.id);
        }
    },

    wxInviteBtnClicked: function () {
        var title = "跑得快 " + "房间号:" + GameData.room.id;
        var des = this.getInviteStr();
        wxShareWeb(title, des);
    },

    getInviteStr: function () {
        var str = "玩法:";
        var costTypeArr = ['房主付,','AA制,','赢家付,','代开房付费,',''];
        str += costTypeArr[GameData.room.opts.costType - 1];


        if (GameData.room.opts.passFlag == 1)
        {
            str += '必须管,';
        }
        else if (GameData.room.opts.passFlag == 2)
        {
            str += '可不管,';
        }
        if (GameData.room.opts.zhuangType == true)
        {
            str += '红桃3先出,';
        }
        str += '局数:' + GameData.room.opts.roundMax + ',';
        str += '人数:' + GameData.room.opts.joinermax;
        var str2 = ",请您快速加入对局.";
        var des = str + str2;
        
        return des;
    },

    onShareResult: function () {
        wxShareTimeline("跑得快", "我在跑得快等你!");
    },

    onShareFriend: function () {
        wxShareWeb("跑得快", "我在跑得快等你!");
    },

    onDeleteRoom: function () {
        createMessageBox('解散房间不扣房卡，是否确定解散？', function () {
            RoomHandler.deleteRoom(GameData.room.id);
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
        // var roomId = GameData.room.id;
        // if (roomId > 0) {
        //     var title = "石狮麻将,"+"房间号:"+GameData.room.id+",";
        //     var des = this.getInviteStr();
        //     textClipboard(title+des);
        // }
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
        this.readyNode.active = !GameDataPDK.game.gameStart;
        // this.hideTiChuai();
        this.hideAllReadyStatus();
    },

    hasName: function (name, nameArry) {
        for (var i = 0; i < nameArry.length; i++) {
            var toName = nameArry[i];
            if (toName == name) return true;
        }
        return false;
    },
    // readyBtnClick :function(){
    //     cc.log('准备');
    //     var self = this;
    //      GameNet.getInstance().request("room.mjHandler.setPrepare", {num: 1}, function(rtn) {
    //       if (rtn.result == ZJHCode.Success) {
    //         self.readyBtn.active = false;
    //       }
    //     });
    // },
    // ShowReadyBtn:function(data){
    //     cc.log(data.detail);
    //     cc.log('111111');
    //     if(Object.keys(data.detail).length == 0){
    //        this.readyBtn.active = true;
    //        return; 
    //     }

    //     for(var key in data.detail){
    //         cc.log('key '+key);
    //         if(parseInt(key) == GameData.player.uid){
    //             this.readyBtn.active = false;
    //         }
    //     }
    // }
});