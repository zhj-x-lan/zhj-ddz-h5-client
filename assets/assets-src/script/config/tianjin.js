var gameDefine = require('gameDefine');

var TianJinConfig = {
  areaType:gameDefine.AreaType.Area_TianJin, //地区
  serverIP:"mahjong.ry-tianjin.xyz",   //服务器地址
  serverPort:3010,  //端口
  gameName:"天津攒局麻将",  //游戏名称
  versionText:"审批文号：新广出审[2017]10415号  出版物号：ISBN978-7-498-03201-0  出版单位：天津电子出版社有限公司",  //版号内容
  notice: "抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活.",
  wxShareUrl: "https://fir.im/rytianjinmajiang",  //微信分享链接
  wxWelcomeText: "还等嘛!我在天津攒局麻将等你!",  //微信邀请语
  loginLogo: "resources/login/cuanjumajiang.png", //登录界面LOGO
  //海报（如果不想显示一个不写就行）
  Poster: [
      "resources/poster/tianjin/poster_tianjin_1.png",
      "resources/poster/tianjin/poster_tianjin_2.png"
  ],
  //包含游戏类型
  GameVisible:[
    gameDefine.GameType.Game_Mj_Tianjin,
    gameDefine.GameType.Game_Poker_DDZ,
    gameDefine.GameType.Game_Poker_TianjinDDZ
  ],
  //游戏开启模式类型
  ModeType: {
      Game_Mj_Tianjin: {
          //付费货币类型
          CurrencyType: gameDefine.currencyType.Currency_Coin,
          //结算奖励类型
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_Mj_Shishi: {
          CurrencyType: gameDefine.currencyType.Currency_Card,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_Mj_HZ: {
          CurrencyType: gameDefine.currencyType.Currency_Coin,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_Poker_TianjinDDZ: {
          CurrencyType: gameDefine.currencyType.Currency_Coin,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_Poker_DDZ: {
          CurrencyType: gameDefine.currencyType.Currency_Coin,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_Poker_13shui: {
          CurrencyType: gameDefine.currencyType.Currency_Card,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_niu_niu: {
          CurrencyType: gameDefine.currencyType.Currency_Card,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_TDK: {
          CurrencyType: gameDefine.currencyType.Currency_Card,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      },
      Game_Poker_paodekuai: {
          CurrencyType: gameDefine.currencyType.Currency_Card,
          SettleType: [
              gameDefine.settleType.Settle_Coin,
              gameDefine.settleType.Settle_Point
          ]
      }
  },
  //调牌是否开启
  SetCardsOpen: false,
  //匹配是否开启
  MatchGameType: [
      gameDefine.GameType.Game_Mj_Tianjin,
      gameDefine.GameType.Game_MJ_HuaDian,
      gameDefine.GameType.Game_TDK,
      gameDefine.GameType.Game_Poker_TianjinDDZ,
      gameDefine.GameType.Game_Mj_CC,
      gameDefine.GameType.Game_Poker_DDZ
  ],
  serverConfig:{
      //金币
    "roomCoin": {
      "1": [
        {"name":"4局", "roundType":1, "roundMax":4, "cost":1, "enter":[20,50,100], "perround":5},
        {"name":"8局", "roundType":1, "roundMax":8, "cost":2, "enter":[40,100,200], "perround":5},
        {"name":"16局", "roundType":1, "roundMax":16, "cost":4, "enter":[80,200,400], "perround":5},
        {"name":"1圈", "roundType":2, "roundMax":1, "cost":1, "enter":[20,50,100], "perround":5},
        {"name":"2圈", "roundType":2, "roundMax":2, "cost":2, "enter":[40,100,200], "perround":5},
        {"name":"4圈", "roundType":2, "roundMax":4, "cost":4, "enter":[80,200,400], "perround":5}
      ],
      "8": [
        {"name":"6局", "roundType":1, "roundMax":6, "cost":1, "enter":[20,50,100], "perround":5},
        {"name":"10局", "roundType":1, "roundMax":10, "cost":2, "enter":[40,100,200], "perround":5},
        {"name":"20局", "roundType":1, "roundMax":20, "cost":4, "enter":[80,200,400], "perround":5}
      ],
      "102": [
        {"name":"6局", "roundType":1, "roundMax":6, "cost":1, "enter":[20,50,100], "perround":5},
        {"name":"10局", "roundType":1, "roundMax":10, "cost":2, "enter":[40,100,200], "perround":5},
        {"name":"20局", "roundType":1, "roundMax":20, "cost":4, "enter":[80,200,400], "perround":5}
      ]
    },
      //房卡
    "roomCard": {
      "1": {
        "1": {"name": "4局","cost": {"2": {"final": 2},"3": {"final": 3},"4": {"final": 4}}},
        "2": {"name": "8局","cost": {"2": {"final": 2},"3": {"final": 3},"4": {"final": 4}}},
        "3": {"name": "16局","cost": {"2": {"final": 4},"3": {"final": 6},"4": {"final": 8}}},
        "4": {"name": "1圈","cost": {"2": {"final": 2},"3": {"final": 3},"4": {"final": 4}}},
        "5": {"name": "2圈","cost": {"2": {"final": 2},"3": {"final": 3},"4": {"final": 4}}},
        "6": {"name": "4圈","cost": {"2": {"final": 6},"3": {"final": 9},"4": {"final": 12}}}
      },
      "8":{
        "6":{"name":"6局", "cost":{"3":{"final":2}}},
        "10":{"name":"10局", "cost":{"3":{"final":3}}},
        "20":{"name":"20局", "cost":{"3":{"final":6}}}
      },
       "11":{
        "10":{"name":"10", "cost":{"2": {"final": 0},"3":{"final":0}}},
        "20":{"name":"20", "cost":{"2": {"final": 0},"3":{"final":0}}},
        "30":{"name":"30", "cost":{"2": {"final": 0},"3":{"final":0}}}
      },
      "102":{
        "6":{"name":"6局", "cost":{"3":{"final":2}}},
        "10":{"name":"10局", "cost":{"3":{"final":3}}},
        "20":{"name":"20局", "cost":{"3":{"final":6}}}
      }
    }
  },
};

module.exports = TianJinConfig;