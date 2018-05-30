cc.Class({
    extends: cc.Component,
    properties: {
        account: null,
        userId: null,
        userName: null,
        lv: 0,
        exp: 0,
        coins: 0,
        gems: 0,
        sign: 0,
        ip: "",
        port: 0,
        sex: 0,
        roomData: null,

        oldRoomId: null,
        //wxappid: 'wx81a4711b716f2bb4',
        wxappid: 'wx21eb8f05d13e5df7',
    },

    onRcvLogin: function (msgTbl) {
        console.warn('【UserMgr.js】--> #61002 onRcvLogin()... ');
        console.warn(msgTbl);
        if (msgTbl.kErrorCode == 0) {
            cc.vv.userMgr.kGateIp = msgTbl.kGateIp;
            cc.vv.userMgr.kGatePort = msgTbl.kGatePort;
            cc.vv.userMgr.kId = msgTbl.kId;
            cc.vv.userMgr.kSeed = msgTbl.kSeed;
            cc.vv.userMgr.kUUID = msgTbl.kUUID;
            //登陆GateServer
            //var url = cc.vv.socketMgr.game_url = 'wss://' + msgTbl.kGateIp + ':' + msgTbl.kGatePort;
            //wss://test.ws.haoyunlaiyule1.com:19002
            var url = cc.vv.socketMgr.game_url = 'wss://test.ws.haoyunlaiyule1.com' + ':' + msgTbl.kGatePort;
            cc.vv.socketMgr.createGameSocket(url);
        } else if (msgTbl.kErrorCode == 7) {
            console.warn('kPlate登陆失败,尝试使用code登陆.');
            //首先清除失效uuid
            localStorage.setItem('uuid', null);
        
            localStorage.removeItem('uuid');
           
            var currUrl = cc.vv.utils.parseURL(location.href);
            cc.vv.userMgr.getCode(currUrl);
            cc.vv.socketMgr.createLoginSocket(cc.vv.socketMgr.login_url, 1, false);            
        } else if (msgTbl.kErrorCode == 4) {
            window.alert('创建账号失败,请联系客服解决...');
        }

        //4 弹窗显示,联系客服
    },

    onRcvLoginGate: function (msgTbl) {
        console.warn('【UserMgr.js】--> #61115 onRcvLoginGate()... ');
        console.warn(msgTbl);
        cc.vv.userMgr.uid = msgTbl.kStrUserUUID;
        cc.vv.gameMgr.gameLogin();
    },

    //#61005
    onRcvLoginServer: function (msgTbl) {
        console.warn('【UserMgr.js】--> #61005 onRcvLoginServer()... ');
        console.warn(msgTbl);

        cc.vv.userMgr.kNike = msgTbl.kNike;

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            cc.vv.userMgr.kNike = msgTbl.kNike;
            cc.vv.userMgr.kFace = msgTbl.kFace;
            
            if (cc.vv.userMgr.loginType == 1) {
                cc.loader.load({ url: msgTbl.kFace, type: 'png' }, function (err, texture) {
                    if (err) {
                        console.warn('头像加载错误...');
                        //self.scheduleOnce(loadImage, 3);
                    } else {
                        cc.vv.userMgr.sprHead = new cc.SpriteFrame(texture);
                    }
                });
            }
        }

        //登陆成功,本地保存uuid
        //localStorage.setItem('uuid', cc.vv.userMgr.kUUID);
        cc.sys.localStorage.setItem('uuid', cc.vv.userMgr.kUUID);
        
        if (msgTbl.kState == 0) {
            console.warn('aaaaaaaaaaaaaaaaaaaaaaaa');
            cc.director.loadScene("hall");
        } else {
            if (cc.director.getScene().name == 'mjgame') {
                console.warn('【】【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【【');
                return;
            }
            cc.director.loadScene('mjgame');
        }
    },

    weixin_auth: function (url) {
        var uri = encodeURIComponent(url);
        var url = 'http://wx.code.haoyunlaiyule.com/get-weixin-code.html?appid=' + this.wxappid + '&' +
            'redirect_uri=' + uri + '&' +
            'scope=snsapi_userinfo' + '&' +
            'state=STATE';
        return url;
    },

    getCode: function (currUrl) {
        let self = this;
        var code = currUrl.params['code'];
        let from = currUrl.params['from'];
        console.warn('【进入getCode()...方法...】');
        console.warn(code);
        // 一、通过不同的方式，获取用户的uid, token
        let uuid = localStorage.getItem('uuid');
        if (uuid != null) {
            console.warn('存在uuid,不需要code login登陆换取,直接登陆gate');
            cc.vv.userMgr.kUUID = localStorage.getItem('uuid');
            console.warn('本地缓存的uuid: ' + localStorage.getItem('uuid'));
            console.warn('以后到这里,自动进行微信登陆...');
        } else if (from != null && from != undefined) {
            // 如果是分享过来的连接，不论是否有code都需要重新授权
            console.warn('分享过来的链接,需要重新登陆...');
            var url = 'http://' + currUrl.host + currUrl.pathname + '?roomid=' + cc.vv.UserMgr.roomid;
            var auth = cc.vv.userMgr.weixin_auth(url);
            window.location.href = auth;
            return;
        } else if (code == null) {
            // 直接访问的游戏URL（且没有缓存过openid），需要授权
            console.warn('code不存在,需要授权获取...');
            var auth = cc.vv.userMgr.weixin_auth(window.location.href);
            window.location.href = auth;
            return; // 这句话一定需要，不然第一个页面还需继续执行
        } else {
            console.warn('【取得的code信息为】');
            cc.vv.userMgr.code = code;
            //self.authLogin();
        }
    },
});
