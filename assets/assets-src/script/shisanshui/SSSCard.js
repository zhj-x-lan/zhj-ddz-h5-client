var soundMngr = require('SoundMngr');
var SSSCard = cc.Class({
    extends: cc.Component,

    properties: {
       card:{
           default:null,
           type:cc.Node
       },

       oneCard: {
           default: null,
           type: cc.Node,
       },
       towCard: {
           default: null,
           type: cc.Node,
       },

       id:0,
       isSelect:false,
       isChange:false,       //表示相邻两个牌可以交换位置

       cardHand:cc.Node,
    },

    onLoad: function () {
        this.cards = [];                        //用于两个牌的位置交换
        this.cardList = [];                  //存储手指移动多选时选中的卡牌
        this.oneCard;
        this.towCard;

        var card0 = cc.find('card0', this.cardHand);
        var card1 = cc.find('card1', this.cardHand);

        if (!this.cardHand.getChildByName('upCardNode')) {
            this.distance = (Math.abs(card0.getPositionX() - card1.getPositionX())) * (2-0.55);
        }
        this.addTouchEvent();

        this._selectArray = [];     //卡牌选中数组
        this._init_x = 0;               //点击初始位置
        this._end_x = 0;               //点击结束位置
    },

    onDestroy: function() {
        this.card.off(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.card.off(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.card.off(cc.Node.EventType.TOUCH_END, this.endTouch, this);
        this.card.off(cc.Node.EventType.TOUCH_CANCEL, this.cancelTouch, this);
    },

    addTouchEvent: function() {
        this.card.on(cc.Node.EventType.TOUCH_START, this.startTouch, this);
        this.card.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this);
        this.card.on(cc.Node.EventType.TOUCH_END, this.endTouch, this);
        this.card.on(cc.Node.EventType.TOUCH_CANCEL, this.cancelTouch, this);
    },

    //将选中的牌存起来，避免重复存储
    pushInCardId : function( cardId ){

        if( true == this.checkIsHave(cardId) ){
            return
        }
        this._selectArray.push(cardId);
    },

    //查看数组中是否有该卡牌
    checkIsHave : function( cardId ){
        for( var key = 0; key < this._selectArray.length; key++ ){
            if( this._selectArray[key] == cardId ){
                return true;
            }
        }
        return false;
    },

    //检查都有哪些牌在滑动范围内，并将牌 id 存储进选中数组
    checkCardPosition_x : function(){
        var children = this.card.parent.getChildren();
        if (children.length <= 0) {
            cc.log('function:checkCardPosition_x.. children is empty.');
            return;
        }
        for( var key = 0; key < this.card.parent.getChildrenCount(); key++ ) {
            var cardNode = children[key];
            if ( !cardNode ) {
                continue;
            }
            var distance = (cardNode.width*cardNode.scaleX)/4;
            var select_x = cardNode.x - distance;     //牌的选中点
            if( select_x < this._init_x && select_x > this._end_x ){
                this.pushInCardId( cardNode.getComponent('SSSCard').id );
            }
            else if( select_x > this._init_x && select_x < this._end_x ){
                this.pushInCardId( cardNode.getComponent('SSSCard').id );
            }
        }
    },

    //设置下面全部手牌的状态       isSetSelect:是否进行选中状态设置
    setCardMaskState : function(){
        var children = this.card.parent.getChildren();
        if (children.length <= 0) {
            cc.log('function:setCardMaskState.. children is empty.');
            return;
        }
        for( var key = 0; key < this.card.parent.getChildrenCount(); key++ ) {
            var cardNode = children[key];
            if ( !cardNode ) {
                continue;
            }
            if ( !cardNode.getComponent('SSSCard') ) {
                continue;
            }
            var cardId = cardNode.getComponent('SSSCard').id;
            if( cardId < 0 ) {
                continue;
            }

            var show = false;
            if( true == this.checkIsHave( cardId ) ){
                show = true;
            }
            this.showCardMask(cardNode,show);
        }
    },

    //卡牌遮罩
    showCardMask: function(card, show) {
        var cardMask = cc.find('cardMask', card);
        cardMask.active = show;
    },

    //设置卡牌选中状态
    setCardSelectState : function(){

        for( var key = 0; key < this._selectArray.length; key++ ) {

            var cardId = this._selectArray[key];
            if( cardId < 0 ) {
                continue;
            }
            var cardNode = cc.find('card'+cardId, this.card.parent);
            if ( !cardNode ) {
                continue;
            }

            if( true == this.checkIsHave( cardId ) ){
                cardNode.getComponent('SSSCard').isSelect = cardNode.getComponent('SSSCard').isSelect == false ? true : false;
            }
        }
    },

    startTouch: function(e) {

        soundMngr.instance.playSSSAudio(SSS_AudioType.SAT_6);

        if (this.isChange == true) {
            //点击到的是牌型列表的牌
            this.setCardStatus(this.card);
            return;
        }else {
            this.reSetCardsStatus();
        }

        var position = e.touch.getLocation();
        this._init_x = this.card.parent.convertToNodeSpaceAR(position).x;

        //清除选中数组
        this._selectArray = [];
        //点击的第一张牌一直都在
        this.pushInCardId(this.id);
        //设置卡牌状态
        this.setCardMaskState();
    },

    moveTouch: function(e) {
        //判断点击的是手牌还是牌型列表当中的牌，即前墩中墩后墩那三列
        if (this.isChange == true) {
            return;
        }

        var position = e.touch.getLocation();
        this._end_x = this.card.parent.convertToNodeSpaceAR(position).x;

        //清除选中数组
        this._selectArray = [];
        //点击的第一张牌一直都在
        this.pushInCardId(this.id);
        //检查滑动范围
        this.checkCardPosition_x();
        //设置卡牌状态
        this.setCardMaskState();
    },

    endTouch: function(e) {

        this.cardList = this._selectArray;

        //设置选中状态
        this.setCardSelectState();

        var is = false; //点击的是否是牌型列表的牌，默认不是
        if (this.isChange == true) {
            //点击到的是牌型列表的牌
            is = true;
            this.showSelectCard(is);
            return;
        }

        //清除遮罩
        this._selectArray = [];
        this.setCardMaskState();

        this.showSelectCard(is);
    },

    cancelTouch: function(e) {

        this.cardList = this._selectArray;

        //设置选中状态
        this.setCardSelectState();

        var is = false; //点击的是否是牌型列表的牌，默认不是
        if (this.isChange == true) {
            //点击到的是牌型列表的牌
            is = true;
            this.showSelectCard(is);
            return;
        }

        //清除遮罩
        this._selectArray = [];
        this.setCardMaskState();

        this.showSelectCard(is);
    },

    setCardList: function(cardIdArr) {
        this.cardList = [];
        this.cardList = cardIdArr;
    },

    bounceCard: function() {
        for (var i = 0; i < this.cardList.length; i++)
        {
            var node = cc.find('card'+this.cardList[i], this.cardHand);

            if (node.getComponent('SSSCard').isSelect == true)
            {
                node.y = node.getPositionY() + (node.getContentSize().height / 5) * 0.55;
            }
            else if (node.getComponent('SSSCard').isSelect == false)
            {
                node.y = 0;
            }
        }
        this.removeAllCardsList();
    },

    //显示选中的卡牌
    showSelectCard: function(is)
    {
        if (this.cardList.length >= 1 && is == false)
        {
            this.bounceCard();
        }
        else if (is == true) {
            if (this.moveTowCard('up', 3)) {
                this.cardList = [];
            }
            else if (this.moveTowCard('mid', 5)) {
                this.cardList = [];
            }
            else if (this.moveTowCard('down', 5)) {
                this.cardList = [];
            }
            this.removeAllCards();
        }
    },

    showOneCard: function(show) {
        this.oneCard.active = show;
    },

    showTowCard: function(show) {
        this.towCard.active = show;
    },

    //两个牌交换位置
    moveTowCard: function(row, len)
    {
        var self = this;
        var idx = 0;
        
        var oneCard = cc.find('oneCard', this.cardHand);
        var towCard = cc.find('towCard', this.cardHand);
        var cardRow = cc.find(row+'CardNode', this.cardHand);

        this.oneCard = oneCard;
        this.towCard = towCard;

        for (var i = 0; i < len; i++)
        {
            var node = cc.find('card'+i, cardRow);
            var card = node.getComponent('SSSCard');
            if (card.isSelect == true) {
                this.cards[this.cards.length] = {card:node, id: i, row: row};
            }
        }
        if (this.cards.length == 2) {
            var spriteFrame1 = this.cards[0].card.getComponent(cc.Sprite).spriteFrame;
            var spriteFrame2 = this.cards[1].card.getComponent(cc.Sprite).spriteFrame;

            this.showCardMask(this.cards[0].card, false);
            this.showCardMask(this.cards[1].card, false);

            //确立两个牌的位置
            var cardPos1 = this.cards[0].card.getPosition();
            var cardPos2 = this.cards[1].card.getPosition();

            if (this.oneCard.active == false && this.towCard.active == false) {
                this.oneCard.setPosition(cardPos1.x, this.cards[0].card.parent.getPositionY());
                this.towCard.setPosition(cardPos2.x, this.cards[1].card.parent.getPositionY());

                this.cards[0].card.getComponent('SSSCard').isSelect = false;
                this.cards[1].card.getComponent('SSSCard').isSelect = false;
                moveCard.oneCard = this.cards[0];
                moveCard.towCard = this.cards[1];

                //交换cardPoker13中的两个牌
                var temp = cardPoker13[this.cards[0].row][this.cards[0].id];
                cardPoker13[this.cards[0].row][this.cards[0].id] = cardPoker13[this.cards[1].row][this.cards[1].id];
                cardPoker13[this.cards[1].row][this.cards[1].id] = temp;

            }else if (this.oneCard.active == true || this.towCard.active == true) {

                this.cards[0].card.getComponent('SSSCard').isSelect = false;
                this.cards[1].card.getComponent('SSSCard').isSelect = false;

                return;
            }
            this.oneCard.getComponent(cc.Sprite).spriteFrame = spriteFrame1;
            this.towCard.getComponent(cc.Sprite).spriteFrame = spriteFrame2;
            this.cards[0].card.getComponent(cc.Sprite).spriteFrame = spriteFrame2;
            this.cards[1].card.getComponent(cc.Sprite).spriteFrame = spriteFrame1;

            this.cards[0].card.active = false;
            this.cards[1].card.active = false;
            this.showOneCard(true);
            this.showTowCard(true);


            //两个牌移动
            var actionTo1 = cc.moveTo(0.5, cc.p(cardPos2.x, this.cards[1].card.parent.getPositionY()));
            var actionTo2 = cc.moveTo(0.5, cc.p(cardPos1.x, this.cards[0].card.parent.getPositionY()));

            //必须要用两个临时变量储存起来，因为在oneCall和towCall里面无法操作全局的cards
            var cardNode1 = this.cards[0].card;
            var cardNode2 = this.cards[1].card;

            //下面为交换动作
            var oneCall = function() {
                cardNode1.active = true;
                // cardNode1.getComponent(cc.Sprite).spriteFrame = spriteFrame2; 
                self.showOneCard(false); 
            }
            var towCall = function() { 
                cardNode2.active = true; 
                // cardNode2.getComponent(cc.Sprite).spriteFrame = spriteFrame1;
                self.showTowCard(false);
            }
            var oneCallFunc = cc.callFunc(oneCall, this);
            var towCallFunc = cc.callFunc(towCall, this);
            var removeCardsFunc = cc.callFunc(function(){self.removeAllCards();}, this);

            var seq1 = cc.sequence(actionTo1, oneCallFunc, removeCardsFunc);
            var seq2 = cc.sequence(actionTo2, towCallFunc, removeCardsFunc);

            this.oneCard.runAction(seq1);
            this.towCard.runAction(seq2);

            // this.removeAllCards();
            return true;
        }
        return false;
    },

    removeAllCards: function() {
        if (this.cards.length > 0) {
            this.cards.splice(0, this.cards.length);
        }
    },

    removeAllCardsList: function() {
        if (this.cardList.length > 0) {
            this.cardList.splice(0, this.cardList.length);
        }
    },

    //移除cardList的一个元素
    removeCardListByValue: function(value) {
        for (var i = 0; i < this.cardList.length; i++) {
            if (this.cardList[i] == value) {
                this.cardList.splice(i, 1);
                return false;
            }
        }
        this.cardList[this.cardList.length] = value;
        return true;
    },

    //设置卡牌选中状态
    setCardStatus: function(node) {
        var spriteFrame = node.getComponent(cc.Sprite).spriteFrame;
        if (!spriteFrame)
            return;

        if (node.getComponent('SSSCard').isSelect == false)
        {
            if (node.getComponent('SSSCard').isChange == false)
            {
                this.removeCardListByValue(node.getComponent('SSSCard').id);
                this.showCardMask(node, true);
            }else if (node.getComponent('SSSCard').isChange == true)
            {
                this.showCardMask(node, true);
            }
            node.getComponent('SSSCard').isSelect = true;
        }
        else if (node.getComponent('SSSCard').isSelect == true)
        {
            if (node.getComponent('SSSCard').isChange == false)
            {
                this.removeCardListByValue(node.getComponent('SSSCard').id);
                this.showCardMask(node, true);
            }else if (node.getComponent('SSSCard').isChange == true)
            {
                this.showCardMask(node, false);
            }
            node.getComponent('SSSCard').isSelect = false;
        }
    },

    reSetCardsStatus: function() {
        var poker = this.cardHand.parent;
        var parent = cc.find('cardType', poker);
        var cardType1 = cc.find('upCardNode', parent);
        var cardType2 = cc.find('midCardNode', parent);
        var cardType3 = cc.find('downCardNode', parent);
        for (var key = 0; key < 3; key++) {
            var node = cc.find('card'+key, cardType1);
            this.showCardMask(node, false);
        }
        for (var key = 0; key < 5; key++) {
            var node1 = cc.find('card'+key, cardType2);
            var node2 = cc.find('card'+key, cardType3);
            this.showCardMask(node1, false);
            this.showCardMask(node2, false);
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

module.exports = SSSCard;
