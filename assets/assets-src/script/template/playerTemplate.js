cc.Class({
    extends: cc.Component,

    properties: {
        uid: 0,
        headBtn: cc.Button,
        headIcon: cc.Sprite,
        zhuangIcon: cc.Sprite,
        creatorIcon: cc.Sprite,
        zhuangNumIcon: cc.Sprite,
        nameLabel: cc.Label,
        _player : null,

        //石狮插水标志
        chaShuiIcon : cc.Sprite,

        //sss 头像相关
        sssWinNode : cc.Node,
        sssMainNode : cc.Node,

        //桦甸
        piaoIcon : cc.Sprite
    },

    // use this for initialization
    onLoad: function () {
    },

    setPlayer : function(data)
    {
        this._player = data;
        this.uid = this._player.uid;
    },

    setName: function(name) {
        this.nameLabel.string = getShortStr(name,4);
    },

    setHeadIcon: function(headimgurl) {
        if (headimgurl == undefined || headimgurl == '') {
            return;
        }

        var self = this;
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                self.headIcon.spriteFrame = new cc.SpriteFrame(texture);
            }  
        });
    },

    showZhuang: function(show) {
        this.zhuangIcon.node.active = show;
    },

    showCreator: function(show) {
        this.creatorIcon.node.active = show;
    },

    showZhuangNum: function(zhuang, num) {
        if (zhuang) {
            if (num == 1) {
                var texture = cc.textureCache.addImage(cc.url.raw('resources/newui/zuo1.png'));
                this.zhuangNumIcon.spriteFrame = new cc.SpriteFrame(texture);
                this.zhuangNumIcon.node.active = true;
            } else if (num == 2) {
                var texture = cc.textureCache.addImage(cc.url.raw('resources/newui/zuo2.png'));
                this.zhuangNumIcon.spriteFrame = new cc.SpriteFrame(texture);
                this.zhuangNumIcon.node.active = true;
            }
        } else {
            if (num == 1) {
                var texture = cc.textureCache.addImage(cc.url.raw('resources/newui/la1.png'));
                this.zhuangNumIcon.spriteFrame = new cc.SpriteFrame(texture);
                this.zhuangNumIcon.node.active = true;
            }if(num == 2){
                var texture = cc.textureCache.addImage(cc.url.raw('resources/newui/la2.png'));
                this.zhuangNumIcon.spriteFrame = new cc.SpriteFrame(texture);
                this.zhuangNumIcon.node.active = true;
            }
        }
    },

    enableHeadBtn: function(flag) {
        this.headBtn.node.active = flag;
    },

    onHeadBtnClicked: function(evt) {
        createPlayerInfoPanel(this._player);
    },

    setCoin : function(value)
    {
        var coinNode = cc.find('coin',this.node);
        var showStr = '';
        if(value > 0)
        {
            showStr = '+' + value; 
            coinNode.color =  new cc.Color(255, 204, 0);
        }
        else if(value < 0)
        {
            showStr = value;
            coinNode.color =  new cc.Color(0, 255, 246);
        }
        else
        {
            showStr = value;
            coinNode.color =  new cc.Color(0, 255, 36);
        }
        coinNode.getComponent(cc.Label).string = showStr;
    },
    setIsOnline : function (isOnline) {
        var disConncetNode = cc.find('/Disconnect', this.node);
        disConncetNode.active = !isOnline;
    },
    getLiuGuang : function(isPlay){
        var liuguang = cc.find('liuguang',this.node);
        liuguang.active = isPlay;
    },

    setCoin : function(value,type)
    {
        var coinNode = cc.find('coin',this.node);
        var showStr = '';
        var ScoreBase;
        if (type == 1) {
            ScoreBase = GameData.room.opts.scoreBase;
        }
        else if (type == 2) {
            ScoreBase = ReplayRoomData.opts.scoreBase;
        }

        if(ScoreBase > 0){
            showStr = value;
            coinNode.color =  new cc.Color(255, 204, 0);
        }else{
            if(value > 0)
            {
                showStr = '+' + value;
                coinNode.color =  new cc.Color(255, 204, 0);
            }
            else if(value < 0)
            {
                showStr = value;
                coinNode.color =  new cc.Color(0, 255, 246);
            }
            else
            {
                showStr = value;
                coinNode.color =  new cc.Color(0, 255, 36);
            }
        }

        coinNode.getComponent(cc.Label).string = showStr;
    },

    setGold : function(value)
    {
        var coinNode = cc.find('coin',this.node);
        var showStr = '';
        value != undefined ? showStr = value : null;
        coinNode.getComponent(cc.Label).string = showStr;
    },

    setChaShuiIconShow : function( direction )
    {
        var show = false;
        var player = GameData.getPlayerByPos(direction);
        if( player ) {
            if( GameDataShiShi.setWater[player.uid] > 0 ) {
                show = true;
            }
        }
        this.setChaShuiShow(show);

        if(show == true){
            switch ( direction ) {
                case "down":
                case "right":
                case "left":{
                    this.chaShuiIcon.node.y = 70;
                }break;
                case "up":{
                    this.chaShuiIcon.node.y = -90;
                }break;
            }
        }
    },

    setChaShuiShow:function( show ){
        this.chaShuiIcon.node.active = show;
    },

    setSSSWinNodeActive:function(show){
        this.sssWinNode.active = show;
    },

    setSSSMainNodeActive:function(show){
        this.sssMainNode.active = show;
    },

    setPiaoIconShow : function( direction )
        {
            this.piaoIcon.node.active = false;
            var player = GameData.getPlayerByPos(direction);
            if( player ) {
                if( profileHuaDian.getPiaoStateByUid(player.uid) > 0 ) {
                    this.piaoIcon.node.active = true;
                }
            }
        },
    // update: function (dt) {

    // },
});
