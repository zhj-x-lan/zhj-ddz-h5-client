var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var loginHandler = require('loginHandler');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {

        dissolveBtn : cc.Button,
        quitBtn : cc.Button,

        musicSlider : cc.Slider,
        soundSlider : cc.Slider,
        musicBtn : cc.Node,
        soundBtn : cc.Node,
        musicProgressbar :cc.ProgressBar,
        soundProgressbar :cc.ProgressBar,
        toggle_tianjin: cc.Toggle,
        toggle_putong: cc.Toggle,
        fangyanLb :cc.Label,

        _musicOpen : true,
        _soundOpen : true,
        _LanguageTypeOpen : true

    },

    onLoad: function () {

        this._LanguageTypeOpen = cc.sys.localStorage.getItem('languageType'+GameData.player.uid)||GameData.language_local;

        this.musicBtn.getChildByName('guan').active = false;
        this.soundBtn.getChildByName('guan').active = false;

        this.soundSlider.node.on('slide', this.adjustSound, this);
        this.musicSlider.node.on('slide', this.adjustMusic, this);

        this.musicBtn.on(cc.Node.EventType.TOUCH_START, this.musicClick,this);
        this.soundBtn.on(cc.Node.EventType.TOUCH_START, this.soundClick,this);

        this.toggle_tianjin.node.on('toggle',this.selectLanguageTypeClick,this);
        this.toggle_putong.node.on('toggle',this.selectLanguageTypeClick,this);

        this._soundOpen = GameData.SetLayerData.soundOpen;
        this._musicOpen = GameData.SetLayerData.musicOpen;

        this.controlBtn();
        this.selectLanguageTypeOpen();
        this.refreshUI();
    },

    controlBtn : function(){
        if( GameData.player.roomid > 0 ){
            this.dissolveBtn.node.active = true;
            this.quitBtn.node.active = false;
        }else{
            this.dissolveBtn.node.active = false;
            this.quitBtn.node.active = true;
        }
    },

    dissolveClick : function(){
        cc.log("..dissolve");

        if(GameData.player.uid != GameData13.owner && GameData13.game.start == false){
            createSSSMoveMessage('牌局开始后才允许解散房间');
            closeSSSView(this.node.name);
            return;
        }

        RoomHandler.deleteRoom(GameData.player.roomid, 'apply');
        this.closeSetting();
    },

    onQuitGame : function(){
        loginHandler.logout();
    },

    musicClick : function(event)
    {
        this._musicOpen = !this._musicOpen;
        this.setMusicOpen();
        GameData.SetLayerData.musicOpen = this._musicOpen;
        var v = this._musicOpen == true? GameData.SetLayerData.musicVolume : 0;

        soundMngr.instance.bgmVolume(v);
        GameData.saveSetLayerData();
    },

    soundClick : function(event)
    {
        this._soundOpen = !this._soundOpen;
        this.setSoundOpen();
        GameData.SetLayerData.soundOpen = this._soundOpen;
        GameData.saveSetLayerData();
    },

    selectLanguageTypeClick: function(event) {
        var  languageType = GameData.language_local;
        if (this.toggle_tianjin.isChecked)  {
            languageType = GameData.language_local;
        }
        if (this.toggle_putong.isChecked)  {
            languageType = GameData.language_putong;
        }
        cc.sys.localStorage.setItem('languageType'+GameData.player.uid,languageType);
    },
    selectLanguageTypeOpen :function () {
        if(this._LanguageTypeOpen == GameData.language_local){
            this.toggle_tianjin.isChecked = true;
            this.toggle_putong.isChecked  = false;
        }else{
            this.toggle_tianjin.isChecked = false;
            this.toggle_putong.isChecked  = true;
        }
    },
    setMusicOpen : function()
    {
        this.musicBtn.getChildByName('kai').active = this._musicOpen;
        this.musicBtn.getChildByName('guan').active = !this._musicOpen;
    },

    setSoundOpen : function()
    {
        this.soundBtn.getChildByName('kai').active = this._soundOpen;
        this.soundBtn.getChildByName('guan').active = !this._soundOpen;
    },

    adjustSound: function (event) {
        var slider = event.detail;
        GameData.SetLayerData.soundVolume = slider.progress;
        GameData.SetLayerData.soundOpen = true;
        this._soundOpen = true;
        this.soundProgressbar.progress = slider.progress;
        if(slider.progress == 0){
            this._soundOpen = false;
            GameData.SetLayerData.soundOpen = false;
        }
        this.setSoundOpen();
        GameData.saveSetLayerData();
    },

    adjustMusic: function (event) {
        var slider = event.detail;

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

    logout : function(evt)
    {
        loginHandler.logout();
    },

    refreshUI : function(){

        this.musicSlider.progress = GameData.SetLayerData.musicVolume;
        this.soundSlider.progress = GameData.SetLayerData.soundVolume;

        this.soundBtn.getChildByName('kai').active =  GameData.SetLayerData.soundOpen;
        this.soundBtn.getChildByName('guan').active = !GameData.SetLayerData.soundOpen;

        this.musicBtn.getChildByName('kai').active = GameData.SetLayerData.musicOpen;
        this.musicBtn.getChildByName('guan').active = !GameData.SetLayerData.musicOpen;

        this.musicProgressbar.progress = GameData.SetLayerData.musicVolume;
        this.soundProgressbar.progress = GameData.SetLayerData.soundVolume;

        if(GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi){
            this.fangyanLb.getComponent(cc.Label).string = "闽南话";
        }else if(GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin){
            this.fangyanLb.getComponent(cc.Label).string = "天津话";
        }
    },

    closeSetting : function(){
        closeSSSView(this.node.name);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // }
});