var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        playerCardNodes : 
        {
            default : [],
            type : [cc.Node]
        },

        huierFace1 : cc.Sprite,
        huierFace2 : cc.Sprite,

        stopBtn : cc.Button,
        playBtn : cc.Button,
        exitBtn : cc.Button,
        quick_btn : cc.Button,
        overBtn : cc.Button,

        _actionIndex : -1,
        _playerCardList : [],
        _effectController : null,

        playintrNode : cc.Node,
        roomNum : cc.Label,
        runSum : cc.Label,
    },

    // use this for initialization
    onLoad: function () 
    {
        this.playIntrSize = 'small';
        this.stopBtn.node.active = false;
        this.playBtn.node.active = true;
    },

    onEnable : function()
    {
        cc.director.getScheduler().setTimeScale(1)
        this._effectController = this.node.getComponent('ReplayEffectController');
        this.showPlayIntroduce(this.playIntrSize);
        this.roomNum.getComponent(cc.Label).string = ReplayRoomData.roomid;
        //this.node.getComponent("ReplayLayout").init();
        //this.initData();
        this.showUIHuier();
        this.initStopPanel();
        this.showHandCards();
        for(var i = 0; i < this._playerCardList.length; i++)
        {
            var headerNode = this._playerCardList[i];
            var score = this.getScore(headerNode.uid);
            console.log('=============score = '+score);
            headerNode.setCoin(score);
        }
        this.roundBeginHua();
        this.schedule(this.runAction, 1);       
    },
    onDestroy: function () {
    },
    runAction : function()
    {
        //function(){this.runNextAction()}
        this.runNextAction();
    },

    initData : function()
    {
        ReplayData = JSON.parse(replayDataJson);
        var huier = ReplayData.opts.huier;
        var huier2 = GameData.getOtherHuier(huier);
        cc.log('huier : ' + huier + ',huier2 : ' + huier2);
        HuierList = [huier,huier2];
    },

    initStopPanel : function()
    {
        var self = this;
        this.stopBtn.node.on(cc.Node.EventType.TOUCH_START,function(event){
            cc.director.getScheduler().setTimeScale(1);
            self.stopBtn.node.active = false;
            self.playBtn.node.active = true;
        });
        this.playBtn.node.on(cc.Node.EventType.TOUCH_START,function(event){
            cc.director.getScheduler().setTimeScale(0);
            self.stopBtn.node.active = true;
            self.playBtn.node.active = false;
        });
        this.exitBtn.node.on(cc.Node.EventType.TOUCH_START,function(event){
            ReplayDataCenter.openRoundPanel = true;
            cc.director.getScheduler().setTimeScale(1);
            cc.director.loadScene('home');
        });
        this.quick_btn.node.on(cc.Node.EventType.TOUCH_START,function(event){
            if(cc.director.getScheduler().getTimeScale() == 0){
                return;
            }
            cc.director.getScheduler().setTimeScale(2)
        });
        this.overBtn.node.on(cc.Node.EventType.TOUCH_START,function(event){
            self.overBtnClick();
        });
    },
    overBtnClick : function(){
        this.unschedule(this.runAction);
        for (var i = this._actionIndex+1; i < ReplayData.actions.length; i++) {
            var actionObject = ReplayData.actions[i];
            var uid = actionObject.uid;
            var action = actionObject.action;
            var card = actionObject.card;           
            cc.log(i,uid,action,card);
            var cardController = this.getCardController(uid);
            if (action == ActionType.obtain) cardController.obtain(card);
            else if (action == ActionType.discard) cardController.discard(card);
            else if (action == ActionType.peng) cardController.peng(card);
            else if (action == ActionType.minggang) cardController.minggang(card);
            else if (action == ActionType.minggangself) cardController.minggangself(card);
            else if (action == ActionType.angang) cardController.angang(card);
            else if (action == ActionType.chi) cardController.chi(card);
            else if (action == ActionType.hu) cardController.hu(card);
        }
        ReplayDataCenter.resultCard = this.getAllCards();

        //添加点炮的那张牌进手牌（针对回放点击结束按钮，回放结算赢家手牌中无点炮的牌添加）
        for (var key = 0; key < Object.keys(ReplayData.players).length; key++)
        {
            var playerUid = ReplayData.players[key].uid;

            var temp = false;
            if (ReplayData.dianpao){
                temp = (playerUid == ReplayData.dianpao.winner);
            }
            if( !temp ) {
                continue;
            }

            for (var index = 0; index < ReplayDataCenter.resultCard.length; index++)
            {
                var cards = ReplayDataCenter.resultCard[index];
                if (cards.uid == playerUid)
                {
                    var handCard = cards.hand;

                    if( handCard.length == 16
                        || handCard.length == 13
                        ||handCard.length == 10
                        ||handCard.length == 7
                        || handCard.length == 4
                        || handCard.length == 1 )
                    {
                        handCard.push( ReplayData.dianpao.discard );
                        handCard.sort(function(a,b){return a > b;});
                    }
                    break;
                }
            }
        }
        openView('ReplayResultPanel-shishi');
    },

    showUIHuier : function()
    {
        // var cardRef = this.node.getComponent('CardRef');
        // this.huierFace1.spriteFrame = cardRef.getSpriteFrame(HuierList[0]); 
        // this.huierFace2.spriteFrame = cardRef.getSpriteFrame(HuierList[1]);
        var cardlength = ReplayData.cards[0].cards.length;
        cc.log('showUIHuier --> ' + HuierList[0] + ',' + HuierList[1]);
        this.showCardContent(this.huierFace1.node,'mj_face_xia_shou',HuierList[0]);
        if (cardlength == 13) {
            this.showCardContent(this.huierFace2.node,'mj_face_xia_shou',HuierList[1]);
        }  
    },

    showCardContent : function(cardNode,cardHeader,cardId)
    {
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
    },

    runNextAction : function()
    {
        var self = this;
        this._actionIndex++;
        if(this._actionIndex < ReplayData.actions.length)
        {  
            var actionObject = ReplayData.actions[this._actionIndex];
            var uid = actionObject.uid;
            var action = actionObject.action;

            var youjinType = 0;
            if (actionObject.youNum) {
                youjinType = actionObject.youNum;
            }

            var card = actionObject.card;
            var hua = 0;
            if (actionObject.hua && actionObject.hua.length > 0) {
                hua = actionObject.hua;
            }
            cc.log(this._actionIndex,uid,action,card);

            this.gotoShowTurnEffect(uid);
            if(ReplayData.dianpao && this._actionIndex+1 == ReplayData.actions.length){
                //cc.log('111111111111111111111');
                var cardController = this.getCardController(ReplayData.dianpao.winner);
                cardController.obtain(card);
            }
            this.whoDoSomething(uid,action,card,hua,youjinType);
        }
        else if(this._actionIndex == ReplayData.actions.length)
        {
            cc.log('replay over');
            var actionindex = this._actionIndex - 1;
            var cardController = ReplayData.actions[actionindex];
            //this.cardActionAnimation(cardController.uid,'hu');
            if(ReplayData.zimo){
                //cc.log('zimo');
                this.cardActionAnimation(cardController.uid,'hu');
                for (var i = 0; i < this.playerCardNodes.length; i++) {
                    var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                    cc.log('playerCards.uid == cardController.uid '+playerCards.uid,cardController.uid,this.playerCardNodes)
                    if (playerCards.uid == cardController.uid) {
                        if (i == 0) {
                        this._effectController.showEffect(ActionType.hu);
                        }
                    }
                }
            }
            if(ReplayData.dianpao){
                 //cc.log('dianpao');
                for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                //cc.log('playerCards.uid == cardController.uid '+playerCards.uid,cardController.uid,this.playerCardNodes)
                    if (playerCards.uid == ReplayData.dianpao.winner) {
                        //cc.log('播放特效');
                        if (i == 0) {
                            //cc.log('播放特效当前');
                            this._effectController.showEffect(ActionType.hu);
                        }else{
                            //cc.log('播放特效其他');
                            this.cardActionAnimation(ReplayData.dianpao.winner,'hu');
                        }
                    }
                }
            }
            for(var i = 0; i < this._playerCardList.length; i++)
            {
                var headerNode = this._playerCardList[i];
                var score = this.getScore(headerNode.uid);
                score += ReplayData.scores[headerNode.uid];
                headerNode.setCoin(score);
            }
            this.lastTime = 2;
            this.schedule(this.updateLastTime, 1); 
        }
        else
        {
            this.unschedule(this.runAction);
            // popupManager.instance.open('ReplayResultPanel-shishi',
            // function(target){
            //      var cardList = self.getAllCards();
            //      target.getComponent('ReplayResultPanel-shishi').onShow(cardList);
            // });
        }
    },
   updateLastTime : function(){
        this.lastTime--;
        if (this.lastTime <= 0) {
            ReplayDataCenter.resultCard = this.getAllCards();
            openView('ReplayResultPanel-shishi');
            this.unschedule(this.updateLastTime);
        }
    },
    getAllCards : function()
    {
        var list = [];
        for(var i = 0; i < this.playerCardNodes.length; i++)
        {
            var cardNode = this.playerCardNodes[i];
            list.push(cardNode.getComponent('ReplayCardController').getList());
        }
        return list;
    },

    showHandCards : function()
    {
        var creator = ReplayData.creator;
        var cards = ReplayData.cards;
        var Uid;
        if (otherReplay[0] == true) {
            for (var key in ReplayRoomData.players) {
                if (key) {
                    Uid = ReplayRoomData.players[key].uid;
                    break;
                }
            }
        }else{
            Uid = GameData.player.uid.toString();
        }
        var replayRoom = ReplayDataCenter.room;
        var playerInfo = {};
        var ownerIndex = 0;
        for (var i = 0; i < replayRoom.length; i++) {
            if (replayRoom[i].roomid == ReplayData.room) {
                playerInfo = replayRoom[i].players;
                ownerIndex = playerInfo[Uid].seat;
            }
        }

        if (ownerIndex == null || ownerIndex == undefined) {
            return;
        }

        var indexList = [];

        this.playerNum = Object.keys(ReplayData.players).length; 
        if (this.playerNum == 4) {
            if(ownerIndex == 0)indexList = [0,1,2,3];
            if(ownerIndex == 1)indexList = [1,2,3,0];
            if(ownerIndex == 2)indexList = [2,3,0,1];
            if(ownerIndex == 3)indexList = [3,0,1,2];  
        }else if (this.playerNum == 3) {
            if(ownerIndex == 0)indexList = [0,1,2];
            if(ownerIndex == 1)indexList = [1,2,0];
            if(ownerIndex == 2)indexList = [2,0,1];
            this.playerCardNodes[1].removeFromParent(true);
            this.playerCardNodes.splice(1,1);
        }else if (this.playerNum == 2) {
            if(ownerIndex == 0)indexList = [0,1];
            if(ownerIndex == 1)indexList = [1,0];
            this.playerCardNodes[1].removeFromParent(true);
            this.playerCardNodes[3].removeFromParent(true);
            this.playerCardNodes.splice(1,1);
            this.playerCardNodes.splice(3,1);
        }
        for(var i = 0; i < indexList.length; i++)
        {
            var needindex = indexList[i];
            var cardList = cards[needindex];
            //console.log('cardList = ' + JSON.stringify(cardList));
            if(this.playerCardNodes != null && this.playerCardNodes.length > 0 && this.playerCardNodes[i] != null)
            {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                playerCards.showHandCard(cardList.cards);

                var uid = cards[needindex].uid;
                var name = playerInfo[uid].name;
                var headimgurl = playerInfo[uid].headimgurl;
                playerCards.uid = uid;
                //playerCards.showHead(name,headimgurl);

                playerCards.showHead(playerInfo[uid],name + "",headimgurl);
                playerCards.setChashuiState(uid);

                var show = playerCards.uid == ReplayData.opts.zhuang;
                playerCards.showZhuang(show);
                this._playerCardList.push(playerCards);
            }
        }
    },

    whoDoSomething : function(uid,action,cards,hua,youjinType)
    {
        this.runSum.getComponent(cc.Label).string = '进度: '+this._actionIndex+'/'+(ReplayData.actions.length -1);
        var cardController = this.getCardController(uid);
        if(action == ActionType.obtain)
        {
            cardController.obtain(cards);
            if (hua != 0) {
                this.cardActionAnimation(cardController.uid,'buhua');
                for (var i = 0; i < this.playerCardNodes.length; i++) {
                    var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                    if (playerCards.uid == cardController.uid) {
                        this.showHua(hua,this.playerCardNodes[i]);
                        if (i == 0) {
                            this._effectController.showEffect('buhua');
                        }
                    }
                }
            }
        }
        else if(action == ActionType.discard)
        {   
            cardController.discard(cards);
            //soundMngr.instance.playAudio('dis', cards[0]);
            //soundMngr.instance.playAudio('out');
        }
        else if(action == ActionType.peng)
        {
            cardController.peng(cards);

            this.cardActionAnimation(cardController.uid,'peng');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                    this._effectController.showEffect(ActionType.peng);
                    }
                }
            }
            this.removeDisFromLast(cards[0]);
            //console.log('cards = ' + cards[0]);
            //soundMngr.instance.playAudio('peng');
        }
        else if(action == ActionType.minggang)
        {
            cardController.minggang(cards);

            this.cardActionAnimation(cardController.uid,'gang');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                    this._effectController.showEffect(ActionType.minggang);
                    }
                }
            }
            this.removeDisFromLast(cards[2]);
            //soundMngr.instance.playAudio('gang');
        }
        else if(action == ActionType.minggangself)
        {
            cardController.minggangself(cards);

            this.cardActionAnimation(cardController.uid,'gang');
            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                    this._effectController.showEffect(ActionType.minggangself);
                    }
                }
            }
            //soundMngr.instance.playAudio('gang');
        }
        else if(action == ActionType.angang)
        {
            cardController.angang(cards);

            this.cardActionAnimation(cardController.uid,'gang');

            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                    this._effectController.showEffect(ActionType.angang);
                    }
                }
            }
           // soundMngr.instance.playAudio('gang');
        }
        else if (action == ActionType.chi) 
        {
            cardController.chi(cards);
            this.cardActionAnimation(cardController.uid,'chi');
            for (var i = 0; i < this.playerCardNodes.length; i++) {
                var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
                if (playerCards.uid == cardController.uid) {
                    if (i == 0) {
                        this._effectController.showEffect(ActionType.chi);
                    }
                }
            }
            this.removeDisFromLast(cards[0]);
        }
        else if (action == "youjin")
        {
            var playPos = this.getAnimationIndex(uid);
            console.log('..........................playPos = '+playPos);
            cardController.youjin(youjinType,playPos);
        } 
        // else if(action == ActionType.hu)
        // {
        //     cardController.hu(cards);

        //     this.cardActionAnimation(cardController.uid,'hu');
        //     for (var i = 0; i < this.playerCardNodes.length; i++) {
        //         var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
        //         if (playerCards.uid == cardController.uid) {
        //             if (i == 0) {
        //             this._effectController.showEffect(ActionType.hu);
        //             }
        //         }
        //     }            
        //     //soundMngr.instance.playAudio('hu');
        // }
        else
        {
            cc.log('no action logic, aciotn name is ' + action);
        }
    },

    removeDisFromLast : function(cardId)
    {
        var actionObject = ReplayData.actions[this._actionIndex - 1];
        var lastuid = actionObject.uid;
        var lastCardController = this.getCardController(lastuid);
        lastCardController.removeDisCard(cardId);
    },

    getAnimationIndex : function(uid){
        var actionPos = '';
        for (var i = 0; i < this.playerCardNodes.length; i++) {
            var playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            // if (this.playerNum == 4 && this.playerCardNodes[i] != null) {
            //         playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            // }else{
            //     if (i == 0) {
            //         playerCards = this.playerCardNodes[i].getComponent('ReplayCardController');
            //     }else{
            //         playerCards = this.playerCardNodes[i+1].getComponent('ReplayCardController');
            //     }
            // }
            if (this.playerNum == 4) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    }else if (i == 1) {
                        actionPos = 'right';
                    }else if (i == 2) {
                        actionPos = 'up';
                    }else if (i == 3) {
                        actionPos = 'left';
                    }
                }
            }else if (this.playerNum == 3) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    }else if (i == 1) {
                        actionPos = 'up';
                    }else if (i == 2) {
                        actionPos = 'left';
                    }
                }
            }
            else if (this.playerNum == 2) {
                if (playerCards.uid == uid) {
                    if (i == 0) {
                        actionPos = 'down';
                    }else if (i == 1) {
                        actionPos = 'up';
                    }
                }
            }
            
        }
        return actionPos;
    },

    cardActionAnimation : function(uid, action){

        var pos = this.getAnimationIndex(uid);
       // cc.log('123 '+pos);
        var animationNode = cc.find('layer_ui/actionAnimations/' + pos,this.node);
        //cc.log("node "+animationNode);
        if(animationNode != null)
        {
            animationNode.getComponent(cc.Animation).play(action);
        }
    },

    gotoShowTurnEffect : function(uid)
    {
        var isPlay = false;
        if(this._playerCardList == null)
        {
            cc.log('this._playerCardList null');
            return        };

        //cc.log('this.headers.length : ' + this.headers.length);
        for(var i = 0; i < this._playerCardList.length; i++)
        {
            var headerNode = this._playerCardList[i];
            //cc.log(uid + "," + headerNode.getComponent('playerTemplate').uid);
            isPlay = headerNode.uid == uid ? true : false;
            headerNode.getLiuGuang(isPlay);
        }
    },

    getCardController : function(uid)
    {
        for(var i = 0; i < this._playerCardList.length; i++)
        {
            var cardController = this._playerCardList[i];
            if(cardController.uid == uid)
            {
                return cardController;
            }
        }
        return null;
    },
    roundBeginHua : function(){
        for (var i = 0; i < ReplayData.cards.length; i++) {
            var hua = 0;
            hua = ReplayData.cards[i].hua;
            var uid = ReplayData.cards[i].uid;
            for (var actionIndex = 0; actionIndex < ReplayData.actions.length; actionIndex++) {
                if (ReplayData.actions[actionIndex].uid == uid && ReplayData.actions[actionIndex].hua && ReplayData.actions[actionIndex].hua.length > 0) {
                    for (var huaIndex = 0; huaIndex < hua.length; huaIndex++) {
                        var actionHua = ReplayData.actions[actionIndex].hua;
                        for (var index = 0; index < actionHua.length; index++) {
                            if (hua[huaIndex] == actionHua[index]) {
                                hua.splice(huaIndex,1);
                            }
                        }
                    }
                }
            }
            if (hua && hua.length > 0) {
                this.cardActionAnimation(uid,'buhua');
                for (var j = 0; j < this.playerCardNodes.length; j++) {
                    var playerCards = this.playerCardNodes[j].getComponent('ReplayCardController');
                    if (playerCards.uid == uid) {
                        this.showHua(hua,this.playerCardNodes[j]);
                        if (j == 0) {
                            this._effectController.showEffect('buhua');
                        }
                    }
                }
            }
        }
    },
    showHua : function(hua, parent){
        var playerCards = parent.getComponent('ReplayCardController');
        var playeruid = playerCards.uid;
        var huaPos = this.getAnimationIndex(playeruid);
        var huacard = hua.sort();
        var huaNode = cc.find('cardhua',parent);
        var huaChild = huaNode.children;


        for (var i = 0; i < huacard.length; i++) {
            for (var j = 0; j < huaChild.length; j++) {
                if (huaChild[j].active == true || huaChild[j] == null) {
                    continue;
                }else{
                    huaChild[j].active = true;
                    huaChild[j].getComponent(cc.Sprite).spriteFrame = null;
                    var iconUrl = this.showHuaTexture(huacard[i],huaPos);
                    var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                    huaChild[j].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
                    break; 
                }
            }
        }
    },
    showHuaTexture : function(huaId, direction){
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
        var texturedirec = '';
        if (direction == 'down') texturedirec = '';
        else if (direction == 'right') texturedirec = '4';
        else if (direction == 'up') texturedirec = '3';
        else if (direction == 'left') texturedirec = '2';
        textureUrl = textureUrl + tetureType + texturedirec + '.png';
        return textureUrl;
    },

    ruleClick : function(){
        if(this.playintrNode.active == true){
            return;
        }
        this.playintrNode.active = true;
         this.playintrNode.runAction(cc.sequence(
            cc.moveTo(0.5,cc.p(30,306)),
            //cc.callFunc(this.isRuleBtn,this),
            cc.delayTime(5),
            cc.moveTo(0.5,cc.p(30,406)),
            cc.callFunc(this.isRuleBtn,this)
            ));
         
    },
    isRuleBtn :function(){
        this.playintrNode.active = false;
    },
    onShowPlayIntrClick : function(){   
        this.playIntrSize = this.playIntrSize == 'small' ? 'big' : 'small';
        this.showPlayIntroduce(this.playIntrSize);
        cc.find('openBtn',this.playintrNode).rotation = this.playIntrSize == 'small' ? 0 : 180;
    },
    showPlayIntroduce : function(size)
    {
        var roomRule = ReplayRoomData.opts;
        console.log('roomRule = '+JSON.stringify(roomRule));
        var playStr = getRuleStrShiShi(roomRule);
        var contentNode = cc.find(size + '/content',this.playintrNode);
        cc.log('size : ' + size + ',contentNode : ' + contentNode);
        var label = contentNode.getComponent(cc.Label);
        console.log('playStr = '+ playStr);
        label.string = playStr;
    },

    getScore : function(uid){
        var index;
        for (var i = 0; i < ReplayRoomData.games.length; i++) {
            if (ReplayData.id == ReplayRoomData.games[i].id) {
                index = i;
            }
        }
        var nowScore = 0;
        if (index != 0){
            for (var i = 0; i < index; i++) {
                nowScore += ReplayRoomData.games[i].score[uid];
            }
        }
        console.log('................nowScore ='+nowScore);
        return nowScore;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
