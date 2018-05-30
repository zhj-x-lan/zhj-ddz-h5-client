var GameDataHZ = GameDataHZ || {};

function HZ_registAllMessage() {
}

GameDataHZ.init = function () {
    console.log('GameDataHZ init..');

    GameDataHZ.initCreateRoomOpts();
    //HZ_registAllMessage();
};

GameDataHZ.initCreateRoomOpts = function () {
    var data = cc.sys.localStorage.getItem('createRoomOptsHZ');
    if (data != null) {
        GameDataHZ.createRoomOpts = JSON.parse(data);
        return;
    }
    GameDataHZ.createRoomOpts = {};
    GameDataHZ.createRoomOpts.gameType = 0;
    GameDataHZ.createRoomOpts.gameTypeIndex = 0;
    GameDataHZ.createRoomOpts.joinermax = 4;      //最大人数

    GameDataHZ.createRoomOpts.roundRule = 1;      //局数类型
    GameDataHZ.createRoomOpts.payType = 1;        //房主付费1/AA付费2/赢家付费3/代开房付费4
    GameDataHZ.createRoomOpts.BuyM = 2;           //买马:2.4.6
    GameDataHZ.createRoomOpts.times = 1;          //倍数
    GameDataHZ.createRoomOpts.score = 1;            //限制分数
    GameDataHZ.createRoomOpts.huqidui = true;     //可胡七对
    GameDataHZ.createRoomOpts.qianggang = false;  //抢杠包三家
    GameDataHZ.createRoomOpts.diangang = false;   //点杠杠开包三家
};
GameDataHZ.saveCreateRoomOpts = function () {
    if (GameDataHZ.createRoomOpts == null || GameDataHZ.createRoomOpts == undefined) {
        return;
    }
    cc.log("saveCreateRoomOptsHZ=" + JSON.stringify(GameDataHZ.createRoomOpts));
    cc.sys.localStorage.setItem('createRoomOptsHZ', JSON.stringify(GameDataHZ.createRoomOpts));
};
GameDataHZ.getRoundMax = function(){
    var max = 0;
    if(GameDataHZ.createRoomOpts.roundRule){
        switch (GameDataHZ.createRoomOpts.roundRule){
            case 1:{
                max = 4;
            }break;
            case 2:{
                max = 8;
            }break;
            case 3:{
                max = 16;
            }break;
        }
    }
    return max;
};