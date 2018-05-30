cc.Class({
    extends: cc.Component,

    properties: {
        resultIcon: cc.Node,
        roomID: cc.Label,
        createtime: cc.Label,
        roundData: cc.Label,

        isMark: 0,
        font: {
            default: [],
            type: [cc.Font]
        },
    },

    // use this for initialization
    onLoad: function () {
        this.onShow();
    },

    onClose: function (evt) {
        ReplayDataCenter.openReplayPanel = true;
        cc.director.getScheduler().setTimeScale(1);
        cc.director.loadScene('home');
    },

    onShow: function () { 
        this.tiChuaiData = [];
        for (var key in ReplayData.game.actions) {
            if (ReplayData.game.actions[key].action == 'startTi' || ReplayData.game.actions[key].action == 'startChuai') {
                this.tiChuaiData.push(ReplayData.game.actions[key]);
            }
        }  
        for (var i = 0; i < ReplayData.players.length; i++) {
            this.showCards(i);
            this.showPlayer(i);
            this.showScore(i);
            this.showDetail(i);
        }
        this.showRoundInfo();
        this.showResultIcon();
        this.showDetain();
    },
    showResultIcon: function () {
        var Uid;
        if (otherReplay[0] == true) {
            for (var key in ReplayRoomData.players) {
                if (key) {
                    Uid = ReplayRoomData.players[key].uid;
                    break;
                }
            }
        }else{
            Uid = GameData.player.uid;
        }
        var myScore = ReplayData.scores[Uid];
        var iconUrl = '';
        var texture;
        if (myScore > 0) {
            iconUrl = 'resources/ddz/UI/result/woyingle' + '.png';
            texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.resultIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);;
        } else if (myScore < 0) {
            iconUrl = 'resources/ddz/UI/result/shibaile' + '.png';
            texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            this.resultIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);;
        }
    },
    showRoundInfo: function () {
        this.roomID.string = "房号：" + ReplayData.room;

        var time = getTimeStr(ReplayRoomData.createtime);
        this.createtime.string = time[0] + '/' + time[1] + '/' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];

        var showRoundNum = 0;
        if (ReplayRoomData.games != undefined)
        {
            for (var i = 0; i < ReplayRoomData.games.length; i++) {
                if (ReplayData.id == ReplayRoomData.games[i].id) {
                    showRoundNum = i + 1;
                }
            }
        }
        else if (ReplayRoomData.record != undefined)
        {
            for (var i = 0; i < ReplayRoomData.record.length; i++) {
                if (ReplayData.id == ReplayRoomData.record[i].id) {
                    showRoundNum = i + 1;
                }
            }
        }
        this.roundData.string = "第" + showRoundNum + "局";
    },

    showDetail: function (index) {
        // var player = ReplayData.players[index];
        // var termNode = cc.find('player'+(index+1)+'/term', this.node);
        // var label = termNode.getComponent('cc.Label');
        // var huTypeStr = [];
        // if (ReplayData.zimo && ReplayData.zimo.winner == player.uid) {
        //     var huType = ReplayData.zimo.type;
        //     huTypeStr = ReplayDataCenter.replayResultDetail(huType);    
        //     label.string = huTypeStr[0];
        // } else {
        //     label.string = '';
        // }
        // console.log('huTypeStr = '+JSON.stringify(huTypeStr));
        // if (ReplayData.opts.zhuang == player.uid) {
        //     if (huTypeStr[1] == true) {
        //         label.string += '铲牌 -1   ';
        //     }
        // }else{
        //     label.string += '';
        // }
        // if (ReplayRoomData.opts.times) {
        //     if (ReplayRoomData.opts.times == 1) label.string += '底分 *1   ';
        //     else if (ReplayRoomData.opts.times == 2) label.string += '底分 *2   ';
        //     else if (ReplayRoomData.opts.times == 5) label.string += '底分 *5   ';
        // }

        // var index1 = 0,index2 = 0;
        // for (var i=0; i<this.gangCard.length; i++) {
        //     if (ReplayDataCenter.isHuier(this.gangCard[i][0])) {label.string += '金杠 ' + '+' + ReplayRoomData.opts.jingang+'   ';}
        //     else if (this.gangCard[i].length == 4) index1++;
        //     else if (this.gangCard[i].length == 5) index2++;
        // }
        // if (index1 == 0){}else{label.string += '明杠 +1*'+index1+'  ';};
        // if (index2 == 0){}else{label.string += '暗杠 +2*'+index2+'  ';};
        // if((index1>0||index2>0)&& ReplayRoomData.opts.doubleGang==true && ReplayData.opts.zhuangnum[ReplayData.opts.zhuang] > 0){
        //     label.string += '杠翻番  ';
        // }

        // if (ReplayData.opts.zhuang == player.uid && ReplayData.opts.zhuangnum[player.uid] > 0) {
        //     var zhuangNum = ReplayData.opts.zhuangnum[player.uid];
        //     var score = zhuangNum * 2;
        //     label.string += '坐'+zhuangNum+'庄 *'+ score;
        // } else if (ReplayData.opts.zhuang != player.uid && ReplayData.opts.zhuangnum[player.uid] > 0) {
        //     var zhuangNum = ReplayData.opts.zhuangnum[player.uid];
        //     var score = zhuangNum * 2;
        //     label.string += '拉'+zhuangNum+'庄 *'+score;
        // }            
    },

    showPlayer: function (index) {
        var player = ReplayData.players[index];
        var idNode = cc.find('player_' + (index + 1) + '/headNode/playerID', this.node);
        var nameNode = cc.find('player_' + (index + 1) + '/headNode/name', this.node);
        var headpicNode = cc.find('player_' + (index + 1) + '/headNode/head', this.node);
        var player_name = player.name.substring(0, 4) + '...'

        nameNode.getComponent(cc.Label).string = player_name;
        idNode.getComponent(cc.Label).string = player.uid;
        //显示身份icon
        this.showPlayerIdentity(player, index);
        //显示倍数
        this.showMultiple(player, index);
        if (player.headimgurl == undefined || player.headimgurl == '') {
            return;
        }

        cc.loader.load({
            url: player.headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (!error && texture) {
                headpicNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    showCards: function (index) {
        var player = ReplayData.players[index];
        var playerNode = cc.find('player_' + (index + 1), this.node);
        var parent = cc.find('cardsNoe', playerNode);
        var uid = player.uid;
        var playCard;
        for (var key = 0; key < ReplayData.game.cards.length; key++) {
            if (ReplayData.game.cards[key].uid == uid) {
                playCard = ReplayData.game.cards[key].cards;
                break;
            }
        }
        //手牌
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
        for (var i = 0; i < playCard.length; i++) {
            var card = parent.getChildByName('card_' + i);
            card.active = true;
            this.showCardContent(card, playCard[i]);
        }
    },
    showPlayerIdentity: function (player, index) {
        var Identity = cc.find('player_' + (index + 1) + '/headNode/identity_icon', this.node);
        //cc.log('Identity:'+Identity);
        var iconUrl = '';

        if (player.uid == ReplayData.game.opts.dizhu) {
            iconUrl = 'resources/ddz/UI/common/icon/' + 'dizhu_icon' + '.png';
        } else {
            iconUrl = 'resources/ddz/UI/common/icon/' + 'nongmin_icon' + '.png';
        }
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        Identity.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showDetain: function() {
        if (ReplayRoomData.opts.detain > 0)
        {
            var detain = cc.find('panel/detain/label', this.node);
            var resultData;
            for (var key in ReplayData.game.actions) {
                if (ReplayData.game.actions[key].action == 'over') {
                    resultData = ReplayData.game.actions[key];
                }
            }
            detain.getComponent(cc.Label).string ='押底:' + resultData.data.detain;
            detain.parent.active = true;
        }
        else 
        {
            var detain = cc.find('panel/detain/label', this.node);
            detain.parent.active = false;
        }
    },
    showMultiple: function (player, index) {
        var difen = cc.find('player_' + (index + 1) + '/difen/label', this.node);
        var beishu = cc.find('player_' + (index + 1) + '/beishu/label', this.node);
        cc.log('ReplayData:' + JSON.stringify(ReplayData.game.actions));
        var resultData;
        for (var key in ReplayData.game.actions) {
            if (ReplayData.game.actions[key].action == 'over') {
                resultData = ReplayData.game.actions[key];
                break;
            }
        }
        difen.getComponent(cc.Label).string = resultData.data.remainFen;
        beishu.getComponent(cc.Label).string = resultData.data.boomNum;

        difen.parent.y = 210;
        beishu.parent.y = 162;

        var shouDi = cc.find('player_' + (index + 1) + '/shouDi/label', this.node);
        var kuiDi = cc.find('player_' + (index + 1) + '/kuiDi/label', this.node);
        shouDi.parent.active = false;
        kuiDi.parent.active = false;

        if (ReplayRoomData.opts.detain > 0)
        {
            this.showDetainScore(difen, beishu, player, index, resultData);
        }
        if (ReplayRoomData.opts.kicking == true)
        {
            this.showPlayerTiChuai(index);
        }
    },
    showDetainScore: function(difen, beishu, player, index, resultData) {
        cc.log('showDetainScore');
        if (resultData.data.flag == true) 
        {
            if (player.uid == ReplayData.game.opts.dizhu)
            {
                if (resultData.data.detainData < 0)
                {
                    difen.parent.y = 239;
                    beishu.parent.y = 209;

                    var shouDi = cc.find('player_' + (index + 1) + '/shouDi/label', this.node);
                    shouDi.getComponent(cc.Label).string = resultData.data.detainInfo[player.uid];
                    shouDi.parent.active = true;
                    shouDi.parent.y = 141;

                    var kuiDi = cc.find('player_' + (index + 1) + '/kuiDi/label', this.node);
                    kuiDi.getComponent(cc.Label).string = - resultData.data.detainData;
                    kuiDi.parent.active = true;
                    kuiDi.parent.y = 176;
                }
                else 
                {
                    difen.parent.y = 226;
                    beishu.parent.y = 190;

                    var shouDi = cc.find('player_' + (index + 1) + '/shouDi/label', this.node);
                    shouDi.getComponent(cc.Label).string = resultData.data.detainInfo[player.uid];
                    shouDi.parent.active = true;
                    shouDi.parent.y = 155;
                }
            }
            else
            {
                difen.parent.y = 226;
                beishu.parent.y = 190;

                var shouDi = cc.find('player_' + (index + 1) + '/shouDi/label', this.node);
                shouDi.getComponent(cc.Label).string = resultData.data.detainInfo[player.uid];
                shouDi.parent.active = true;
                shouDi.parent.y = 155;
            }
        }
        else if (resultData.data.flag == undefined)
        {
            if (player.uid == ReplayData.game.opts.dizhu)
            {
                if (resultData.data.detainInfo > 0)
                {
                    difen.parent.y = 226;
                    beishu.parent.y = 190;

                    var shouDi = cc.find('player_' + (index + 1) + '/shouDi/label', this.node);
                    shouDi.getComponent(cc.Label).string = resultData.data.detainInfo;
                    shouDi.parent.active = true;
                    shouDi.parent.y = 155;
                }
                else if (resultData.data.detainInfo < 0)
                {
                    difen.parent.y = 226;
                    beishu.parent.y = 190;

                    var kuiDi = cc.find('player_' + (index + 1) + '/kuiDi/label', this.node);
                    kuiDi.getComponent(cc.Label).string = - resultData.data.detainInfo;
                    kuiDi.parent.active = true;
                    kuiDi.parent.y = 155;
                }
            }
        }
    },
    showPlayerTiChuai: function(index) {
        var uid = ReplayData.players[index].uid;

        for (var key = 0; key < this.tiChuaiData.length; key++)
        {
            if (this.tiChuaiData[key].uid == uid && uid != ReplayData.game.opts.dizhu)
            {
                if (this.tiChuaiData[key].num == 1)
                {
                   var tiIcon = cc.find('player_' + (index + 1) + '/tiIcon', this.node);
                   tiIcon.active = true;     
                }
            }
            else if (this.tiChuaiData[key].uid == uid && uid == ReplayData.game.opts.dizhu)
            {
                if (this.tiChuaiData[key].num == 1)
                {
                   var chuaiIcon = cc.find('player_' + (index + 1) + '/chuaiIcon', this.node);
                   chuaiIcon.active = true;     
                }
            }
        }
    },
    showCardContent: function (cardNode, cardId) { //cc.log('cardid :'+cardId);
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/' + 'poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showScore: function (index) {
        var uid = ReplayData.players[index].uid;
        var scoreNode = cc.find('player_' + (index + 1) + '/field_num1', this.node);
        if (ReplayData.scores[uid] > 0) {
            scoreNode.getComponent('cc.Label').font = this.font[0];
            scoreNode.getComponent('cc.Label').string = '+' + ReplayData.scores[uid];
        } else if (ReplayData.scores[uid] < 0) {
            scoreNode.getComponent('cc.Label').font = this.font[1];
            scoreNode.getComponent('cc.Label').string = ReplayData.scores[uid];
        } else {
            scoreNode.getComponent('cc.Label').font = this.font[2];
            scoreNode.getComponent('cc.Label').string = ReplayData.scores[uid];
        }
    },
    shareRet: function () {
        if (inCD(3000) == false) {
            screenShoot(wxShareTexture);
        }
    }
});