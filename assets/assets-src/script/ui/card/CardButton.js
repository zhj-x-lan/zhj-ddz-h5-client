cc.Class({
    extends: cc.Component,

    properties: {
        cardId: 0,
        index: 0,
        btn: cc.Button
    },

    onLoad: function () {
        //设置点击类型相应的事件（滑动出牌）
        //滑动出牌和点击出牌的发送事件消息名不一样，所以不用判断类型或者分开写
        this.setTouchOn();

        //是否开始移动牌
        this.is_move = false;
        //初始坐标
        this.initPosition = this.node.parent.position;
        //第一次移动的坐标
        this.first_move_position = 0;
    },
    setTouchOn : function(){

        this.btn.node.interactable = true;

        this.btn.node.on(cc.Node.EventType.TOUCH_START,this.onBtnStart,this);
        this.btn.node.on(cc.Node.EventType.TOUCH_MOVE,this.onBtnMove,this);
        this.btn.node.on(cc.Node.EventType.TOUCH_END,this.onBtnEnd,this);
        this.btn.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onBtnCancel,this);
    },
    // setTouchOff : function(){

    //     this.btn.node.interactable = false;

    //     this.btn.node.off("touchstart",this.onBtnStart,this);
    //     this.btn.node.off("touchmove",this.onBtnMove,this);
    //     this.btn.node.off("touchend",this.onBtnEnd,this);
    //     this.btn.node.off("touchcancel",this.onBtnCancel,this);
    // },

    getCardId: function () {
        return this.cardId;
    },
    setCardId: function (id) {
        this.cardId = id;
    },
    getIndex: function () {
        return this.index;
    },
    setIndex: function (index) {
        this.index = index;
    },
    cardRestoration: function(){
        this.node.parent.setPosition(this.initPosition);
    },
    onBtnStart : function(event){
        if (GameData.game.turn != GameData.player.uid){
            return;
        }
        var position = event.touch.getLocation();
        this.first_move_position = position;

        sendEvent('onCardBtnStart', {card: this.getCardId(), index: this.getIndex(),position:position});
    },
    onBtnMove:function(event){
        if (GameData.game.turn != GameData.player.uid){
            return;
        }
        var position = event.touch.getLocation();
        var node = this.node.parent;

        if (Math.abs(position.x - this.first_move_position.x) >= 20
            || Math.abs(position.y - this.first_move_position.y) >= 20) {
            this.is_move = true;
        }
        if( this.is_move == true ) {
            node.setPosition(node.parent.convertToNodeSpaceAR(position));
        }
        sendEvent('onCardBtnMove', {card: this.getCardId(), index: this.getIndex(),position:position});
    },
    onBtnEnd:function(event) {
        if (GameData.game.turn != GameData.player.uid){
            return;
        }
        var position = event.touch.getLocation();
        var node = this.node.parent;
        var type = 0;

        //是否滑牌
        if (this.is_move == true) {
            //判断是否滑过指定范围
            if (node.getPositionY() < 100) {
                type = -1;
            }else {
                //超过指定范围，相当于直接出牌
                type = 1;
            }
        }
        this.is_move = false;

        sendEvent('onCardBtnEnd', {card:this.getCardId(),index:this.getIndex(),position:position,type:type});
    },
    onBtnCancel :function(event){
        if (GameData.game.turn != GameData.player.uid){
            return;
        }
        //如果移出屏幕，就让牌复位
        this.cardRestoration();

        sendEvent('onCardBtnCancel', {card: this.getCardId(), index: this.getIndex()});
    },
    onBtnClicked: function (evt) {
        if (GameData.game.turn != GameData.player.uid){
            return;
        }
        sendEvent('onHandCardClicked', {
            card: this.cardId,
            index: this.index
        });
    }
});