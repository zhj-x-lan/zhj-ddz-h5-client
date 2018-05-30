var configMgr = require('configMgr');
var roomHandler = require('roomHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        editCards:cc.EditBox,
        debugBtn :cc.Node,
    },

    // use this for initialization
    onLoad: function () {

        var setCardsOpen = configMgr.getSetCardsOpen();
        this.debugBtn.active = setCardsOpen;//!cc.sys.isNative;
    },

    /**
     *  确定按钮
     */
    onOkBtnClick: function () {
        var str = this.editCards.string.split(',');
        var cards = [];
        for (var i=0; i<str.length; i++) {
            cards.push(parseInt(str[i]));
        }
        var data = {roomid: roomHandler.room.id, cards: cards};
        GameNet.getInstance().request("game.debugHandler.setCards", data, function(rtn) {
            // if (rtn.result == 0) {
            //     createMoveMessage("调牌成功");
            // }else {
            //     createMoveMessage("调牌失败");
            // }
            createMoveMessage("调牌成功");

            console.log("--- 调牌结果 " + JSON.stringify(rtn) );
        });
    },
});