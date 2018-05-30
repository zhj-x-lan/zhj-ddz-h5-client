cc.Class({
    extends: cc.Component,

    properties: {
        delay: 2,
    },

    // use this for initialization
    onLoad: function () {
        this.button = this.node.getComponent(cc.Button);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickHandler, this);
    },

    onClickHandler: function () {
        var self = this;
        var timeCallback = function (dt) {
            cc.log('button interactable true');
            self.button.interactable = true;
        }
        cc.log('button interactable false');
        this.button.interactable = false;
        this.scheduleOnce(timeCallback, 2);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});