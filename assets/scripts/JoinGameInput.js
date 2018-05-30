cc.Class({
    extends: cc.Component,

    properties: {
        nums:{
            default:[],
            type:[cc.Label]
        },
        inputIndex:0,
    },

    onLoad: function () {
        console.log('【1*---==================加载【JoinGameInput.js】');
        var numNodes = cc.find('Canvas/joinGame/window/nums');    
        for (let i = 0; i < numNodes.children.length; i++) {
            if (numNodes.children[i].getName().indexOf('n') != -1) {
                this.nums.push(numNodes.children[i].getComponent(cc.Label));
                this.nums[i].string = '';
            }
        }
    },
    
    onEnable:function(){
        this.onResetClicked();
    },
    
    onInputFinished:function(roomId){
        console.log('房间输入完成,即将进入房间:' + roomId);
        /* cc.vv.userMgr.enterRoom(roomId,function(ret){
            if(ret.errcode == 0){
                this.node.active = false;
            }
            else{
                var content = "房间["+ roomId +"]不存在，请重新输入!";
                if(ret.errcode == 4){
                    content = "房间["+ roomId + "]已满!";
                }
                cc.vv.alert.show("提示",content);
                this.onResetClicked();
            }
        }.bind(this));  */
        var data = {
            'kMId': 61014,
            'kDeskId': Number(roomId),
            "kGpsLng": "1",         // 经度
            "kGpsLat": "1",         // 纬度
        };

        cc.vv.gameMgr.joinRoom(data);
    },
    
    onInput:function(num){
        if(this.inputIndex >= this.nums.length){
            return;
        }
        this.nums[this.inputIndex].string = num;
        this.inputIndex += 1;
        
        if(this.inputIndex == this.nums.length){
            var roomId = this.parseRoomID();
            this.onInputFinished(roomId);
        }
    },
    
    onNumClicked:function(event, num){
        this.onInput(num);  
    },
    onResetClicked:function(){
        for(var i = 0; i < this.nums.length; ++i){
            this.nums[i].string = '';
        }
        this.inputIndex = 0;
    },
    onDelClicked:function(){
        if(this.inputIndex > 0){
            this.inputIndex -= 1;
            this.nums[this.inputIndex].string = "";
        }
    },
    onCloseClicked:function(){
        this.node.active = false;
    },
    
    parseRoomID:function(){
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
            str += this.nums[i].string;
        }
        return str;
    }
});
