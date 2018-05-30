var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabItem: cc.Prefab,
        listCount: 0,
        totalJushuLabel: cc.Label,
        winJushuLabel: cc.Label,
        chengjiLabel: cc.Label,
        lijianLabel: cc.Label,
        creatorNum: cc.Label,
        _itemList: [],

        layer_selectOther: cc.Node,
        roomid: 0,
        _players: null,
    },

    // use this for initialization
    onLoad: function () {
        this.initParam();
        registEvent('onGameStart', this, this.showTableLayer);
        registEvent('ddz-onGameStart', this, this.showTableLayer);
        registEvent('tjddz-onGameStart', this, this.showTableLayer);

        this.content = this.scrollView.content;
        if (!ReplayDataCenter.openRoundPanel) return;
        this.show(ReplayGameData);
        ReplayDataCenter.openRoundPanel = false;
    },

    initParam: function() {
        this.RecordType = [
            gameDefine.GameType.Game_Poker_TianjinDDZ,
            gameDefine.GameType.Game_Mj_Shishi,
            gameDefine.GameType.Game_Mj_Tianjin,
            gameDefine.GameType.Game_MJ_HuaDian,
            gameDefine.GameType.Game_Poker_13shui,
            gameDefine.GameType.Game_niu_niu,
            gameDefine.GameType.Game_TDK,
            gameDefine.GameType.Game_Poker_DDZ,
            gameDefine.GameType.Game_Mj_HZ,
            gameDefine.GameType.Game_Mj_CC,
            gameDefine.GameType.Game_Poker_paodekuai
        ];
        //没有回放为false
        this.RecordTypeMngr = {
            Game_Poker_TianjinDDZ:false,
            Game_Mj_Shishi:true,
            Game_Mj_Tianjin:true,
            Game_MJ_HuaDian:true,
            Game_Poker_13shui:false,
            Game_niu_niu:true,
            Game_TDK:true,
            Game_Poker_DDZ:true,
            Game_Mj_HZ:true,
            Game_Mj_CC:true,
            Game_Poker_paodekuai:false
        };
        this.GameTypeName = [
            '天津斗地主',
            '石狮麻将',
            '天津麻将',
            '桦甸麻将',
            '十三水',
            '经典牛牛',
            '填大坑',
            '经典斗地主',
            '红中麻将',
            '长春麻将',
            '跑得快'
        ];
    },

    onEnable: function () {

        var self = this;
        GameNet.getInstance().request("game.playerHandler.getPlayerRecord", {}, function(rtn) {
            if (rtn && Object.keys(rtn).length > 0) {
                self.show(rtn);
            }
        });        
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

    show: function (recordData) {
        //cc.log('recordData : ' + JSON.stringify(recordData));
        this.totalJushuLabel.string = '';
        this.winJushuLabel.string = '';
        this.chengjiLabel.string = '';
        this.lijianLabel.string = '';
        this.creatorNum.string = '';
        if (recordData == null || recordData == undefined) {
            return;
        }
        ReplayGameData = recordData;
        ReplayDataCenter.room = recordData;
        if (this._itemList.length == 0) {
            for (var i = 0; i < 20; i++) {
                var item = cc.instantiate(this.prefabItem);
                this.content.addChild(item);
                this._itemList.push(item);
                item.active = false;
            }
        }

        for (var index = 0; index <= this._itemList.length - 1; index++) {
            var item = this._itemList[index];
            if (index < ReplayGameData.length) {
                var roomData = ReplayGameData[index];//ReplayGameData.length - 1 - index
                var RecordTypeMngr_index = -1;
                for (var key in this.RecordTypeMngr)
                {
                    RecordTypeMngr_index++;
                    if (this.RecordTypeMngr[key] == true)
                    {
                        if (roomData.opts.gameType == this.RecordType[RecordTypeMngr_index])
                        {
                            var recordItem = item.getComponent('RecordItem');
                            recordItem.roomid = roomData.roomid;
                            recordItem.roomIdLab.string = roomData.roomid;
                            recordItem.createtime = roomData.createtime;
                            recordItem.showTime(roomData.createtime);
                            recordItem.creatorId = roomData.creator;
                            recordItem.setPlayers(roomData.players, roomData.score);
                            this.showGameType(recordItem, roomData.opts);
                            item.active = true;
                            break;
                        }
                    }
                }
            } else {
                item.active = false;
            }
        }
        var now = new Date();
        var nowYear = now.getFullYear();
        var nowMonth = now.getMonth();
        var nowDate = now.getDate();

        var playId = GameData.player.uid;
        var TodayJushu = 0;
        var winJushu = 0;
        var creatJushu = 0;
        for (var i = 0; i < ReplayGameData.length; i++) {
            var items = ReplayGameData[i];

            var da = items.createtime;
            da = new Date(items.createtime);
            var year = da.getFullYear();
            var month = da.getMonth();
            var date = da.getDate();
            var RecordTypeMngr_index = -1;
            for (var key in this.RecordTypeMngr)
            {
                RecordTypeMngr_index++;
                if (this.RecordTypeMngr[key] == true)
                {
                    if (items.opts.gameType == this.RecordType[RecordTypeMngr_index])
                    {
                        if (year == nowYear && month == nowMonth && date == nowDate) 
                        {
                            TodayJushu++;
                            var scoreSum = items.score;
                            if (scoreSum[playId] > 0) 
                            {
                                winJushu++;
                            }
                        }
                        if (items.creator == playId) 
                        {
                            creatJushu++;
                        }
                        break;
                    }
                }
            }
        }
        this.totalJushuLabel.string = TodayJushu;
        this.winJushuLabel.string = winJushu;
        this.creatorNum.string = creatJushu;
    },

    showGameType: function(parents, data){
        var roomRuleString = "";

        var roomRule = data.roomType;
        switch (roomRule){
            case 1:{
                roomRuleString = '(普通房)';
            }break;
            case 2:{
                roomRuleString = '(俱乐部)';
            }break;
        }
        parents.roomclub.string = roomRuleString;
        
        var RecordTypeMngr_index = -1;
        for (var key in this.RecordTypeMngr)
        {
            RecordTypeMngr_index++;
            if (this.RecordTypeMngr[key] == true)
            {
                if (this.RecordType[RecordTypeMngr_index] == data.gameType)
                {
                    parents.roomtype.string = this.GameTypeName[RecordTypeMngr_index];
                    break;
                }
            }
        }
    },
    onClose: function () {
        closeView('RecordPanel');
    },
    openSelectRoom: function (eve) {
        this.layer_selectOther.active = true;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    closeLayer: function (eve) {
        this.layer_selectOther.active = false;
    },
    sendReplayNum: function (eve) {
        let str = cc.find('layer_otherRecard/panel/EditBox', this.node).getComponent(cc.EditBox).string;

        var getRoomId = str.substring(0,6);
        var getRecordId = str.substring(6,str.length);
        openView('RoundPanel',"",
        function (target) {
            GameNet.getInstance().request("game.playerHandler.getRoomRecord", {
                roomid: parseInt(getRoomId),
                createtime: parseInt(getRecordId)
            }, function (rtn) {
                var playersArray = [];
                for (var key in rtn.players) {
                    playersArray.push(rtn.players[key]);
                }
                otherReplay[0] = true;
                target.getComponent('RoundPanel').show(rtn, rtn.creator, playersArray);
                closeView('RecordPanel');
            });
        });
    },
});