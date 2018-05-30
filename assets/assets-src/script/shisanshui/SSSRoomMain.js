var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');

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

        playerHeadArray : {
            default: [],
            type: [cc.Node]
        },

        promptScrollView: {
            default: null,
            type: cc.ScrollView
        },

        talkBtn : cc.Button,
        yuyinNode :cc.Node,

        chatNode : cc.Prefab,

        prefabList: {
            default: [],
            type: [cc.Prefab],
        },
    },

    onLoad: function () {
        GameData.saveSetLayerData();
        this.rotationScene(AutoScene.SCENE_HORIZONTAL);  //SCENE_HORIZONTAL 為橫版  SCENE_VERTICAL 為豎版

        registEvent('onRoomChat', this, this.onSSSChatHandler);
        registEvent('onRoomDissolve', this, this.showdissolveLayer);
        registEvent('onCreatorQuit',this,this.onCreatorQuit);
        registEvent('yunwaUploaded', this, this.onYunwaUploaded);

        var self = this;
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_START,function(event){
            console.log('TOUCH_START');
            //增加连点CD；
            if (inCD(3000)){
                return;
            }
            yunwaStartTalk();

            self.yuyinNode.active = true;
            GameData.isPlayVioce = true;

            self.yuyinNode.getComponent(cc.Animation).play("yuyin");
            cc.audioEngine.pauseAll();
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_MOVE,function(event){
            console.log('TOUCH_MOVE');

            var movePos = event.touch.getLocation();
            var position = this.parent.convertToNodeSpaceAR(movePos);

            if( Math.abs(position.x - this.position.x) > this.width
                || Math.abs(position.y - this.position.y) > this.height )
            {
                self.yuyinNode.getComponent(cc.Animation).play("CancelSend");
                GameData.isPlayVioce = false;
            }
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_END,function(){
            console.log('TOUCH_END');

            yunwaStopTalk();

            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_CANCEL,function(){
            console.log('TOUCH_CANCEL');

            yunwaStopTalk();

            GameData.isPlayVioce = false;
            self.yuyinNode.active = false;

            cc.audioEngine.resumeAll();
        });

        this.playerSex = 1;
        //播放背景音乐
        soundMngr.instance.playMusic('shisanshui/sound/sss_table_bg1');

        this.showdissolveLayer();
    },
    onDestroy: function() {
        unregistEvent('onRoomChat', this, this.onSSSChatHandler);
        unregistEvent('onCreatorQuit',this,this.onCreatorQuit);
    },

    //旋转场景 orientation
    rotationScene: function(oriented) {
        WriteLog('rotationScene');

        var node = cc.director.getScene().getChildByName('Canvas');
        var canvas = node.getComponent(cc.Canvas);
        
        if (oriented == AutoScene.SCENE_HORIZONTAL)
        {
            var sceneRotateTo = cc.rotateTo(0.1, -90); 
            var sceneSize = new cc.size(1280, 720);
            canvas.designResolution = sceneSize;  //設計分辨率
            node.runAction(sceneRotateTo);

            this.promptScrollView.horizontal = false;
            this.promptScrollView.vertical = true;
        }
        else if (oriented == AutoScene.SCENE_VERTICAL)
        {
            var sceneSize = new cc.size(720, 1280);
            canvas.designResolution = sceneSize;  //設計分辨率

            this.promptScrollView.horizontal = true;
            this.promptScrollView.vertical = false;
        }
        this.changeRunlampPanel(oriented);
    },

    //活动消息跑马灯
    changeRunlampPanel: function(oriented) {
        if (GameData.gameType == gameDefine.GameType.Game_Poker_13shui)
        {
            var child = cc.director.getScene().getChildByName('lampNode');
            var children = child.children;
            if (children.length <= 0)
            {
                return;
            }
            if (GameData.serverNoticeData.length > 1)
            {
                var paoMaDeng = children[0].getComponent('RunlampPanel1');
                paoMaDeng.changeRunlamp(oriented);
            }
            else if (GameData.serverNoticeData.length == 1)
            {
                var paoMaDeng = children[0].getComponent('RunlampPanel');
                paoMaDeng.changeRunlamp(oriented);
            }
        }
    },

    showPlayers: function() {
        this.tableNode.active = true;
    },

    showSettingLayer: function(evt) {

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_1);

        openSSSView('SSSSettingsPanel');
    },

    onCreatorQuit :function()
    {
        GameData.player.roomid = undefined;
        GameData.game.onRoomDissolve = {};
        GameData13.clearAllGameData();

        if(GameData13.owner != GameData.player.uid)
        {
            poker13MessageBox('房主已经解散房间',"","",function() {
                cc.director.loadScene('home');
                });
        }
        else
        {
            cc.director.loadScene('home');
        }
    },

    showdissolveLayer: function() {

        var data = GameData.game.onRoomDissolve;
        if( Object.keys(data).length <= 0 ){
            this.dissolveLayer.active = false;
            return;
        }
        var dissolve = data.select;
        if( Object.keys(dissolve).length <= 0 || dissolve == null ){
            this.dissolveLayer.active = false;
            return;
        }

        if( GameData.player.roomid == undefined || GameData.player.roomid <= 0 ){
            this.dissolveLayer.active = false;
            return;
        }

        this.dissolveLayer.active = true;
        this.dissolveLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
    },

    showSummaryLayer: function() {
        this.summaryLayer.active = true;
        this.dissolveLayer.active = false;

        this.summaryLayer.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
        this.node.getComponent('SSSRoomTable').stopGameAction();

        if (GameData.player.uid == GameData13.joiners[0].uid) {
            cc.sys.localStorage.setItem("creatorIsCheckIp",false);
        }
        else{
            cc.sys.localStorage.setItem("isCheckIp",false);
        }
    },

    showDebugLayer: function() {
        this.debugLayer.active = !this.debugLayer.active;
    },

    onSSSChatHandler : function(data)
    {
        var uid = data.detail.uid;
        var type = data.detail.msg.type;
        this.playerSex =  GameData13.getPlayerSexByUid(uid);

        for (var i = 0; i < GameData13.joiners.length; i++) {

            if( uid == GameData13.joiners[i].uid ){
                var index = GameData13.getPosition(GameData13.joiners[i].uid);
                var playerHeadNode = this.playerHeadArray[index-1];
                if( playerHeadNode == undefined ) {
                    continue;
                }
                var chatNode = playerHeadNode.getChildByName('chatNode');
                if( chatNode == undefined ) {
                    chatNode = cc.instantiate(this.chatNode);
                    chatNode.name = 'chatNode';
                    chatNode.parent = playerHeadNode;
                }

                var direction;
                switch ( index ) {
                    case 1:
                    case 2:
                    case 4:{
                        direction = 'right';
                    }break;
                    case 3:
                    case 5:{
                        direction = 'left';
                    }break;
                }
                if( direction == undefined ){
                    continue;
                }
                chatNode.getComponent('SSSPlayerChat').playChat(data,direction,type,this.playerSex);
            }
        }
    },

    onYunwaUploaded :function(data)
    {
        var soundurl = data.detail;
        WriteLog('soundurl ：'+ soundurl);
        ChatHandler.getInstance().sendRecord(soundurl);
    },

    openChatPanel : function(){
        if (inCD(3000)) {
            return;
        }
        openSSSView('SSSChatPanel');
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
