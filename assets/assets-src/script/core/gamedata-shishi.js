var GameDataShiShi = GameDataShiShi || {};

function shishi_registAllMessage() {

    GameNet.getInstance().setCallBack('initYoujin', function(data){
        WriteLog("do event initYoujin " + JSON.stringify(data));
        GameData.cards[data.uid]['youNum'] = data.youNum;
        GameData.cards[data.uid]['youRound'] = data.youRound;
    });
    GameNet.getInstance().setCallBack('onYoujin', function(data) {
        WriteLog("do event onYoujin " + JSON.stringify(data));
        GameData.cards[data.uid]['youNum'] = data.youNum;
        GameData.cards[data.uid]['youRound'] = data.youRound;
        if (!data.zimo && data.youNum > 0) {
            if (data.uid == GameData.player.uid) {
                var cards = GameData.cards[data.uid]['hand'];
                cards[GameData.game.lastdisCard] = (cards[GameData.game.lastdisCard] === undefined) ? 1 : cards[GameData.game.lastdisCard]+1;
                GameData.game.obtain = GameData.game.lastdisCard;
            }
            if (GameData.game.lastdisUid > 0) {
                GameData.removeDisCard(GameData.game.lastdisUid);
            }
            GameData.game.turn = data.uid;
            GameData.game.lastdisUid = 0;
            GameData.game.lastdisCard = 0;
            GameData.cards[data.uid]['handnum']++;
            sendEvent('onGameTurn', data.uid);
        }
        sendEvent('onYoujin', data);
    });
    GameNet.getInstance().setCallBack('allYoujinInfo', function(data){
        WriteLog("sercerMsg  allYoujinInfo :" + JSON.stringify(data));
        for(var i = 0; i<data.data.length; i++){
            GameData.cards[data.data[i].uid]['youNum'] = data.data[i].youNum;
            GameData.allYouJinInfo[i] = data.data[i];
        }
        sendEvent('allYoujinInfo', data);
    });
    GameNet.getInstance().setCallBack('startWater', function(data){
        WriteLog("sercerMsg  startWater :" + JSON.stringify(data.data));
        GameDataShiShi.setWater = data.data;
        sendEvent('startWater');
    });
}

GameDataShiShi.init = function() {

    GameDataShiShi.initGameData();
    GameDataShiShi.initCreateRoomOpts();

    GameDataShiShi.autoLogin = false;

    shishi_registAllMessage();
};

GameDataShiShi.initGameData = function() {

  GameDataShiShi.setWater = 1;

  console.log('call initGameData shishi');
};

GameDataShiShi.initCreateRoomOpts = function() {
    var data = cc.sys.localStorage.getItem('createRoomOptsShiShi');
    if (data!=null) {
        GameDataShiShi.createRoomOpts = JSON.parse(data);
      return;
    }
    GameDataShiShi.createRoomOpts = {};

    GameDataShiShi.createRoomOpts.joinermax = 4;  //最大人数
    GameDataShiShi.createRoomOpts.scoreBase = 0; //一课底分
    GameDataShiShi.createRoomOpts.fengtou = true;//风头跟打
    GameDataShiShi.createRoomOpts.shuangjin = true; //双金不平湖
    GameDataShiShi.createRoomOpts.chashui = true; // 插水
    GameDataShiShi.createRoomOpts.qg_zimo = false; //抢杠自摸
    GameDataShiShi.createRoomOpts.qg_pinghu = false; //抢杠平胡

    //普通房
    GameDataShiShi.createRoomOpts.roundRule = 2;    //局/圈/Num
    GameDataShiShi.createRoomOpts.huierDiao = true; //带混掉
    GameDataShiShi.createRoomOpts.daZi = false;     //逢字必打
    GameDataShiShi.createRoomOpts.daiFeng = true;   //带风牌
    GameDataShiShi.createRoomOpts.daiChan = true;   //带铲牌
    GameDataShiShi.createRoomOpts.jGangScore = 4;   //金杠分数
    GameDataShiShi.createRoomOpts.laType  = 1;      //坐二拉一:1/连庄拉庄:2
    GameDataShiShi.createRoomOpts.payType = 1;      //房主付费1/AA付费2/赢家付费3

    //俱乐部
    GameDataShiShi.createRoomOpts.roundRule_club = 2;    //局/圈/Num
    GameDataShiShi.createRoomOpts.huierDiao_club = true; //带混掉
    GameDataShiShi.createRoomOpts.daZi_club = false;     //逢字必打
    GameDataShiShi.createRoomOpts.daiFeng_club = true;   //带风牌
    GameDataShiShi.createRoomOpts.daiChan_club = true;   //带铲牌
    GameDataShiShi.createRoomOpts.jGangScore_club = 4;   //金杠分数
    GameDataShiShi.createRoomOpts.laType_club = 1;      //坐二拉一:1/连庄拉庄:2
    GameDataShiShi.createRoomOpts.youJin = YoujinType.Ming; //游金
    GameDataShiShi.createRoomOpts.payType_club = 1;      //房主付费1/AA付费2/赢家付费3
    GameDataShiShi.createRoomOpts.dianpao = 2;            //点炮单赔/通赔
};

GameDataShiShi.saveCreateRoomOpts = function(){
  if (GameDataShiShi.createRoomOpts == null || GameDataShiShi.createRoomOpts == undefined) {
    return;
  }
  cc.log("saveCreateRoomOptsShiShi="+JSON.stringify(GameDataShiShi.createRoomOpts));
  cc.sys.localStorage.setItem('createRoomOptsShiShi', JSON.stringify(GameDataShiShi.createRoomOpts));
};