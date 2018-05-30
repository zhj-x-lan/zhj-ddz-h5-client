var gameDefine = require('gameDefine');
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabItem: cc.Prefab,
        _itemList: [],
        roomID: cc.Label,
        creatorLabel: cc.Label,
        roonMaxNum: cc.Label,
        roomRules: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('ddz-onGameStart', this, this.showTableLayer);
        registEvent('tjddz-onGameStart', this, this.showTableLayer);

        if (!ReplayDataCenter.openReplayPanel) return;
        var players = {};
        for (var i = 0; i < ReplayDataCenter.room.length; i++) {
            if (ReplayDataCenter.room[i].roomid == ReplayRoomData.roomid) {
                players = ReplayDataCenter.room[i].players;
            }
        }
        var self = this;
        GameNet.getInstance().request("game.playerHandler.getRoomRecord", {
            roomid: ReplayData.room,
            createtime: ReplayRoomData.createtime
        }, function (rtn) {
            self.show(rtn, rtn.creator);
        });
        ReplayDataCenter.openReplayPanel = false;
    },

    onDestroy: function () {
        unregistEvent('onGameStart', this, this.showTableLayer);
        unregistEvent('ddz-onGameStart', this, this.showTableLayer);
        unregistEvent('tjddz-onGameStart', this, this.showTableLayer);
    },

    showTableLayer: function () {
        if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
            cc.director.loadScene('table');
        } else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_DDZ) {
            cc.director.loadScene('table-DDZ');
        }else if (GameData.client.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ) {
            cc.director.loadScene('table-TJDDZ');
        }
    },
    
    onClose: function () {
        closeView('RoundPanel');
        otherReplay[0] = false;
        ReplayDataCenter.openRoundPanel = true;
        openView('RecordPanel');
    },

    show: function (roundData, creatorId) {
        this._itemList = [];
        this.roomID.string = '';
        this.creatorLabel.string = '';
        this.roonMaxNum.string = '';
        this.showRoomRule('');
        this.scrollView.content.removeAllChildren();
        if (Object.keys(roundData).length <= 0) {
            createMoveMessage('暂无牌局详情');
            return;
        }

        var gamesData;
        if (roundData.games) {
            gamesData = roundData.games;
        }else if (roundData.record) {
            gamesData = roundData.record;
        }

        if (this._itemList.length == 0) {
            for (var i = 0; i < gamesData.length; ++i) {
                var item = cc.instantiate(this.prefabItem);
                this.scrollView.content.addChild(item);
                this._itemList.push(item);
                item.active = false;
            }
        }
        ReplayRoomData = roundData;
        this.roomID.string = roundData.roomid;
        this.creatorLabel.string = creatorId;
        ReplayRoomData.creator = creatorId;
        this.roonMaxNum.string = gamesData.length;
        this.showRoomRule(roundData.opts);
        for (var index = this._itemList.length - 1; index >= 0; index--) {
            var roundItemNode = this._itemList[index];
            if (roundItemNode.active) break;
            var oneRoundData = gamesData[gamesData.length - 1 - index];
            if (index < gamesData.length && oneRoundData.score != null) {
                var roundItem = roundItemNode.getComponent('RoundItem');
                roundItem.show(gamesData.length - index, roundData.roomid, creatorId, roundData.createtime, oneRoundData.id);
                roundItem.showGameType(roundData.opts);
                cc.log('oneRoundData = '+JSON.stringify(oneRoundData));
                roundItem.setPlayers(roundData.players, oneRoundData.score);
                roundItemNode.active = true;
            } else {
                roundItemNode.active = false;
            }
        }
    },
    showRoomRule: function (roomRule) {
        var rule = '';
        switch (roomRule.gameType){
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                rule = getRuleStrTJDDZ(roomRule);  
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                rule = getRuleStrShiShi(roomRule);
            }break;
            case gameDefine.GameType.Game_Mj_Tianjin:{
                rule = getRoomRuleStr(roomRule);
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
               rule = getRuleStrHd(roomRule);
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                rule = getRuleStr13(roomRule);
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                rule = getRuleStrNiuNiu(roomRule);
            }break;
            case gameDefine.GameType.Game_TDK:{
                rule = getRuleStrTDK(roomRule);
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:{
                rule = getRuleStrDDZ(roomRule);
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                rule = getRuleStrHongZhong(roomRule);
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                rule = getRuleStrCC(roomRule);
            }break;
            default :break;
        }
        // rule = getShortStr(rule, 27);
        this.roomRules.string = rule;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});