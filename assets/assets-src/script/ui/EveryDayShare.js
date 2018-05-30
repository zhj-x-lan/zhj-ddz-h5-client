cc.Class({
    extends: cc.Component,

    properties: {
        shareImage: cc.Node,
    },
    onLoad: function () {
        this.shareImage.active = false;
    },
    cancel:function(){
        closeView(this.node.name);
    },
    shareContent: function(){
        this.shareImage.active = true;
    	if(inCD(3000))
        {
            return;
        }
        screenShoot(wxShareTexture);
    },
});
