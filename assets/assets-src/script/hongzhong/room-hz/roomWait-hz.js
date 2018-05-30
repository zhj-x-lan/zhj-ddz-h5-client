var gameDefine = require('gameDefine');
var RoomHandler = require('roomHandler');
var hongzhongData = require('hongzhongData');

cc.Class({
    extends: cc.Component,

    properties: {
        layerShare: cc.Node,

        timeLabel: cc.Label,
        roomNum: cc.Label,

        wifiNode: cc.Node,
        dianchiNode: cc.Node,

        playintrNode: cc.Node,

        deleteRoomBtn: cc.Node,
        quitRoomBtn: cc.Node,
        btnRule: cc.Button,

        uiPlayers: cc.Prefab
    },

    onLoad: function () {

        registEvent('onRoomInfo', this, this.onRoomInfoHandler);
        registEvent('onGameInfo', this, this.onGameInfoHandler);
        registEvent('onPrepareInfo', this, this.onRoomReadyInfoHandler);
        registEvent('onCreatorQuit', this, this.onCreatorQuit);
        registEvent('nativePower', this, this.onNativePowerHandler);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);

        MjHandler.getInstance().requestReady();

        this._curGameData = undefined;
        this.setCurGameData();

        this.handTimeLabel();
        this.updateTime();
        this.updataWifi();
        this.electricQuantity();

        //设置基本界面显示
        this.setUIBaseInfo();
        //添加头像
        this.addPlayers();
        //设置相关状态信息
        this.updatePlayersWithRoom();
        this.updatePlayersWithGame();
    },
    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.onRoomInfoHandler);
        unregistEvent('onGameInfo', this, this.onGameInfoHandler);
        unregistEvent('onPrepareInfo', this, this.onRoomReadyInfoHandler);
        unregistEvent('onCreatorQuit', this, this.onCreatorQuit);
        unregistEvent('nativePower', this, this.onNativePowerHandler);
        unregistEvent('yunwaUploaded', this, this.onYunwaUploaded);
    },

    onRoomInfoHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onRoomInfoSetData(data.detail);

        this.setCurGameData();
        this.updatePlayersWithRoom();
        this.setUIBaseInfo();
    },
    onGameInfoHandler: function(data){
        if(data == undefined || this._curGameData == undefined) {
            return;
        }
        this._curGameData.onGameInfoSetData(data.detail);

        this.updatePlayersWithGame();
    },
    onRoomReadyInfoHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onPrepareInfoSetData(data.detail);

        this.updatePlayersReady();
    },

    setCurGameData: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        switch (roomData.opts.gameType){
            case gameDefine.GameType.Game_Mj_HZ:{
                this._curGameData = hongzhongData;
            }break;
        }
    },

    addPlayers: function(){
        var uiPlayersNode = cc.instantiate(this.uiPlayers);
        uiPlayersNode.parent = this.layerShare;
        uiPlayersNode.name = 'uiPlayers';
    },
    updatePlayersWithRoom: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var scoreData = RoomHandler.getScoreData();
        var onLineData = RoomHandler.getOnLinesData();

        var uiPlayersNode = this.layerShare.getChildByName('uiPlayers');
        if(uiPlayersNode){
            var template = uiPlayersNode.getComponent('tablePlayersControl');

            template.showPlayers();
            template.setPlayerScoreData(scoreData);
            template.setPlayerOnLineData(onLineData);

            this.updatePlayersReady();
        }
    },
    updatePlayersWithGame: function(){
        if(this._curGameData == undefined){
            return;
        }
        var gameInfoData = this._curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var uiPlayersNode = this.layerShare.getChildByName('uiPlayers');
        if(uiPlayersNode){
            var template = uiPlayersNode.getComponent('tablePlayersControl');

            template.setPlayerZhuang(gameInfoData.zhuangUid);
            template.setPlayerTurn(gameInfoData.turn);
        }
    },
    updatePlayersReady: function(){
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var readyData = RoomHandler.getRoomReadyData();
        if(readyData == undefined){
            return;
        }
        var uiPlayersNode = this.layerShare.getChildByName('uiPlayers');
        if(uiPlayersNode){
            var template = uiPlayersNode.getComponent('tablePlayersControl');
            template.setRoomReadyData(roomData.status,readyData);
        }
    },
    setUIBaseInfo: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var isCreator = roomData.creator == GameData.player.uid;
        this.deleteRoomBtn.active = isCreator;
        //this.quitRoomBtn.active = !isCreator;

        this.showPlayIntroduce();
        this.setRoomNum();
    },

    onYunwaUploaded: function (data) {
        var soundurl = data.detail;
        WriteLog('soundurl ：' + soundurl);
        ChatHandler.getInstance().sendRecord(soundurl);
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
        this.showPlayIntroduce();
    },
    showPlayIntroduce: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        if (roomData.opts == undefined) {
            return;
        }
        var RuleStr = getRuleStrHongZhong(roomData.opts);

        var contentNode = cc.find('small/content', this.playintrNode);
        if(contentNode) {
            contentNode.getComponent(cc.Label).string = RuleStr;
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
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        if (roomData.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            RoomHandler.quitRoom(roomData.id);
        }
    },

    wxInviteBtnClicked: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var title = "红中麻将 " + "房间号:" + roomData.id;
        if (roomData.opts.costType == 4) {
            title = "红中麻将 " + "房间号:" + roomData.id + "(代开)";
        }
        var des = this.getInviteStr();
        cc.log("..wxInvite:"+des);
        wxShareWeb(title, des);
    },
    getInviteStr: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var str1 = "玩法:";
        var str2 = ",请您快速加入对局.";
        var playStr = '';
        if(roomData.opts){
            playStr = getRuleStrHongZhong(roomData.opts);
        }
        return str1 + playStr + str2;
    },
    onShareResult: function () {
        wxShareTimeline("红中麻将", "还等嘛!我在红中麻将等你!");
    },
    onShareFriend: function () {
        wxShareWeb("红中麻将", "还等嘛!我在红中麻将等你!");
    },
    onDeleteRoom: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        createMessageBox('解散房间不扣房卡，是否确定解散？', function () {
            RoomHandler.deleteRoom(roomData.id, 'close');
        }, function () {});
    },
    onQuitRoom: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        if (roomData.creator == GameData.player.uid) {
            cc.director.loadScene('home');
        } else {
            RoomHandler.quitRoom(roomData.id);
        }
    },
    onCreatorQuit: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        GameData.player.roomid = undefined;

        if (roomData.creator != GameData.player.uid) {
            createMessageBox('房主已经解散房间', function () {
                cc.director.loadScene('home');
            });
        } else {
            cc.director.loadScene('home');
        }
    },
    //复制房间号
    onCopyRoomInfo: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var roomId = roomData.id;
        if (roomId > 0) {
            var title = "红中麻将," + "房间号:" + roomData.id + ",";
            var des = this.getInviteStr();
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
        node.scaleX = percent.detail / 100;
    },
    updataWifi: function () {
        this.callBackForWifiUI();
        this.schedule(this.callBackForWifiUI, 5);
    },
    callBackForWifiUI: function () {
        var ms = GameNet.getInstance().getPingPong() / 1000.0;

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
    }
});