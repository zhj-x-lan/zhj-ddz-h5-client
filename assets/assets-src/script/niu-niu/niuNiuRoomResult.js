var niuNiuHandler = require('niuNiuHandler');
var roomHandler = require('roomHandler'); 
cc.Class({
    extends: cc.Component,
    properties: {
        playerRender: cc.Prefab, // 总结算玩家的模板
        content: cc.Node, // 玩家列表
        panel: cc.Node,
        dengguang: cc.Node,
    },

    onLoad: function () {

        this._roomInfo = roomHandler.room;

        this.handlerMsg();
        // 如果房间状态为结算(关闭) 
        // if (niuNiuHandler.room && profileNiuNiu.roomInfo.roomStatus == 4) {
            var anim = this.dengguang.getComponent(dragonBones.ArmatureDisplay);
            anim.playAnimation('newAnimation',0);
            this.initUI();
        // }
    },
    // 
    initUI: function () {
        this.showTime(this._roomInfo.createtime, this._roomInfo.id);
        // 显示玩家列表
        this.content.removeAllChildren();
        for (var i = 0; i < 6; i++) {
            var playerRender = cc.instantiate(this.playerRender);
            playerRender.x = 6+i*212;
            this.content.addChild(playerRender);
        }
        var playerInfo = roomHandler.players;
        var child = this.content.children;
        for (var i = 0; i < child.length; i++) {
            var playsLen = playerInfo.length;
            if (i < playsLen) {
                var playerRender = child[i];
                playerRender.getComponent("niuNiuResultRender").initData(playerInfo[i]);
                playerRender.getComponent("niuNiuResultRender").getActiveNode().active = true;

            }else{
                var playerRender = child[i];
                playerRender.getComponent("niuNiuResultRender").getActiveNode().active = false;
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
        GameData.initGameData();
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