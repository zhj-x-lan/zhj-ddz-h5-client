var msgpack = require('msgpack.min');
cc.Class({
    extends: cc.Component,

    properties: {
        loginSocket: null,
        gameSocket: null,
        dataEventHandler: null,
        lockReconnect: false,
        game_url: null,
        safeClose: false,
        netFlag: false,
        createFlag: false,
        login_url: '',
    },

    onLoad: function () {

    },
    /**
     * WebSocket相关
     * readyState: 0, 正在建立连接连接，还没有完成
     *             1, 连接成功建立，可以进行通信
     *             2, 连接正在进行关闭握手，即将关闭
     *             3, 连接已经关闭或者根本没有建立
     */
    init: function () {
        this.reqLoginUrl();
    },

    updateNetWork: function () {
        var self = this;
        var inner = function () {
            if (self.gameSocket.readyState == 3) {  //执行重连
                if (!self.createFlag) {
                    console.warn('【updateNetWork()... 11111111111111111111111】');
                    console.error('login_url: ===> ' + self.login_url);
                    self.createLoginSocket(self.login_url, 1, true);
                    self.createFlag = true;
                    clearInterval(checkNetwork);
                    setTimeout(() => {
                        self.updateNetWork();
                    }, 8000);
                }
            }
        };
        var checkNetwork = setInterval(inner, 3000);
    },

    reqLoginUrl: function () {
        var data = { type: 'h5' };
        var self = this;
        cc.vv.httpx.sendRequest('/logon', data, function (retdata) {
            console.warn(retdata);
            self.login_url = 'wss://' + retdata.data.ip.replace('#', ':');
            //cc.vv.socketMgr.login_url = 'wss://test.ws.haoyunlaiyule1.com:19002';        
        });
    },

    createGameSocket: function (url) {
        this.gameSocket = new WebSocket(url);
        this.lockReconnect = true;
        //心跳检测
        var heartCheck = {
            timeout: 4000,//4秒
            timeoutObj: null,
            serverTimeoutObj: null,
            reset: function () {
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this;
            },
            start: function () {
                var self = this;
                this.timeoutObj = setTimeout(function () {
                    //这里发送一个心跳，后端收到后，返回一个心跳消息，
                    //onmessage拿到返回的心跳就说明连接正常
                    var socket = cc.vv.socketMgr.gameSocket;
                    if (socket && socket.readyState == 1) {
                        console.warn('发送心跳...');
                        cc.vv.gameMgr.sendHeart();
                    }
                    self.serverTimeoutObj = setTimeout(function () {//如果超过一定时间还没重置，说明后端主动断开了
                        console.warn('超时关闭gameSocket');
                        cc.vv.socketMgr.lockReconnect = false;
                        if (cc.vv.socketMgr.gameSocket.readyState != 1) {
                            cc.vv.socketMgr.gameSocket.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                            //cc.vv.socketMgr.reconnect();
                        }
                    }, 8000)
                }, 4000)
            }
        }

        this.gameSocket.onopen = () => {
            console.warn('this.gameSocket连接成功, 开始登陆gate...');
            heartCheck.reset().start();
            this.updateNetWork();
            
            if (cc.vv.userMgr.loginType == 1) {
                
                cc.vv.gameMgr.gateLoginByWx();
            } else {
                
                cc.vv.gameMgr.gateLoginByGuest();
            }
        };

        this.gameSocket.onmessage = (msg) => {

            heartCheck.reset().start();
            var msgId = this.unpack(msg.data).kMId;
            cc.vv.msgHandler.recv(this.unpack(msg.data));
        };

        this.gameSocket.onclose = () => {
            console.warn('this.gameSocket连接关闭...开始重连...');
            this.lockReconnect = false;
            if (!this.netFlag) {
                console.warn('请检查网络状态...');
            } else {
            }
            //this.reconnect();
        };

        this.gameSocket.onerror = () => {
            this.lockReconnect = false;
            console.warn('this.gameSocket连接错误,关闭');
            this.gameSocket.close();
        };
    },

    createLoginSocket: function (url, value, cached) {
       
        this.loginSocket = new WebSocket('wss://test.ws.haoyunlaiyule1.com:19002');

        console.warn('login url: ==> ' + url);
        this.loginSocket.onopen = () => {
            console.warn('loginSocket 连接成功..., 开始登陆loginServer');
            if (value == 1) {
                
                cc.vv.gameMgr.wxLogin(cached);
            } else {
               
                cc.vv.gameMgr.testLogin();
            }
        };
        this.loginSocket.onmessage = (msg) => {
            //标记正常关闭
            this.safeClose = true;
            this.loginSocket.close();
            
            cc.vv.msgHandler.recv(this.unpack(msg.data));
        };
        this.loginSocket.onclose = () => {
            console.warn('loginSocket关闭...');
            this.createFlag = false;
            if (!this.safeClose) {
                
                this.createLoginSocket(url, value, cached);
            }
        };
        this.loginSocket.onerror = () => {
            this.createFlag = false;
            console.warn('loginSocker发生错误...');
        };
    },

    reconnect: function () {
        if (this.lockReconnect) {
            return;
        }
        this.lockReconnect = true;
        if (cc.vv.userMgr.loginType == 1) {
           
            this.createLoginSocket(this.login_url, 1, false);
        } else {
           
            this.createLoginSocket(this.login_url, 1, true);
        }
        cc.vv.gameMgr.reconnFlag = true;
    },

    dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },

    send: function (data) {
        var str = this.pack(data);
        if (this.gameSocket && this.gameSocket.readyState == 1) {  //连接已经建立
            this.gameSocket.send(str);
        }
    },

    loginSend: function (data) {
        var str = this.pack(data);
        if (this.loginSocket.readyState == 1) { //正常建立连接,可以发送消息...
            this.loginSocket.send(str);
        } else {
            setTimeout(() => {
                this.loginSend(str);
            }, 1000);
        }
    },

    pack: function (data) {
        var result = msgpack.encode(data);

        var output = '01';
        for (let val of result) {
            if (val < 16) {
                output += '0';
            }
            output += val.toString(16);
        }
        return output;
    },

    unpack: function (data) {
        var size = data.length / 2;
        var arr = new Uint8Array(size);

        var s = '';
        for (let i = 0; i < size; i++) {
            s = data.substring(i * 2, i * 2 + 2);
            arr[i] = parseInt(s, 16);
        }
        return msgpack.decode(arr);
    },

    rec_heartbeat: function (time) {
        //console.log('收到心跳...');
    }
});
