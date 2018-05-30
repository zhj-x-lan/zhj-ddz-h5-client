var RoomHandler = require('roomHandler');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        headPanel: cc.Node,
        headerNode: cc.Node,
        agreeWaitNode: cc.Node,
        agreeBtn: cc.Node,
        disAgreeBtn: cc.Node,
        dissolvePerson: cc.Label,
        lastTimeLabel: cc.Label
    },

    onLoad: function () {
        registEvent('onRoomInfo', this, this.onRoomInfoHandler);
        registEvent('onRoomDissolve', this, this.onRoomDissolveHandler);
        registEvent('showDissolve', this, this.showDissolveLayer);

        this.lastTimeLabel.string = '';
        this.openDisAgree = false;

        this.initHeaderUI();
        this.showDissolveText();
    },
    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.onRoomInfoHandler);
        unregistEvent('onRoomDissolve', this, this.onRoomDissolveHandler);
        unregistEvent('showDissolve', this, this.showDissolveLayer);
    },

    onRoomInfoHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onRoomInfoSetData(data.detail);

        this.initHeaderUI();
    },
    onRoomDissolveHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onRoomDissolveSetData(data.detail);

        this.initHeaderUI();
        this.showDissolveText();
    },

    showDissolveLayer: function (data) {
        cc.log("..showDissolve:"+data.detail);
        this.node.active = data.detail;
    },

    initHeaderUI: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        for(var ii = 0;ii < this.headPanel.getChildrenCount();ii++){
            var child = this.headPanel.getChildren()[ii];
            if(child){
                child.active = false;
            }
        }
        for (var index = 0; index < roomData.opts.joinermax; index++) {
            var playerData = GameData.joiners[index];
            if(playerData == undefined){
                continue;
            }
            var headNode = this.headPanel.getChildren()[index];
            if(headNode == undefined){
                headNode = cc.instantiate(this.headerNode);
                headNode.parent = this.headPanel;
                headNode.name = 'headNode'+index;
                headNode.y = this.headerNode.y;
                headNode.x = this.headerNode.x + index*(this.headerNode.width+50);
            }
            headNode.tag = playerData.uid;
            headNode.active = true;

            //设置信息
            var nameStr = playerData.name;
            var nameNode = cc.find('nameLabel', headNode);
            nameNode.getComponent(cc.Label).string = getShortStr(nameStr, 4);

            var headImgurl = playerData.headimgurl;
            var headSprite = cc.find('headimg', headNode).getComponent(cc.Sprite);

            this.showHeaderIcon(headSprite, headImgurl);

            var onLine = RoomHandler.isPlayerOnline(playerData.uid);
            this.showLostIcon(headNode,onLine);
        }
    },
    showHeaderIcon: function (headSprite, headimgurl) {
        if (headSprite == undefined || headimgurl == undefined || headimgurl.length <= 0) {
            return;
        }
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                headSprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    showLostIcon: function(headNode,onLine){
        var disNode = cc.find('lost', headNode);
        disNode.active = !onLine;
    },

    showAgreeIcon: function (headNode, show) {
        var node = cc.find('duigou', headNode);
        node.active = show;
    },

    alreadyAgree: function (act) {
        this.agreeWaitNode.active = !act;
        this.agreeBtn.active = act;
        this.disAgreeBtn.active = act;
    },

    handleSomebodyDisagree: function (uid) {
        if (uid == GameData.player.uid) {
            return;
        }
        if (this.openDisAgree) {
            return;
        }
        var playerData = GameData.getPlayerByUid(uid);
        if(playerData){
            var self = this;
            var name = playerData.name;
            createMessageBox('因［' + name + '］拒绝解散房间，游戏需继续进行', function () {
                self.openDisAgree = false
            });
            this.openDisAgree = true;
        }
    },

    showDissolveText: function () {
        var dissolveData = RoomHandler.getRoomDissolveData();
        if (dissolveData == undefined
            || Object.keys(dissolveData).length <= 0) {
            return;
        }
        GameData.showResult = false;

        var playerData,
            headNode,
            show = true;

        for (var uid in dissolveData.select) {

            var select = dissolveData.select[uid];

            if (select == 'apply') {
                playerData = GameData.getPlayerByUid(uid);
                if(playerData){
                    this.dissolvePerson.string = '[' + playerData.name + ']发起投票解散对局';

                    headNode = this.headPanel.getChildByTag(parseInt(uid));
                    if(headNode){
                        this.showAgreeIcon(headNode, true);
                    }
                }
            } else if (select == 'agree') {
                headNode = this.headPanel.getChildByTag(parseInt(uid));
                if(headNode){
                    this.showAgreeIcon(headNode, true);
                }
            } else if (select == 'disagree') {
                sendEvent('showDissolve', false);
                this.handleSomebodyDisagree(uid);
                return;
            }
            if ((select == 'agree' || select == 'apply')
                && uid == GameData.player.uid) {
                show = false;
            }
        }
        this.alreadyAgree(show);
        sendEvent('showDissolve', true);

        this.handleVoteResult();
        this.handleRoomDisbandTimer();
    },

    handleVoteResult: function () {
        var dissolveData = RoomHandler.getRoomDissolveData();
        if(dissolveData == undefined){
            return;
        }
        if (dissolveData.isStart == false) {
            sendEvent('showDissolve', false);
            this.unschedule(this.updateLastTime);

            setTimeout(function(){
                if (GameData.room.close) {
                    sendEvent('showSummary');
                }
            }, 100);
        }
    },
    handleRoomDisbandTimer: function () {
        var dissolveData = RoomHandler.getRoomDissolveData();
        if(dissolveData == undefined){
            return;
        }
        this.totalTime = dissolveData.startTime;
        this.lastTime = dissolveData.lastTime;

        this.schedule(this.updateLastTime, 1);
    },
    updateLastTime: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        this.lastTime--;
        this.lastTimeLabel.string = '倒计时结束后自动解散牌局   ' + formatSeconds(this.lastTime, 1);
        if (this.lastTime <= 0) {
            RoomHandler.deleteRoom(roomData.id, 'close');
            this.unschedule(this.updateLastTime);
        }
    },

    requestDissolveAgree: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        RoomHandler.deleteRoom(roomData.id, 'agree');
    },
    requestDissolveDisagree: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        RoomHandler.deleteRoom(roomData.id, 'disagree');
    }
});