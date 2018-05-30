var RuleHandler = require('ruleHandler');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        resultLayer: cc.Node,

        winSprite: cc.Sprite,
        loseSprite: cc.Sprite,
        pingSprite: cc.Sprite,

        cardTemplate: cc.Prefab,
        cardHuier   : cc.Prefab,
        playerTemplate: cc.Prefab,
        cardHuimage : cc.Prefab,
        isMark : 0,

        roomid: cc.Label,
        createTime : cc.Label,
        roundNum : cc.Label,
        jinNum : 0,

        fonts :{
            default:[],
            type:cc.Font
        }
    },

    // use this for initialization
    onLoad: function () {
        //registEvent('onShowResult', this, this.onShow);
        //this.RuleHandler = new RuleHandler();
    },

    onDestroy: function() {
        //delete this.RuleHandler;
        //unregistEvent('onShowResult', this, this.onShow);
    },
    onShow: function () {
        if(GameData.room.joinermax){

            for (var i=0; i<GameData.room.joinermax; i++) {
            this.jinNum = 0;
            this.showCards(i);
            this.showPlayer(i);
            this.showScore(i);
            this.showDetail(i);
            this.hideDianpaoIcon(i);
            this.showWinIcon(i);
            }
            for (var i=GameData.room.joinermax; i<4; i++) {
                var playerNode = cc.find('player'+(i+1), this.resultLayer);
                playerNode.active = false;
            }
            this.showResultIcon();
            this.showRoomDetail();
        }  
    },
    showPlayer: function(index) {
        var player = GameData.joiners[index];
        var idNode = cc.find('player'+(index+1)+'/head/id', this.resultLayer);
        var nameNode = cc.find('player'+(index+1)+'/head/name', this.resultLayer);
        var headpicNode = cc.find('player'+(index+1)+'/head/headpic', this.resultLayer);
        var zhuangNode = cc.find('player'+(index+1)+'/head/zhuang', this.resultLayer);
        var player_name = player.name.substring(0,4) +'...'

        nameNode.getComponent(cc.Label).string = player_name;
        idNode.getComponent(cc.Label).string = player.uid;

        zhuangNode.active = player.uid == GameData.game.zhuangUid;

        if(player.headimgurl == undefined || player.headimgurl == '') 
        {
            return;
        }

        cc.loader.load({url: player.headimgurl, type: 'png'}, function (error, texture) 
        {
            if (!error && texture) 
            {
                headpicNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }  
        });
    },
    setMyHuierVisible : function(cardNode,cardId)
    {
        var show = false;
        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (RuleHandler.instance.isHuier(cardId))
        {
            show = true;
        }
        if(show == true)
        {
            this.jinNum++;
        }
        if(huierNode == null)
        {
            if (show){
                huierNode = cc.instantiate(this.cardHuier);
                huierNode.y = huierNode.y - 8;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';

                var texture = cc.textureCache.addImage(cc.url.raw("resources/shishi/image/youjinbiao.png"));
                var headerNodeIcon = cc.find('huier_icon',huierNode);
                headerNodeIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        }
        else
        {
            huierNode.active = show;
        }       
    },
    setMyHuimageVisible : function(cardNode,cardId,isHu)
    {
        var orCard = GameData.game.winnerObtain;
        var show = false;
        if(isHu == false)
        {
            show = false;
        }
        else
        {
            if (orCard == cardId && this.isMark == 0)
            {
                show = true;
            }
        }


        var huimageNode = cardNode.getChildByName(cardNode.name + '_hu');
        if(huimageNode == null)
        {
            if(show == true)
            {
                huimageNode = cc.instantiate(this.cardHuimage);
                huimageNode.y = huimageNode.y -20;
                cardNode.addChild(huimageNode);
                huimageNode.name = cardNode.name + '_hu';            
            }
        }
        else
        {
            huimageNode.active = show;
        }

        if(show == true)
        {
            this.isMark = 1; 
        }      
    },
    showDetail: function(index) {
        var player = GameData.joiners[index];
        var termNode = cc.find('player'+(index+1)+'/term', this.resultLayer);
        var label = termNode.getComponent('cc.Label');
        label.string = '';

        var myScore = GameData.scores[GameData.player.uid];
        //console.log('myScore = ' + myScore);
        // if (myScore == 0 && GameData.client.gameType == GameType.Game_Mj_Shishi) {
        //     label.string = '';
        // }
        if( GameDataShiShi.setWater[player.uid] > 0 ) {
            label.string += '2水 ';
        }

        if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi){
            if (GameData.game.winnerUid == player.uid) {
                label.string += RuleHandler.instance.getHuTypeString();
            } else {
                label.string += '';
            }

            var gangs = GameData.getGangCards(player.uid);
            //console.log('gangs = '+JSON.stringify(gangs));
            for (var i=0; i<gangs.length; i++) {
                if (RuleHandler.instance.isHuier(gangs[i][0])) label.string += '金杠' + '+' + GameData.room.opts.jingang+'  ';
                // else if (gangs[i].length == 4) label.string += ' 明杠 +1';
                // else if (gangs[i].length == 5) label.string += ' 暗杠 +2';
                // if (RuleHandler.instance.isHuier(gangs[i][0])) label.string += ' 金杠 ';
                var index = 0,index2 = 0;
                for (var i = 0; i < gangs.length; i++) {
                    if(gangs[i].length == 4){
                        index++;
                    }else if (gangs[i].length == 5) {
                        index2++;
                    }
                }
                if (index == 0){}else{label.string += '明杠 +1*'+index+'  ';}
                if (index2 == 0){}else{label.string += '暗杠 +2*'+ index2+'  ';}
                // else if (gangs[i].length == 4) label.string += ' 明杠 +1';
                // else if (gangs[i].length == 5) label.string += ' 暗杠 +2';
                //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GameData.room.opts.jingang = '+GameData.room.opts.jingang);
            }

            if (GameData.game.zhuangUid == player.uid && GameData.game.zhuangNum[player.uid] > 0) {
                var zhuangNum = GameData.game.zhuangNum[player.uid];
                var score = zhuangNum * 2;
                label.string += '坐'+zhuangNum+'庄 *'+ score+'  ';
            } else if (GameData.game.zhuangUid != player.uid && GameData.game.zhuangNum[player.uid] > 0) {
                var zhuangNum = GameData.game.zhuangNum[player.uid];
                var score = zhuangNum * 2;
                label.string += '拉'+zhuangNum+'庄 *'+score+'  ';
            }
            if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi) {
                var huaNum = RuleHandler.instance.calcHuaScore(player.uid);
                cc.log("..hua:"+huaNum);
                if (huaNum && huaNum != 0) {
                    label.string += '花杠 +'+huaNum+' ' ;
                }
            }

            if (this.jinNum == 0) return;
            label.string += '金 +'+this.jinNum+'  ';          
        }  
    },

    showCardContent : function(cardNode,cardHeader,cardId)
    {
        if( cardNode == undefined || cardNode == null )
            return;

        var card = cardNode.getComponent('Card');
        if(card != null)
        {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
        this.setMaskVisible(cardNode,false);
    },

    setMaskVisible : function(cardNode,show)
    {
        //cc.log('showMaskVisible - > show ' + show);
        var maskNode = cardNode.getChildByName(cardNode.name + '_mask');
        if(maskNode == null)
        {
            if(show == true)
            {
                maskNode = cc.instantiate(this.cardMaskPrefab);
                cardNode.addChild(maskNode);
                maskNode.name = cardNode.name + '_mask';              
            }
        }
        else
        {
            maskNode.active = show;
        }

        return maskNode;      
    },

    showPengCards: function(player, parent, cardHeader, direction) {
        if (player) {
        
            var gang = GameData.getGangCards(player.uid);
            var peng = GameData.getPengCards(player.uid);
            var cards = gang.concat(peng);
            if(GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi){
                var chi = GameData.getChiCards(player.uid);
                console.log('chi == '+JSON.stringify(chi));
                for(var i = 0; i< chi.length;i++){
                    if( chi[i].length > 2 ) {
                        chi[i].sort(function(a,b){
                            return a-b;
                        });
                    }
                }
                cards = gang.concat(peng, chi);
            }
            //var cards = gang.concat(peng, chi);
            var size = parseInt(GameData.client.handsize/3);

            for (var i=0; i<size; i++)
            {
                var node = cc.find('cardPeng/cardPeng'+(i+1), parent);
                if (i < cards.length) 
                {   //console.log('i < cards.length'+i,cards.length);
                    for (var n=0; n<4; n++) 
                    {
                        var face = node.getChildByName('card_face'+(n+1)).getComponent("cc.Sprite");
                        //var word = node.getChildByName('card_word'+(n+1)).getComponent("cc.Sprite");
                        if (n < cards[i].length) 
                        {                           
                            face.node.active = true; 
                            var cardId = cards[i][n];
                            this.showCardContent(face.node,cardHeader,cardId);
                            if(n == 3 && RuleHandler.instance.isHuier(cardId) == true)
                            {
                                this.addHuierIcon(face.node,direction);
                            }
                        } 
                        else 
                        {
                            face.node.active = false;
                        } 
                    }
                    if (cards[i].length == 5) { //暗杠
                        var face = node.getChildByName('card_face4').getComponent("cc.Sprite");
                        //var word = node.getChildByName('card_word4').getComponent("cc.Sprite");
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                        //word.node.active = false;
                        face.node.active = false;
                        back.node.active = true;
                    } else {
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
                        back.node.active = false;
                    }
                    node.active = true;
                } else {
                    node.active = false;
                }
            }
        }
    },

    addHuierIcon : function(parent,direction)
    {
        if(parent.childrenCount <= 0)
        {
            var huierIconNode = new cc.Node();
            parent.addChild(huierIconNode);
            var textureUrl = '';
            if(GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi)
                textureUrl = cc.url.raw('resources/shishi/image/youjinbiao.png');
            var huierIconTx = cc.textureCache.addImage(textureUrl);
            var huierIconSprite = huierIconNode.addComponent(cc.Sprite);
            huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTx);
            
            if(direction == 'right')
            {
                huierIconNode.x = -32.6;
                huierIconNode.y = 7.1;
                huierIconNode.rotation = -101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = 11;
            }
            else if(direction == 'down')
            {
                huierIconNode.x = 0;
                huierIconNode.y = 60;
                huierIconNode.skewX = 10;
            }
            else if(direction == 'left')
            {
                huierIconNode.x = 31;
                huierIconNode.y = 8.6;
                huierIconNode.rotation = 101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = -11;
            }
            else if(direction == 'up')
            {
                huierIconNode.x = 3;
                huierIconNode.y = -6.8;
                huierIconNode.rotation = 180;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.3;
            }
        }
    },

    showCards: function(index) {
        var player = GameData.joiners[index];
        var playerNode = cc.find('player'+(index+1), this.resultLayer);
        var parent = cc.find('cards', playerNode);

        var hu = (player.uid == GameData.game.winnerUid);
        var totalSize = GameData.client.handsize+1;
        var cardHand = GameData.getHandCards(player.uid);
        var nodeIdx = GameData.getHandCardNum(player.uid);
        nodeIdx = (nodeIdx % 3 == 1) ? nodeIdx+1 : nodeIdx;
        var nodeIdx2 = nodeIdx;

        if (hu) this.isMark = 0;
        for (var card in cardHand) {   
            for (var i=0; i<cardHand[card]; i++) {
                var node = cc.find('cardHand/cardHand'+nodeIdx, parent);
                cc.log('result showCards:'+nodeIdx+' '+card);
                this.showCardContent(node, 'mj_face_xia_shou', card);
                this.setMyHuierVisible(node, card);
                this.setMyHuimageVisible(node, card, hu);
                node.active = true;
                nodeIdx--;
            }
        }
        for (var i=nodeIdx; i>=1; i--) {
            var node = cc.find('cardHand/cardHand'+i, parent);
            node.active = false;
        }
        for (var i=nodeIdx2+1; i<=totalSize; i++) {
            var node = cc.find('cardHand/cardHand'+i, parent);
            node.active = false;
        }

        this.showPengCards(player, parent ,'mj_face_xia_chu','down');
        if(GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi){
            this.showHua(player, parent);
        }
        playerNode.active = true;
    },

    showScore: function(index) {
        var uid = GameData.joiners[index].uid;
        var scoreNode = cc.find('player'+(index+1)+'/score', this.resultLayer);
        if (GameData.scores[uid] > 0)
        {
            scoreNode.getComponent('cc.Label').font = this.fonts[0];
            scoreNode.getComponent('cc.Label').string = '+' + GameData.scores[uid];
        }else if(GameData.scores[uid] == 0)
        {
            scoreNode.getComponent('cc.Label').font = this.fonts[2];
            scoreNode.getComponent('cc.Label').string = GameData.scores[uid];
        } else
        {
            scoreNode.getComponent('cc.Label').font = this.fonts[1];
            scoreNode.getComponent('cc.Label').string = GameData.scores[uid];
        }
    },
    hideDianpaoIcon: function(index){
        var uid = GameData.joiners[index].uid;
        var parent = cc.find('player'+(index+1), this.resultLayer);
        var paoNode = cc.find('paoIcon',parent);
        paoNode.active = false;
    },
    showWinIcon: function(index) {
        var uid = GameData.joiners[index].uid;
        var parent = cc.find('player'+(index+1), this.resultLayer);
        var node = cc.find('huIcon', parent);
        node.active = (uid == GameData.game.winnerUid);
        //显示点炮icon
        var paoNode = cc.find('paoIcon',parent);
        paoNode.active = false;
        if(!GameData.recordInfo[GameData.game.roundNum-1]){
            return
        }
        if(GameData.recordInfo[GameData.game.roundNum-1].type == 1 && uid == GameData.recordInfo[GameData.game.roundNum-1].dianpao){
            node.active = false;
            paoNode.active = true;
        }else{
            paoNode.active = false;
        }
    },

    showResultIcon: function() {
        this.winSprite.node.active = false;
        this.loseSprite.node.active = false;
        this.pingSprite.node.active = false;

        var myScore = GameData.scores[GameData.player.uid];
        if(myScore > 0) {
           this.winSprite.node.active = true;
        } else if(myScore < 0) {
           this.loseSprite.node.active = true;
        } else {
           this.pingSprite.node.active = true;
        }
    },
    showRoomDetail : function(){
        this.roomid.string =  '房间号:'+GameData.room.id ;
        this.createTime.string = getDate(GameData.room.createtime);
        var showRoundNum = GameData.game.roundNum;
        this.roundNum.string = '第 '+showRoundNum+' 局';
    },
    setReady: function() {
        // cc.log("GameData.game.roundNum:"+GameData.game.roundNum+"  "+"GameData.game.roundmax:"+GameData.game.roundmax);
        if (!GameData.room.close) {
            MjHandler.getInstance().requestReady(function(res){});
            //this.resultLayer.active = false;
            sendEvent('onGameStart');
        } else {
            this.resultLayer.active = false;
            this.node.getComponent('roomMain-shishi').showSummaryLayer();
        }
    },

    shareRet: function(){
        if(inCD(3000) == false)
        {
            screenShoot(wxShareTexture);
        }
    },

    showHua: function(player, parent) {
        var uid = player.uid;
        var huacard = GameData.cards[uid]['hua'].sort();
        var huaNode = cc.find('cardhua',parent);
        var huaChild = huaNode.children;
        for (var i = 0; i < huaChild.length; i++) {
            huaChild[i].active = false;
        }
        for (var i = 0; i < huacard.length; i++) {
            var index = i + 1;
            var showCard = cc.find('cardhua/'+index,parent);
            showCard.getComponent(cc.Sprite).spriteFrame = null;
            var iconUrl = this.showHuaTexture(huacard[i]);
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            showCard.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
            showCard.active = true;
        }
    },

    showHuaTexture : function(huaId){
        var textureUrl = 'resources/shishi/image/';
        var tetureType = '';
        if (huaId == 111) tetureType = 'chun';
        else if (huaId == 112) tetureType = 'xia';
        else if (huaId == 113) tetureType = 'qiu';
        else if (huaId == 114) tetureType = 'dong';
        else if (huaId == 121) tetureType = 'mei';
        else if (huaId == 122) tetureType = 'lan';
        else if (huaId == 123) tetureType = 'zhu';
        else if (huaId == 124) tetureType = 'ju';
        textureUrl = textureUrl + tetureType+ '.png';
        return textureUrl;
    },
});
