var configMgr = require('configMgr');
var errorCode = require('errorCode');
var configMgr = require('configMgr');

var STATUS = {
	DISCONNECT: 0,
	CONNECTING: 1,
	CONNECTED: 2
};

var login = {
	status: STATUS.DISCONNECT,
};

module.exports = login;

login.loginBtn = function(account){
	try{
		if (this.status != STATUS.DISCONNECT) {
			return;
		}

		openView('Loading');
		if (!cc.sys.isNative) {
			this.onWebLogin(account);
			return;
		}
		if (this.loginByLocalData()) return;
		if (cc.sys.OS_ANDROID == cc.sys.os) {
			jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "wx_login", "()V");
		}else if (cc.sys.OS_IOS == cc.sys.os) {
			jsb.reflection.callStaticMethod("AppController", "wx_login");
		}else{
			this.onSimulatorLogin();
		}
	}
	catch(e){
		WriteLog("loginHandler.loginBtn throw error:" + JSON.stringify(e));
	}
}

login.loginByLocalData = function(){
	if (!cc.sys.isNative) return false;
	var localData = cc.sys.localStorage.getItem("loginData");
	if (!localData) return false;
	var Data = eval("(" + localData + ")");
	this.connect(Data);
	return true;
}

login.onWebLogin = function (account) {
	var accountData = account || 'Web-' + new Date().getTime();
	cc.sys.localStorage.setItem("testName", accountData);
	var loginData = {
		account: accountData,
		nickname: accountData,
		sex: Math.floor(Math.random() * 2 + 1),
		app: {
			appid: "com.mahjong.tianjin",
			os: 'web',
		}
	};
	this.connect(loginData);
}

login.onSimulatorLogin = function () {
	var accountData = cc.sys.localStorage.getItem("account") || 'Simulator-' + new Date().getTime();
	var loginData = {
		account: accountData,
		nickname: accountData,
		app: {
			appid: "com.mahjong.tianjin",
			os: 'simulator',
		}
	};
	this.connect(loginData);
}

login.login = function (loginData) {
	loginData.version = UpdateHandler.getInstance().getVersion();
	GameNet.getInstance().request("connector.entryHandler.login", loginData, function (rtn) {
		if (rtn.result == errorCode.Success) {
			cc.sys.localStorage.setItem("loginData", JSON.stringify(loginData)); // 存入登录信息
			GameData.player = rtn.pinfo;
			loginYunwa(GameData.player.uid.toString(), GameData.player.name);
			if (GameData.player.roomid === undefined || GameData.player.roomid <= 0) {
				cc.director.loadScene('home');
				closeView('Loading');
			}else{
				GameNet.getInstance().request("room.roomHandler.enterRoom", {
					roomid: GameData.player.roomid,
					posInfo: getPosInfo()
				}, 
				function (rtn) {
					if (rtn.result != errorCode.Success) {
						GameData.player.roomid = undefined;
						cc.director.loadScene('home');
						closeView('Loading');
					}
				});
			}
		}else{
			if (rtn.result == errorCode.accountHasSeal) {
				createMessageBox('帐号已封停,无法登录！', function(){
					closeView('Loading');
				});
				return;
			} else if (rtn.result == errorCode.codeVersionError) {
				createMessageBox('请更新至最新版本,体验更优质的游戏内容.', function(){
					closeView('Loading');
				});
				return;
			} else if (rtn.result == errorCode.packetVersionError) {
				createMessageBox('请下载最新的安装包,更多精彩值得期待.', function () {
					closeView('Loading');
				});
				return;
			}
			WriteLog('login error ' + JSON.stringify(rtn));
			GameData.restart();
		}
	});
}

login.logout = function (uid) {
	cc.sys.localStorage.removeItem("loginData");
	cc.game.end();
}

login.connect = function (loginData) {
	var self = this;
	this.status = STATUS.CONNECTING;
	GameNet.getInstance().connect(configMgr.getIP(), configMgr.getPort(),		
	function(){
		WriteLog("connect suc...");
		self.status = STATUS.CONNECTED;
		self.login(loginData);
	},
	function(){
		WriteLog("connect failed...");
		self.status = STATUS.DISCONNECT;
		createMessageBox('网络断开，请重新连接',
			function () {
				GameData.autoLogin = true;
				WriteLog("点击重连...");
				cc.director.loadScene('login');
		});
	});
}

login.OnWXLogin = function (wxinfo) {
	var userinfo = eval('(' + wxinfo + ')');
	if (userinfo.unionid == null) return;
	userinfo.nickname = emoji2Str(userinfo.nickname);
	var self = this;
	GameData.client.sex = userinfo.sex;
	GameData.client.nickname = userinfo.nickname;
	GameData.client.headurl = userinfo.headimgurl;
	var loginData = {
		account: 'wx_' + userinfo.unionid,
		nickname: userinfo.nickname,
		sex: userinfo.sex,
		headimgurl: userinfo.headimgurl,
		app: {
			appid: "com.mahjong.tianjin",
			os: cc.sys.os,
			area: configMgr.getAreaType(),
		}
	};
	self.connect(loginData);
}

login.OnWXFailed = function () {
	
}