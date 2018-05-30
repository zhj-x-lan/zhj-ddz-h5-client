cc.Class({
    extends: cc.Component,

    properties: {
        btnOk: cc.Button,
        btnCancel: cc.Button,
        content: cc.Label,
        artWordSp :cc.Node,
        nameStr: cc.Label,
        content1: cc.Label,
        content2: cc.Label,
        content3: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function(evt) {evt.stopPropagation();});
        
    },

    setContent: function(text) {
        cc.log('text:'+text);
        this.content.node.active = true;
        if(text != null){
            this.content.string = text;
        }else{
            cc.log('11111111111111');
            this.content.node.active = false;
        }  
    },

    setName: function(text) {
        if (!text || text.length <= 0) {
            this.nameStr.node.active = false;
            return;
        }else {
            this.nameStr.node.active = true;
        }
        this.nameStr.string = text;
    },

    setContent1: function(text) {
        if (!text || text.length <= 0) {
            this.content1.node.active = false;
            return;
        }else {
            this.content1.node.active = true;
        }
        this.content1.string = text;
    },

    setContent2: function(text) {
        if (!text || text.length <= 0) {
            this.content2.node.active = false;
            return;
        }else {
            this.content2.node.active = true;
        }
        this.content2.string = text;
        this.content2.node.x = 30 + this.content1.node.getPositionX() + this.content1.node.getContentSize().width + this.nameStr.node.getContentSize().width;
    },

    setContent3: function(text) {
        if (!text || text.length <= 0) {
            this.content3.node.active = false;
            return;
        }else {
            this.content3.node.active = true;
        }
        this.content3.string = text;
    },


    setArtwordSp: function(img) {
        cc.log('img:'+img);
        this.artWordSp.active = true;
        if(img != null){
            this.artWordSp.getComponent(cc.Sprite).spriteFrame = null;
            var texture = cc.textureCache.addImage(cc.url.raw(img));
            this.artWordSp.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture); 
        }else{
            this.artWordSp.active = false;
        } 
        
    },

    setStringVisbile : function(){
        if( this.nameStr.node.active == false
            && this.content2.node.active == false )
        {
            this.content1.node.active = false;
            this.content3.node.active = false;
        }
        else{
            this.content1.node.active = true;
            this.content3.node.active = true;
        }
    },

    setOkFunc: function(func) {
        var self = this;
        this.btnOk.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.node.active = false;
            func();
        });
    },

    setCancelFunc: function(func){
        var self = this;
        this.btnCancel.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.node.active = false;
            func();
        });
    },

    updateBtnPos: function(hasCancel){
        if (hasCancel) {
            this.btnOk.node.x = -140;//this.node.width/2 - this.btnOk.width - 10;
            //this.btnCancel.x = this.node.width/2 + this.btnOk.width + 10;
            this.btnOk.node.active = true;
            this.btnCancel.node.active = true;
        }else{
            this.btnOk.node.x = 0;
            //this.node.width/2-this.btnOk.width/2;
            this.btnOk.node.active = true;
            this.btnCancel.node.active = false;
        }
    },

    update13BtnPos: function(hasCancel){
        if (hasCancel) {
            this.node.width/2 - this.btnOk.width - 10;
            //this.btnCancel.x = this.node.width/2 + this.btnOk.width + 10;
            this.btnOk.node.active = true;
            this.btnCancel.node.active = true;
        }else{
            this.btnOk.node.x = 0;
            //this.node.width/2-this.btnOk.width/2;
            this.btnOk.node.active = true;
            this.btnCancel.node.active = false;
        }
    }
});
