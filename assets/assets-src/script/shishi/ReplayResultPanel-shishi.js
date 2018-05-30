var RuleHandler = require('ruleHandler');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        cardTemplate : cc.Prefab,
        cardHuier : cc.Prefab,
        cardHuImage : cc.Prefab,

        winNode : cc.Node,
        lostNode : cc.Node,
        pingNode : cc.Node,

        roomID : cc.Label,
        createtime : cc.Label,
        roundData :cc.Label,

        isMark : 0,
        jinNum : 0,

        fonts :{
            default:[],
            type:cc.Font
        }
    },

    // use this for initialization
    onLoad: function () {
        this.pengCard = {};
        this.gangCard = {};
        this.chiCard = {};
        this.onShow();
    },

    onClose: function(evt)
    {
        ReplayDataCenter.openReplayPanel = true;
        cc.director.getScheduler().setTimeScale(1);
        cc.director.loadScene('home');
    },

    onShow: function () 
    {
        for (var i=0; i<Object.keys(ReplayData.players).length; i++) {
            this.jinNum = 0;
            this.showCards(i);
            this.showPlayer(i);
            this.showScore(i);
            this.showDetail(i);
            this.showWinIcon(i);
        }
        for (var i=Object.keys(ReplayData.players).length; i<4; i++) {
            var playerNode = cc.find('player'+(i+1), this.node);
            playerNode.active = false;
        }
        this.showRoundInfo();
        this.showResultIcon();
    },

    showWinIcon: function(index) {
        var uid = ReplayData.players[index].uid;
        //显示胡icon
        var parent = cc.find('player'+(index+1), this.node);
        var node = cc.find('huIcon', parent);
        var winner = false;
        if(ReplayData.zimo){
            winner = (uid == ReplayData.zimo.winner);
        }else if (ReplayData.dianpao){
            winner = (uid == ReplayData.dianpao.winner);
        }
        node.active = winner;
        //显示点炮icon
        var paoNode = cc.find('paoIcon',parent);
        cc.log("sadasd "+JSON.stringify(ReplayData));
        var dianpao = false;
        if(ReplayData.zimo){
            dianpao = false;
        }else if (ReplayData.dianpao){
            dianpao = (uid == ReplayData.dianpao.displayer);
        }
        paoNode.active = dianpao;
    },

    showResultIcon: function() {
        this.winNode.active = false;
        this.lostNode.active = false;
        this.pingNode.active = false;
        var Uid;
        if (otherReplay[0] == true) {
            for (var key in ReplayRoomData.players) {
                if (key) {
                    Uid = ReplayRoomData.players[key].uid;
                    break;
                }
            }
        }else{
            Uid = GameData.player.uid;
        }
        var myScore = ReplayData.scores[Uid];
        if(myScore > 0) {
            this.winNode.active = true;
        } else if(myScore < 0) {
            this.lostNode.active = true;
        } else {
            this.pingNode.active = true;
        }
    },

    showRoundInfo: function(){
        this.roomID.string = "房号："+ReplayData.room;
        
        var time = ReplayRoomData.createtime;
        time = new Date(time);
        var year = time.getFullYear()+'/';
        var month = time.getMonth()+1+'/';
        var date = time.getDate()+'   ';
        var h = time.getHours() + '';
        var m = time.getMinutes() + '';
        var s = time.getSeconds() + '';
        h = h.length == 1 ? '0' + h : h;
        m = m.length == 1 ? '0' + m : m;
        s = s.length == 1 ? '0' + s : s;
        this.createtime.string = year + month + date + h + ':' + m + ':' + s;

        var showRoundNum = 0;
        for (var i = 0; i < ReplayRoomData.games.length; i++) {
            if (ReplayData.id == ReplayRoomData.games[i].id) {
                showRoundNum = i+1;
            }
        }
        this.roundData.string = "第" + showRoundNum + "局";
    },

    showDetail: function(index) 
    {
        var player = ReplayData.players[index];
        var termNode = cc.find('player'+(index+1)+'/term', this.node);
        var label = termNode.getComponent('cc.Label');
        label.string = ' ';

        if( ReplayData.opts.water[player.uid] > 0 ) {
            label.string += '2水 ';
        }

        var huType;
        if(ReplayData.zimo){
                if (ReplayData.zimo.winner == player.uid) {
                    huType = ReplayData.zimo.type;
                    label.string += ReplayDataCenter.replayResultDetailShiShi(huType);
                }
        }else if (ReplayData.dianpao){
            if (ReplayData.dianpao.winner == player.uid) {
                    huType = ReplayData.dianpao.type;
                    label.string += ReplayDataCenter.replayResultDetailShiShi(huType);
                }
        }

        for (var i=0; i<this.gangCard.length; i++) {
            if (ReplayDataCenter.isHuier(this.gangCard[i][0])) label.string += ' 金杠 ' + '+' + ReplayRoomData.opts.jingang;

            var index1 = 0,index2 = 0;
            for (var j = 0; j < this.gangCard.length; j++) {
                if (this.gangCard[j].length == 4) {
                    index1++;
                } else if (this.gangCard[j].length == 5) {
                    index2++;
                }
            }
        }
        if (index1 > 0){
            label.string += '明杠 +1*'+index1+'  ';
        }
        if (index2 > 0){
            label.string += '暗杠 +2*'+ index2+'  ';
        }

        if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi) {
            var huaArray = this.getHuaCards(index);

            //显示花牌标志
            if( huaArray.length >=1  ) {
                var temp = cc.find('player'+(index+1)+'/cards', this.node);
                this.showHua( huaArray,temp);
            }
            if( huaArray.length >=4  ) {
                var huaNum = RuleHandler.instance.replayCalcHuaScore(player.uid);
                if (huaNum && huaNum != 0) {
                    label.string += '花杠 +'+huaNum+' ' ;
                }
            }
        }

        if (this.jinNum > 0){
            label.string += '金 +'+this.jinNum+'  ';
        }
    },

    getHuaCards : function( index){
        var player = ReplayData.players[index];

        var array = [];
        var initHua = ReplayData.cards[index].hua;
        if( initHua.length > 0 ) {
            array = initHua;
        }

        for( var key = 0; key < ReplayData.actions.length; key++ )
        {
            if( ReplayData.actions[key].uid == player.uid ){
                if( ReplayData.actions[key].hua == undefined ) {
                    continue;
                }
                this.mergeArray( array, ReplayData.actions[key].hua );
            }
        }
        return array;
    },

    mergeArray : function( array1, array2 ){
        for( var key = 0; key < array2.length; key++ ) {
            array1.push(array2[key]);
        }
    },

    showHua: function( huaCard,parent) {

        huaCard.sort();
        var huaNode = cc.find('cardhua',parent);
        var huaChild = huaNode.children;
        for (var j = 0; j < huaChild.length; j++) {
            huaChild[j].active = false;
        }
        for (var i = 0; i < huaCard.length; i++) {
            var index = i + 1;
            var showCard = cc.find('cardhua/'+index,parent);
            showCard.getComponent(cc.Sprite).spriteFrame = null;
            var iconUrl = this.showHuaTexture(huaCard[i]);
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

    showPlayer : function(index)
    {
        var player = ReplayData.players[index];
        var idNode = cc.find('player'+(index+1)+'/head/id', this.node);
        var nameNode = cc.find('player'+(index+1)+'/head/name', this.node);
        var headpicNode = cc.find('player'+(index+1)+'/head/headpic', this.node);
        var zhuangNode = cc.find('player'+(index+1)+'/head/zhuang', this.node);
        var creator = cc.find('player'+(index+1)+'/head/creator', this.node);
        var player_name = player.name.substring(0,4) +'...'

        nameNode.getComponent(cc.Label).string = player_name;
        idNode.getComponent(cc.Label).string = player.uid;

        zhuangNode.active = player.uid == ReplayData.opts.zhuang;

        creator.active = player.uid == ReplayRoomData.creator;

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

    showCards : function(index)
    {
        var player = ReplayData.players[index];
        var playerNode = cc.find('player'+(index+1), this.node);
        var parent = cc.find('cards', playerNode);

        var uid = player.uid;
        var hu ;

        if(ReplayData.zimo){
             hu = (uid == ReplayData.zimo.winner);
        }else if (ReplayData.dianpao){
            hu = (uid == ReplayData.dianpao.winner);
        }
        if (hu) {
            this.isMark = 0;
        }
        var playCard;

        for (var i = 0; i < ReplayDataCenter.resultCard.length; i++) {
            var cards = ReplayDataCenter.resultCard[i];
            if (cards.uid == uid) {
                playCard = cards;
                break;
            }
        }

        //碰杠
        this.pengCard = playCard.peng;
        this.gangCard = playCard.gang;
        this.chiCard = playCard.chi;
        //排序
        for(var i = 0; i< this.chiCard.length;i++)
        {
            this.chiCard[i].sort(function(a,b){
                return a-b;
            });
        }
        this.showPengCards(player, parent ,'mj_face_xia_chu','down');

        //手牌
        var cardHand = playCard.hand;
        if( cardHand.length >= 2 ){
            cardHand.sort(function(a,b){
                return a-b;
            });
        }

        var handNode = cc.find('cardHand',parent);
        handNode.setScale(0.7);

        for (var i = 0; i < cardHand.length; i++)
        {
            var card = cardHand[i];
            var cardNode = cc.instantiate(this.cardTemplate);
            cardNode.getComponent('cardTemplate').setId(card);
            cardNode.getComponent('cardTemplate').enableButton(false);

            var icon = 'mj_face_xia_shou_'+card+'.png';
            cardNode.getComponent('cardTemplate').setIcon('resources/mjcard2d/' + icon);
            cardNode.x = i*85;

            this.setMyHuierVisible(cardNode,card);
            this.setMyHuImageVisible(cardNode,card,hu);

            handNode.addChild(cardNode);
        }
        var childNum = 0;
        var pengNode = cc.find('cardPeng',parent);
        var child = pengNode.children;

        for (var i = 0; i < child.length; i++) {
            if (child[i].active) {
                childNum++;
            }
        }
        handNode.x = -532 + childNum*180;
        playerNode.active = true;
    },

    showCardContent : function(cardNode, cardHeader, cardId)
    {
        var card = cardNode.getComponent('Card');
        if(card != null)
        {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
    },

    setMyHuierVisible : function(cardNode, cardId)
    {
        var show = false;
        if (ReplayDataCenter.isHuier(cardId))
        {
            show = true;
        }
        if(show == true)
        {
            this.jinNum++;
        }
        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if(huierNode == null)
        {
            if(show == true)
            {
                huierNode = cc.instantiate(this.cardHuier);
                huierNode.y = huierNode.y - 8;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';
            }
        }
        else
        {
            huierNode.active = show;
        }       
    },
    setMyHuImageVisible : function(cardNode,cardId,isHu)
    {
        var orCard ;
        if(ReplayData.zimo){
             orCard =ReplayData.zimo.obtain;
        }else if(ReplayData.dianpao){
            orCard = ReplayData.dianpao.discard;
        }
        //var orCard = ReplayData.zimo.obtain;

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

        var huImageNode = cardNode.getChildByName(cardNode.name + '_hu');
        if(huImageNode == null)
        {
            if(show == true)
            {
                huImageNode = cc.instantiate(this.cardHuImage);
                huImageNode.y = huImageNode.y -20;
                cardNode.addChild(huImageNode);
                huImageNode.name = cardNode.name + '_hu';            
            }
        }
        else
        {
            huImageNode.active = show;
        }

        if(show == true)
        {
            this.isMark = 1; 
        }      
    },

    showPengCards: function(player, parent, cardHeader, direction) {
        if (player) {
            var cards = this.gangCard.concat(this.pengCard,this.chiCard);
            var size = parseInt(16/3);

            for (var i=0; i<size; i++)
            {
                var node = cc.find('cardPeng/cardPeng'+(i+1), parent);
                if (i < cards.length) 
                {   
                    for (var n=0; n<4; n++) 
                    {
                        var face = node.getChildByName('card_face'+(n+1)).getComponent("cc.Sprite");
                        if (n < cards[i].length) 
                        {                           
                            face.node.active = true; 
                            var cardId = cards[i][n];
                            this.showCardContent(face.node,cardHeader,cardId);
                            // if(n == 3 && ReplayDataCenter.isHuier(cardId) == true)
                            // {
                            //     this.addHuierIcon(face.node,direction);
                            // }
                        } 
                        else 
                        {
                            face.node.active = false;
                        } 
                    }
                    if (cards[i].length == 5) { //暗杠
                        var face = node.getChildByName('card_face4').getComponent("cc.Sprite");
                        var back = node.getChildByName('card_back4').getComponent("cc.Sprite");
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

    showScore: function(index) {
        var uid = ReplayData.players[index].uid;
        var scoreNode = cc.find('player'+(index+1)+'/score', this.node);
        if (ReplayData.scores[uid] > 0)
        {
            scoreNode.getComponent('cc.Label').string = '+' + ReplayData.scores[uid];
            scoreNode.getComponent('cc.Label').font = this.fonts[0];
        }
        else if( ReplayData.scores[uid] < 0 )
        {
            scoreNode.getComponent('cc.Label').string = ReplayData.scores[uid];
            scoreNode.getComponent('cc.Label').font = this.fonts[1];
        }
        else {
            scoreNode.getComponent('cc.Label').string = ReplayData.scores[uid];
            scoreNode.getComponent('cc.Label').font = this.fonts[2];
        }
    },
    shareRet: function(){
        if(inCD(3000) == false) {
            screenShoot(wxShareTexture);
        }
    },
});
