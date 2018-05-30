var RoomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {

        headerNode : cc.Node,
        agreeWaitNode : cc.Node,
        agreeBtn : cc.Node,
        disAgreeBtn : cc.Node,
        dissolvePerson : cc.Label,
        lastTimeLabel : cc.Label

    },

    onLoad: function () {

        this.initHeaderUI();

        registEvent('onRoomDissolve', this, this.showDissolveText);
        registEvent('13-GameEnd', this, this.showGameResult);
        registEvent('onJoinerLost', this, this.showJoinerLost);
        registEvent('onJoinerConnect', this, this.showJoinerConnect);

        this.lastTimeLabel.string = '';

        this.showDissolveText();
    },

    onDestroy: function() {
        unregistEvent('onRoomDissolve', this, this.showDissolveText);
        unregistEvent('13-GameEnd', this, this.showGameResult);
        unregistEvent('onJoinerLost', this, this.showJoinerLost);
        unregistEvent('onJoinerConnect', this, this.showJoinerConnect);
    },

    initHeaderUI : function()
    {
        var parent = this.headerNode.parent;

        var init_x = this.headerNode.x;
        var init_y = this.headerNode.y;
        var init_interval = 250;
        var index = 1;

        for( var key = 2; key <= GameData13.room.joinermax; key++ )
        {
            var name = 'header_' + key;
            var headNode = parent.getChildByName(name);
            if( headNode == undefined ) {
                headNode = cc.instantiate(this.headerNode);
                headNode.name = name;
                headNode.parent = parent;

                if( key > 3 ){
                    init_x = this.headerNode.x+150;
                    init_y = this.headerNode.y-120;
                    init_interval = 200;
                    index = 4;
                }
                headNode.x = init_x + init_interval*(key-index);
                headNode.y = init_y;
            }
            headNode.active = false;
        }
        this.resetUI();
    },

    showPlayers : function()
    {
        if(GameData13.room.joinermax)
        {
            for(var j = 1 ;j <= GameData13.joiners.length; j++)
            {
                var hNode = cc.find('header_'+j,this.headerNode.parent);
                hNode.active = true;
            }
            for(var i = 1; i <= GameData13.room.joinermax; i++)
            {
                var index = i;
                var joiner = GameData13.joiners[i-1];

                if (joiner != null)
                {
                    var uid = joiner.uid;
                    var headimgurl = joiner.headimgurl;
                    this.showHeaderIcon(index,headimgurl);
                    this.showHeaderName(index,joiner.name);
                    this.showHeaderId(index,uid);

                    var show = false;
                    if ( GameData13.owner == uid ) {
                        show = true;
                    }
                    this.showMainFlag(index,show);

                    show = false;
                    if (joiner.status == 2) {
                        show = true;
                    }
                    this.showLostImg( index,show );
                }
            }
        }
    },

    showHeaderName : function(index,nameStr)
    {
        var nameNode = cc.find('header_' + index + '/nameLabel' ,this.headerNode.parent);
        if( nameNode ) {
            nameNode.getComponent(cc.Label).string = getShortStr(nameStr,4);
        }
    },

    showHeaderId : function(index,uid){
        var idNode = cc.find('header_' + index + '/idLabel' ,this.headerNode.parent);
        if( idNode ) {
            idNode.getComponent(cc.Label).string = uid;
        }
    },

    showAgreeIcon : function(index,show)
    {
        var node = cc.find('header_' + index + '/duigou' ,this.headerNode.parent);
        if( node ) {
            node.active = show;
        }
    },

    showMainFlag : function(index,show){
        var node = cc.find('header_' + index + '/fangzhu' ,this.headerNode.parent);
        if( node ) {
            node.active = show;
        }
    },

    showLostImg : function(index,show){
        var disNode = cc.find('header_' + index + '/lost',this.headerNode.parent);
        if( disNode ){
            disNode.active = show;
        }
    },

    showHeaderIcon : function(index,headimgurl)
    {
        if (headimgurl == undefined || headimgurl == '') {
            return;
        }

        var self = this;
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) 
            {
                var iconNode = cc.find('header_' + index + '/headimg' ,self.headerNode.parent);
                iconNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }  
        });
    },

    alreadyAgree : function(show)
    {
        this.agreeBtn.active = show;
        this.disAgreeBtn.active = show;
    },

    resetUI : function()
    {
        this.agreeWaitNode.active = false;
        for(var i = 0; i < GameData13.room.joinermax; i++)
        {
            this.showAgreeIcon(i+1,false);
        }
    },

    showDissolveText: function() {
        var dissolove = GameData.game.onRoomDissolve;
        var disagreeNum = 0;
        var agreeNum = 0;
        this.isDis = dissolove.isStart;
        

        this.resetUI();
        this.showPlayers();
        this.alreadyAgree(true);

        cc.log('..select:'+JSON.stringify(GameData.game.onRoomDissolve));
        for (var uid in GameData.game.onRoomDissolve.select)
        {
            var text = '';

            var index = 0;
            for(var i = 0; i < GameData13.joiners.length; i++)
            {
                var joiner = GameData13.joiners[i];
                if(joiner.uid == uid)
                {
                    index = i+1;
                    break;
                }
            }

            if (GameData.game.onRoomDissolve.select[uid] == 'apply')
            {
                text = '申请解散房间';
                for(var i = 0; i < GameData13.joiners.length; i++){
                    var joiner = GameData13.joiners[i];
                    if(joiner.uid == uid){
                        this.dissolvePerson.string = '['+joiner.name+']发起投票解散对局';
                    }
                }
                agreeNum++;

                this.showAgreeIcon(index,true);
                if( uid == GameData.player.uid ) {
                    this.agreeWaitNode.active = true;
                }
            }
            else if (GameData.game.onRoomDissolve.select[uid] == 'agree')
            {
                agreeNum++;
                text = '同意解散房间';
                this.showAgreeIcon(index,true);

                if( uid == GameData.player.uid ) {
                    this.agreeWaitNode.active = true;
                }
            }
            else if (GameData.game.onRoomDissolve.select[uid] == 'disagree')
            {
                text = '拒绝解散房间';
                disagreeNum++;

                if(uid != GameData.player.uid )
                {
                    for(var j = 0; j < GameData13.joiners.length; j++)
                    {
                        var joiner = GameData13.joiners[j];
                        if( joiner.uid == uid )
                        {
                            var name = joiner.name;
                            poker13MessageBox('因［' + name + '］拒绝解散房间，游戏需继续进行',"","", function() {});

                            this.agreeWaitNode.active = false;
                        }
                    }
                }
                break;
            }

            if((GameData.game.onRoomDissolve.select[uid] == 'agree' || GameData.game.onRoomDissolve.select[uid] == 'apply') && uid == GameData.player.uid)
            {
                this.alreadyAgree(false);
            }
        }

        if( disagreeNum >= 1 ){
            cc.find('layer_dissolve',this.node).active = false;
            return;
        }

        var max;
        if( GameData13.room.joinermax == 2 ){
            max = GameData13.room.joinermax;
        }else if( GameData13.room.joinermax > 2 ) {
            max = parseInt(GameData13.room.joinermax/2)+1;
        }

        if( agreeNum == max ) {
            GameData.player.roomid = undefined;
        }
        this.node.getComponent('SSSRoomMain').showdissolveLayer();

        this.handleVoteResult(this.isDis);
        this.handleRoomDisbandTimer(dissolove);
    },

    showGameResult: function(data) {
        if (this.isDis == false) {
            cc.log('gemaEndResult: ', JSON.stringify(GameData13.gemaEndResult));
            if (!GameData13.isEmptyObject(GameData13.gemaEndResult)) {
                GameData.SetLayerData.soundOpen = false;
                // GameData.saveSetLayerData();
                this.node.getComponent('SSSRoomMain').showSummaryLayer();
                if (GameData13.clearObject(GameData.game.onRoomDissolve)) {
                    cc.log('对象已清空');
                }else {
                    cc.log('对象没有清空');
                }
            }else if (GameData13.isEmptyObject(GameData13.gemaEndResult)) {
                if (GameData13.clearObject(GameData.game.onRoomDissolve)) {
                    cc.log('对象已清空');
                }else {
                    cc.log('对象没有清空');
                }
                GameData13.clearAllGameData();
                cc.director.loadScene('home');
            }
        }
    },

    requestDissolveAgree: function() {
        RoomHandler.deleteRoom(GameData.player.roomid, 'agree');
    },

    requestDissolveDisagree: function() {
        RoomHandler.deleteRoom(GameData.player.roomid, 'disagree');
    },

    handleVoteResult: function(data) {
        if (data == false) {

            this.unschedule(this.updateLastTime);
            if (GameData13.game.start == false) {
                if (GameData13.clearObject(GameData.game.onRoomDissolve)) {
                    cc.log('对象已清空');
                }else {
                    cc.log('对象没有清空');
                }
                GameData13.clearAllGameData();
                cc.director.loadScene('home');
            }
        }
    },

    handleRoomDisbandTimer : function(data)
    {
        this.totalTime = data.startTime;
        this.lastTime = data.lastTime;
        this.schedule(this.updateLastTime, 1);
    },

    updateLastTime : function()
    {
        this.lastTime--;

        var labelStr = '倒计时结束后自动解散牌局   ' + formatSeconds(this.lastTime,1);
        this.lastTimeLabel.string = labelStr;
        if( this.lastTime <= 0 )
        {
            RoomHandler.deleteRoom(GameData.player.roomid, 'close');
            this.unschedule(this.updateLastTime);
        }
    },

    showJoinerLost: function(data) {
        cc.log('disconnect uid : ' + data.detail.uid);
        this.showHeaderDisconnect(data.detail.uid,true);
    },

    showJoinerConnect : function(data)
    {
        cc.log('connect uid : ' + data.detail.uid);
        this.showHeaderDisconnect(data.detail.uid,false);
    },

    showHeaderDisconnect : function(uid, show)
    {
        for(var i = 0; i < GameData13.joiners.length; i++)
        {
            var player = GameData13.joiners[i];
            var index = i+1;
            if(player.uid == uid)
            {
                player.status = 0;

                this.showLostImg( index,show );
                return;
            }
        }   
    },
});
