var tdk_roomData = require('tdkRoomData');
var gameDefine = require('gameDefine');
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
        winNumLbl: cc.Label,
        loseNumLbl: cc.Label,
        baoNumLbl: cc.Label,
        doubleKingLbl: cc.Label,
        fourSameLbl: cc.Label,
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
        this.userIdLbl.string = "ID: " + player.uid;
        
        var self = this;
        this.headIcon.getComponent(cc.Sprite).spriteFrame = null;
        if(player.headimgurl != null && player.headimgurl != '' && player.headimgurl.length > 0)
        {
            cc.loader.load({url: player.headimgurl, type: 'png'}, function (error, texture) {
                if (!error && texture) {
                   self.headIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
        this.winNumLbl.string = 0;
        this.loseNumLbl.string = 0;
        this.baoNumLbl.string = 0;
        this.doubleKingLbl.string = 0;
        this.fourSameLbl.string = 0;
        var resultInfo = tdk_roomData.resultData;
        if (tdk_roomData.resultData.statis && tdk_roomData.resultData.statis[player.uid]) {
            this.winNumLbl.string = resultInfo.statis[player.uid].win;
            this.loseNumLbl.string = resultInfo.statis[player.uid].lost;
            this.baoNumLbl.string = resultInfo.statis[player.uid].baozi;
            this.doubleKingLbl.string = resultInfo.statis[player.uid].kings;
            this.fourSameLbl.string = resultInfo.statis[player.uid].zhadan;
        }
        var scoreData;
        var eveScore = 0;
        if (GameData.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            if (roomHandler.coinData.coins) {
                scoreData = roomHandler.coinData.coins;
                eveScore = scoreData[player.uid];
            }
        }else if (GameData.room.opts.currencyType == gameDefine.currencyType.Currency_Card) {
            if (tdk_roomData.resultData.score && tdk_roomData.resultData.score[player.uid]) {
                scoreData = resultInfo.score;
                eveScore = scoreData[player.uid];
            }
        }
        if (eveScore > 0) {
            this.roomScoreLbl.string = "+"+eveScore;
            this.roomScoreLbl.font = this.fonts[0];
        }else if (eveScore < 0) {
            this.roomScoreLbl.string = eveScore;
            this.roomScoreLbl.font = this.fonts[1];
        }else if (eveScore == 0) {
            this.roomScoreLbl.string = eveScore;
            this.roomScoreLbl.font = this.fonts[2];
        }

        var GetScoreMaxUid = function() {
            var maxScore = [];
            // tempUid = playersInfo[0].player.uid;
            for (var key in scoreData) {
                maxScore.push(scoreData[key]);
            }
            var index = 0;
            for (var i = 1; i < maxScore.length; i++) {
                if (maxScore[i] && maxScore[i] > maxScore[index]) {
                    index = i;
                }
            }
            return maxScore[index];
        }
        if (GetScoreMaxUid() == scoreData[player.uid]) {
            this.maxWinner.active = true;
        }
        this.creatorIcon.active = player.uid == GameData.room.creator;

    },
    getActiveNode: function(){
        return this.infoNode;
    },
    initData : function (playerInfo) {
        if (!playerInfo) return;
        this._playerInfo = playerInfo;
        cc.log('tdk_roomData.resultData = '+JSON.stringify(tdk_roomData.resultData));
        if (Object.keys(tdk_roomData.resultData).length > 0) {
            this.initUI();
        }
    }
});