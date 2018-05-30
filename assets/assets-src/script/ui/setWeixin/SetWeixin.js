cc.Class({
    extends: cc.Component,

    properties: {
        weixinStr1: cc.Label,
        weixinStr2: cc.Label,
        weixinStr3: cc.Label,
    },
    onLoad: function () {
        if (GameData.configData.agentWechat == undefined) {
            return;
        }
        var WXconfig = GameData.configData.agentWechat;
        //console.log('WXconfig = '+ JSON.stringify(WXconfig));
        this.weixinStr1.string = WXconfig[0].accounts;
        this.weixinStr2.string = WXconfig[0].agentConsult;
        this.weixinStr3.string = WXconfig[0].gameProblem;
    },
    onCopyNumber1: function () {
        var number = this.weixinStr1.string;
        textClipboard(number);
        console.log('Copy successed');
    },
    onCopyNumber2: function () {
        var number = this.weixinStr2.string;
        textClipboard(number);
        console.log('Copy successed');
    },
    onCopyNumber3: function (text) {
        var number = this.weixinStr3.string;
        textClipboard(number);
        console.log('Copy successed');
    },
    onClose: function () {
        closeView('kefuweixin');
    },
});