var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var roomHandler = require('roomHandler');
var niuNiuHandler = require('niuNiuHandler');
cc.Class({
    extends: cc.Component,

    properties: {
        dissolveLayer: {
            default: null,
            type: cc.Node
        },
        summaryLayer: {
            default: null,
            type: cc.Node
        },
        settingLayer: {
            default: null,
            type: cc.Node
        },
        debugLayer: {
            default: null,
            type: cc.Node
        },
        waitLayer : cc.Node,  //等待界面
        talkBtn :cc.Button, // 语音按钮
        yuyinNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        soundMngr.instance.playMusic('sound/niuniu/brnn_bg');
        this.handlerMsg();
        this.talkClick();
        this.showLayer();
    },
    showLayer: function () {
        if (GameData.room.status > gameDefine.RoomState.WAIT) {
            this.showWaitLayer(false);
        } else {
            this.showWaitLayer(true);
        }
    },
    showWaitLayer: function (act) {
        this.waitLayer.active = act;
    },
    showSettingLayer: function(evt, data) {
        if (data == 1) {
            this.settingLayer.active = true;
            this.settingLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
            // openView('SettingsPanel');
        } else {
            this.settingLayer.active = false;
        }
    },
    registShowDisLayer: function () {
        this.showDissolveLayer(1,1);
    },
    showDissolveLayer: function(evt, data) {
        if (data == 1) {
            this.dissolveLayer.active = true;
            this.dissolveLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
        } else {
            this.dissolveLayer.active = false;
        }
    },
    showSummaryLayer: function() {
        this.summaryLayer.active = true;
        this.dissolveLayer.active = false; 
        this.summaryLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
    },
    showChat:function () {
         if (inCD(2000)) return;
         //cc.log('1111111111111111111');
         openView('NiuNiuChatPanel',gameDefine.GameType.Game_niu_niu);
    },

    talkClick:function () {
        var self = this;
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_START,function(event){
             console.log('TOUCH_START');
            // WriteLog('TOUCH_START : ');
            //增加连点CD；
            if (inCD(2000)){return;}
            yunwaStartTalk();
            self.yuyinNode.active = true;
            GameData.isPlayVioce = true;
            self.yuyinNode.getComponent(cc.Animation).play("yuyin");
            cc.audioEngine.pauseAll();

        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_MOVE,function(event){
            //console.log('TOUCH_MOVE');
            var movePos = event.touch.getLocation();
            var talkBtnWorldPos = this.convertToWorldSpace(this.getPosition());
            var RelativeCoordinatePos = {};
            RelativeCoordinatePos.x = talkBtnWorldPos.x-this.getPosition().x+170;
            RelativeCoordinatePos.y = talkBtnWorldPos.y-this.getPosition().y+50;
            var distance = cc.pDistance(movePos,RelativeCoordinatePos);
            if(distance > this.width*2){
                self.yuyinNode.getComponent(cc.Animation).play("CancelSend");
                GameData.isPlayVioce = false;
                // console.log("distance: movePos this.width/2 "+distance,movePos,this.width/2);
            }
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_END,function(){
            //console.log('TOUCH_END');
            //WriteLog('TOUCH_END : ');
            yunwaStopTalk();
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_CANCEL,function(){
            //console.log('TOUCH_CANCEL');
            yunwaStopTalk();
            GameData.isPlayVioce = false;
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });
    },
    handlerMsg : function () {
        registEvent('onRoomInfo', this, this.showLayer);  
        registEvent('onRoomDissolve', this, this.registShowDisLayer);      
    },

    onDestroy : function () {
        unregistEvent('onRoomInfo', this, this.showLayer);
        unregistEvent('onRoomDissolve', this, this.registShowDisLayer);
        niuNiuHandler.initAllData();
        GameData.initGameData(); 
    },
});
