cc.Class({
    extends: cc.Component,

    properties: {
        _zhuang: null,
        _ready: null,
        _offline: null,
        _lblName: null,
        _lblScore: null,
        _scoreBg: null,
        _nddayingjia:null,

        _emoji: null,
        _lastChatTime: -1,

        _userName: "",
        _score: 0,
        _dayingjia: false,
        _isOffline: false,
        _isReady: false,
        _isZhuang: false,
        _userId: null,
        //新增图集
        public_ui:{
            default:null,
            type:cc.SpriteAtlas
        },

        //头像:
        _icon: {
            type: cc.Node,
            default: null
        },
    },

    onLoad: function () {
       
        this._lblName = this.node.getChildByName("name").getComponent(cc.Label);
        this._lblScore = this.node.getChildByName("score").getComponent(cc.Label);

        this._offline = this.node.getChildByName("offline");

        this._ready = this.node.getChildByName("ready");

        this._zhuang = this.node.getChildByName("zhuang");

        this._scoreBg = this.node.getChildByName("Z_money_frame");

        this._nddayingjia = this.node.getChildByName("dayingjia");

        this._ting = this.node.getChildByName('ting');

        this._emoji = this.node.getChildByName("emoji");
        if (this._emoji != null) {
            this._emoji.active = false;
        }

        this._icon = this.node.getChildByName('icon');

        this._id = this.node.getChildByName('id');
        
        this.refresh();
    },

    refresh: function () {
        if (this._lblName != null) {
            this._lblName.string = this._userName;
        }

        if (this._lblScore != null) {
            
            this._lblScore.string = this._score;
        }

        if(this._nddayingjia != null){
            this._nddayingjia.active = this._dayingjia == true;
        }

        if (this._offline) {
            this._offline.active = this._isOffline && this._userName != "";
        }

        if (this._ready) {
            this._ready.active = this._isReady;
        }

        if (this._zhuang) {
            this._zhuang.active = this._isZhuang;
        }
        this.node.active = true;
        
        var result = this._userName != null && this._userName != "";
        this.node.active = result;
    },

    setInfo: function (name, score, dayingjia) {
        this._userName = name;
        this._score = score;
        if (this._score == null ) {
            this._score = 0;
        }

        this._dayingjia = dayingjia;

        if (this._scoreBg != null) {
            this._scoreBg.active = this._score != null;
        }

        if (this._lblScore != null) {
            this._lblScore.node.active = this._score != null;
        }
        this.refresh();
    },

    setId: function (idNum) {
        if (this._id) {
            this._id.getComponent(cc.Label).string = idNum;
        }
    },

    setName: function (name) {
        this._userName = name;
    },
    setScore: function (score) {
       
        this._score = score;
    },

    setZhuang: function (value) {
        this._isZhuang = value;
        if (this._zhuang) {
            this._zhuang.active = value;
        }
    },
    setDayingjia: function (dayingjia) {
        this._dayingjia = dayingjia;
    },

    setReady: function (isReady) {
        this._isReady = isReady;
        if (this._ready) {
            this._ready.active = this._isReady;
        }
    },

    setTing: function (isTing) {
        if (this._ting) {   
            this._ting.active = isTing;
        }
    },
 
    setOffline: function (isOffline) {
        this._isOffline = isOffline;
        if (this._offline) {
            this._offline.active = this._isOffline && this._userName != "";
        }
    },

});
