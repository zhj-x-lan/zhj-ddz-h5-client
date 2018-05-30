var GameNet = (function () {
  var _instance = null;
  var pingpong = 0;
  var reqPingPong = [];
  var reqStart = Date.now();
  var lastTableCmd = null;
  var netStatus = 0;
  var connected = false;
  var reconnectMax = 2;
  var reconnectCount = 0;

  function computePingPong() {
    reqPingPong.push(Date.now() - reqStart);
    if (reqPingPong.length > 5) reqPingPong.splice(0, 1);
    pingpong = 0;
    for (var i = 0; i < reqPingPong.length; i++) pingpong += reqPingPong[i];
    pingpong = pingpong / reqPingPong.length;
  }

  function constructor() {
    return {
      connect: function (host, port, f_ok, f_fail) {
        if (connected) {
          this.disconnect();
        }
        var self = this;
        connected = true;
        reqPingPong = [];
        this.setCallBack('disconnect', function() {
          WriteLog('get disconnect:'+reconnectCount);
          if (++reconnectCount > reconnectMax) {
            self.disconnect();
            f_fail();
            closeView('Loading');
          } else if (reconnectCount == 1) {
            openView('Loading');
          }
        });
        /*this.setCallBack('reconnect', function() {
          WriteLog('get reconnect');
          closeView('Loading');
          reconnectCount = 0;
        });*/
        pomelo.init({
          host: host,
          port: port,
          log: false,
          reconnect: true,
          maxReconnectAttempts: reconnectMax
        }, function() {
          f_ok();
          reconnectCount = 0;
        });
      },

      disconnect: function () {
        pomelo.removeAllListeners('disconnect');
        pomelo.disconnect();
        connected = false;
      },

      request: function (type, msg, cb) {
        try {
          console.log("request " + type + ": " + JSON.stringify(msg));
          reqStart = Date.now();
          if (arguments.length == 2) {
            pomelo.notify(type, msg);
            lastTableCmd = msg.cmd;
          } else {
            pomelo.request(type, msg, function (rtn) {
              computePingPong();
              console.log("response " + type + " " + (Date.now() - reqStart) + "ms: " + JSON.stringify(rtn));
              cb(rtn);
            });
          }
        } catch (e) {
          sendEvent("disconnect");
        }
      },

      setCallBack: function (evt, cb) {
        pomelo.removeAllListeners(evt);
        if (cb) {
          pomelo.addEventListener(evt, function (data) {
            if (lastTableCmd == evt) {
              lastTableCmd = null;
              computePingPong();
            }
            console.log("notify "+ evt +": "+ JSON.stringify(data));
            cb(data);
          });
        }
      },

      removeAllListeners: function(evt){
        pomelo.removeAllListeners(evt);
      },

      setNetStatus: function(status) {
        // '0':无连接  1:'运营商网络' 2:'Wifi网络'
        if (netStatus != 0 && netStatus != status) {
          pomelo.disconnect();
        } 
        netStatus = status;
      },

      getPingPong: function () {
        return pingpong;
      },

      heartbeat: function() {
        if (connected) {
          GameNet.getInstance().request('connector.entryHandler.heartbeat', {}, function() {});
        }
        setTimeout(GameNet.getInstance().heartbeat, 20000);
      },
    }
  }

  return {
    getInstance: function () {
      if (_instance == null) {
        _instance = constructor();
        _instance.heartbeat();
      }
      return _instance;
    }
  }
})();