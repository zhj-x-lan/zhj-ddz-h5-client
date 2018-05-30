cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    addClickEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    addToggleEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var toggleEvents = node.getComponent(cc.Toggle).clickEvents;
        toggleEvents.push(eventHandler);
    },

    addSlideEvent: function (node, target, component, handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

    addEscEvent: function (node) {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
            },
            onKeyReleased: function (keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    cc.vv.alert.show('提示', '确定要退出游戏吗？', function () {
                        cc.game.end();
                    }, true);
                }
            }
        }, node);
    },

    parseURL: function (url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length, i = 0, s;
                for (; i < len; i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            pathname: a.pathname,
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    },

    checkOption: function (data) {
        var option = null;
        var kThink = data.kThink;   //Array,保存可以有的所有操作类型及牌数据
        if (kThink.length == 0) {
            return option;
        }
        option = {
            'peng': [],
            'gang': [],
            'ting': [],
            'hu': [],
            'ting': [],
        };
        var typeMap = {
            5: 'peng',
            3: 'gang',
            4: 'gang',
            8: 'gang',
            2: 'hu',
            7: 'ting',
        };
        var paiMap = {};    //pai --> type
        for (let i = 0; i < kThink.length; i++) {
            var think = kThink[i];  //think代表一个操作类型和相应的牌.
            var type = think[0];        //操作类型
            //碰牌：5,只61037,pai唯一.
            //杠牌: 4,61037(明杠)，pai唯一.  61034(暗杠3,pai数组、补杠8,pai数组)    
            //听牌: 7,pai数组
            var pai = cc.vv.mahjongmgr.converArr2Ids(think[1])[0];
            option[typeMap[type]].push({
                type: type,
                pai: pai
            });
            console.warn('当前pai:==> ' + pai + '可以的操作类型为:==> ' + type);
        }
        console.log('测试解析出来的option数据========================');
        console.log(option);
        return option;
    },

    /**
     * 全局uuid生成,用于用户注册
     */
    generateUUid: function (len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data. At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    },

    sortHzCards: function (holds, hzCards) {
        /*   holds.sort(function (a, b) {
              if (~hzCards.indexOf(a)) {
                  return -1
              } else if (~hzCards.indexOf(b)) {
                  return 1
              } else {
                  return a - b
              }
          }); */
        holds.sort(function (a, b) {
            if (~hzCards.indexOf(a) && ~hzCards.indexOf(b)) {
                return a - b;
            } else if (~hzCards.indexOf(a)) {
                return -1;
            } else if (~hzCards.indexOf(b)) {
                return 1;
            } else {
                return a - b;
            }
        });
        return holds;
    },

    //[8,8,27, 0,5,6,12]  3张耗子牌   [8,27]
    getHaoziPos: function (holds, haoziCards) {
        var arrHzPos = [];
        for (let i = 0; i < haoziCards.length; i++) {
            var hz = haoziCards[i];
            for (let index = 0; index < holds.length; index++) {
                if (holds[index] == hz) {
                    arrHzPos.push(index);
                    console.log('牌: ' + holds[index] + '是耗子, 位置为: ' + index);
                }
            }
        }
        console.log('耗子牌的位置为： ==>');
        console.log(arrHzPos);
        return arrHzPos;
    },

    getCodeParam: function () {
        var currUrl = cc.vv.utils.parseURL(location.href);
        var code = currUrl.params['code'];
        console.warn('getCodeParam: ________________');
        return code;
    },

    //每个场景初始必须现执行一次适配函数：
    screenAdapter: function () {  //屏幕适配
        var screenAdapter = function () {
            let canvas = cc.find("Canvas").getComponent(cc.Canvas);
            let winSize = cc.view.getVisibleSize();

            if (winSize.height / winSize.width <= 720 / 1280) {
                canvas.fitHeight = true;
                canvas.fitWidth = false;
            }
            else {
                canvas.fitHeight = false;
                canvas.fitWidth = true;
            }
        };
        //第一次适配
        screenAdapter();

        //时时监听
        window.onresize = () => {
            console.warn('window resize ...');
            screenAdapter();//屏幕适配
        }
    },

    loadImage: function (userData, head) {
        if (!head) {
            return;
        }
        //此方法针对4人包括自己,
        let self = this;
        cc.loader.load({ url: head, type: 'png' }, function (err, texture) {
            if (err) {
                self.scheduleOnce(loadImage, 3);
            } else {
                userData.sprHead = new cc.SpriteFrame(texture);
            }
        });
    },
});
