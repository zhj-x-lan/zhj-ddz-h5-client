var RuleHandler = require('ruleHandler');
var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        resultLayer: cc.Node,

        winSprite: cc.Sprite,
        loseSprite: cc.Sprite,
        pingSprite: cc.Sprite,

        createtime: cc.Label,
        roomID: cc.Label,
        roundData: cc.Label,


        cardTemplate: cc.Prefab,
        cardHuier: cc.Prefab,
        playerTemplate: cc.Prefab,
        cardHuimage: cc.Prefab,
        isMark: 0,
        //宝牌
        baoCardNode:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        //registEvent('onShowResult', this, this.onShow);
        //this.RuleHandler = new RuleHandler();
    },

    onDestroy: function () {
        //delete this.RuleHandler;
        //unregistEvent('onShowResult', this, this.onShow);
    },
    onShow: function () {
        for (var i = 0; i < GameData.room.opts.joinermax; i++) {
            this.showCards(i);
            this.showPlayer(i);
            this.showScore(i);
            this.showDetail(i);
            this.showWinIcon(i);
        }
        for (var i = GameData.room.opts.joinermax; i < 4; i++) {
            var playerNode = cc.find('player' + (i + 1), this.resultLayer);
            playerNode.active = false;
        }
        this.showBaoNode();
        this.showRoundInfo();
        this.showResultIcon();
    },
    showPlayer: function (index) {
        var player = GameData.joiners[index];
        var idNode = cc.find('player' + (index + 1) + '/head/id', this.resultLayer);
        var nameNode = cc.find('player' + (index + 1) + '/head/name', this.resultLayer);
        var headpicNode = cc.find('player' + (index + 1) + '/head/headpic', this.resultLayer);
        var zhuangNode = cc.find('player' + (index + 1) + '/head/zhuang', this.resultLayer);
        var creator = cc.find('player' + (index + 1) + '/head/creator', this.resultLayer)
        var player_name = player.name.substring(0, 4) + '...'

        nameNode.getComponent(cc.Label).string = player_name;
        idNode.getComponent(cc.Label).string = player.uid;

        zhuangNode.active = player.uid == GameData.game.zhuangUid;

        creator.active = player.uid == GameData.room.creator;
        if (player.headimgurl == undefined || player.headimgurl == '' || player.headimgurl.length <= 0) {
            return;
        }

        cc.loader.load({ url: player.headimgurl, type: 'png' }, function (error, texture) {
            if (!error && texture) {
                headpicNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

   showBaoNode: function () {
        var baoSp = cc.find('baoCard',this.baoCardNode);
        if (GameData.game.cardHuier1 != 1000 && GameData.game.cardHuier1 != -1 && GameData.game.cardHuier1 != 0) {
            this.baoCardNode.active = true;
            baoSp.getComponents(cc.Sprite).spriteFrame = null;
            var iconUrl = 'resources/mjcard2d/mj_face_xia_shou' + '_' + GameData.game.cardHuier1 + '.png';
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            baoSp.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }else{
            this.baoCardNode.active = false;
        }
    },

    //添加宝牌标识
    setMyBaoVisible: function (cardNode,cardData,isHu) {
        var show = false;
        if (RuleHandler.instance.isHuier(cardData.card)) {
            show = true;
        }
        if (isHu == false) {
            show = false;
        }
        //宝牌标识  相同牌值 0 不是 1 是宝牌
        if (cardData.type == 0) {
            show = false;
        }
        var huierNode = cardNode.getChildByName(cardNode.name + '_huier');
        if (huierNode == null) {
            if (show == true) {
                huierNode = cc.instantiate(this.cardHuier);
                //huierNode.y = huierNode.y;
                cardNode.addChild(huierNode);
                huierNode.name = cardNode.name + '_huier';
            }
        }
        else {
            huierNode.active = show;
        }
    },
    //添加胡的牌标识
    setMyHuimageVisible: function (cardNode,cardData,isHu) {
        var orCard = GameData.game.winnerObtain;
        cc.log('orCard:'+orCard);
        var show = false;
        if (isHu == false) {
            show = false;
        }
        else {
            if (orCard == cardData.card && this.isMark == 0) {
                show = true;
            }
        }
        var huimageNode = cardNode.getChildByName(cardNode.name + '_hu');
        if (huimageNode == null) {
            if (show == true) {
                huimageNode = cc.instantiate(this.cardHuimage);
                huimageNode.y = huimageNode.y - 20;
                cardNode.addChild(huimageNode);
                huimageNode.name = cardNode.name + '_hu';
            }
        }
        else {
            huimageNode.active = show;
        }
        //cc.log('huimageNode.active:'+huimageNode.active);

        if (show == true) {
            this.isMark = 1;
        }
    },
    showDetail: function (index) {
        var player = GameData.joiners[index];
        var termNode = cc.find('player' + (index + 1) + '/term', this.resultLayer);
        var label = termNode.getComponent('cc.Label');
        label.node.active = false;
        var resultStr = profileHuaDian.getResultScoreInfoByUid(player.uid);
        label.string = '';

        var ishu = (GameData.ResultData[player.uid].isWin == 1 || GameData.ResultData[player.uid].isWin == 3);
        var isLiuJu = GameData.ResultData[player.uid].isWin == HuaDian.WINTYPE.LIUJU ;

        for (var i = 0; i<resultStr.huTypes.length; i++) {
            //小番+  大番*
            if (GameData.room.opts.isBigFan == 0) {
                //label.string += resultStr.huTypes[i].des + '+1 ';
            }else if (GameData.room.opts.isBigFan == 1){
                //屁胡  夹胡 抢杠胡
                if(ishu) {
                    if (resultStr.huTypes[i].code == 2 || resultStr.huTypes[i].code == 3 || resultStr.huTypes[i].code == 9) {
                        label.string += resultStr.huTypes[i].des + '+' + resultStr.huTypes[i].fan + ' ';
                    }else{
                        label.string += resultStr.huTypes[i].des + '*' + resultStr.huTypes[i].fan + ' ';
                    }
                }
            }
        }
        //杠+分
        var selfGang =  GameData.ResultData[player.uid].gangCards;
        var selfAddGangScore = 0;
        var selfDelGangScore = 0;
        for (var key in selfGang) {
            if (selfGang[key].cards.length == 4){
                selfAddGangScore+=1
            }else if (selfGang[key].cards.length == 5) {
                selfAddGangScore += GameData.joiners.length -1;
            }
        }
        if (selfAddGangScore != 0) {
            label.string += ' 杠:' + '+' + selfAddGangScore +'分 ';
        }
        //杠-分
        selfDelGangScore = selfAddGangScore - resultStr.scoreList[1];
        if (selfDelGangScore != 0) {
            label.string += ' 杠:' + '-'+ selfDelGangScore +'分 ';
        }

        //飘
        if (GameData.ResultData[player.uid].hasPiao == 1 || GameData.ResultData[player.uid].hasPiao == 2) {
            label.string += '飘 ';
        }

        //显示玩家是否上听搂 (1搂 2听)
        var tingState = GameData.cards[player.uid]['tingState'];
        if (tingState && !ishu) {
            if (tingState == 1) {
                label.string += '报搂 ';
            }else if (tingState == 2) {
                label.string += '报听 ';
            }
        }
        
        label.node.active = true;
    },

    showCardContent: function (cardNode, cardHeader, cardId) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.active = true;
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        //this.setMaskVisible(cardNode, false);
    },

    showHandCardContent: function (cardNode, cardHeader, cardData) {
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardData.card;
        }
        cardNode.active = true;
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/mjcard2d/' + cardHeader + '_' + cardData.card + '.png';
        // cc.log('load Card URL :' + iconUrl)
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        //this.setMaskVisible(cardNode, false);
    },

    showRoundInfo: function () {
        this.roomID.string = "房号：" + GameData.room.id;

        var time = profileHuaDian.resultData.timeStamp * 1000;
        time = new Date(time);
        var year = time.getFullYear() + '/';
        var month = time.getMonth() + 1 + '/';
        var date = time.getDate() + '   ';
        var h = time.getHours() + '';
        var m = time.getMinutes() + '';
        var s = time.getSeconds() + '';
        h = h.length == 1 ? '0' + h : h;
        m = m.length == 1 ? '0' + m : m;
        s = s.length == 1 ? '0' + s : s;
        this.createtime.string = year + month + date + h + ':' + m + ':' + s;

        var showRoundNum = GameData.room.gameNum;
        //游戏类型 1 局 2 圈
        //var roundType = GameData.room.opts.roundType;
        this.roundData.string = "第" + showRoundNum + "局";
        //if (roundType == 2) {
        //    this.roundData.string = "第" + showRoundNum + "圈";
        //}
    },

    setMaskVisible: function (cardNode, show) {
        //cc.log('showMaskVisible - > show ' + show);
        var maskNode = cardNode.getChildByName(cardNode.name + '_mask');
        if (maskNode == null) {
            if (show == true) {
                maskNode = cc.instantiate(this.cardMaskPrefab);
                cardNode.addChild(maskNode);
                maskNode.name = cardNode.name + '_mask';
            }
        }
        else {
            maskNode.active = show;
        }

        return maskNode;
    },

    showPengCards: function (player, parent, cardHeader, direction) {
        if (player) {

            var gang = GameData.getGangCards(player.uid);
            var peng = GameData.getPengCards(player.uid);
            var chi = GameData.getChiCards(player.uid);
            var cards = [] ;
            for (var key in gang) {
                cards.push(gang[key]);
            }
            for (var key in peng) {
                cards.push(peng[key]);
            }
            for (var key in chi) {
                cards.push(chi[key]);
            }
            cc.log('resultCards:'+JSON.stringify(cards));
            //var cards = gang.concat(peng, chi);
            var size = parseInt(GameData.client.handsize / 3);

            for (var i = 0; i < size; i++) {
                var node = cc.find('cardPeng/cardPeng' + (i + 1), parent);
                var face4 = cc.find('card_face4',node);
                if (i < cards.length) {   //console.log('i < cards.length'+i,cards.length);
                    for (var n = 0; n < 4; n++) {
                        var face = node.getChildByName('card_face' + (n + 1)).getComponent("cc.Sprite");

                            if (n < cards[i].cards.length) {
                                face.node.active = true;
                                var cardId = cards[i].cards[n];
                                if(cards[i].cards.length == 4){
                                    //添加明杠标识
                                    this.addGangIcon(face4,direction,1);
                                }

                                if (cards[i].cards.length == 5) { //暗杠
                                    //添加暗杠标识
                                    this.addGangIcon(face4,direction,2);
                                }
                                this.showCardContent(face.node, cardHeader, cardId);
                        }
                        else {
                            face.node.active = false;
                        }
                    }
                    node.active = true;
                } else {
                    node.active = false;
                }
            }
        }
    },
    /**
     *
     * @param parent 需要添加标识的card节点
     * @param direction 方向
     * @param type 杠的类型（明暗）1明2暗
     */
    addGangIcon: function(node,direction,type){
        var gangIcon = cc.find('gangType',node);
        var Url ;
        var gangType = '';
        var gangDirection ='';
        if (direction == 'right') {
            if (type ==1){
                gangType = 'ming'
            }else{
                gangType = 'an'
            }
            gangDirection = '1';
        }
        else if (direction == 'down') {
            if (type ==1){
                gangType = 'ming'
            }else{
                gangType = 'an'
            }
            gangDirection = '0';
        }
        else if (direction == 'left') {
            if (type ==1){
                gangType = 'ming'
            }else{
                gangType = 'an'
            }
            gangDirection = '3';
        }
        else if (direction == 'up') {
            if (type ==1){
                gangType = 'ming'
            }else{
                gangType = 'an'
            }
            gangDirection = '2';
        }
        Url = cc.url.raw('resources/huadian/UI/icon/' + gangType + gangDirection + '_icon.png');
        var GangIconTx = cc.textureCache.addImage(Url);
        gangIcon.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(GangIconTx);
    },

    addHuierIcon: function (parent, direction) {
        if (parent.childrenCount <= 0) {
            var huierIconNode = new cc.Node();
            parent.addChild(huierIconNode);
            var textureUrl = '';
            if (GameData.client.gameType == gameDefine.GameType.Game_Mj_Tianjin) {
                textureUrl = cc.url.raw('resources/table/huier_icon.png');
            } else if (GameData.client.gameType == gameDefine.GameType.Game_MJ_HuaDian) {
                textureUrl = cc.url.raw('resources/table/huier_icon.png');
            }
            var huierIconTx = cc.textureCache.addImage(textureUrl);
            var huierIconSprite = huierIconNode.addComponent(cc.Sprite);
            huierIconSprite.spriteFrame = new cc.SpriteFrame(huierIconTx);

            if (direction == 'right') {
                huierIconNode.x = -32.6;
                huierIconNode.y = 7.1;
                huierIconNode.rotation = -101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = 11;
            }
            else if (direction == 'down') {
                huierIconNode.x = 0;
                huierIconNode.y = 60;
                huierIconNode.skewX = 10;
            }
            else if (direction == 'left') {
                huierIconNode.x = 31;
                huierIconNode.y = 8.6;
                huierIconNode.rotation = 101.2;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.4;
                huierIconNode.skewX = -11;
            }
            else if (direction == 'up') {
                huierIconNode.x = 3;
                huierIconNode.y = -6.8;
                huierIconNode.rotation = 180;
                huierIconNode.scaleX = 0.4;
                huierIconNode.scaleY = 0.3;
            }
        }
    },

     showCards: function (index) {
        var player = GameData.joiners[index];
        var playerNode = cc.find('player' + (index + 1), this.resultLayer);
        var parent = cc.find('cards', playerNode);
        var hu ;
        var isBao = 0;
        if (GameData.ResultData[player.uid].isWin == 1 || GameData.ResultData[player.uid].isWin == 3) {
            hu = true;
        }else {
            hu = false;
        }

        var totalSize = GameData.client.handsize + 1;
        //var cardHand = GameData.getHandCards(player.uid);
        var cardHand = GameData.cards[player.uid]['Resulthand'];
        cardHand.sort(function (a,b) {
            return a.card-b.card;
        });
        var nodeIdx = GameData.getHandCardNum(player.uid);
        nodeIdx = (nodeIdx % 3 == 1) ? nodeIdx + 1 : nodeIdx;
        if (hu) this.isMark = 0;

        var handCardNode = cc.find('cardHand',parent);
        for (var i = 0; i<handCardNode.childrenCount; i++) {
            handCardNode.children[i].active = false;
        }
        var pengCardNode = cc.find('cardPeng',parent);
        for (var j = 0; j<pengCardNode.childrenCount; j++) {
            pengCardNode.children[j].active = false;
        }

        for (var kk = 0; kk<cardHand.length; kk++){
            if (cardHand[kk].type == 1) {
                isBao++;
            }
        }
        var isLou = profileHuaDian.resultData.isLouBao;
        var pengAndGangNum = GameData.getPengCards(player.uid).length*3
            + GameData.getGangCards(player.uid).length*3
            + GameData.getChiCards(player.uid).length*3;
        for (var k = 0; k<cardHand.length; k++) {
            if (!hu && isLou) {
                cc.log('nodeIdx:'+nodeIdx);
                var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                this.showHandCardContent(node, 'mj_face_xia_shou', cardHand[k]);
                if (nodeIdx == (totalSize - cardHand.length - pengAndGangNum)){
                    cc.log('nodeIdxnodeIdxnodeIdxnodeIdx:'+nodeIdx);
                    var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                    node.active = false;
                }
                if (nodeIdx == 1){
                    var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                    node.active = false;
                }
            }else{
                var node = cc.find('cardHand/cardHand' + nodeIdx, parent);
                this.showHandCardContent(node, 'mj_face_xia_shou', cardHand[k]);
            }
            nodeIdx--;
        }
        //init cardNode
        this.removeCardIcon(parent);
        //摸宝胡
        if (isBao != cardHand.length) {
            for (var kkk = 0; kkk<cardHand.length; kkk++){
                //设置宝和胡icon
                var nodeIdx1 = GameData.getHandCardNum(player.uid);
                var node = cc.find('cardHand/cardHand' + (nodeIdx1-kkk), parent);
                if (cardHand[kkk].type == 1) {
                    this.setMyBaoVisible(node, cardHand[kkk]);
                    this.setMyHuimageVisible(node, cardHand[kkk], hu);
                }
            }
        }else{
            //非摸宝胡
            for (var jj = 0; jj<cardHand.length; jj++) {
                var nodeIdx2 = GameData.getHandCardNum(player.uid);
                var node = cc.find('cardHand/cardHand' + (nodeIdx2-jj), parent);
                this.setMyHuimageVisible(node, cardHand[jj], hu);
            }
        }

        this.showPengCards(player, parent, 'mj_face_xia_chu', 'down');
        playerNode.active = true;
    },

    showScore: function (index) {
        var uid = GameData.joiners[index].uid;
        var scoreNode = cc.find('player' + (index + 1) + '/score', this.resultLayer);

        var score = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin && coinData.coin[uid]){
                score = coinData.coin[uid];
            }
        } else {
            score = GameData.scores[uid];
        }
        score == undefined ? score = 0 : null;
        if (score > 0) {
            scoreNode.getComponent('cc.Label').string = '+' + score;
            scoreNode.color = new cc.Color(255, 255, 0);
        } else {
            scoreNode.getComponent('cc.Label').string = score;
            scoreNode.color = new cc.Color(255, 46, 53);
        }
    },
    /**
     * 移除宝牌 胡儿牌Icon
     */
    removeCardIcon:function(parent){
        var handCardNode = cc.find('cardHand',parent);
        for (var key in handCardNode.children) {
            //宝牌Icon
            var baoIcon = handCardNode.children[key].getChildByName(handCardNode.children[key].name + '_huier');
            //胡牌Icon
            var HurIcon = handCardNode.children[key].getChildByName(handCardNode.children[key].name + '_hu');
            if (baoIcon) {
                baoIcon.removeFromParent(true);
            }
            if (HurIcon) {
                HurIcon.removeFromParent(true);
            }

        }
    },
    showWinIcon: function (index, parent) {
        var uid = GameData.joiners[index].uid;
        var parent = cc.find('player' + (index + 1), this.resultLayer);
        var node = cc.find('huIcon', parent);
        var isHu = false;
        if (GameData.ResultData[uid].isWin == 1 || GameData.ResultData[uid].isWin == 3) {
            isHu = true;
        }
        node.active = isHu;

        //显示点炮icon
        var paoNode = cc.find('paoIcon',parent);
        paoNode.active = false;
        if(GameData.ResultData[uid].isWin == 2){
            node.active = false;
            paoNode.active = true;
        }else{
            paoNode.active = false;
        }
    },

    showResultIcon: function () {

        var myScore = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin && coinData.coin[GameData.player.uid]){
                myScore = coinData.coin[GameData.player.uid];
            }
        } else {
            myScore = GameData.scores[GameData.player.uid];
        }
        myScore == undefined ? myScore = 0 : null;
        if (myScore > 0) {
            this.winSprite.node.active = true;
            this.loseSprite.node.active = false;
            this.pingSprite.node.active = false;
        } else if (myScore < 0) {
            this.winSprite.node.active = false;
            this.loseSprite.node.active = true;
            this.pingSprite.node.active = false;
        } else {
            this.winSprite.node.active = false;
            this.loseSprite.node.active = false;
            this.pingSprite.node.active = true;
        }
    },

    setReady: function () {
        //cc.log("GameData.game.roundNum:"+GameData.game.roundNum+"  "+"GameData.game.roundmax:"+GameData.game.roundmax);
        if (!GameData.room.close) {
            MjHandler.getInstance().requestReady(function (res) { });
            //this.resultLayer.active = false;
            GameData.game.zhuangUid = 0;
            sendEvent('onGameReady');
        } else {
            this.resultLayer.active = false;
            this.node.getComponent('roomMain_huadian').showSummaryLayer();
        }
    },

    shareRet: function () {
        if (inCD(3000) == false) {
            screenShoot(wxShareTexture);
        }
    }
});
