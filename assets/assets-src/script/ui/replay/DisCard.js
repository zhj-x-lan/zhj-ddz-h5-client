cc.Class({
    extends: cc.Component,

    properties: {
        icon: cc.Sprite,
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {

    },

    setIcon: function (cardId) {
        var ref = this.getCardRef();
        if (ref != null) {
            this.icon.spriteFrame = ref.getSpriteFrame(cardId);
            this.icon.node.active = true;
        }
    },

    getCardRef: function () {
        if (this._cardRef == null) {
            this._cardRef = this.node.getComponent("CardRef");
        }
        return this._cardRef;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});