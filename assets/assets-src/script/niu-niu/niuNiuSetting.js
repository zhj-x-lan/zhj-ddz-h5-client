var soundMngr = require('SoundMngr');
var loginHandler = require('loginHandler');
var roomHandler = require('roomHandler');
var niuNiuHandler = require('niuNiuHandler');
cc.Class({
    extends: cc.Component,

    properties: {
        musicSlider : cc.Slider,
        soundSlider : cc.Slider,
        musicBtn : cc.Node,
        soundBtn : cc.Node,
        musicProgressbar :cc.ProgressBar,
        soundProgressbar :cc.ProgressBar,
        _musicOpen : true,
        _soundOpen : true,
        byeRoomBtn : cc.Node,
        quitRoomBtn : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.musicBtn.getChildByName('guan').active = false;
        this.soundBtn.getChildByName('guan').active = false;

        this.soundSlider.node.on('slide', this.adjustSound, this);
        this.musicSlider.node.on('slide', this.adjustMusic, this);

        this.musicBtn.on(cc.Node.EventType.TOUCH_START, this.musicClick,this);
        this.soundBtn.on(cc.Node.EventType.TOUCH_START, this.soundClick,this);
        this._soundOpen = GameData.SetLayerData.soundOpen;
        this._musicOpen = GameData.SetLayerData.musicOpen;


        // if(!profileNiuNiu.roomInfo)
        // {
        //     this.byeRoomBtn.active = false;
        //     this.quitRoomBtn.active = true;
        // }
        // else
        // {
        //     this.byeRoomBtn.active = true;
        //     this.quitRoomBtn.active = false;
        // }

        var sceneName = cc.director.getScene().name;
        if(sceneName == 'home')
        {
            this.byeRoomBtn.active = false;
            this.quitRoomBtn.active = true; 
        }
        else
        {
            this.byeRoomBtn.active = true;
            this.quitRoomBtn.active = false;             
        }
        this.refreshUI();
    },

    logout : function(evt)
    {
        loginHandler.logout();
    },

    requestDissolve: function() {
        if (Object.keys(roomHandler.room).length <= 0) {
            this.node.active = false;
            return;
        }
        cc.log('GameData.player.uid == roomHandler.room.creator:'+GameData.player.uid,roomHandler.room.creator);
        cc.log('niuNiuHandler.gameStart = '+niuNiuHandler.gameStart);
        if(niuNiuHandler.gameStart == false && GameData.player.uid != roomHandler.room.creator){
            createMoveMessage('游戏开始才允许解散房间');
            this.node.active = false;
            return
        }
        if (roomHandler.room.id != "") {
            roomHandler.deleteRoom(GameData.room.id, 'apply');
            var parentNode = cc.find("Canvas/layer_ui");
            parentNode.parent.getComponent('niuNiuRoomMain').showDissolveLayer(1, 1);
            var disNode = cc.find("layer_dissolve",parentNode);
            disNode.getComponent('niuNiuRoomDissolve').showPlayers();
            disNode.getComponent('niuNiuRoomDissolve').alreadyAgree();
            this.node.active = false;
        }
    },

    setMusicOpen : function()
    {
        this.musicBtn.getChildByName('kai').active = this._musicOpen;
        this.musicBtn.getChildByName('guan').active = !this._musicOpen;
        //this.musicBtn.getChildByName('base').active = this._musicOpen;
    },

    setSoundOpen : function()
    {
        this.soundBtn.getChildByName('kai').active = this._soundOpen;
        this.soundBtn.getChildByName('guan').active = !this._soundOpen;
        //this.soundBtn.getChildByName('base').active = this._soundOpen;
    },


    onBtnClose: function () {
        this.node.active = false;
    },

    musicClick : function(event)
    {
        this._musicOpen = !this._musicOpen;
        this.setMusicOpen();
        GameData.SetLayerData.musicOpen = this._musicOpen;
        var v = this._musicOpen == true? GameData.SetLayerData.musicVolume : 0
        soundMngr.instance.bgmVolume(v);
        //console.log("v=======",v);
        GameData.saveSetLayerData();
    },

    soundClick : function(event)
    {
        this._soundOpen = !this._soundOpen;
        this.setSoundOpen();
        GameData.SetLayerData.soundOpen = this._soundOpen;
        // var v = this._soundOpen == true? GameData.SetLayerData.soundOpen : 0
        // soundMngr.instance.bgmVolume(v);
        GameData.saveSetLayerData();
    },

    adjustSound: function (event) {
        var slider = event.detail;
        // cc.log(slider.progress);
        GameData.SetLayerData.soundVolume = slider.progress;
        GameData.SetLayerData.soundOpen = true;
        this._soundOpen = true;
        this.soundProgressbar.progress = slider.progress;
        if(slider.progress == 0){
            this._soundOpen = false;
            GameData.SetLayerData.soundOpen = false;
        }
        // var v = slider.progress;
        // soundMngr.instance.bgmVolume(v);
        this.setSoundOpen();
        GameData.saveSetLayerData();
    },

    adjustMusic: function (event) {
        var slider = event.detail;
        //cc.log(slider.progress);
        GameData.SetLayerData.musicVolume = slider.progress;
        soundMngr.instance.bgmVolume(GameData.musicVolume);
        this.musicProgressbar.progress = slider.progress;
        GameData.SetLayerData.musicOpen = true;
        this._musicOpen = true;
        if(slider.progress == 0){
            this._musicOpen = false;
            GameData.SetLayerData.musicOpen = false;
        }
        var v =slider.progress;
        soundMngr.instance.bgmVolume(v);
        this.setMusicOpen();
        GameData.saveSetLayerData();
    },

    refreshUI : function(){
        //console.log("GameData.SetLayerData.soundOpen;",GameData.SetLayerData.soundOpen);
        this.musicSlider.progress = GameData.SetLayerData.musicVolume;
        this.soundSlider.progress = GameData.SetLayerData.soundVolume;

        this.soundBtn.getChildByName('kai').active =  GameData.SetLayerData.soundOpen;
        this.soundBtn.getChildByName('guan').active = !GameData.SetLayerData.soundOpen;
        //this.soundBtn.getChildByName('base').active = GameData.SetLayerData.soundOpen;

        this.musicBtn.getChildByName('kai').active = GameData.SetLayerData.musicOpen;
        this.musicBtn.getChildByName('guan').active = !GameData.SetLayerData.musicOpen;
        //this.musicBtn.getChildByName('base').active = GameData.SetLayerData.musicOpen;

        this.musicProgressbar.progress = GameData.SetLayerData.musicVolume;
        this.soundProgressbar.progress = GameData.SetLayerData.soundVolume;

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
