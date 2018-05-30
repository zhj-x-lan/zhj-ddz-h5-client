var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        panel: cc.Node,
        font: {
            default: [],
            type: [cc.Font]
        },

        _curGameData: undefined
    },

    onLoad: function () {
        registEvent('onShowSummary', this, this.onShow);
    },
    onDestroy: function () {
        unregistEvent('onShowSummary', this, this.onShow);
    },

    onShow: function () {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }

        var idx = 0;
        var playerNode;
        this.showPlayer(GameData.player, ++idx);

        for (var i = 0; i < GameData.joiners.length; i++) {
            if (GameData.joiners[i].uid == GameData.player.uid) {
                continue;
            }
            this.showPlayer(GameData.joiners[i], ++idx);
            playerNode = cc.find('player_'+ (i +1), this.panel);
            playerNode.active = true;
        }
        for (i = GameData.joiners.length; i < 4; i++) {
            playerNode = cc.find('player_'+ (i +1), this.panel);
            playerNode.active = false;
        }
        for (i = 0; i < GameData.joiners.length; i++) {
            if (GameData.joiners.length == 2) {
                playerNode = cc.find('player_'+ (i +1), this.panel);
                playerNode.x = -155 + i * 310;
            } else if (GameData.joiners.length == 3) {
                playerNode = cc.find('player_'+ (i +1), this.panel);
                playerNode.x = -310 + i * 310;
            }
        }
        var roomId = cc.find('strNode/roomid', this.panel);
        var createtime = cc.find('strNode/time', this.panel);

        roomId.getComponent("cc.Label").string = '房间号:' + roomData.id;
        var time = getTimeStr(roomData.createtime);
        createtime.getComponent("cc.Label").string = time[0] + '/' + time[1] + '/' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];
    },

    showPlayer: function (player, idx) {
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        var scoreData = RoomHandler.getScoreData();
        if(scoreData == undefined){
            return;
        }

        var nameNode = cc.find('player_' + idx + '/head_bg/name', this.panel);
        var uid = cc.find('player_' + idx + '/head_bg/id', this.panel);
        var scoreNode = cc.find('player_' + idx + '/field_num1', this.panel);
        var headNode = cc.find('player_' + idx + '/head_bg/head', this.panel);

        uid.getComponent("cc.Label").string = 'ID:' + player.uid;
        if (isChinese(player.name)) {
            nameNode.getComponent("cc.Label").string = getShortStr(player.name, 8);
        } else {
            nameNode.getComponent("cc.Label").string = getShortStr(player.name, 10);
        }

        var score = scoreData[player.uid];
        if (score > 0) {
            scoreNode.getComponent("cc.Label").font = this.font[0];
            scoreNode.getComponent("cc.Label").string = '+' + score;
        } else if (score < 0) {
            scoreNode.getComponent("cc.Label").font = this.font[1];
            scoreNode.getComponent("cc.Label").string = score;
        } else {
            scoreNode.getComponent("cc.Label").font = this.font[2];
            scoreNode.getComponent("cc.Label").string = score;
        }

        var imgUrl = player.headimgurl;
        var headSprite = headNode.getComponent(cc.Sprite);
        this.setIcon(headSprite, imgUrl);

        var GetScoreMaxUid = function () {
            var tempUid;
            tempUid = GameData.joiners[0].uid;
            for (var i = 1; i < GameData.joiners.length; i++) {
                if (GameData.joiners[i] && scoreData[GameData.joiners[i].uid] > scoreData[tempUid]) {
                    tempUid = GameData.joiners[i].uid;
                }
            }
            return tempUid;
        };
        var winNode = cc.find('player_' + idx + '/win', this.panel);
        if (GetScoreMaxUid() == player.uid) {
            winNode.active = (scoreData[GetScoreMaxUid()] - roomData.initScore > 0);
        } else {
            winNode.active = false;
        }

        var owner = cc.find('player_' + idx + '/head_bg/Owner', this.panel);
        owner.active = roomData.creator == player.uid ? true : false;

        var selfBg = cc.find('player_' + idx + '/selfBg', this.panel);
        var playerBg = cc.find('player_' + idx + '/playerBg', this.panel);
        if (player.uid == GameData.player.uid) {
            selfBg.active = true;
            playerBg.active = false;
        } else {
            selfBg.active = false;
            playerBg.active = true;
        }
        this.recordInfoShow(player.uid, idx);
    },
    setIcon: function(sprite, imgUrl){
        if(sprite == undefined || imgUrl == undefined || imgUrl.length <= 0){
            return;
        }
        cc.loader.load({url: imgUrl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    btnBackOnClicked: function (evt) {
        GameData.player.roomid = undefined;
        cc.director.loadScene('home');
    },
    recordInfoShow: function (uid, index) {
        //统计次数
        var hu_num = 0,
            chan_num = 0,
            ming_num = 0,
            an_num = 0;

        var huNum = cc.find('player_' + index + '/tongji/hu', this.panel);
        var chanNum = cc.find('player_' + index + '/tongji/chan', this.panel);
        var minggang = cc.find('player_' + index + '/tongji/ming', this.panel);
        var angang = cc.find('player_' + index + '/tongji/an', this.panel);

        huNum.getComponent("cc.Label").string = '胡牌次数:  ' + hu_num;
        chanNum.getComponent("cc.Label").string = '被铲次数:  ' + chan_num;
        minggang.getComponent("cc.Label").string = '明杠次数:  ' + ming_num;
        angang.getComponent("cc.Label").string = '暗杠次数:  ' + an_num;
    },
    btnShareOnClicked: function () {
        if (inCD(3000)) {
            return;
        }
        screenShoot(wxShareTexture);
    }
});
