var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        scoreScollView: cc.ScrollView,
        scoreLayer: cc.Node,

        headLayer: cc.Node,
        playerHeadNode: cc.Node,

        playerScoreItem: cc.Node,
        playerSumScore: cc.Node,

        _curGameData: null
    },

    onLoad: function () {
        registEvent('onRoomInfo', this, this.RoomInfoHandler);

        this.playerMax = 0;
        this.ScoreList = [];

        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }
        this.playerMax = roomData.opts.joinermax;

        this.initPlayerHeadNode();
    },
    onDestroy: function () {
        unregistEvent('onRoomInfo', this, this.RoomInfoHandler);
    },

    RoomInfoHandler: function(data){
        if(data == undefined){
            return;
        }
        RoomHandler.onRoomInfoSetData(data.detail);

        this.initPlayerHeadNode();
    },

    initPlayerHeadNode: function () {
        for(var ii = 0;ii < this.headLayer.getChildrenCount();ii++){
            var child = this.headLayer.getChildren()[ii];
            if(child){
                child.active = false;
            }
        }
        var roomData = RoomHandler.getRoomData();
        if(roomData == undefined){
            return;
        }

        var index = 0;
        for (var jj = 0;jj < this.playerMax;jj++) {

            var joiner = GameData.joiners[jj];
            if(joiner == undefined){
                continue;
            }

            var headNode = this.headLayer.getChildren()[index];
            if (headNode == undefined) {
                headNode = cc.instantiate(this.playerHeadNode);
                headNode.parent = this.headLayer;
            }
            headNode.active = true;
            headNode.x = this.playerHeadNode.x + index * this.playerHeadNode.width;

            var headurl = joiner.headimgurl;
            var headSprite = cc.find('head', headNode).getComponent(cc.Sprite);
            this.setHeadIcon(headurl, headSprite);

            var name = joiner.name;
            var nameNode = cc.find('nick_name', headNode);
            nameNode.getComponent(cc.Label).string = getShortStr(name, 4);

            var show = false;
            roomData.creator == joiner.uid ? show = true : null;
            var owner = cc.find('owner', headNode);
            owner.active = show;

            index++;
        }
    },
    setHeadIcon: function (url, sprite) {
        if (sprite == undefined || url == undefined || url.length <= 0) {
            return;
        }
        cc.loader.load({url: url, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    ShowPlayerScoreItem: function () {

        if(this._curGameData == undefined){
            cc.log('...gameData is undefined.');
            return;
        }

        var scoreData = RoomHandler.getScoreData();
        if(scoreData == undefined){
            return;
        }
        var gameInfoData = this._curGameData.getGameInfoData();
        if(gameInfoData == undefined){
            return;
        }
        var len = gameInfoData.roundNum -1;
        cc.log('...len:'+len);

        var content = this.scoreScollView.content;
        content.height = len * this.playerScoreItem.height;

        for(var ii = 0;ii < content.getChildrenCount();ii++){
            var child = content.getChildren()[ii];
            if(child){
                child.active = false;
            }
        }

        for (var jj = 0; jj < len; jj++) {

            var node = content.getChildren()[jj];
            if(node == undefined){
                node = cc.instantiate(this.playerScoreItem);
                node.parent = content;
            }
            node.active = true;

            node.x = this.playerScoreItem.x;
            node.y = this.playerScoreItem.y - jj * this.playerScoreItem.height;

            var jushuNode = cc.find('roundNum', node);
            jushuNode.getComponent(cc.Label).string = '第'+ (jj +1) +'局：';

            for (var m = 0; m < 4; m++) {
                var scoreNode = cc.find('scoreNum_'+ (m +1), node);
                scoreNode.active = false;
            }

            for (var kk = 0; kk < this.playerMax; kk++) {

                var playerData = GameData.joiners[kk];
                if(playerData == undefined){
                    continue;
                }

                var playerUid = playerData.uid;
                var playerScore = scoreData[playerUid];
                playerScore == undefined ? playerScore = 0 : null;

                var scoreNum = cc.find('scoreNum_'+ (kk +1), node);
                scoreNum.active = true;

                if (playerScore > 0) {
                    scoreNum.getComponent('cc.Label').string = '+' + playerScore + '分';
                } else if (playerScore == 0) {
                    scoreNum.getComponent('cc.Label').string = '0 分';
                } else {
                    scoreNum.getComponent('cc.Label').string = playerScore + '分';
                }
                /*if (playerUid == GameData.JushuScore[i].zhuangUid) {
                    var zhuangIndex = j + 1;
                    var zhuangSaw = cc.find('zhuang_' + zhuangIndex, node);
                    zhuangSaw.active = true;
                }*/
            }
        }
        this.AddSumScore();
    },
    AddSumScore: function () {
        var scoreData = RoomHandler.getScoreData();
        if(scoreData == undefined){
            return;
        }

        var children = this.playerSumScore.children;
        for (var i = 0; i < children.length; i++) {
            if (i >= this.playerMax) {
                children[i].active = false;
            }
        }
        for (var j = 0; j < this.playerMax; j++) {

            var Allscore = cc.find('scoreNum_'+ (j +1), this.playerSumScore);
            var playUid = GameData.joiners[j].uid;
            if (scoreData[playUid] > 0) {
                Allscore.getComponent('cc.Label').string = '+' + scoreData[playUid] + '分';
            } else if (scoreData[playUid] == 0) {
                Allscore.getComponent('cc.Label').string = '0 分';
            } else {
                Allscore.getComponent('cc.Label').string = scoreData[playUid] + '分';
            }
        }
    },
    close: function () {
        this.node.active = false;
    }
});