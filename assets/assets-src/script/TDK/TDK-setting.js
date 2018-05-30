var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var loginHandler = require('loginHandler');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,
    properties: {
        musicSlider: cc.Slider,
        soundSlider: cc.Slider,
        musicBtn: cc.Node,
        soundBtn: cc.Node,
        musicProgressbar: cc.ProgressBar,
        soundProgressbar: cc.ProgressBar,
        _musicOpen: true,
        _soundOpen: true,
        _LanguageTypeOpen: true,
        byeRoomBtn: cc.Node,
        quitRoomBtn: cc.Node,
        toggle_tianjin: cc.Toggle,
        toggle_putong: cc.Toggle,
        fangyanLb: cc.Label,

    },

    // use this for initialization
    onLoad: function () {
        // this._musicOpen = true;
        // this._soundOpen = true;
        this._LanguageTypeOpen = cc.sys.localStorage.getItem('languageType' + GameData.player.uid) || GameData.language_local;
        //cc.log("language_type ==============" ,cc.sys.localStorage.getItem('languageType'+GameData.player.uid));
        this.musicBtn.getChildByName('guan').active = false;
        this.soundBtn.getChildByName('guan').active = false;

        this.soundSlider.node.on('slide', this.adjustSound, this);
        this.musicSlider.node.on('slide', this.adjustMusic, this);

        this.musicBtn.on(cc.Node.EventType.TOUCH_START, this.musicClick, this);
        this.soundBtn.on(cc.Node.EventType.TOUCH_START, this.soundClick, this);

        this.toggle_tianjin.node.on('toggle', this.selectLanguageTypeClick, this);
        this.toggle_putong.node.on('toggle', this.selectLanguageTypeClick, this);

        var sceneName = cc.director.getScene().name;
        //cc.log("..roomid:"+GameData.player.roomid);
        // if(GameData.player.roomid == undefined || GameData.player.roomid <= 0)
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
        if (sceneName == 'home') {
            this.byeRoomBtn.active = false;
            this.quitRoomBtn.active = true;
        } else {
            this.byeRoomBtn.active = true;
            this.quitRoomBtn.active = false;
        }
        //console.log(" GameData.soundVolume", GameData.soundVolume);
        // this.soundSlider.progress = GameData.SetLayerData.soundVolume;
        // this.musicSlider.progress = GameData.SetLayerData.musicVolume;
        // this.soundProgressbar.progress = GameData.SetLayerData.soundVolume;
        // this.musicProgressbar.progress = GameData.SetLayerData.musicVolume;

        this._soundOpen = GameData.SetLayerData.soundOpen;
        //this.setSoundOpen();

        this._musicOpen = GameData.SetLayerData.musicOpen;
        //console.log("this._soundOpen",this._soundOpen);
        //this.setMusicOpen();
        this.selectLanguageTypeOpen();
        this.refreshUI();
    },
    onEnable: function () {},
    musicClick: function (event) {
        this._musicOpen = !this._musicOpen;
        this.setMusicOpen();
        GameData.SetLayerData.musicOpen = this._musicOpen;
        var v = this._musicOpen == true ? GameData.SetLayerData.musicVolume : 0
        soundMngr.instance.bgmVolume(v);
        //console.log("v=======",v);
        GameData.saveSetLayerData();
    },

    soundClick: function (event) {
        this._soundOpen = !this._soundOpen;
        this.setSoundOpen();
        GameData.SetLayerData.soundOpen = this._soundOpen;
        // var v = this._soundOpen == true? GameData.SetLayerData.soundOpen : 0
        // soundMngr.instance.bgmVolume(v);
        GameData.saveSetLayerData();
    },
    selectLanguageTypeClick: function (event) {
        var languageType = GameData.language_local;
        if (this.toggle_tianjin.isChecked) languageType = GameData.language_local;
        if (this.toggle_putong.isChecked) languageType = GameData.language_putong;
        cc.sys.localStorage.setItem('languageType' + GameData.player.uid, languageType);
    },
    selectLanguageTypeOpen: function () {
        if (this._LanguageTypeOpen == GameData.language_local) {
            this.toggle_tianjin.isChecked = true;
            this.toggle_putong.isChecked = false;
        } else {
            this.toggle_tianjin.isChecked = false;
            this.toggle_putong.isChecked = true;
        }
    },
    setMusicOpen: function () {
        this.musicBtn.getChildByName('kai').active = this._musicOpen;
        this.musicBtn.getChildByName('guan').active = !this._musicOpen;
        this.musicBtn.getChildByName('base').active = this._musicOpen;
    },

    setSoundOpen: function () {
        this.soundBtn.getChildByName('kai').active = this._soundOpen;
        this.soundBtn.getChildByName('guan').active = !this._soundOpen;
        this.soundBtn.getChildByName('base').active = this._soundOpen;
    },

    adjustSound: function (event) {
        var slider = event.detail;
        // cc.log(slider.progress);
        GameData.SetLayerData.soundVolume = slider.progress;
        GameData.SetLayerData.soundOpen = true;
        this._soundOpen = true;
        this.soundProgressbar.progress = slider.progress;
        if (slider.progress == 0) {
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
        if (slider.progress == 0) {
            this._musicOpen = false;
            GameData.SetLayerData.musicOpen = false;
        }
        var v = slider.progress;
        soundMngr.instance.bgmVolume(v);
        this.setMusicOpen();
        GameData.saveSetLayerData();
    },

    onClose: function () {
        // closeView('SettingsPanel');
        closeView(this.node.name);
    },

    requestDissolve: function () {
        if (!GameData.room.opts) {
            return;
        }
        if (GameData.player.uid != GameData.joiners[0].uid && GameData.room.status === TDKPokerCard.STATUS.WAITING) {
            createMoveMessage('牌局开始后才允许解散房间');
            closeView(this.node.name);
            return;
        }

        RoomHandler.deleteRoom(GameData.room.id, 'apply');
        closeView(this.node.name);
        if (GameData.gameType == gameDefine.GameType.Game_TDK) {
            this.node.parent.getComponent('TDK-roomMain').showdissolveLayer(1, 1);
            this.node.parent.getComponent('TDK-roomDissolve').showPlayers();
            this.node.parent.getComponent('TDK-roomDissolve').alreadyAgree();
            return;
        }
        // this.node.parent.getComponent('roomMain').showdissolveLayer(1, 1);
        // this.node.parent.getComponent('roomDissolve').showPlayers();
        // this.node.parent.getComponent('roomDissolve').alreadyAgree();
    },

    logout: function (evt) {
        loginHandler.logout();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    refreshUI: function () {
        //console.log("GameData.SetLayerData.soundOpen;",GameData.SetLayerData.soundOpen);
        this.musicSlider.progress = GameData.SetLayerData.musicVolume;
        this.soundSlider.progress = GameData.SetLayerData.soundVolume;

        this.soundBtn.getChildByName('kai').active = GameData.SetLayerData.soundOpen;
        this.soundBtn.getChildByName('guan').active = !GameData.SetLayerData.soundOpen;
        this.soundBtn.getChildByName('base').active = GameData.SetLayerData.soundOpen;

        this.musicBtn.getChildByName('kai').active = GameData.SetLayerData.musicOpen;
        this.musicBtn.getChildByName('guan').active = !GameData.SetLayerData.musicOpen;
        this.musicBtn.getChildByName('base').active = GameData.SetLayerData.musicOpen;

        this.musicProgressbar.progress = GameData.SetLayerData.musicVolume;
        this.soundProgressbar.progress = GameData.SetLayerData.soundVolume;
        this.fangyanLb.getComponent(cc.Label).string = "东北话";
        //if (GameData.client.gameType == GameType.Game_Mj_Shishi) {
        //    //var texture = cc.textureCache.addImage(cc.url.raw("resources/shishi/image/ziminnanhua.png"));
        //    this.fangyanLb.getComponent(cc.Label).string = "闽南话";
        //} else if (GameData.client.gameType == GameType.Game_Mj_Tianjin) {
        //    //var texture = cc.textureCache.addImage(cc.url.raw("resources/setting/tianjinhua.png"));
        //    this.fangyanLb.getComponent(cc.Label).string = "天津话";
        //} else if (GameData.client.gameType == GameType.Game_MJ_HuaDian) {
        //    //var texture = cc.textureCache.addImage(cc.url.raw("resources/setting/tianjinhua.png"));
        //    this.fangyanLb.getComponent(cc.Label).string = "东北话";
        //}
    }
});