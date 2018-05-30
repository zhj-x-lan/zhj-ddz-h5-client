var gameDefine = require('gameDefine');

var ShiShiConfig = {
  areaType: gameDefine.AreaType.Area_HuaDian, //地区
  serverIP: "192.168.1.1",   //服务器地址
  gameName: "摸摸桦甸麻将",  //游戏名称
  versionText: "",  //版号内容
  //海报（如果不想显示一个不写就行）
  Poster: [
      "resources/poster/huandian/poster_HD_1.png"
  ],
  //包含游戏类型
  GameVisible: [
    gameDefine.GameType.Game_MJ_HuaDian,
    gameDefine.GameType.Game_Poker_DDZ,
    gameDefine.GameType.Game_TDK
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
  serverConfig: {
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
      "2": {
        "1": {"name": "4局","cost": {"2": {"final": 10},"3": {"final": 15},"4": {"final": 20}}},
        "2": {"name": "8局","cost": {"2": {"final": 20},"3": {"final": 30},"4": {"final": 40}}},
        "3": {"name": "16局","cost": {"2": {"final": 40},"3": {"final": 60},"4": {"final": 80}}},
        "4": {"name": "1课/50分","cost": {"2": {"final": 20},"3": {"final": 30},"4": {"final": 40}}},
        "5": {"name": "1课/100分","cost": {"2": {"final": 40},"3": {"final": 60},"4": {"final": 80}}}
      },
      "3": {
        "1": {"name": "15局", "cost": {"2": { "final": 0}, "3": { "final": 0}, "4": { "final": 0}, "5": { "final": 0}}},
        "2": {"name": "30局", "cost": {"2": { "final": 0}, "3": { "final": 0}, "4": { "final": 0}, "5": { "final": 0}}},
        "3": {"name": "45局", "cost": {"2": { "final": 0}, "3": { "final": 0}, "4": { "final": 0}, "5": { "final": 0}}},
        "4": {"name": "60局", "cost": {"2": { "final": 0}, "3": { "final": 0}, "4": { "final": 0}, "5": { "final": 0}}},
        "5": {"name": "75局", "cost": {"2": { "final": 0}, "3": { "final": 0}, "4": { "final": 0}, "5": { "final": 0}}}
      },
      "5":{
        "1":{"name":"10局", "cost":{"6":{ "final":0}}},
        "2":{"name":"20局", "cost":{"6":{ "final":0}}},
        "3":{"name":"30局", "cost":{"6":{ "final":0}}}
      },
      "6" : {
        "61":{"name":"6局", "cost":{"2":{ "final":0},"4":{ "final":0}}},
        "62":{"name":"12局", "cost":{"2":{ "final":0},"4":{ "final":0}}},
        "63":{"name":"24局", "cost":{"2":{ "final":0},"4":{ "final":0}}},
        "64":{"name":"1圈", "cost":{"2":{ "final":0},"4":{ "final":0}}},
        "65":{"name":"2圈", "cost":{"2":{ "final":0},"4":{ "final":0}}},
        "66":{"name":"4圈", "cost":{"2":{ "final":0},"4":{ "final":0}}}
      },
      "7":{
        "71":{"name":"15局", "cost":{"3":{ "final":0}, "4":{ "final":0}, "5":{ "final":0}, "6":{ "final":0}}},
        "72":{"name":"30局", "cost":{"3":{ "final":0}, "4":{ "final":0}, "5":{ "final":0}, "6":{ "final":0}}}  
      },
      "8":{
        "6":{"name":"6局", "cost":{"3":{ "final":0}}},
        "10":{"name":"10局", "cost":{"3":{ "final":0}}},
        "20":{"name":"20局", "cost":{"3":{ "final":0}}}
      },
      "11":{
        "10":{"name":"10", "cost":{"2": {"final": 0},"3":{"final":0}}},
        "20":{"name":"20", "cost":{"2": {"final": 0},"3":{"final":0}}},
        "30":{"name":"30", "cost":{"2": {"final": 0},"3":{"final":0}}}
      },
      "102":{
        "6":{"name":"6局", "cost":{"3":{ "final":0}}},
        "10":{"name":"10局", "cost":{"3":{ "final":0}}},
        "20":{"name":"20局", "cost":{"3":{ "final":0}}}
      }
    }
  },
}

module.exports = ShiShiConfig;