
var AppMgr = require('AppMgr');
var Utils = require('Utils');

cc.Class({
	extends: cc.Component,

	properties: {
		turnOffWX:{
			default: false,
			displayName:"关闭微信登录",
		},
	},

	// use this for initialization
	//desktop.html?roomid=xxx&uid=xxx&sign=xxx&ip=xxx&port=xxx&gameid=SANG
	onLoad: function () {
		if (this.turnOffWX == true) {
			return;
		}

		let self = this;
		//this.tipLabel = this.node.getChildByName('tip');
		var appMgr = new AppMgr();
		appMgr.initMgr();
		
		var currentUrl = Utils.parseURL(location.href);  
		self.log(currentUrl.params);
		this.from = currentUrl.params['from'];	
		cc.vv.UserMgr.roomid = currentUrl.params['roomid'];
		cc.log(' ---- roomid ----'+cc.vv.UserMgr.roomid);
		// cc.vv.UserMgr.gameid = currentUrl.params['gameid'];
		cc.vv.UserMgr.uid = currentUrl.params['uid'];
		cc.vv.UserMgr.sign = currentUrl.params['sign'];
		cc.vv.UserMgr.ip = currentUrl.params['ip'];
		cc.vv.UserMgr.port = currentUrl.params['port'];
		cc.vv.UserMgr.code = currentUrl.params['code'];
		// cc.vv.UserMgr.sex = currentUrl.params['sex'];
		// cc.director.preloadScene("sanGongGame", function () {
		//     console.log("Next scene preloaded");
		// });
		this.getCode(currentUrl);
	},

	getCode:function(currentUrl){
		let self = this;
		var code = currentUrl.params['code'];
		let from = currentUrl.params['from'];
		// 一、通过不同的方式，获取用户的uid, token
		let openidx = localStorage.getItem('openidx');
		if(openidx != null){
			// 已经登陆过了，有缓存，直接使用openidx登陆获得uid/token
			self.userLogin(openidx);
		} else if (from != null && from != undefined){
			// 如果是分享过来的连接，不论是否有code都需要重新授权
			var url = 'http://' + currentUrl.host + currentUrl.pathname + '?roomid=' + cc.vv.UserMgr.roomid;
			var auth = self.get_weixin_auth(url);
			window.location.href = auth;
			return;
		}else if(code == null){
		   // 直接访问的游戏URL（且没有缓存过openidx），需要授权
			var auth = self.get_weixin_auth(window.location.href);
			window.location.href = auth;
			return; // 这句话一定需要，不然第一个页面还需继续执行
		}else{
			cc.vv.UserMgr.code = code;
			self.authLogin();
		}
	},
	userLogin:function(openidx){
		let self = this;
		var reqdata = {
			openid: openidx,
			type: 'wx'
		};
	   
		cc.vv.http.sendRequest("/user_login",reqdata,function (retdata) {
			self.log(retdata);
			if (retdata.ret === 0) {
				self.log(retdata)
				cc.vv.UserMgr.uid = retdata.data.uid;
				cc.vv.UserMgr.token = retdata.data.token;
				cc.vv.UserMgr.sex = retdata.data.sex;
				cc.vv.UserMgr.name = retdata.data.name;
				cc.vv.UserMgr.head = retdata.data.head;
				
				self.enterRoom();
			}
			else {
				
			}
		},cc.vv.userMgr.ip);
	},  
	authLogin:function(code){
		let self = this;
		code = code || cc.vv.UserMgr.code;
		var reqdata = {
			code: code,
			type: 'wx'
		};
	   
		cc.vv.http.sendRequest("/auth_login",reqdata,function (retdata) {
			self.log(retdata)
			if (retdata.ret === 0) {
				cc.vv.UserMgr.uid = retdata.data.uid;
				cc.vv.UserMgr.token = retdata.data.token;// 缓存openidx
				localStorage.setItem('openidx', retdata.data.openid);
				self.enterRoom();
			}
			else {
				
			}
		},cc.vv.userMgr.ip);
	},
	enterRoom:function(roomid,code,token,uid,ip){
		let self = this;
		ip = ip || cc.vv.UserMgr.ip;
		code = code || cc.vv.UserMgr.code;
		token = token||cc.vv.UserMgr.token;
		uid = uid|| cc.vv.UserMgr.uid;
		roomid = roomid|| cc.vv.UserMgr.roomid;
		var reqdata = {
			token: token,
			uid: uid,
			roomid: roomid
		};
		// self.userLogin();
	   cc.vv.http.sendRequest("/enter_room",reqdata,function (retdata) {
		// cc.vv.http.sendRequest("/user_login",reqdata,function (retdata) {
			self.log(retdata)
			if (retdata.ret === 0) {
				cc.vv.UserMgr.ip = retdata.data.ip;
				cc.vv.UserMgr.port = retdata.data.port;
				cc.vv.UserMgr.sign = retdata.data.sign;
				 cc.vv.net.ip =cc.vv.UserMgr.ip + ":" + cc.vv.UserMgr.port;
				self.connectSocket();
			}
			else {
			   let url = cc.vv.userMgr.ip+'/rank.html?roomid='+cc.vv.UserMgr.roomid;
				window.location.href = url;
			}
		},cc.vv.userMgr.ip);
	},
	connectSocket:function(){
		let self = this;
		let onConnectFailed = function(){
			cc.log(' ---- onConnectFailed ----');
		}
		let onConnectOK = function(){
			cc.log(' ---- onConnectOK ----');
			self.playGame();
			
		}
		cc.vv.net.connect(onConnectOK,onConnectFailed); 
	},

	playGame: function () {
		//this.tipLabel.string = '进入游戏中...';
		this.node.getComponent("niuniuGame").showTable();
		this.getComponent("niuniuGame").initHandler();
		this.getComponent("niuniuGame").loginGame();
	},

	get_weixin_auth:function (url){
		var uri = encodeURIComponent(url);
		var auth = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + cc.vv.userMgr.wxappid + 
					'&redirect_uri=' + uri + 
					'&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
		return auth;
	},


	log:function (obj) {
		var str = '';
		if (typeof(obj) == 'boolean') {
			str = str + obj?'true':'false';
		}
		else if (typeof(obj) == 'string' || typeof(obj) == 'number') {
			str = str + obj;
		}
		else if (typeof(obj) == 'object') {
			// str = str + obj.tostring();
			str = str+JSON.stringify(obj);
		}
		// if (string.len(str) > 0) {
		// }
	},

	// called every frame
	update: function (dt) {

	},

	/*

	*/


});
