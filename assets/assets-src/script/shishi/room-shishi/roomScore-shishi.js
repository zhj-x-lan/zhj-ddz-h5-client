cc.Class({
    extends: cc.Component,

    properties: {
        scoreScollView : cc.ScrollView,
        scoreLayer :cc.Node,
        playerHeadNode : cc.Node,
        playerScoreItem : cc.Node,
        playerSumScore : cc.Node,
        ScoreList : [],
       
    },
    //use this for initialization
    onLoad:function () {
        cc.log('GameData.room.joinermax1 '+JSON.stringify(GameData.room));
        if(GameData.room){
           this.playerNum = GameData.room.joinermax; 
        }
        registEvent('onRoomMsg', this, this.ShowsPlayerTitle);
    },
    onEnable : function(){
        if(GameData.joiners)
        {
            this.ShowsPlayerTitle();
        };
        this.ScoreList = []; 
    },
    onDestroy : function(){
        //unregistEvent('onRoomMsg', this, this.ShowsPlayerTitle);
    },
    initPlayerHeadNode:function(){
        for(var i = 0; i < this.playerNum - 1; i++)
        {
            var index = i+1;
            var headNode = this.playerHeadNode.parent.getChildByName('Player_' + (i+2));
            if (headNode) continue;
            headNode = cc.instantiate(this.playerHeadNode); 
            this.playerHeadNode.parent.addChild(headNode);
            headNode.name = 'Player_' + (i+2);
            headNode.x = this.playerHeadNode.x + (i+1) * 200;

        };
    },
    ShowsPlayerTitle : function(){
         if(this.playerNum != undefined){
            this.playerNum = GameData.room.joinermax;
        } 
        cc.log('this.playerNum2'+this.playerNum); 
        this.initPlayerHeadNode();
        for (var i = 0; i < this.playerNum; i++) {
            var index = i + 1;
            var joiner = GameData.joiners[i];
            if (joiner) {
                var playerhead = joiner.headimgurl;
                this.ShowPlayerNameOnItme(index,joiner.name);
                this.ShowsPlayerImageOnItme(index,playerhead);
                this.ShowPlayerOwner(index, joiner);
            }
        }
    },
    ShowPlayerNameOnItme : function(index,nameStr){
        var nameNode = cc.find('Player_' + index + '/nick_name' ,this.playerHeadNode.parent);
        nameNode.getComponent(cc.Label).string = getShortStr(nameStr,4);
    },
    ShowsPlayerImageOnItme : function(index,playIma){
        if (playIma == undefined || playIma == '') {
            return;
        }
        var self = this;
        cc.loader.load({url: playIma, type: 'png'}, function (error, texture) {
            if (!error && texture) 
            {
                var nameNode = cc.find('Player_' + index + '/head' ,self.playerHeadNode.parent);
                nameNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }  
        });
    },
    ShowPlayerOwner : function(index,player){
        if (GameData.room.creator == player.uid) {
            var owner = cc.find('Player_'+index+'/owner', this.playerHeadNode.parent);
            owner.active = true;
        }
    },
    ShowPlayerScoreItem : function(){
        var len;
        len = GameData.game.roundNum;
        for (var i = 0; i < len; i++) {
            var index = i + 1;
            var scoreNode = this.playerScoreItem.parent.getChildByName(''+i);
            if(scoreNode == null)
            {
                scoreNode = cc.instantiate(this.playerScoreItem);
                this.playerScoreItem.parent.addChild(scoreNode);
                this.ScoreList.push(scoreNode);
                scoreNode.active = true;
                scoreNode.name = ''+i;
                scoreNode.y = this.playerScoreItem.y - (i)*this.playerScoreItem.height;
            }
            if (this.scoreScollView.content.height < this.ScoreList.length*this.playerScoreItem.height) {
                this.scoreScollView.content.height  = this.scoreScollView.content.height + this.playerScoreItem.height;
            }
            var jushuNode = cc.find('' + i + '/roundNum' ,this.playerScoreItem.parent);
            jushuNode.getComponent(cc.Label).string = '第' + index + '局：'; 
            
            for (var m = 0; m < 4; m++) {
                var index = m+1;
                var scoreNum = cc.find('scoreNum_'+ index,scoreNode);
                if (m >= this.playerNum) {
                    scoreNum.active = false;
                }
            }

            for (var j = 0; j < this.playerNum; j++) {
                var indem = j + 1;
                var playerUid = GameData.joiners[j].uid;
                var scoreNum = cc.find('scoreNum_'+ indem,scoreNode);
                if (GameData.JushuScore[i][playerUid] > 0){
                    scoreNum.getComponent('cc.Label').string = '+' +GameData.JushuScore[i][playerUid] + '分';
                    scoreNum.color = new cc.Color(254, 48, 0);
                }else if(GameData.JushuScore[i][playerUid] == 0){
                    scoreNum.getComponent('cc.Label').string =  '0 分';
                    scoreNum.color = new cc.Color(0, 164, 54);
                }else {
                    scoreNum.getComponent('cc.Label').string = GameData.JushuScore[i][playerUid] + '分';
                    scoreNum.color = new cc.Color(24, 51, 55);
                } 
                if (playerUid == GameData.JushuScore[i].zhuangUid) {
                    var zhuangIndex = j + 1;
                    var zhuangSaw = cc.find('zhuang_' + zhuangIndex,scoreNode);
                    zhuangSaw.active = true;
                } 
            }
        } 
        cc.log('GameData.room.joinermax2 '+GameData.room.joinermax);
        if(this.playerNum != undefined){
            this.playerNum = GameData.room.joinermax;
            this.AddSumScore();
        }  
    },
    AddSumScore : function(){
        var children = this.playerSumScore.children;
        for (var i = 0; i < children.length; i++) {
            console.log('this.playerNum = ' + this.playerNum + ',i = '+i);
            if (i >= this.playerNum) {
                children[i].active = false;
            }
        }

        for (var i = 0; i < this.playerNum; i++) {
            var index = i + 1;
            var Allscore = cc.find('scoreNum_' + index,this.playerSumScore);
            var playUid = GameData.joiners[i].uid;
            if (GameData.allScores[playUid] > 0) {
                if (GameData.room.opts.scoreBase != 0) Allscore.getComponent('cc.Label').string = GameData.allScores[playUid] + '分';
                else Allscore.getComponent('cc.Label').string = '+' + GameData.allScores[playUid] + '分';
                Allscore.color = new cc.Color(254, 48, 0);
            }else if (GameData.allScores[playUid] == 0) {
                Allscore.getComponent('cc.Label').string = '0 分';
                Allscore.color = new cc.Color(0, 164, 54);
            }else{
                Allscore.getComponent('cc.Label').string = GameData.allScores[playUid] + '分';
                Allscore.color = new cc.Color(24, 51, 55);
            }
        }  
    },
    
    close:function(){
        this.scoreLayer.active = false;
    }

})