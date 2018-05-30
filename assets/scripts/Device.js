cc.Class({
    extends: cc.Component,

    properties: {
        _device:null,
        _btnOK:null,
        _btnCancel:null,
        _title:null,
        _content:null,
        _onok:null,
        _oncancel: null,
        _time:-1,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this._device = cc.find("Canvas/device");
        this._title = cc.find("Canvas/device/title").getComponent(cc.Label);
        this._content = cc.find("Canvas/device/content").getComponent(cc.Label);
        
        this._btnOK = cc.find("Canvas/device/btn_ok");
        this._btnCancel = cc.find("Canvas/device/btn_cancel");

        this._timeLabel = cc.find('num', this._device).getComponent(cc.Label);
        this._timeLabel.string = "000";
        
        
        cc.vv.utils.addClickEvent(this._btnOK,this.node,"Device","onBtnClicked");
        cc.vv.utils.addClickEvent(this._btnCancel,this.node,"Device","onBtnClicked");
        
        this._device.active = false;
        console.error('****************************** Device加载完成...............................');
        cc.vv.device = this;
        cc.vv.dispatcher.fire('load_device');
    },
    
    onBtnClicked:function(event){
        if(event.target.name == "btn_ok"){
            if(this._onok){
                this._onok();
            }
        } else if (event.target.name == 'btn_cancel') {
            if (this._oncancel) {
                this._oncancel();
            }
        }
        this._device.active = false;
        this._onok = null;
        this._oncancel = null;
    },
    
    show:function(title,content,onok,oncancel, time){
        this._device.active = true;
        this._onok = onok;
        this._oncancel = oncancel;
        this._title.string = title;
        this._content.string = content;

        this._time = time;

        if(oncancel){
            this._btnCancel.active = true;
            this._btnOK.x = -150;
            this._btnCancel.x = 150;
        }
        else{
            this._btnCancel.active = false;
            this._btnOK.x = 0;
        }
    },
    
    updateTime: function (time) {

    },

    hide: function () {
        this._device.active = false;
    },

    update: function (dt) {
        if(this._time > 0){
            this._time -= dt;
            
            var pre = "";
            if(this._time < 0){
                this._time = 0;
            }
            
            var t = Math.ceil(this._time);
            if(t < 10){
                pre = "00";
            } else if (t < 100) {
                pre = '0';
            }
            this._timeLabel.string = pre + t; 
        }
    },

    onDestory:function(){
        if(cc.vv){
            cc.vv.device = null;    
        }
    }

});
