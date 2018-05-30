var profileNiuNiu = profileNiuNiu || {};

profileNiuNiu.init = function () {
    profileNiuNiu.initCreateRoomOpts();
};

profileNiuNiu.initCreateRoomOpts = function () {
    var data = cc.sys.localStorage.getItem('createNiuNiuRoomOpts');
    if (data != null) {
        profileNiuNiu.createRoomOpts = JSON.parse(data);
        return;
    }
    profileNiuNiu.createRoomOpts = {};
    //
    profileNiuNiu.createRoomOpts.joinermax = 6; //最大人数
    profileNiuNiu.createRoomOpts.joinermin = 2; //最小人数
    profileNiuNiu.createRoomOpts.scoreBase = 1; //底分
    var gameDefine = require('gameDefine');
    profileNiuNiu.createRoomOpts.roundType = gameDefine.roundType.round; // 服务器配置的局数
    profileNiuNiu.createRoomOpts.roomType = 1; // 1 普通房 2 俱乐部
    profileNiuNiu.createRoomOpts.costType = 1; // 1: 房主支付 2: aa 3: 大赢家 4: 代理
    profileNiuNiu.createRoomOpts.clubId = "";
    profileNiuNiu.createRoomOpts.multipleType = 0; // 0: 1 /5 /10  1: 1 /2
    profileNiuNiu.createRoomOpts.bossType = 2; // 抢庄的类型 1房主坐庄 2 轮流 3 牛牛坐庄 4 自由抢庄 5 明牌抢庄
    profileNiuNiu.createRoomOpts.gameType = 5; // 5 牛牛
};

profileNiuNiu.saveCreateRoomOpts = function () {
    if (this.createRoomOpts == null || this.createRoomOpts == undefined) return;
    cc.log("saveCreateRoomOpts=" + JSON.stringify(this.createRoomOpts));
    cc.sys.localStorage.setItem('createNiuNiuRoomOpts', JSON.stringify(this.createRoomOpts));
};