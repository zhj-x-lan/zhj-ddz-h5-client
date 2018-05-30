cc.Class({
    extends: cc.Component,

    properties: {
        uid: 0,
        headBtn: cc.Button,
        headIcon: cc.Sprite,
        zhuangIcon: cc.Sprite,
        zhuangNumIcon: cc.Sprite,
        nameLabel: cc.Label,
        score: cc.Node,
        _player: null,
        fonts: {
            default: [],
            type: cc.Font
        },
        tiChuaiNode: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    setPlayer: function (data) {
        this._player = data;
        this.uid = this._player.uid;
    },

    setName: function (name) {
        this.nameLabel.string = getShortStr(name, 4);
    },

    setHeadIcon: function (headimgurl) {
        if (headimgurl == undefined || headimgurl == '' || headimgurl.length <= 0) {
            return;
        }
        var self = this;
        cc.loader.load({
            url: headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (!error && texture) {
                self.headIcon.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    //玩家身份
    showPlayerIdentity: function (show, type) {
        this.setIsPlayerIcon(show);
        //type 1 -地主 2-农民
        if (type == 1) {
            var texture = cc.textureCache.addImage(cc.url.raw('resources/ddz/UI/common/icon/dizhu_icon.png'));
            this.zhuangIcon.spriteFrame = new cc.SpriteFrame(texture);
        } else if (type == 2) {
            var texture = cc.textureCache.addImage(cc.url.raw('resources/ddz/UI/common/icon/nongmin_icon.png'));
            this.zhuangIcon.spriteFrame = new cc.SpriteFrame(texture);
        }
    },
    setIsPlayerIcon: function (show) {
        this.zhuangIcon.node.active = show;
    },
    setNamePositionByDir: function (direction) {
        if (direction == 'right') {
            this.nameLabel.node.x = -50;
            this.score.x = -50;
            this.zhuangIcon.node.x = 33;
            console.log('this.nameLabel:' + this.nameLabel.horizontalAlign);
            this.nameLabel.horizontalAlign = 3;
            this.nameLabel.node.anchorX = 1;
            this.score.horizontalAlign = 3;
            this.score.anchorX = 1;
            var bg = cc.find('bg', this.node);
            bg.scaleX = -1;
            bg.x = -29;
        }
    },
    showZhuangNum: function (zhuang, num) {},

    enableHeadBtn: function (flag) {
        this.headBtn.node.active = flag;
    },

    onHeadBtnClicked: function (evt) {
        createPlayerInfoPanel(this._player);
    },

    setCoin: function (value, type) {
        var coinNode = cc.find('score', this.node);
        var showStr = '';
        if (value > 0) {
            showStr = '+' + value;
            coinNode.getComponent('cc.Label').font = this.fonts[0];
        } else if (value < 0) {
            showStr = value;
            coinNode.getComponent('cc.Label').font = this.fonts[1];
        } else if (value == 0) {
            showStr = value;
            coinNode.getComponent('cc.Label').font = this.fonts[2];
        }
        coinNode.getComponent(cc.Label).string = showStr;
    },

    setGold: function (value) {
        var coinNode = cc.find('score', this.node);
        var showStr = 0;
        value != undefined ? showStr = value : null;

        if (showStr > 0) {
            coinNode.getComponent('cc.Label').font = this.fonts[0];
        } else if (showStr < 0) {
            coinNode.getComponent('cc.Label').font = this.fonts[1];
        } else {
            coinNode.getComponent('cc.Label').font = this.fonts[2];
        }
        coinNode.getComponent(cc.Label).string = showStr;
    },

    getLiuGuang: function (isPlay) {
        var liuguang = cc.find('liuguang', this.node);
        liuguang.active = isPlay;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});