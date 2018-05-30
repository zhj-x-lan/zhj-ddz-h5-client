cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        itemPrefab: cc.Prefab,

        roomid: 0,
        roomIdLab: cc.Label,

        roomtype: cc.Label,
        roomclub: cc.Label,

        createtime: 0,
        creatorId: 0,

        _playerItems: [],
        _players: [],
        PlayTimes: cc.Label
    },

    // use this for initialization
    onLoad: function () {

    },

    setPlayers: function (players, scores) {
        this._playerItems = [];
        this.content.removeAllChildren();
        this._players = players;
        //console.log('this._players.length = ' + Object.keys(this._players).length);
        if (this._playerItems.length == 0) {
            for (var i = 0; i < this._players.length; ++i) {
                var playerItem = cc.instantiate(this.itemPrefab);
                playerItem.parent = this.content;
                playerItem.setPosition(i * 190, 10);
                this._playerItems.push(playerItem);
            }
        }

        var index = 0;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (index < this._players.length) {
                var playerItemNode = this._playerItems[index];
                var playerInfo = playerItemNode.getComponent('RecordPlayerInfo');
                playerInfo.setName(player.name);
                playerInfo.setHeadIcon(player.headimgurl);
                playerInfo.setZongfen(2, scores[player.uid]);
                // playerInfo.setId(player.uid);
                // playerInfo.setJifen(undefined);

                var winnerId = this.setWinner(scores, players);
                var isActive = winnerId == player.uid ? true : false;
                playerInfo.showWinner(isActive);  
            }
            index++;
        }
    },
    showTime: function (playtime) {
        cc.log('playtime = '+playtime);
        var time = getTimeStr(playtime);
        var dateStr = time[0] + '.' + time[1] + '.' + time[2] + '  ' + time[3] + ':' + time[4] + ':' + time[5];
        this.PlayTimes.string = dateStr;
    },
    setWinner: function(scores, players){
        var tempUid;
        tempUid = players[0].uid;
        for (let i = 1; i < players.length; i++) {
            if (players[i].uid && scores[players[i].uid] > scores[tempUid]) {
                tempUid = players[i].uid;
            }
        }
        return tempUid;
    },
    openRoundPanel: function () {
        var self = this;
        openView('RoundPanel',"",
            function (target) {
                GameNet.getInstance().request("game.playerHandler.getRoomRecord", {
                    roomid: self.roomid,
                    createtime: self.createtime
                }, function (rtn) {
                    target.getComponent('RoundPanel').show(rtn, self.creatorId);
                    closeView('RecordPanel');
                });
            });
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});