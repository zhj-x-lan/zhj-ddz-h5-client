var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        direction_pos: cc.Sprite,
        direction_turn: cc.Node,

        countdown_num1: cc.Sprite,
        countdown_num2: cc.Sprite,
        _countdown_index: 0,

        roomRule: cc.Node,
        leftCardNumLabel: cc.Label,
        lastRoundLabel: cc.RichText,

        quanNode: cc.Node,
        juNode: cc.Node
    },

    onLoad: function () {
        this.turnUid = 0;       //该谁出牌
        this.roomState = -1;    //房间状态
        this.roundCur = 0;      //当前局数
        this.roundMax = 0;      //最大局数
        this.roundRule = 0;     //牌局类型
        this.leftNumber = 0;    //剩余牌数

        this.showTurn();
        this.updateRoundString();
        this.updateLeftCardNumber();
    },
    onEnable: function () {
    },
    onDestroy: function () {
    },

    setRoomRuleString: function(string){
        this.roomRule.getComponent('cc.Label').string = string;
    },
    setRoomRoundCur: function(cur,max){
        this.roundCur = cur;
        this.roundMax = max;
        this.updateRoundString();
    },
    setRoundRule: function(type){
        this.roundRule = type;
        this.updateRoundRule();
    },
    setLeftCardNumber: function(number){
        this.leftNumber = number;
        this.updateLeftCardNumber();
    },
    setTurnUid: function(uid){
        this.turnUid = uid;
        this.showTurn();
    },
    setRoomState: function(state){
        this.roomState = state;
        if(this.roomState < gameDefine.RoomState.GAMEING){
            this.stopCoundDown();
        }
    },
    startCoundDown: function () {
        this._countdown_index = 10;
        this.schedule(this.runCountDown, 1);
    },
    stopCoundDown: function(){
        this.unschedule(this.runCountDown);
    },
    setPosition: function () {
        var index = GameData.getPlayerIndex(GameData.player.uid);
        var rotation = 0;

        if (index == 0) {
            rotation = 90;
        } else if (index == 3) {
            rotation = 0;
        } else if (index == 2) {
            rotation = 270;
        } else if (index == 1) {
            rotation = 180;
        }
        this.direction_pos.node.rotation = rotation;
    },
    showTurn: function () {
        var index = GameData.getPlayerIndex(this.turnUid);
        if(index < 0){
            return;
        }
        var direction;
        if (index == 0) {
            direction = 'dong';
        } else if (index == 3) {
            direction = 'nan';
        } else if (index == 2) {
            direction = 'xi';
        } else if (index == 1) {
            direction = 'bei';
        } else {
            direction = 'dong';
        }

        var texture = cc.textureCache.addImage(cc.url.raw('resources/table/' + direction + '.png'));
        this.direction_pos.spriteFrame = new cc.SpriteFrame(texture);

        cc.find('down', this.direction_turn).active = false;
        cc.find('right', this.direction_turn).active = false;
        cc.find('up', this.direction_turn).active = false;
        cc.find('left', this.direction_turn).active = false;

        direction = GameData.getPlayerPosByUid(this.turnUid);
        if(direction == null){
            return;
        }
        cc.find(direction, this.direction_turn).active = true;
    },
    runCountDown: function () {
        this.showCountDown(this._countdown_index + '');
        if (this._countdown_index <= 0) {
            this._countdown_index = 10;
        } else {
            if (this._countdown_index == 3 && this.turnUid == GameData.player.uid) {
                soundMngr.instance.playAudioOther('countdown');
            }
            this._countdown_index--;
        }
    },
    showCountDown: function (num) {
        var ary = num.split('');
        if (ary.length == 0) {
            return;
        }
        var url1;
        var url2;
        if (ary.length == 1) {
            url1 = cc.url.raw('resources/number/jinzi0.png');
            url2 = cc.url.raw('resources/number/jinzi' + num + '.png');
        } else if (ary.length == 2) {
            url1 = cc.url.raw('resources/number/jinzi' + ary[0] + '.png');
            url2 = cc.url.raw('resources/number/jinzi' + ary[1] + '.png');
        } else {
            return;
        }
        var texture1 = cc.textureCache.addImage(url1);
        var texture2 = cc.textureCache.addImage(url2);
        this.countdown_num1.spriteFrame = new cc.SpriteFrame(texture1);
        this.countdown_num2.spriteFrame = new cc.SpriteFrame(texture2);
    },
    //局数
    updateRoundString: function(){
        var showRoundNum = this.roundCur > this.roundMax ? this.roundMax : this.roundCur;
        this.lastRoundLabel.string = showRoundNum + '/' + this.roundMax;
    },
    //剩余牌数
    updateLeftCardNumber: function () {
        this.leftNumber < 0 ? this.leftNumber = 0 : null;
        this.leftCardNumLabel.string = this.leftNumber;
    },
    //牌局类型
    updateRoundRule: function(){
        if (this.roundRule >= 4) {
            this.quanNode.active = true;
            this.juNode.active = false;
        } else {
            this.quanNode.active = false;
            this.juNode.active = true;
        }
    }
});