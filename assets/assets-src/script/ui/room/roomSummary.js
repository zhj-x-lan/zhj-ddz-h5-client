var configMgr = require('configMgr');
var gameDefine = require('gameDefine');
var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        panel: cc.Node,
        font: {
            default: [],
            type: [cc.Font]
        },

    },
    // use this for initialization
    onLoad: function () {
        registEvent('onShowSummary', this, this.onShow);
        registEvent('recordInfo', this, this.onShow);
    },

    onDestroy: function () {
        unregistEvent('onShowSummary', this, this.onShow);
        unregistEvent('recordInfo', this, this.onShow);
    },

    onShow: function () {
        cc.log("..showSummaryLayer");
        var idx = 0;
        // this.showPlayer(GameData.player, ++idx);
        for (var i = 0; i < GameData.joiners.length; i++) {
            // if (GameData.joiners[i].uid == GameData.player.uid) {
            //     continue;
            // }
            this.showPlayer(GameData.joiners[i], ++idx);
            var playerNode = cc.find('player_' + (i + 1), this.panel);
            playerNode.active = true;
        }
        for (var i = GameData.joiners.length; i < 4; i++) {
            var playerNode = cc.find('player_' + (i + 1), this.panel);
            playerNode.active = false;
        }
        for (var i = 0; i < GameData.joiners.length; i++) {
            if (GameData.joiners.length == 2) {
                var playerNode = cc.find('player_' + (i + 1), this.panel);
                playerNode.x = -155 + i * 310;
            } else if (GameData.joiners.length == 3) {
                var playerNode = cc.find('player_' + (i + 1), this.panel);
                playerNode.x = -310 + i * 310;
            }
        }
        var roomId = cc.find('strNode/roomid', this.panel);
        var createtime = cc.find('strNode/time', this.panel);

        roomId.getComponent("cc.Label").string = '房间号:' + GameData.player.roomid;
        var time = getTimeStr(GameData.room.createtime);
        createtime.getComponent("cc.Label").string = time[0] + '/' + time[1] + '/' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];

        //显示再来一局按钮
        // var againBtn = cc.find('btnAgain',this.panel);
        // againBtn.active = (GameData.room.creator == GameData.player.uid);
    },
    showPlayer: function (player, idx) {
        cc.log('player idx:' + idx + ' name:' + player.name + ' score:' + GameData.allScores[player.uid]);
        var nameNode = cc.find('player_' + idx + '/head_bg/name', this.panel);
        var uid = cc.find('player_' + idx + '/head_bg/id', this.panel);
        var scoreTxtNode = cc.find('player_' + idx + '/fieldBg', this.panel);
        var scoreNode = cc.find('player_' + idx + '/field_num1', this.panel);
        var headNode = cc.find('player_' + idx + '/head_bg/head', this.panel);

        // cc.log('nameNode:'+nameNode);
        // cc.log('scoreNode:'+scoreNode);
        uid.getComponent("cc.Label").string = 'ID:' + player.uid;
        if (isChinese(player.name)) {
            nameNode.getComponent("cc.Label").string = getShortStr(player.name, 5);
        } else {
            nameNode.getComponent("cc.Label").string = getShortStr(player.name, 9);
        }

        var GetScoreMaxUid = function () {
            var tempUid;
            tempUid = GameData.joiners[0].uid;
            for (let i = 1; i < GameData.joiners.length; i++) {
                if (GameData.joiners[i] && GameData.allScores[GameData.joiners[i].uid] > GameData.allScores[tempUid]) {
                    tempUid = GameData.joiners[i].uid;
                }
            }
            return tempUid;
        };

        var winNode = cc.find('player_' + idx + '/win', this.panel);
        var score = 0;
        //如果是金币场，隐藏总分图片
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            scoreTxtNode.active = false;

            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coins && coinData.coins[player.uid]){
                score = coinData.coins[player.uid];
            }
            winNode.active = (score > 0);
        } else {
            score = GameData.allScores[player.uid] - GameData.room.initScore;
            if (GetScoreMaxUid() == player.uid) {
                winNode.active = (GameData.allScores[GetScoreMaxUid()] - GameData.room.initScore > 0);
            } else {
                winNode.active = false;
            }
        }
        score == undefined ? score = 0 : null;
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

        if (player.headimgurl != null && player.headimgurl != '' || player.headimgurl.length > 0) {
            cc.loader.load({
                url: player.headimgurl,
                type: 'png'
            }, function (error, texture) {
                if (!error && texture) {
                    headNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }

        var owner = cc.find('player_' + idx + '/head_bg/Owner', this.panel);
        owner.active = (GameData.room.creator == player.uid);

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

    btnBackOnClicked: function (evt) {
        GameData.player.roomid = undefined;
        cc.director.loadScene('home');
    },
    recordInfoShow: function (uid, index) {
        //统计次数
        let hu_num = 0;
        let chan_num = 0;
        let ming_num = 0;
        let an_num = 0;

        let huNum = cc.find('player_' + index + '/tongji/hu', this.panel);
        let chanNum = cc.find('player_' + index + '/tongji/chan', this.panel);
        let minggang = cc.find('player_' + index + '/tongji/ming', this.panel);
        let angang = cc.find('player_' + index + '/tongji/an', this.panel);

        for (var i = 0; i < GameData.recordInfo.length; i++) {

            if (GameData.recordInfo[i].winner == uid) hu_num++;

            let gang = GameData.recordInfo[i].gangs;
            if (gang[uid]) {
                for (var m = 0; m < gang[uid].length; m++) {
                    let gangNum = gang[uid][m];
                    if (gangNum.length == 4) ming_num++;
                    else if (gangNum.length == 5) an_num++;
                }
            }

            if (GameData.recordInfo[i].zhuang == uid) {
                let type = GameData.recordInfo[i].type;
                for (var j = 0; j < type.length; j++) {
                    if (type[j] == 12) chan_num++;
                }
            }
        }

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
    },
    //再来一局点击事件
    // btnAgainOnClicked:function(){
    //     cc.director.loadScene('home');
    //     var createData = {
    //         gameType: GameData.client.gameType,
    //         roundRule:GameData.createRoomOpts.roundRule,
    //         roomType:GameData.createRoomOpts.roomTypes,
    //         costType:GameData.createRoomOpts.payType,
    //         joinermax:GameData.createRoomOpts.joinermax,
    //         clubId:0,
    //         playeruid: GameData.player.uid,
    //         feng: GameData.createRoomOpts.daiFeng,
    //         chan: GameData.createRoomOpts.daiChan,
    //         //disfeng: GameData.createRoomOpts.daZi,
    //         doubleGang: GameData.createRoomOpts.doubleGang,
    //         hd: GameData.createRoomOpts.huierDiao,
    //         longwufan:GameData.createRoomOpts.longwufan,
    //         times: GameData.createRoomOpts.times,
    //         jingang:GameData.createRoomOpts.jGangScore,
    //         lazhuang:GameData.createRoomOpts.laType,
    //     };
    //     console.log('GameData.createRoomOpts.joinermax ='+JSON.stringify(createData));
    //     RoomHandler.createRoom(createData);
    // },
});
