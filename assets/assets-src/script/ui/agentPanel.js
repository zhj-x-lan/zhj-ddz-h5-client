var RoomHandler = require('roomHandler');
var gameDefine = require('gameDefine');

var agentPanel = cc.Class({
	extends: cc.Component,

	properties: {
		kaifangBtn: cc.Node,
		kaifangLb: cc.Node,
		jiesuanBtn: cc.Node,
		jiesuanLb: cc.Node,
		roomState: cc.Label,
        kaifangNode : cc.ScrollView,
        jiesuanNode : cc.ScrollView,
		ScrollItem: cc.Node,
		jiesuanItem: cc.Node,
        dissolveLayer: cc.Node,
        infoLayer: cc.Node,

        fonts :{
            default:[],
            type:cc.Font
        }
	},

    onLoad : function () {

        this.registerListener();

        this.refreshUINew();		//刷新未开始的房间
        this.refreshUIResult();		//刷新结算的房间
    },

    registerListener : function(){
        registEvent('refreshAgentRoomUINew',this,this.refreshUINew);
        registEvent('refreshAgentRoomUIResult',this,this.refreshUIResult);
    },

    onDestroy : function(){
        unregistEvent('refreshAgentRoomUINew',this,this.refreshUINew);
        unregistEvent('refreshAgentRoomUIResult',this,this.refreshUIResult);
    },

    refreshUINew:function(){
        cc.log("GameData.AgentRoomsData:"+JSON.stringify(GameData.AgentRoomsData));

        var content = this.kaifangNode.content;
        for(var ii = 0;ii < content.getChildrenCount();ii++){
            var childNode = content.getChildren()[ii];
            if(childNode){
                childNode.active = false;
            }
        }

        if( GameData.AgentRoomsData == undefined
            || Object.keys(GameData.AgentRoomsData).length <= 0) {
            return;
        }
        var AgentRoomsLength = Object.keys(GameData.AgentRoomsData).length;
        var contentHeight = parseInt(AgentRoomsLength/3)*this.ScrollItem.height;
        AgentRoomsLength%3 >= 1 ? contentHeight += this.ScrollItem.height : null;
        contentHeight < 550 ? contentHeight = 550 : null;
        content.height = contentHeight;

        var i = 0;
        for(var key in GameData.AgentRoomsData)
        {
        	var data = GameData.AgentRoomsData[key];
        	if(data == undefined){
        		continue;
			}
            var item = content.getChildren()[i];
            if(!item){
                item = cc.instantiate(this.ScrollItem);
                item.parent = content;
                //设置位置
                item.x = this.ScrollItem.x + this.ScrollItem.width*(i%3);
                item.y = this.ScrollItem.y - this.ScrollItem.height*parseInt(i/3);
            }
            item.active = true;

            this.initItemChildNode(item,data);
            i++;
        }
    },

    refreshUIResult:function(){

        var content = this.jiesuanNode.content;
        for(var jj = 0;jj < content.getChildrenCount();jj++){
            var tempNode = content.getChildren()[jj];
            if(tempNode){
                tempNode.active = false;
            }
        }

        if(GameData.AgentResultRoom == undefined
            || Object.keys(GameData.AgentResultRoom).length <= 0)
        {
            return;
        }

        var contentHeight = Object.keys(GameData.AgentResultRoom).length*this.jiesuanItem.height;
        contentHeight < 550 ? contentHeight = 550 : null;
        content.height = contentHeight;

        var index = 0;
        for(var key in GameData.AgentResultRoom)
        {
            var data = GameData.AgentResultRoom[key];
            if(data == undefined){
                continue;
            }
            var item1 = content.getChildren()[index];
            if(!item1){
                item1 = cc.instantiate(this.jiesuanItem);
                item1.parent = content;
                item1.y = this.jiesuanItem.y-this.jiesuanItem.height*index;
            }
            item1.active = true;

            this.initJSItemChildNode(item1,data);
            index++;
        }
    },

	//开房Item
	initItemChildNode: function (item,data) {

        var roomid = data.roomid;

		var inviteBtn = cc.find('inviteBtn', item);
        var dissolveBtn = cc.find('dissolveBtn', item);
        var infoBtn = cc.find('infoBtn', item);
        var roomTypeSprite = cc.find('roomTypeSprite', item);
        var gameTypeSprite = cc.find('gameTypeSprite', item);
		var roomId = cc.find('roomId', item);
		var roomState = cc.find('roomState', item);

		//房间 id
        roomId.getComponent('cc.Label').string = roomid;

        //房间状态 （未开始、等待中、进行中）
        var roomStateDis = '';
        var color = new cc.Color(254, 48, 0);
        var show = true;

        if (Object.keys(data.players).length <= 0) {
            roomStateDis = '未开始';
        } else if (Object.keys(data.players).length > 0 && Object.keys(data.players).length < data.opts.joinermax) {
            roomStateDis = '等待中';
            color = new cc.Color(0, 53, 49);
        } else if (Object.keys(data.players).length == data.opts.joinermax) {
            roomStateDis = '进行中';
            color = new cc.Color(0, 53, 49);
            show = false;
        }
        //房间状态
        roomState.getComponent('cc.Label').string = roomStateDis;
        roomState.color = color;

        //解散按钮只有在房间开始之前显示
        dissolveBtn.active = show;

        var textureUrl,texture;
        //更换游戏类型图片
        textureUrl = this.getGameTypeImageUrl(data.opts.gameType);
        texture = cc.textureCache.addImage(cc.url.raw(textureUrl));
        if(texture){
            gameTypeSprite.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        //更换房间类型图片
        textureUrl = this.getRoomTypeImageUrl(data.opts.roomType);
        cc.log("...roomType:"+data.opts.roomType);
        cc.log("...textureUrl:"+textureUrl);
        texture = cc.textureCache.addImage(cc.url.raw(textureUrl));
        if(texture){
            roomTypeSprite.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        var headNode,frameNode;
		//将全部头像隐藏
		for(var i = 1;i <= 6;i++){
			headNode = cc.find('playerNode/player_'+i, item);
			if(headNode){
				headNode.active = false;
			}
			frameNode = cc.find('playerNode/headBgs/headBg'+i, item);
            if(frameNode){
                frameNode.active = false;
            }
		}

		//根据房间最大人数，显示头像底框
        for (var j = 1; j <= data.opts.joinermax; j++) {
            frameNode = cc.find('playerNode/headBgs/headBg'+j, item);
            if(frameNode){
                frameNode.active = true;
            }
        }

		//遍历房间玩家,显示头像
        var index = 1;
		for (var key in data.players) {

            var playerData = data.players[key];
            if(!playerData){
                continue;
            }
            headNode = cc.find('playerNode/player_'+index, item);
            if(headNode){
                headNode.active = true;

                var playerHead = cc.find('playerHead', headNode);
                var url = playerData.headimgurl;
                //设置头像图片
                this.setPlayerHead(playerHead,url);
            }
            index++;
		}

        inviteBtn.setTag(roomid);
        inviteBtn.on(cc.Node.EventType.TOUCH_END, this.inviteClick, this);

        dissolveBtn.setTag(roomid);
        dissolveBtn.on(cc.Node.EventType.TOUCH_END, this.dissolveClick, this);

        infoBtn.setTag(roomid);
        infoBtn.on(cc.Node.EventType.TOUCH_END, this.infoClick, this);
	},
	//结算item
	initJSItemChildNode: function (item,data) {

	    cc.log("..jiesuanData:"+JSON.stringify(data));

        var roomid = data.roomid;

		var shareBtn = cc.find('shareBtn', item);
		var roomId = cc.find('roomId', item);
		var createtime = cc.find('createtime', item);
		var gametype = cc.find('gametype', item);
		var roomrule = cc.find('roomrule', item);

        shareBtn.setTag(roomid);
        shareBtn.on(cc.Node.EventType.TOUCH_END, this.shareClick, this);

        //房间号
        roomId.getComponent(cc.Label).string = "房间号:"+roomid;

        //创建时间
        var date = new Date(data.createtime);
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hours = date.getHours();
        if (hours < 10) {
            hours = '0'+hours+':';
        }else{
            hours = hours+':';
        }
        var minute = date.getMinutes();
        if (minute < 10) {
            minute = '0'+minute;
        }else{
            minute = minute;
        }
        /*var second = date.getSeconds();
        if (second < 10) {
            second = '0'+second;
        }else{
            second = second;
        }*/
        createtime.getComponent(cc.Label).string = year+'-'+month+'-'+day+'  '+hours+minute;

        //房间规则
        roomrule.getComponent(cc.Label).string = this.getRoomRule(data.opts);

        var textureUrl,texture;
        //更换游戏类型图片
        textureUrl = this.getGameTypeImageUrl(data.opts.gameType);
        texture = cc.textureCache.addImage(cc.url.raw(textureUrl));
        if(texture){
            gametype.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        var headNode,frameNode;
        //将全部玩家信息隐藏
        for(var i = 1;i <= 6;i++){
            headNode = cc.find('playerNode/player_'+i, item);
            if(headNode){
                headNode.active = false;
            }
        }

        //遍历房间玩家，完善信息
        var index = 1;
        for (var key in data.players) {

            var playerData = data.players[key];
            if(!playerData){
                continue;
            }
            headNode = cc.find('playerNode/player_'+index, item);
            if(headNode){
                headNode.active = true;

                var scoreNode = cc.find('score',headNode);
                var name = cc.find('name',headNode);

                var fen = this.getSumScore(data,playerData.uid);

                if (fen > 0) {
                    scoreNode.getComponent(cc.Label).font = this.fonts[0];
                    scoreNode.getComponent(cc.Label).string = '+'+fen;
                }else if(fen < 0) {
                    scoreNode.getComponent(cc.Label).font = this.fonts[1];
                    scoreNode.getComponent(cc.Label).string = fen;
                }else {
                    scoreNode.getComponent(cc.Label).font = this.fonts[2];
                    scoreNode.getComponent(cc.Label).string = fen;
                }

                if (isChinese(playerData.name)) {
                    name.getComponent(cc.Label).string = getShortStr(playerData.name, 4);
                } else {
                    name.getComponent(cc.Label).string = getShortStr(playerData.name, 8);
                }
            }
            index++;
        }
	},

    //设置头像（在循环里面执行回调函数会有问题）
    setPlayerHead:function(headNode,url){
        if (url != undefined && url != '' && url.length > 0){
            cc.loader.load({url: url, type: 'png'}, function (error, texture){
                if (!error && texture) {
                    headNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
    },

    //计算总分数
    getSumScore: function(data,uid){
        var fen = 0;
        for (var key in data.scores)
        {
            if(key == uid){
                fen = data.scores[key];
            }
        }
        return fen;
    },

    getGameTypeImageUrl: function(gameType){
	    //默认为麻将类型图片，防止加载空图片出错
        var textureUrl = 'resources/createroom/agentInfo/majiangzi.png';
        switch (gameType){
            case gameDefine.GameType.Game_Mj_Tianjin:
            case gameDefine.GameType.Game_Mj_Shishi:
            case gameDefine.GameType.Game_MJ_HuaDian:{
                textureUrl = 'resources/createroom/agentInfo/majiangzi.png';
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                textureUrl = 'resources/createroom/agentInfo/doudizhuzi.png';
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                textureUrl = 'resources/createroom/agentInfo/shisanshuizi.png';
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                textureUrl = 'resources/createroom/agentInfo/niuniuzi.png';
            }break;
            case gameDefine.GameType.Game_TDK:{
                textureUrl = 'resources/createroom/agentInfo/tiandakengzi.png';
            }break;
            case gameDefine.GameType.Game_Poker_paodekuai:{
                textureUrl = 'resources/createroom/agentInfo/paodeikuaizi.png';
            }break;
        }
        return textureUrl;
    },
    getRoomTypeImageUrl: function(roomType){
        //默认为普通房类型图片，防止加载空图片出错
        var textureUrl = 'resources/createroom/agentInfo/putongzi.png';
        switch (roomType){
            case 1:{
                textureUrl = 'resources/createroom/agentInfo/putongzi.png';
            }break;
            case 2:{
                textureUrl = 'resources/createroom/agentInfo/julebuzi.png';
            }break;
        }
        return textureUrl;
    },
	getRoomRule: function (data) {
		var str = '';
		if(data == undefined || Object.keys(data).length <= 0){
		    return str;
        }
		switch (data.gameType){
            case gameDefine.GameType.Game_Mj_Tianjin:{
                str = getRoomRuleStr(data);
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                str = getRuleStrShiShi(data);
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                str = getRuleStrHd(data);
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                str = getRuleStrHongZhong(data);
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                str = getRuleStrCC(data);
            }break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                str = getRuleStrTJDDZ(data);
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:{
                str = getRuleStrDDZ(data);
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                str = getRuleStrNiuNiu(data);
            }break;
            case gameDefine.GameType.Game_TDK:{
                str = getRuleStrTDK(data);
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                str = getRuleStr13(data);
            }break;
            case gameDefine.GameType.Game_Poker_paodekuai:{
                str = getRuleStrPDK(data);
            }break;
        }
		return str;
	},
    getInviteStr: function (roomdata) {

	    var roomid = roomdata.roomid;
        var title = '';
	    switch (roomdata.opts.gameType){
            case gameDefine.GameType.Game_Mj_Tianjin:{
                title = "天津攒局麻将 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Mj_Shishi:{
                title = "石狮摸摸麻将 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_MJ_HuaDian:{
                title = "摸摸桦甸麻将 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Mj_HZ:{
                title = "红中麻将 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Mj_CC:{
                title = "长春麻将 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Poker_DDZ:{
                title = "经典斗地主 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ:{
                title = "天津斗地主 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_niu_niu:{
                title = "牛牛 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_TDK:{
                title = "填大坑 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Poker_13shui:{
                title = "十三水 " + "房间号:" + roomid + "(代开)";
            }break;
            case gameDefine.GameType.Game_Poker_paodekuai:{
                title = "跑得快 " + "房间号:" + roomid + "(代开)";
            }break;
        }
        cc.log("...opts:"+JSON.stringify(roomdata.opts));
        var RuleStr = this.getRoomRule(roomdata.opts);

        var str1 = "玩法:";
        var str2 = ",请您快速加入对局.";
        var des = str1 + RuleStr + str2;
        console.log('des = ' + des);

        return {title:title,des:des};
    },
	selectUIType: function (eve, data) {
        //data 1:代开房间，2结算房间
        var flag = false;
        if(data == 1){
            flag = true;
        }
        this.kaifangLb.active = flag;
        this.kaifangBtn.active = !flag;
        this.jiesuanLb.active = !flag;
        this.jiesuanBtn.active = flag;
        //this.roomState.string = flag == true ?"创建时间":"结束状态";

        this.kaifangNode.node.active = flag;
        this.jiesuanNode.node.active = !flag;
	},
	joinRoomClick: function (eve) {
		var roomid = eve.target.tag.toString();
		console.log("加入房间号为：" + roomid);
		if (roomid && roomid.length >= 6) {
			RoomHandler.enterRoom(roomid);
		}
	},
	shareClick: function (eve) {
		var roomid = eve.target.tag;
		console.log("分享房间号为：" + roomid);
	},
	inviteClick: function (eve) {
		var roomid = eve.target.tag;
		console.log("邀请好友,房间号为：" + roomid);

		var roomdata = GameData.getAgentRoomDataByRoomid(roomid);
		if(roomdata == null){
		    return;
        }
		var strObject = this.getInviteStr(roomdata);
		wxShareWeb(strObject.title, strObject.des);
	},
    dissolveClick: function(eve){

        var roomid = eve.target.tag;
        if(roomid <= 0){
            return;
        }
        this.dissolveLayer.active = true;

        var text = cc.find('text',this.dissolveLayer);
        var dissolveBtn = cc.find('btnAgree',this.dissolveLayer);
        var cancelBtn = cc.find('btnDisagree',this.dissolveLayer);

        text.getComponent(cc.Label).string = "确定要解散房间"+roomid+"吗？";

        dissolveBtn.setTag(roomid);
        dissolveBtn.on(cc.Node.EventType.TOUCH_END, this.confirmDissolveClick, this);
        cancelBtn.on(cc.Node.EventType.TOUCH_END, this.cancelDissolveClick, this);
    },
    confirmDissolveClick: function(eve){
	    //确认解散
        var roomid = eve.target.tag;
        console.log("解散房间：" + roomid);

        var data = GameData.getAgentRoomDataByRoomid(roomid);
        if( data == undefined || data == null ){
            return;
        }

        var isOk = false;
        if(Object.keys(data.players).length <= 0){
            if(data.opts.gameType == gameDefine.GameType.Game_niu_niu){
                GameNet.getInstance().request("room.niuNiuHandler.startDismissRoom",{},function () {});
            }else {
                RoomHandler.deleteRoom(roomid, 'close');
            }
            isOk = true;
        }
        this.dissolveLayer.active = false;
        //显示解散成功提示
        this.showDissolveRoomTip(isOk);
    },
    cancelDissolveClick: function(){
	    //取消解散
        this.dissolveLayer.active = false;
    },
    infoClick: function(eve){
        var roomid = eve.target.tag;
        console.log("查看房间：" + roomid);

        var data = GameData.getAgentRoomDataByRoomid(roomid);
        if( data == undefined || data == null ){
            return;
        }
        this.infoLayer.active = true;

        var roomType = cc.find('panel/roomType',this.infoLayer);
        var gameType = cc.find('panel/gameType',this.infoLayer);
        var roomId = cc.find('panel/roomId',this.infoLayer);
        var createTime = cc.find('panel/createTime',this.infoLayer);
        var clubLabel = cc.find('panel/clubLabel',this.infoLayer);
        var club = cc.find('panel/club',this.infoLayer);
        var agent = cc.find('panel/agent',this.infoLayer);
        var rule = cc.find('panel/rule',this.infoLayer);
        var playerNode = cc.find('panel/playerNode',this.infoLayer);

        //房间 id
        roomId.getComponent(cc.Label).string = "房间号:"+roomid;
        //创建时间
        var date = new Date(data.createtime);
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hours = date.getHours();
        if (hours < 10) {
            hours = '0'+hours+':';
        }else{
            hours = hours+':';
        }
        var minute = date.getMinutes();
        if (minute < 10) {
            minute = '0'+minute;
        }else{
            minute = minute;
        }
        /*var second = date.getSeconds();
        if (second < 10) {
            second = '0'+second;
        }else{
            second = second;
        }*/
        createTime.getComponent(cc.Label).string = year+'-'+month+'-'+day+'  '+hours+minute;
        //俱乐部
        if(data.opts.roomType == 2){
            clubLabel.active = true;
            club.active = true;

            club.getComponent(cc.Label).string = GameData.player.club.clubName;
        } else {
            clubLabel.active = false;
            club.active = false;
        }
        //代理 id
        agent.getComponent(cc.Label).string = "代理(ID):"+data.creator;
        //规则
        rule.getComponent(cc.Label).string = this.getRoomRule(data.opts);

        var textureUrl,texture;
        //更换游戏类型图片
        textureUrl = this.getGameTypeImageUrl(data.opts.gameType);
        texture = cc.textureCache.addImage(cc.url.raw(textureUrl));
        if(texture){
            gameType.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        //更换房间类型图片
        textureUrl = this.getRoomTypeImageUrl(data.opts.roomType);
        texture = cc.textureCache.addImage(cc.url.raw(textureUrl));
        if(texture){
            roomType.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        var headNode,frameNode;
        //将全部头像隐藏
        for(var i = 1;i <= 6;i++){
            headNode = cc.find('player_'+i, playerNode);
            if(headNode){
                headNode.active = false;
            }
            frameNode = cc.find('headBgs/headBg'+i, playerNode);
            if(frameNode){
                frameNode.active = false;
            }
        }

        //根据房间最大人数，显示头像底框
        for (var j = 1; j <= data.opts.joinermax; j++) {
            frameNode = cc.find('headBgs/headBg'+j, playerNode);
            if(frameNode){
                frameNode.active = true;
            }
        }

        //遍历房间玩家,显示头像和信息
        var index = 1;
        for (var key in data.players) {

            var playerData = data.players[key];
            if(!playerData){
                continue;
            }
            headNode = cc.find('player_'+index, playerNode);
            if(headNode){
                headNode.active = true;

                var playerHead = cc.find('playerHead', headNode);
                var url = playerData.headimgurl;
                //设置头像图片
                this.setPlayerHead(playerHead,url);
                //玩家名字
                var nameLabel = cc.find('nameLabel', headNode);
                if (isChinese(playerData.name)) {
                    nameLabel.getComponent(cc.Label).string = getShortStr(playerData.name, 4);
                } else {
                    nameLabel.getComponent(cc.Label).string = getShortStr(playerData.name, 8);
                }
            }
            index++;
        }
    },
    closeInfoLayer: function(){
	    //关闭详细信息界面
        this.infoLayer.active = false;
    },
	refreshDataClick: function () {
		//增加连点CD；
		if (inCD(3000)) {
			return;
		}
		RoomHandler.reqAgentRoom();
		RoomHandler.reqAgentResultRoom();
	},
    showDissolveRoomTip: function(isOk){

	    var str = "解散房间成功。";
        isOk == false ? str = "房间已有人进入，不能解散！" : null;

        createMessageBox(str, function () {
            RoomHandler.reqAgentRoom();
            RoomHandler.reqAgentResultRoom();
        });

    },
	close: function () {
		closeView(this.node.name);
	}
})