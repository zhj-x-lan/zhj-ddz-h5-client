var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        roundIndexLabel: cc.Label,
        roomIdLabel: cc.Label,
        creatorIdLabel: cc.Label,
        dateLabel: cc.Label,
        content: cc.Node,
        itemPrefab: cc.Prefab,

        _playerItems: [],

        _recordId: 0,
        _createTime: 0,
        _roomId: 0,
        replayNum: cc.Label,

        gameTypeNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    openReplay: function (evt) {
        var self = this;
        GameNet.getInstance().request("game.playerHandler.getGameRecord", {
            id: self._recordId,
            roomid: self._roomId
        }, function (rtn) {
            if (!rtn || Object.keys(rtn).length <= 0) return;
            ReplayData = rtn;
            //console.log('ReplayData = ' + JSON.stringify(ReplayData));
            if (ReplayData.cards) {
                var cardlength = ReplayData.cards[0].cards.length;
                var huier = ReplayData.opts.huier;
                var huier2 = GameData.getOtherHuier(huier);
                if (cardlength == 13) {
                    HuierList = [huier, huier2];
                } else if (cardlength == 16) {
                    HuierList = [huier];
                }
            }
            
            cc.log('go to replay');
            switch (ReplayRoomData.opts.gameType) {
                case gameDefine.GameType.Game_Poker_DDZ:
                    cc.director.loadScene('replay-DDZ');
                    break;
                case gameDefine.GameType.Game_Mj_Tianjin:
                    cc.director.loadScene('replay');
                    break;
                case gameDefine.GameType.Game_Mj_Shishi:
                    cc.director.loadScene('replay-shishi');
                    break;
                case gameDefine.GameType.Game_TDK:
                    cc.director.loadScene('replay-tdk');
                break;
                default:
                    createMoveMessage('暂无回放');
                    break;
            }
        });
    },

    show: function (roundIndex, roomId, creatorId, createtime, recordId) {
        this._roomId = roomId;
        this._recordId = recordId;
        this._createTime = createtime;
        this.roundIndexLabel.string = roundIndex;
        var len = roomId.toString().length;
        var zeroLen = 6 - len;
        for (var i = 0; i < zeroLen; i++) {
            roomId = "0" + roomId;
        }

        this.roomIdLabel.string = roomId;
        this.creatorIdLabel.string = creatorId;

        this.replayNum.string = recordId;
        var time = getTimeStr(recordId);
        var dateStr = time[0] + '.' + time[1] + '.' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];
        this.dateLabel.string = dateStr;
    },
    showGameType: function(data){
        var gametype = cc.find('typeName',this.gameTypeNode);
        var clubType = cc.find('roomtype',this.gameTypeNode);

        var roomRuleString = '';
        var roomRule = data.roomType;
        switch (roomRule){
            case 1:{
                roomRuleString = '(普通房)';
            }break;
            case 2:{
                roomRuleString = '(俱乐部)';
            }break;
        }
        clubType.getComponent('cc.Label').string = roomRuleString;

        var strType = '';
        switch (data.gameType){
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{ strType = '天津斗地主';} break;
            case gameDefine.GameType.Game_Mj_Shishi:{ strType = '石狮麻将';} break;
            case gameDefine.GameType.Game_Mj_Tianjin:{ strType = '天津麻将';} break;
            case gameDefine.GameType.Game_MJ_HuaDian:{ strType = '桦甸麻将';} break;
            case gameDefine.GameType.Game_Poker_13shui:{ strType = '十三水';} break;
            case gameDefine.GameType.Game_niu_niu:{ strType = '经典牛牛';} break;
            case gameDefine.GameType.Game_TDK:{ strType = '填大坑';} break;
            case gameDefine.GameType.Game_Poker_DDZ:{ strType = '经典斗地主';} break;
            case gameDefine.GameType.Game_Mj_HZ:{ strType = '红中麻将';} break;
            case gameDefine.GameType.Game_Mj_CC:{ strType = '长春麻将';} break;
            default :break;
        }
        gametype.getComponent('cc.Label').string = strType;
    },
    setPlayers: function (players, scores) {
        this._playerItems = [];
        if (this._playerItems.length == 0) {
            for (var i = 0; i < Object.keys(players).length; ++i) {
                var playerItem = cc.instantiate(this.itemPrefab);
                playerItem.parent = this.content;
                playerItem.setPosition(i * 190, 10);
                this._playerItems.push(playerItem);
            }
        }
        var index = 0;
        for (var key in players) {
            var player = players[key];
            if (index < Object.keys(players).length) {
                var playerItemNode = this._playerItems[index];
                var playerInfo = playerItemNode.getComponent('RecordPlayerInfo');
                playerInfo.setName(player.name);
                playerInfo.setHeadIcon(player.headimgurl);
                playerInfo.setId(player.uid);
                if (scores == null || scores == undefined) {
                    playerInfo.setZongfen(1, 0);
                }else{
                    playerInfo.setZongfen(1, scores[player.uid]);
                }
                playerInfo.setJifen(undefined);  
            }
            index++;
        }
    },
    copyRepayNum: function (eve) {
        cc.log('this._roomId = '+this._roomId+',this._createTime = '+this._createTime);
        var num = '';
        num = num+this._roomId+this._createTime;
        WriteLog('shareStr = '+num);
        textClipboard(num);
        createMoveMessage('复制回放码成功');
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});