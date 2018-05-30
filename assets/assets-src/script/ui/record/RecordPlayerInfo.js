cc.Class({
    extends: cc.Component,

    properties: {
        headerSprite: cc.Sprite,
        playerNameLabel: cc.Label,
        idNode: cc.Node,
        idLabel: cc.Label,
        jifenLabel: cc.Label,
        recordScore: cc.Node,
        roundScore: cc.Node,
        font: {
            default: [],
            type: [cc.Font]
        },
    },

    // use this for initialization
    onLoad: function () {
        // this.playerNameLabel.string = '';
        // this.idLabel.string = '';
        // this.jifenLabel.string = '';
        // this.zongfenLabel.string = '';
    },

    setName: function (name) {
        this.playerNameLabel.string = name;
    },

    setHeadIcon: function (headimgurl) {
        if (headimgurl == undefined || headimgurl == '') {
            return;
        }

        var self = this;
        cc.loader.load({
            url: headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (texture !== null) {
                self.headerSprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    setId: function (id) {
        this.idLabel.string = id;
    },

    setJifen: function (score) {
        if (score == undefined) {
            this.jifenLabel.string = '';
        } else {
            this.jifenLabel.string = score;
        }

    },

    setZongfen: function (changeNum, score) {
        var zongfenLabel;
        cc.log('changeNum = '+changeNum+',score = '+score);
        if (changeNum == 1) {
            this.roundScore.active = true;
            this.idNode.active = true;
            this.recordScore.active = false;
            zongfenLabel = cc.find('total_score',this.roundScore);
        } else {
            this.roundScore.active = false;
            this.idNode.active = false;
            this.recordScore.active = true;
            zongfenLabel = cc.find('recordScore',this.recordScore);
        }
        this.setHeadPosition(changeNum);
        if (score > 0) {
            zongfenLabel.getComponent('cc.Label').font = this.font[0];
            zongfenLabel.getComponent('cc.Label').string = '+' + score;
        } else if (score < 0) {
            zongfenLabel.getComponent('cc.Label').font = this.font[1];
            zongfenLabel.getComponent('cc.Label').string = score;
        } else {
            zongfenLabel.getComponent('cc.Label').font = this.font[2];
            zongfenLabel.getComponent('cc.Label').string = score;
            zongfenLabel.color = new cc.Color(0, 255, 36);
        }
    },
    setHeadPosition: function(type){
        var headNode = this.headerSprite.node.parent;
        if (type == 2) {
            headNode.setPosition(cc.p(40,0));
        }else{
            headNode.setPosition(cc.p(0,0));
        }
    },
    showWinner: function(ac){
        var winner = cc.find('winner',this.recordScore);
        winner.active = ac;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});