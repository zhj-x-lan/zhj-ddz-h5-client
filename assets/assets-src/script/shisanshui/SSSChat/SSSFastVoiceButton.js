cc.Class({
    extends: cc.Component,

    properties: {
        sound : 'null',
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
        this.node.on(cc.Node.EventType.TOUCH_END,this.onClick,this);
    },

    onClick : function()
    {
        var talkContent = cc.find('label',this.node).getComponent(cc.Label).string;
        ChatHandler.getInstance().requestChat('fast',{sound:this.sound,content:talkContent},function(rtn){});
        closeSSSView('SSSChatPanel');
    } ,
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
