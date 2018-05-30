var gameDefine = require('gameDefine');
var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        play_up_player: cc.Node,
        play_down_player: cc.Node,
        play_left_player: cc.Node,
        play_right_player: cc.Node,

        readyNode: cc.Node,
        lostNode: cc.Node,

        playerTemplate: cc.Prefab
    },

    onLoad: function () {
        registEvent('onRoomChat', this, this.onRoomChatHandler);

        this.headers = [];

        this.zhuangUid = 0;     //庄家
        this.turnUid = 0;       //该谁出牌
        this.roomState = -1;    //房间状态
        this.readyData = {};    //准备信息
        this.scoreData = {};    //分数信息
        this.onLineData = {};   //在线信息

        //设置头像
        this.showPlayers();
        //设置相关状态标志
        this.updatePlayerZhuang();
        this.updatePlayerReady();
        this.updatePlayerTurn();
        this.updatePlayerScore();
        this.updatePlayerOnLine();
    },
    onEnable: function () {
    },
    onDestroy: function () {
    },

    setPlayerZhuang: function(uid){
        this.zhuangUid = uid;
        this.updatePlayerZhuang();
    },
    setRoomReadyData: function(state,data){
        this.roomState = state;
        this.readyData = data;
        this.updatePlayerReady();
    },
    setPlayerTurn: function(uid){
        this.turnUid = uid;
        this.updatePlayerTurn();
    },
    setPlayerScoreData: function(data){
        if(data == undefined){
            return;
        }
        this.scoreData = data;
        this.updatePlayerScore();
    },
    setPlayerOnLineData: function(data){
        if(data == undefined){
            return;
        }
        this.onLineData = data;
        this.updatePlayerOnLine();
    },

    showPlayers: function () {
        //清空头像存储数组
        this.headers = [];

        this.showPlayer('down', this.play_down_player);
        this.showPlayer('right', this.play_right_player);
        this.showPlayer('up', this.play_up_player);
        this.showPlayer('left', this.play_left_player);
    },
    showPlayer: function (direction, parent) {

        var player = GameData.getPlayerByPos(direction);
        if (player != null) {

            var playerNode = parent.getChildByName('playerNode');
            if(playerNode == undefined){
                playerNode = cc.instantiate(this.playerTemplate);
                playerNode.name = "playerNode";
                playerNode.parent = parent;
            }
            parent.active = true;

            playerNode.getComponent('playerTemplate').setPlayer(player);
            playerNode.getComponent('playerTemplate').setName(player.name);
            playerNode.getComponent('playerTemplate').setHeadIcon(player.headimgurl);

            this.headers.push(playerNode);
        } else {
            parent.active = false;
        }
    },
    updatePlayerZhuang: function(){
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            if(headerNode){
                var playerTemplate = headerNode.getComponent('playerTemplate');
                var zhuangShow = this.zhuangUid == playerTemplate.uid ? true : false;
                playerTemplate.showZhuang(zhuangShow);
            }
        }
    },
    updatePlayerTurn: function(){
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            if(headerNode){
                var uid = headerNode.getComponent('playerTemplate').uid;
                var disNode = cc.find('liuguang', headerNode);
                if(disNode){
                    disNode.active = this.turnUid == uid ? true : false;
                }
            }
        }
    },
    updatePlayerScore: function(){
        for (var i = 0; i < this.headers.length; i++) {
            var headerNode = this.headers[i];
            if(headerNode){
                var uid = headerNode.getComponent('playerTemplate').uid;
                var score = this.scoreData[uid] == undefined ? 0 : this.scoreData[uid];
                headerNode.getComponent('playerTemplate').setCoin(score);
            }
        }
    },
    updatePlayerReady: function(){
        for (var i = 0; i < this.headers.length; i++) {
            var ready1 = false,
                ready2 = false;

            var headerNode = this.headers[i];
            if(headerNode){
                var playerTemplate = headerNode.getComponent('playerTemplate');
                if(this.roomState >= 0 && this.roomState < gameDefine.RoomState.GAMEING){
                    if(this.readyData[playerTemplate.uid] == true){
                        ready2 = true;
                    } else {
                        ready1 = true;
                    }
                }
            }
            var direction = GameData.getPlayerPosByUid(playerTemplate.uid);
            this.showReadyIcon(direction, ready2, ready1);
            cc.log("...ready:"+direction, ready2, ready1);
        }
    },
    updatePlayerOnLine: function(){
        for (var i = 0; i < this.headers.length; i++) {
            var onLine = false;

            var headerNode = this.headers[i];
            if(headerNode){
                var playerTemplate = headerNode.getComponent('playerTemplate');
                onLine = RoomHandler.isPlayerOnline(playerTemplate.uid);
                playerTemplate.setIsOnline(onLine);
            }
            var direction = GameData.getPlayerPosByUid(playerTemplate.uid);
            this.showLostIcon(direction, onLine);
        }
    },
    showReadyIcon: function (direction, showHand, showReading) {
        var readyHand = cc.find('ready_hand_' + direction, this.readyNode);
        if(readyHand){
            readyHand.active = showHand;
        }
        var readying = cc.find('readying_' + direction, this.readyNode);
        if(readying){
            readying.active = showReading;
        }
    },
    showLostIcon: function(direction, online){
        var lostNode = cc.find('lost_' + direction, this.lostNode);
        if(lostNode){
            lostNode.active = !online;
        }
    },

    onRoomChatHandler: function (data) {

        var uid = data.detail.uid;
        var type = data.detail.msg.type;

        for (var i = 0; i < this.headers.length; i++) {

            var headerNode = this.headers[i];
            if (headerNode.getComponent('playerTemplate').uid == uid) {

                var direction = GameData.tablePos[uid];
                var content;

                var chatNode = cc.find('chat_' + direction, headerNode);
                if (chatNode != null) {

                    var wordNode = cc.find('word', chatNode);
                    var emoNode = cc.find('emo', chatNode);
                    var yuyinNode = cc.find('yuyinNode', chatNode);
                    var chatBg = cc.find('word/bg', chatNode);
                    var chatLabel = cc.find('word/Label', chatNode).getComponent(cc.Label);

                    if (type == 'word') {
                        content = data.detail.msg.data;
                        chatLabel.string = content;
                        chatBg.width = 20 + content.length * 24;

                        wordNode.getComponent('HideComponent').show(3);
                    } else if (type == 'fast') {
                        var soundKey = data.detail.msg.data.sound;
                        content = data.detail.msg.data.content;

                        var contentStr = getShortStr(content, 20);
                        chatLabel.string = contentStr;
                        chatBg.width = contentStr.length * 30;

                        var playerSex = GameData.getPlayerSexByUid(uid);
                        soundMngr.instance.playAudioChat(soundKey, playerSex);

                        wordNode.getComponent('HideComponent').show(3);
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
    }
});