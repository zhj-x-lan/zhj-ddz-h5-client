cc.Class({
    extends: cc.Component,

    initMgr: function () {
        cc.vv = {};

        cc.vv.dispatcher = require('onfire');
        cc.vv.maps = require('MsgMaps');
        
        var Utils = require("Utils");
        cc.vv.utils = new Utils();

        var GameMgr = require('GameMgr');
        cc.vv.gameMgr = new GameMgr();
        cc.vv.gameMgr.init();
        cc.vv.gameMgr.initEventHandlers();


        var UserMgr = require("UserMgr");
        cc.vv.userMgr = new UserMgr();

        var RoomMgr = require("RoomMgr");
        cc.vv.roomMgr = new RoomMgr();
        cc.vv.roomMgr.init();

        //var ReplayMgr = require("ReplayMgr");
        //cc.vv.replayMgr = new ReplayMgr();

        cc.vv.httpx = require("HTTP");

        var AudioMgr = require("AudioMgr");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.audioMgr.init();


        /* var SocketMgr = require('SocketMgr');
        cc.vv.socketMgr = new SocketMgr();
        cc.vv.socketMgr.init(); */

        var MsgHandler = require('MsgHandler');
        cc.vv.msgHandler = new MsgHandler();
        cc.vv.msgHandler.init();

        var MjMgr = require('MahjongMgr');
        cc.vv.mahjongmgr = new MjMgr();
        cc.vv.mahjongmgr.init();

    }
});
