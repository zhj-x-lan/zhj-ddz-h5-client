cc.Class({
	extends: cc.Component,
	properties: {
		
	},

	//desktop.html?roomid=xxx&uid=xxx&sign=xxx&ip=xxx&port=xxx&gameid=SANG
	onLoad: function () {
		console.log('[wxCode.js]--> onLoad()...');

		var currentUrl = cc.vv.utils.parseURL(location.href);
		this.from = currentUrl.params['from'];
		cc.vv.userMgr.roomid = currentUrl.params['roomid'];
		cc.vv.userMgr.uid = currentUrl.params['uid'];
		cc.vv.userMgr.sign = currentUrl.params['sign'];
		cc.vv.userMgr.ip = currentUrl.params['ip'];
		cc.vv.userMgr.port = currentUrl.params['port'];
		cc.vv.userMgr.code = currentUrl.params['code'];
		//暂不做微信授权...
		//this.getCode(currentUrl);
	},

	getCode: function (currentUrl) {
		console.log('[wxCode.js]--> getCode()...');
		let self = this;
		var code = currentUrl.params['code'];
		let from = currentUrl.params['from'];
		// 一、通过不同的方式，获取用户的uid, token
		let openidx = localStorage.getItem('openidx');
		if (openidx != null) {
			// 已经登陆过了，有缓存，直接使用openidx登陆获得uid/token
			cc.vv.userMgr.userLogin(openidx);
		} else if (from != null && from != undefined) {
			// 如果是分享过来的连接，不论是否有code都需要重新授权
			var url = 'http://' + currentUrl.host + currentUrl.pathname + '?roomid=' + cc.vv.userMgr.roomid;
			var auth = cc.vv.userMgr.weixin_auth(url);
			window.location.href = auth;
			return;
		} else if (code == null) {
			// 直接访问的游戏URL（且没有缓存过openidx），需要授权
			var auth = cc.vv.userMgr.weixin_auth(window.location.href);
			window.location.href = auth;
			return; // 这句话一定需要，不然第一个页面还需继续执行
		} else {
			cc.vv.userMgr.code = code;
			cc.vv.userMgr.authLogin();
		}
	},
});
