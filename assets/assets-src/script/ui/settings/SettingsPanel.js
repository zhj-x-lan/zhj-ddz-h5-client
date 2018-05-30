var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var loginHandler = require('loginHandler');
var gameDefine = require('gameDefine');
var configMgr = require('configMgr');

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

        musicKuang1: cc.Node,
        musicKuang2: cc.Node,

        soundKuang1: cc.Node,
        soundKuang2: cc.Node,
        areaLb: cc.Label
    },

    onLoad: function () {

        this._LanguageTypeOpen = cc.sys.localStorage.getItem('languageType' + GameData.player.uid) || GameData.language_tianjin;
        cc.log("language_type ==============", cc.sys.localStorage.getItem('languageType' + GameData.player.uid));

        this.musicBtn.getChildByName('guan').active = false;
        this.musicKuang1.active = false;
        this.soundBtn.getChildByName('guan').active = false;
        this.soundKuang1.active = false;

        this.soundSlider.node.on('slide', this.adjustSound, this);
        this.musicSlider.node.on('slide', this.adjustMusic, this);

        this.musicBtn.on(cc.Node.EventType.TOUCH_START, this.musicClick, this);
        this.soundBtn.on(cc.Node.EventType.TOUCH_START, this.soundClick, this);

        this.toggle_tianjin.node.on('toggle', this.selectLanguageTypeClick, this);
        this.toggle_putong.node.on('toggle', this.selectLanguageTypeClick, this);

        var sceneName = cc.director.getScene().name;
        cc.log("..sceneName:", sceneName);
        if (sceneName == 'table'
            || sceneName == 'table-DDZ'
            || sceneName == 'table-shishi'
            || sceneName == 'table-TJDDZ'
            || sceneName == 'table-huadian1'
            || sceneName == 'table-changchun'
            || sceneName == 'table-hz'
            || sceneName != 'home')
        {
            this.byeRoomBtn.active = true;
            this.quitRoomBtn.active = false;
        } else {
            this.byeRoomBtn.active = false;
            this.quitRoomBtn.active = true;
        }

        this._soundOpen = GameData.SetLayerData.soundOpen;
        this._musicOpen = GameData.SetLayerData.musicOpen;

        //home界面设置语言设置
        var areaStr = '';
        if (configMgr.getArea() == gameDefine.AreaType.Area_Test) {
            areaStr = '测试语言';
        }else if (configMgr.getArea() == gameDefine.AreaType.Area_HuaDian) {
            areaStr = '东北话';
        }else if (configMgr.getArea() == gameDefine.AreaType.Area_TianJin) {
            areaStr = '天津话';
        }else if (configMgr.getArea() == gameDefine.AreaType.Area_ShiShi) {
            areaStr = '闽南话';
        }
        cc.log('地区：'+configMgr.getArea());
        if (this.areaLb) {
            this.areaLb.string = areaStr;
        }
        this.selectLanguageTypeOpen();
        this.refreshUI();
    },

    musicClick: function (event) {
        this._musicOpen = !this._musicOpen;
        this.setMusicOpen();
        GameData.SetLayerData.musicOpen = this._musicOpen;
        var v = this._musicOpen == true ? GameData.SetLayerData.musicVolume : 0;
        soundMngr.instance.bgmVolume(v);

        GameData.saveSetLayerData();
    },

    soundClick: function (event) {
        this._soundOpen = !this._soundOpen;
        this.setSoundOpen();
        GameData.SetLayerData.soundOpen = this._soundOpen;
        GameData.saveSetLayerData();
    },
    selectLanguageTypeClick: function (event) {

        var languageType = GameData.language_tianjin;
        if (this.toggle_tianjin.isChecked) languageType = GameData.language_tianjin;
        if (this.toggle_putong.isChecked) languageType = GameData.language_putong;
        cc.sys.localStorage.setItem('languageType' + GameData.player.uid, languageType);
        cc.log(languageType);
        cc.log('languageType= ', cc.sys.localStorage.getItem('languageType' + GameData.player.uid));
    },
    selectLanguageTypeOpen: function () {
        cc.log('=============================>', this._LanguageTypeOpen);
        if (this._LanguageTypeOpen == GameData.language_tianjin) {
            this.toggle_tianjin.isChecked = true;
            this.toggle_putong.isChecked = false;
        } else {
            this.toggle_tianjin.isChecked = false;
            this.toggle_putong.isChecked = true;
        }
    },
    setMusicOpen: function () {
        this.musicBtn.getChildByName('kai').active = this._musicOpen;
        this.musicKuang2.active = this._musicOpen;
        this.musicBtn.getChildByName('guan').active = !this._musicOpen;
        this.musicKuang1.active = !this._musicOpen;
    },

    setSoundOpen: function () {
        this.soundBtn.getChildByName('kai').active = this._soundOpen;
        this.soundKuang2.active = this._soundOpen;
        this.soundBtn.getChildByName('guan').active = !this._soundOpen;
        this.soundKuang1.active = !this._soundOpen;
    },

    adjustSound: function (event) {
        var slider = event.detail;

        GameData.SetLayerData.soundVolume = slider.progress;
        GameData.SetLayerData.soundOpen = true;
        this._soundOpen = true;
        this.soundProgressbar.progress = slider.progress;
        if (slider.progress == 0) {
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
        closeView(this.node.name);
    },

    requestDissolve: function () {
        if (!GameData.room.opts) {
            return;
        }
        if (GameData.player.uid != GameData.joiners[0].uid && GameData.joiners.length < GameData.room.opts.joinermax) {
            createMoveMessage('牌局开始后才允许解散房间');
            closeView(this.node.name);
            return;
        }

        RoomHandler.deleteRoom(GameData.room.id, 'apply');
        if (GameData.client.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ)
        {
            RoomHandler.deleteRoom(GameData.room.id, 'apply');
        }
        closeView(this.node.name);

        switch (GameData.client.gameType){
            case gameDefine.GameType.Game_Poker_DDZ:{
                this.node.parent.getComponent('DDZ-roomMain').showdissolveLayer(1, 1);
                this.node.parent.getComponent('DDZ-roomDissolve').showPlayers();
                this.node.parent.getComponent('DDZ-roomDissolve').alreadyAgree();
            }break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                this.node.parent.getComponent('TJDDZ-roomMain').showdissolveLayer(1, 1);
                this.node.parent.getComponent('TJDDZ-roomDissolve').showPlayers();
                this.node.parent.getComponent('TJDDZ-roomDissolve').alreadyAgree();
            }break;
            case gameDefine.GameType.Game_Mj_Tianjin:{
                this.node.parent.getComponent('roomMain').showdissolveLayer(1, 1);
                this.node.parent.getComponent('roomDissolve').showPlayers();
                this.node.parent.getComponent('roomDissolve').alreadyAgree();
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                this.node.parent.getComponent('roomMain-shishi').showdissolveLayer(1, 1);
                this.node.parent.getComponent('roomDissolve-shishi').showPlayers();
                this.node.parent.getComponent('roomDissolve-shishi').alreadyAgree();
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                this.node.parent.getComponent('roomMain_huadian').showdissolveLayer(1, 1);
                this.node.parent.getComponent('roomDissolve_huadian').showPlayers();
                this.node.parent.getComponent('roomDissolve_huadian').alreadyAgree();
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                this.node.parent.getComponent('roomMain_changchun').showdissolveLayer(1, 1);
                this.node.parent.getComponent('roomDissolve_changchun').showPlayers();
                this.node.parent.getComponent('roomDissolve_changchun').alreadyAgree();
            }break;
        }
    },

    logout: function (evt) {
        loginHandler.logout();
    },

    refreshUI: function () {
        this.musicSlider.progress = GameData.SetLayerData.musicVolume;
        this.soundSlider.progress = GameData.SetLayerData.soundVolume;
        this.soundBtn.getChildByName('kai').active = GameData.SetLayerData.soundOpen;
        this.soundBtn.getChildByName('guan').active = !GameData.SetLayerData.soundOpen;
        this.soundKuang1.active = !GameData.SetLayerData.soundOpen;
        this.soundKuang2.active = GameData.SetLayerData.soundOpen;

        this.musicBtn.getChildByName('kai').active = GameData.SetLayerData.musicOpen;
        this.musicBtn.getChildByName('guan').active = !GameData.SetLayerData.musicOpen;
        this.musicProgressbar.progress = GameData.SetLayerData.musicVolume;
        this.soundProgressbar.progress = GameData.SetLayerData.soundVolume;
        this.musicKuang2.active = GameData.SetLayerData.musicOpen;
        this.musicKuang1.active = !GameData.SetLayerData.musicOpen;
    }
});