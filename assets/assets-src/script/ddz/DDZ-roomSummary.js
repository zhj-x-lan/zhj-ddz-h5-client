var configMgr = require('configMgr');
var gameDefine = require('gameDefine');
var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        panel: cc.Node,

        fonts: {
            default: [],
            type: cc.Font
        },

        lostNode: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function () {
        registEvent('onShowSummary', this, this.onShow);
    },

    onDestroy: function () {
        unregistEvent('onShowSummary', this, this.onShow);
    },

    onShow: function () {
        this.showTime();
        this.hideLostNode();
        // //将四个结算模板位置复原
        // cc.find('player_1', this.panel).y = 0;
        // cc.find('player_2', this.panel).y = 0;
        // cc.find('player_3', this.panel).y = 0;
        // cc.find('player_4', this.panel).y = 0;

        // for (var i=0; i<GameData.joiners.length; i++) {
        //     // if (GameData.joiners[i].uid == GameData.player.uid) continue;
        //     this.showPlayer(GameData.joiners[i], i+1);
        //     var playerNode = cc.find('player_'+(i+1), this.panel);
        //     playerNode.active = true;
        //     //根据人数设置位置
        //     if( GameData.joiners.length == 3 && i == 1 ) {
        //         playerNode.y = 25;
        //     }
        //     else if( GameData.joiners.length == 4 && i == 1 ) {
        //         playerNode.y = 25;
        //     }
        //     else if( GameData.joiners.length == 4 && i == 3 ) {
        //         playerNode.y = 25;
        //     }
        // }
        // for (var i=GameData.joiners.length; i<4; i++) {
        //     var playerNode = cc.find('player_'+(i+1), this.panel);
        //     
        for (var i = 0; i < GameData.joiners.length; i++) {
            this.showPlayer(GameData.joiners[i], i + 1);
        }
    },
    hideLostNode: function() {
        for (var key in this.lostNode.children)
        {
            this.lostNode.children[key].active = false;
        }
    },
    showTime: function () {
        let roomID = cc.find('roomID', this.panel);
        let dateNode = cc.find('date', this.panel);
        let timeNode = cc.find('time', this.panel);

        let date = new Date(GameData.room.createtime);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        if (hours < 10) {
            hours = '0' + hours + ':';
        } else {
            hours = hours + ':';
        }
        let minute = date.getMinutes();
        if (minute < 10) {
            minute = '0' + minute + ':';
        } else {
            minute = minute + ':';
        }
        let second = date.getSeconds();
        if (second < 10) {
            second = '0' + second;
        } else {
            second = second;
        }

        roomID.getComponent("cc.Label").string = "房号 : " + GameData.room.id;
        dateNode.getComponent("cc.Label").string = year + "-" + month + "-" + day;
        timeNode.getComponent("cc.Label").string = hours + minute + second;
    },

    showPlayer: function (player, idx) {
        if (!player) return;
        let joinermax = GameData.room.opts.joinermax; //玩家人數
        var nameNode = cc.find('player_' + idx + '/name', this.panel);
        var scoreTxtNode = cc.find('player_' + idx + '/field_text1', this.panel);
        var scoreNode = cc.find('player_' + idx + '/field_num1', this.panel);
        var headNode = cc.find('player_' + idx + '/head', this.panel);
        let playerID = cc.find('player_' + idx + '/playerID', this.panel);
        let pNode = cc.find('player_' + idx, this.panel);
        var maxScore = cc.find('player_' + idx + '/maxScore', this.panel);
        var maxBobm = cc.find('player_' + idx + '/maxBobm', this.panel);
        let panelSize = cc.find('bg', this.panel).getContentSize().width;
        let playerNodeSize = cc.find('player_' + idx + '/biankuang', this.panel).getContentSize().width;
        var owner = cc.find('player_' + idx + '/owner', this.panel);
        owner.active = (GameData.room.creator == player.uid);
        if (isChinese(player.name)) {
            nameNode.getComponent("cc.Label").string = getShortStr(player.name, 5);
        } else {
            nameNode.getComponent("cc.Label").string = getShortStr(player.name, 9);
        }
        playerID.getComponent("cc.Label").string = "ID:" + player.uid;

        if (GameDataDDZ.roomsummaryData && Object.keys(GameDataDDZ.roomsummaryData).length != 0) {
            console.log('1111111111:' + JSON.stringify(GameDataDDZ.roomsummaryData));
            if (Object.keys(GameDataDDZ.roomsummaryData.maxFen).length != 0) {
                maxScore.getComponent("cc.Label").string = '单局最高分:' + GameDataDDZ.roomsummaryData.maxFen[player.uid];
            }
            if (Object.keys(GameDataDDZ.roomsummaryData.maxBoom).length != 0) {
                maxBobm.getComponent("cc.Label").string = '打出炸弹数:' + GameDataDDZ.roomsummaryData.maxBoom[player.uid];
            }
        }
        if (player.headimgurl != null && player.headimgurl != '') {
            cc.loader.load({
                url: player.headimgurl,
                type: 'png'
            }, function (error, texture) {
                if (!error && texture) {
                    cc.log('player.headimgurl:' + player.headimgurl);
                    headNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
        var winNode = cc.find('player_' + idx + '/win', this.panel);
        winNode.active = false;
        var score = 0;
        //如果是金币场，隐藏总分图片
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            scoreTxtNode.active = false;

            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coins && coinData.coins[player.uid]){
                score = coinData.coins[player.uid];
            }
            //winNode.active = (score > 0);
        } else {
            if (GameDataDDZ.roomsummaryData.score != null) {
                score = GameDataDDZ.roomsummaryData.score[player.uid];

                var GetScoreMaxUid = function () {
                    var tempUid;
                    tempUid = GameData.joiners[0].uid;
                    for (let i = 1; i < GameData.joiners.length; i++) {
                        if (GameData.joiners[i] && GameDataDDZ.roomsummaryData.score[GameData.joiners[i].uid] > GameDataDDZ.roomsummaryData.score[tempUid]) {
                            tempUid = GameData.joiners[i].uid;
                        }
                    }
                    return tempUid;
                };
                if (GameDataDDZ.roomsummaryData.score[GetScoreMaxUid()] == GameDataDDZ.roomsummaryData.score[player.uid]) {
                    //winNode.active = (GameDataDDZ.roomsummaryData.score[GetScoreMaxUid()] > 0);
                }
            }
        }
        score == undefined ? score = 0 : null;
        if (score > 0) {
            scoreNode.getComponent("cc.Label").string = "+" + score;
            scoreNode.getComponent('cc.Label').font = this.fonts[1];
        } else if (score < 0) {
            scoreNode.getComponent("cc.Label").string = score;
            scoreNode.getComponent('cc.Label').font = this.fonts[0];
        } else {
            scoreNode.getComponent("cc.Label").string = score;
            scoreNode.getComponent('cc.Label').font = this.fonts[2];
        }

        if (GameData.room.creator == player.uid) {
            let ownerNode = cc.find('player_' + idx + '/owner', this.panel);
            ownerNode.active = true;
        }
    },

    btnBackOnClicked: function (evt) {
        GameData.player.roomid = undefined;
        cc.director.loadScene('home');
    },
    btnShareOnClicked: function () {
        if (inCD(3000)) {
            return;
        }
        screenShoot(wxShareTexture);
    },

});