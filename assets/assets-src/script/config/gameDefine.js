var gameDefine = {
  AreaType:{
    Area_Test:0,      //测试服
    Area_TianJin:1,   //天津地区
    Area_ShiShi:2,    //石狮地区
    Area_HuaDian:3,   //桦甸地区
    Area_DunHua:4,    //敦化地区
    Area_HEB:5,       //哈尔滨地区
    Area_Hebei:6,     //河北省
    Area_Changchun:7, //长春地区
  },

  //玩法类型
  GameType: {
    Game_Mj_Tianjin:1,        //天津麻将 
    Game_Mj_Shishi:2,         //石狮麻将
    Game_Poker_13shui:3,      //十三水
    Game_niu_niu:5,           //经典牛牛
    Game_MJ_HuaDian:6,        //桦甸麻将
    Game_TDK:7,               //填大坑
    Game_Poker_TianjinDDZ:8,  //天津斗地主
    Game_Mj_HZ:9,             //红中麻将
    Game_Mj_CC:10,            //长春麻将
    Game_Poker_paodekuai: 11, //跑得快
    Game_Mj_AS: 12,           //鞍山麻将  
    Game_Mj_Heb:13,           //哈尔滨麻将
    Game_Poker_DDZ: 102,      //经典斗地主
  },

  //房间类型
  roomType: {
    Room_Common: 1,   //普通房间
    Room_Club: 2,   //俱乐部房间
    Room_Contest: 3,  //比赛房间
    Room_Match: 4,    //匹配房间
  },

  //房间状态
  RoomState :{
    WAIT:0,
    READY:1,
    GAMEING:2,
  },

  ruleType: {
    // 跳转到玩法说明界面是否通过点及问号
    isRuleType: false,
    // 玩法说明左边的页签类型
    type: 1,
    // scroview偏移的y轴坐标
    py: 1,
  },

  //付费货币类型
  currencyType: {
      Currency_Card: 1,	  //房卡
      Currency_Coin: 2	  //金币
  },
  //结算奖励类型
  settleType: {
      Settle_None: 1,		//无
      Settle_Coin: 2,		//金币
      Settle_Point: 3 	    //积分
  },
  // 回合计算类型
  roundType: {
      round:1,	//局
      quan:2,		//圈
      ke:3,		//课
  },
    CostType: {
        Cost_None: 0,		//无需付费
        Cost_Creator:1,		//房主付费
        Cost_AA:2,			//AA制付费
        Cost_Winner:3,		//大赢家付费
        Cost_Agent:4,		//代理付费
        Cost_Table:5,		//台费
    },
    //商店兑换消耗类型
  shopCostType: {
    Shop_Cost_Cash: 0,    //现金  
    Shop_Cost_Card: 1,    //房卡
    Shop_Cost_Coin: 2,    //金币
    Shop_Cost_Point: 3,   //积分
  },

  //商店兑换获得类型
  shopGetType:{
    Shop_Get_Coin: 0,   //金币
    Shop_Get_Item: 1,   //道具
  }
};

module.exports = gameDefine;