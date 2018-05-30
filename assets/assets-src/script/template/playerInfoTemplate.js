cc.Class({
    extends: cc.Component,

    properties: {
        headNode: cc.Node,
        nameLabel: cc.Label,
        idLabel: cc.Label,
        ipLabel: cc.Label,
        winningLabel: cc.Label,
        roundLabel: cc.Label,
        winperLabel: cc.Label,
        playerTemplate: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {

    },

    onShow: function(player) {
        var headNode = cc.instantiate(this.playerTemplate);
        headNode.getComponent('playerTemplate').setName('');
        headNode.getComponent('playerTemplate').showZhuang(false);
        headNode.getComponent('playerTemplate').enableHeadBtn(false);
        headNode.getComponent('playerTemplate').setHeadIcon(player.headimgurl);
        this.headNode.addChild(headNode);
        
        if (isChinese(player.name)) {
            this.nameLabel.string = getShortStr(player.name,8);
        }else{
            this.nameLabel.string = getShortStr(player.name,16);
        }
        this.idLabel.string = player.uid;
        this.ipLabel.string = player.remoteAddr || '';
        this.winningLabel.string = player.winning || 0;
        this.roundLabel.string = player.round || 0;
        this.winperLabel.string = player.winper || 0;

        this.node.active = true;
    },

    onClose: function() {
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
