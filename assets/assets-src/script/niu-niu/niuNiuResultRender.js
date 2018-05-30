var roomHandler = require('roomHandler'); 
cc.Class({
    extends: cc.Component,
    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        maxWinner: cc.Node,
        nameLbl: cc.Label,
        userIdLbl: cc.Label,
        niuNiuNumLbl: cc.Label,
        wuNiuNumLbl: cc.Label,
        winNumLbl: cc.Label,
        selfBgFrame: cc.Node, //自己背景框
        creatorIcon: cc.Node, //房主图标
        headIcon: cc.Node,
        roomScoreLbl: cc.Label,
        fonts: [cc.Font],
        _playerInfo: null,

        infoNode: cc.Node,

    },

    onLoad: function () {

    },

    initUI: function () {
        var player = this._playerInfo; // 玩家信息

        JSON.stringify("结算玩家数据  " + JSON.stringify(player));

        this.nameLbl.string = getShortStr(player.name,10);
        this.userIdLbl.string = "ID: " + player.uid,
        this.niuNiuNumLbl.string ='';
        this.winNumLbl.string = '';
        this.wuNiuNumLbl.string = '';
        var self = this;
        if(player.headimgurl != null && player.headimgurl != '')
        {
            cc.loader.load({url: player.headimgurl, type: 'png'}, function (error, texture) {
                if (!error && texture) {
                   self.headIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }

        var score = roomHandler.scores[player.uid];

        if (score > 0) {
            this.roomScoreLbl.string = "+"+score;
            this.roomScoreLbl.font = this.fonts[0];
        }else if (score < 0) {
            this.roomScoreLbl.string = score;
            this.roomScoreLbl.font = this.fonts[1];
        }else if (score == 0) {
            this.roomScoreLbl.string = score;
            this.roomScoreLbl.font = this.fonts[2];
        }
        var playersInfo = roomHandler.players;
        console.log('playersInfo = '+JSON.stringify(playersInfo));
        var GetScoreMaxScore = function() {
            var maxScore = [];
            // tempUid = playersInfo[0].player.uid;
            for (var key in roomHandler.scores) {
                maxScore.push(roomHandler.scores[key]);
            }
            var index = 0;
            for (var i = 1; i < maxScore.length; i++) {
                if (maxScore[i] && maxScore[i] > maxScore[index]) {
                    index = i;
                }
            }
            return maxScore[index];
        }
        if (GetScoreMaxScore() == score) {
            this.maxWinner.active = true;
        }
        //this.selfBgFrame.active = player.uid == GameData.player.uid;
        this.creatorIcon.active = player.uid == roomHandler.room.creator;

    },
    getActiveNode: function(){
        return this.infoNode;
    },
    initData : function (playerInfo) {
        this._playerInfo = playerInfo;
        if (this._playerInfo) {
            this.initUI();
        }
    }
});