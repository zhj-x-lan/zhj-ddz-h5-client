cc.Class({
    extends: cc.Component,

    properties: {
        _arrow:null,
        _pointer:null,
        _timeLabel:null,
        _time:-1,
        _alertTime:-1,
    },

    // use this for initialization
    onLoad: function () {
        console.log('【1*---==================加载【TimePointer.js】');
        var gameChild = this.node.getChildByName("game");
        this._arrow = gameChild.getChildByName("arrow");
        this._pointer = this._arrow.getChildByName("pointer");
        this.initPointer();
        
        this._timeLabel = this._arrow.getChildByName("lblTime").getComponent(cc.Label);
        this._timeLabel.string = "00";
        
        var self = this;
        this.node.on('game_begin',function(data){
            console.log('显示定时器......');
            self.initPointer();
        });
        
        this.node.on('game_chupai',function(data){
            self.initPointer();
            self._time = 10;
            self._alertTime = 3;
        });

        this.node.on('game_reset', function () {
            self._arrow.active = false;
        });
    }, 
    
    updatePointer: function () {
       
        this.initPointer();
        this._time = 10;
        this._alertTime = 3;
    },

    initPointer:function(){
        if(cc.vv == null){
            return;
        }
        this._arrow.active = cc.vv.gameMgr.gameState == "started";
        if(!this._arrow.active){
            return;
        }
        var turn = cc.vv.gameMgr.turn;
        var localIndex = cc.vv.gameMgr.getLocalIndex(turn);
        for(var i = 0; i < this._pointer.children.length; ++i){
            this._pointer.children[i].active = i == localIndex;
        }
    },
    
    update: function (dt) {
        if(this._time > 0){
            this._time -= dt;
            if(this._alertTime > 0 && this._time < this._alertTime){
                cc.vv.audioMgr.playSFX("timeup_alarm.mp3");
                this._alertTime = -1;
            }
            var pre = "";
            if(this._time < 0){
                this._time = 0;
            }
            
            var t = Math.ceil(this._time);
            if(t < 10){
                pre = "0";
            }
            this._timeLabel.string = pre + t; 
        }
    },
});
