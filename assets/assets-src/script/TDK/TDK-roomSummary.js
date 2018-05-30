var RoomHandler = require('roomHandler');
var tdk_roomData = require('tdkRoomData');
cc.Class({
    extends: cc.Component,
    properties: {
        playerRender: cc.Prefab, // 总结算玩家的模板
        content: cc.Node, // 玩家列表
        panel: cc.Node
    },

    onLoad: function () {

        this._roomInfo = RoomHandler;

        this.handlerMsg();
        registEvent('onGameAllResult', this, this.initUI);
        if (Object.keys(tdk_roomData.resultData).length > 0) {
            this.initUI();
        }
    },
    oonEnable: function(){
        unregistEvent('onGameAllResult', this, this.initUI);
    },
    // 
    initUI: function () {
        this.showTime(this._roomInfo.room.createtime, this._roomInfo.room.id);
        // 显示玩家列表
        this.content.removeAllChildren();
        for (var i = 0; i < 6; i++) {
            var playerRender = cc.instantiate(this.playerRender);
            playerRender.x = 6+i*212;
            this.content.addChild(playerRender);
        }
        var child = this.content.children;
        for (var i = 0; i < child.length; i++) {
            var playsLen = this._roomInfo.players.length;
            if (i < playsLen) {
                var playerRender = child[i];
                playerRender.getComponent("tdk-ResultRender").initData(this._roomInfo.players[i]);
                playerRender.getComponent("tdk-ResultRender").getActiveNode().active = true;

            }else{
                var playerRender = child[i];
                playerRender.getComponent("tdk-ResultRender").getActiveNode().active = false;
            }
        }
    },

    showTime: function (createTime, roomId) {
        let roomID = cc.find('roomID', this.panel);
        let dateNode = cc.find('date', this.panel);
        let timeNode = cc.find('time', this.panel);

        let date = new Date(createTime);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        if (hours < 10) {
            hours = '0' + hours + ':';
        } else {
            hours = hours + ':';
        }
        let minute = date.getMinutes();
        if (minute < 10) {
            minute = '0' + minute + ':';
        } else {
            minute = minute + ':';
        }
        let second = date.getSeconds();
        if (second < 10) {
            second = '0' + second;
        } else {
            second = second;
        }

        roomID.getComponent("cc.Label").string = "房号 : " + roomId;
        dateNode.getComponent("cc.Label").string = year + "-" + month + "-" + day;
        timeNode.getComponent("cc.Label").string = hours + minute + second;
    },

    btnBackOnClicked: function (evt) {
        GameData.player.roomid = undefined;
        GameData.joiners = [];
        GameData.game.onRoomDissolve = null;
        cc.director.loadScene('home');
    },

    // onNiuNiuRoomEnd

    btnShareOnClicked: function () {
        if (inCD(3000)) {
            return;
        }
        screenShoot(wxShareTexture);
    },

    handlerMsg: function () {

    },
    onDestroy: function () {

    }
});