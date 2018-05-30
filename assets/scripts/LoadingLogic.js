var AppMgr = require('AppMgr');;
cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel: cc.Label,
        _stateStr: '',
        _progress: 0.0,
        _splash: null,
        _isLoading: false,
        _wxMode: false,
    },

    onLoad: function () {
        //cc.view.enableAutoFullScreen(true);
        var appMgr = new AppMgr();
        appMgr.initMgr();

        //cc.vv.utils.screenAdapter();

        this.tipLabel.string = this._stateStr;

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
           /*  wx.setEnableDebug({
                enableDebug: true,
            }); */

            /** 转发相关... */
            wx.showShareMenu({
                withShareTicket: true
            });

            wx.onShareAppMessage(function () {
                return {
                    title: '转发标题',
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    }),
                }
            })

            var self = this;

            var saveUserInfo = function (retdata) {
                cc.vv.userMgr.encryptedData = retdata.encryptedData;
                cc.vv.userMgr.iv = retdata.iv;
                cc.vv.userMgr.signature = retdata.signature;
                cc.vv.userMgr.rawData = retdata.rawData;
            
                var userInfo = retdata.userInfo;
           
                cc.vv.userMgr.kNike = userInfo.nickName;
                cc.vv.userMgr.kFace = userInfo.avatarUrl;

                cc.loader.load({ url: userInfo.avatarUrl, type: 'png' }, function (err, texture) {
                    if (err) {
                        console.error('头像加载错误...');
                        //self.scheduleOnce(loadImage, 3);
                    } else {
                        cc.vv.userMgr.sprHead = new cc.SpriteFrame(texture);
                    }
                });
            };

            //1)获取code
            wx.login({
                success: function (res) {
                    //wx.login只会返回code, 用户信息需要用wx.getUserInfo.
                    /**
                     * 返回结果示例===> 
                     * code:"023Fxiuh0O34Px1LQvwh0Hd7uh0FxiuT"
                        errMsg: "login:ok"
                     */
                    console.warn(res.code); //小游戏中,每次刷新code都会变化
                    var code = res.code;


                    cc.vv.userMgr.code = res.code;

                    /** 
                     * 1.无操作,快速退出、返回
                     *   流程走2.3.4
                     *    此时socketMgr存在,
                     *       loginSocket存在,state= 3
                     *       gameSocket存在, state= 1
                     *   综上,needReconn = false,不需要重连.
                     * 2.无操作,3分钟退出、返回
                     * 3.退出、电话、返回 依然同1 无影响
                     * 4.退出、查看微信、返回:
                     *   流程走2.3.4.5
                     *   此时socketMgr存在,
                     *      loginSocket存在,state= 0
                     *      gameSocket存在, state = 2 needReconn = true
                     *      开始走重连流程...
                     *      
                     */

                   /*  wx.onHide(function () {
                        console.error('');
                        cc.director.getScene().getChildByName('Canvas').destroy();
                    }); */

                    wx.onShow(function (result) {
                        console.error('调用wx.onShow()...=======================================================================');
                        console.error(result);

                        var needReconn = false;
                        if (!cc.vv.socketMgr) {
                            console.error('# 111');
                            needReconn = true;
                        } else {
                            console.error('# 222');
                            if (cc.vv.socketMgr.loginSocket) { 
                                console.error('# 333');
                                console.error(cc.vv.socketMgr.loginSocket);
                                var loginState = cc.vv.socketMgr.loginSocket.readyState;
                                console.error(loginState);
                            }
                            if (cc.vv.socketMgr.gameSocket) {
                                console.error('# 444');
                                console.error(cc.vv.socketMgr.gameSocket);
                                var gameState = cc.vv.socketMgr.gameSocket.readyState;
                                console.error(gameState);
                                if (gameState != 1) {
                                    needReconn = true;
                                }
                            } else {
                                needReconn = true;
                            }
                        }

                        /** 重新获取code */
                  /*       var code = null;
                        wx.login({
                            success: function (res) {
                                code = res.code;
                            }
                        }); */

                        wx.getUserInfo({
                            success: function (retdata) {
                              
                                saveUserInfo(retdata);

                                var curSceneName = cc.director.getScene().name;
                                if (curSceneName == 'hall' || curSceneName == 'mjgame') {   //在此两个场景中 肯定只需要判断gameSocket
                                    if (needReconn) {
                                        console.error('# 555');
                                        /** 此处必须重走一次流程 */
                                        /* var appMgr = new AppMgr();
                                        appMgr.initMgr(); */

                                        /* var SocketMgr = require('SocketMgr');
                                        cc.vv.socketMgr = new SocketMgr();
                                        cc.vv.socketMgr.init(); */

                                        /** 再次保存下userInfo */
                                        //cc.vv.userMgr.code = code;
                                        cc.vv.userMgr.kUUID = localStorage.getItem('uuid');

                                        cc.vv.userMgr.loginType = 1;
                                        cc.vv.userMgr.needReconn = true;

                                        console.error(localStorage.getItem('uuid'));

                                        saveUserInfo(retdata);
                                        
                                        cc.vv.socketMgr.createLoginSocket('wss://test.ws.haoyunlaiyule1.com:19002', 1, true);

                                        //cc.vv.socketMgr.updateNetWork();

                                    }
                                }
                            }
                        });
                    });

                    wx.getUserInfo({
                        withCredentials: true,
                        success: function (result) {
                            console.warn('授权结果信息: ===> ');
                            console.warn(result);
                            saveUserInfo(result);
                        },
                        fail: function (result) {
                            wx.showModal({
                                title: '拒绝授权',
                                content: '授权失败,是否打开设置选项重新授权?',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户手动设置授权...'); //点击了确定按钮触发
                                        wx.openSetting({
                                            success: function (data) {  //success只有用户点击设置返回按钮时,才会触发.不管用户最终是否同意授权,都是这里调用而不是fail方法调用.
                                                console.warn('data ======================');
                                                console.warn(data);
                                                if (data) {
                                                    if (data.authSetting["scope.userInfo"] == true) {
                                                      
                                                    } else {
                         
                                                    }
                                                }
                                            },
                                            fail: function (data) {
                                                
                                            }
                                        });
                                    } else if (res.cancel) {
                                       
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } else if (!cc.sys.isNative) {
            if (this._wxMode) {         //h5微信授权
                var currUrl = cc.vv.utils.parseURL(location.href);
                console.warn('currUrl: ===> ' + currUrl);
                console.warn(currUrl.params);

                var from = currUrl.params['from'];
       
                var code = currUrl.params['code'];

                cc.vv.userMgr.getCode(currUrl);
            }
        }

        this.startPreloading();
    },

    startPreloading: function () {
        this._stateStr = "正在加载资源，请稍候"
        this._isLoading = true;
        var self = this;

        cc.loader.onProgress = function (completedCount, totalCount, item) {
            if (self._isLoading) {
                self._progress = completedCount / totalCount;
            }
        };

        cc.loader.loadResDir("load", cc.loader.onProgress, function (err, assets) {
            self.onLoadComplete();
        });
    },

    onLoadComplete: function () {
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },

    update: function (dt) {
        if (this._stateStr.length == 0) {
            return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if (this._isLoading) {
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";
        }
        else {
            var t = Math.floor(Date.now() / 1000) % 4;
            for (var i = 0; i < t; ++i) {
                this.tipLabel.string += '.';
            }
        }
    }
});