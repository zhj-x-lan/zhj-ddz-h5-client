cc.Class({
    extends: cc.Component,

    properties: {
        gongzhonghao: cc.Label,
    },

    onLoad: function () {
        this.showNumLabel();
    },
    showNumLabel : function () {
        if (!GameData.configData.agentWechat) return;
        var WXconfig = GameData.configData.agentWechat;
        var officAccounts = WXconfig[0].accounts;
        this.gongzhonghao.string = officAccounts;
    },
    close: function () {
        closeView(this.node.name);
    }
});
