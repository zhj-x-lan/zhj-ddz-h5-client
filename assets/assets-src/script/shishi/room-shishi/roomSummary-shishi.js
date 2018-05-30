cc.Class({
    extends: cc.Component,

    properties: {
        panel: cc.Node,

        fonts :{
            default:[],
            type:cc.Font
        }
    },

    // use this for initialization
    onLoad: function () {
        registEvent('onShowSummary', this, this.onShow);
        registEvent('recordInfo', this.recordInfoShow);
    },

    onDestroy: function() {
        unregistEvent('onShowSummary', this, this.onShow);
        unregistEvent('recordInfo', this.recordInfoShow);
    },

    onShow: function() {

        this.showTime();

        //将四个结算模板位置复原
        cc.find('player_1', this.panel).y = 0;
        cc.find('player_2', this.panel).y = 0;
        cc.find('player_3', this.panel).y = 0;
        cc.find('player_4', this.panel).y = 0;

        for (var i=0; i<GameData.joiners.length; i++) {
            // if (GameData.joiners[i].uid == GameData.player.uid) continue;
            this.showPlayer(GameData.joiners[i], i+1);
            var playerNode = cc.find('player_'+(i+1), this.panel);
            playerNode.active = true;

            //根据人数设置位置
            if( GameData.joiners.length == 3 && i == 1 ) {
                playerNode.y = 25;
            }
            else if( GameData.joiners.length == 4 && i == 1 ) {
                playerNode.y = 25;
            }
            else if( GameData.joiners.length == 4 && i == 3 ) {
                playerNode.y = 25;
            }
        }
        for (var i=GameData.joiners.length; i<4; i++) {
            var playerNode = cc.find('player_'+(i+1), this.panel);
            playerNode.active = false;
        }
    },
    recordInfoShow: function(uid, idx){
        let num_zimo = 0;
        let num_sudao = 0;
        let num_youjin = 0;
        let num_dizhen = 0;
        let num_dianpao = 0;

        let zimoNum = cc.find('player_'+idx+'/zimo/zimolabel', this.panel);
        let sudaoNum = cc.find('player_'+idx+'/sudao/sudaolabel', this.panel);
        let youjinNum = cc.find('player_'+idx+'/youjin/youjinlabel', this.panel);
        let dizhenNum = cc.find('player_'+idx+'/dizhen/dizhenlabel', this.panel);
        let dianpaoNum = cc.find('player_'+idx+'/dianpao/dianpaolabel', this.panel);

        for (let i = 0; i < GameData.recordInfo.length; i++) {
            if (GameData.recordInfo[i].winner == uid) {
                if (GameData.recordInfo[i].type == 1) num_sudao++;
                else if (GameData.recordInfo[i].type == 2) num_zimo++;
                else if (GameData.recordInfo[i].type == 3) num_dizhen++;
                else if (GameData.recordInfo[i].type == 4 || GameData.recordInfo[i].type == 5 || 
                GameData.recordInfo[i].type == 6 || GameData.recordInfo[i].type == 7) num_youjin++;
            }
            else if (GameData.recordInfo[i].dianpao == uid) {
                if (GameData.recordInfo[i].type == 1) num_dianpao++;
            }
        }

        zimoNum.getComponent("cc.Label").string = num_zimo;
        sudaoNum.getComponent("cc.Label").string = num_sudao;
        youjinNum.getComponent("cc.Label").string = num_youjin;
        dizhenNum.getComponent("cc.Label").string = num_dizhen;
        dianpaoNum.getComponent("cc.Label").string = num_dianpao;
    },

    showTime: function(){
        let roomID = cc.find('roomID', this.panel);
        let dateNode = cc.find('date', this.panel);
        let timeNode = cc.find('time', this.panel);

        let date = new Date(GameData.room.createtime);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hours = date.getHours();
        if (hours < 10) {
            hours = '0'+hours+':';
        }else{
            hours = hours+':';
        }
        let minute = date.getMinutes();
        if (minute < 10) {
            minute = '0'+minute+':';
        }else{
            minute = minute+':';
        }
        let second = date.getSeconds();
        if (second < 10) {
            second = '0'+second;
        }else{
            second = second;
        }

        roomID.getComponent("cc.Label").string = "房号 : " + GameData.room.id;
        dateNode.getComponent("cc.Label").string = year + "-" + month + "-" + day;
        timeNode.getComponent("cc.Label").string = hours + minute + second;
    },

    showPlayer: function(player, idx) {
        if (!player) return;
        this.recordInfoShow(player.uid, idx);
        let joinermax = GameData.room.opts.joinermax; //玩家人數
        var nameNode = cc.find('player_'+idx+'/name', this.panel);
        var scoreNode = cc.find('player_'+idx+'/field_num1', this.panel);
        var headNode = cc.find('player_'+idx+'/head', this.panel);
        let playerID = cc.find('player_'+idx+'/playerID', this.panel);
        let pNode = cc.find('player_'+idx, this.panel);

        let panelSize = cc.find('bg', this.panel).getContentSize().width;
        let playerNodeSize = cc.find('player_'+idx+'/biankuang', this.panel).getContentSize().width;

        if( joinermax < 4 ) {
            var distance = (panelSize-playerNodeSize*joinermax)/2 - 50*(joinermax-1);
            pNode.x = distance + 50*(idx-1);
        }

        nameNode.getComponent("cc.Label").string = cutstr(player.name, 10);
        playerID.getComponent("cc.Label").string = "ID:" + player.uid;

        var score = GameData.allScores[player.uid] - GameData.room.opts.scoreBase;

        if (score > 0) {
            scoreNode.getComponent("cc.Label").string = "+"+score;
            scoreNode.getComponent('cc.Label').font = this.fonts[1];
        }else if (score < 0) {
            scoreNode.getComponent("cc.Label").string = score;
            cc.log("..score:"+score);
            scoreNode.getComponent('cc.Label').font = this.fonts[0];
        }else {
            scoreNode.getComponent("cc.Label").string = score;
            scoreNode.getComponent('cc.Label').font = this.fonts[2];
        }
        
        if(player.headimgurl != null && player.headimgurl != '' && player.headimgurl.length > 0)
        {
            cc.loader.load({url: player.headimgurl, type: 'png'}, function (error, texture) {
                if (!error && texture) {
                    headNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
                }  
            });
        }

        if (GameData.player.uid == player.uid) {
            var biankuang = cc.find('player_'+idx+'/biankuang', this.panel);
            var selfbiankuang = cc.find('player_'+idx+'/selfbiankuang', this.panel);
            biankuang.active = false;
            selfbiankuang.active = true;
        }

        if (GameData.room.creator == player.uid) {
            let ownerNode = cc.find('player_'+idx+'/owner', this.panel);
            ownerNode.active = true;
        }

        var GetScoreMaxUid = function() {
            var tempUid;
            tempUid = GameData.joiners[0].uid;
            for (let i = 1; i < GameData.joiners.length; i++) {
                if (GameData.joiners[i] && GameData.allScores[GameData.joiners[i].uid] > GameData.allScores[tempUid]){
                    tempUid = GameData.joiners[i].uid;
                }
            }
            return tempUid;
        }
        if (GameData.allScores[GetScoreMaxUid()] == GameData.allScores[player.uid]) {
            var winNode = cc.find('player_'+idx+'/win', this.panel);
            winNode.active = (GameData.allScores[GetScoreMaxUid()] - GameData.room.opts.scoreBase > 0);
        }
    },

    btnBackOnClicked: function(evt) {
        GameData.player.roomid = undefined;
        cc.director.loadScene('home');
    },

    btnShareOnClicked: function(){
        if(inCD(3000))
        {
            return;
        }
        screenShoot(wxShareTexture);
    },
    
});
