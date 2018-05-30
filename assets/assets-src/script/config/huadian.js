var gameDefine = require('gameDefine');

var HuaDianConfig = {
  areaType: gameDefine.AreaType.Area_HuaDian, //地区
  serverIP: "mahjong.ry-huadian.com",   //服务器地址
  serverPort:3010,  //端口
  gameName: "摸摸桦甸麻将",  //游戏名称
  versionText: "",  //版号内容
  notice: "抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活.",
  wxShareUrl: "https://fir.im/huadian2",    //微信分享链接
  wxWelcomeText: "摸摸桦甸麻将,欢迎您的加入!",  //暂用天津
  loginLogo: "resources/login/ruoyuhuadian.png",  //登录界面游戏LOGO

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
    // "roomCoin": {
    //   "1": [
    //     {"name":"4局", "roundType":1, "roundMax":4, "cost":1, "enter":[20,50,100], "perround":5},
    //     {"name":"8局", "roundType":1, "roundMax":8, "cost":2, "enter":[40,100,200], "perround":5},
    //     {"name":"16局", "roundType":1, "roundMax":16, "cost":4, "enter":[80,200,400], "perround":5},
    //     {"name":"1圈", "roundType":2, "roundMax":1, "cost":1, "enter":[20,50,100], "perround":5},
    //     {"name":"2圈", "roundType":2, "roundMax":2, "cost":2, "enter":[40,100,200], "perround":5},
    //     {"name":"4圈", "roundType":2, "roundMax":4, "cost":4, "enter":[80,200,400], "perround":5}
    //   ],
    //   "8": [
    //     {"name":"6局", "roundType":1, "roundMax":6, "cost":1, "enter":[20,50,100], "perround":5},
    //     {"name":"10局", "roundType":1, "roundMax":10, "cost":2, "enter":[40,100,200], "perround":5},
    //     {"name":"20局", "roundType":1, "roundMax":20, "cost":4, "enter":[80,200,400], "perround":5}
    //   ],
    //   "102": [
    //     {"name":"6局", "roundType":1, "roundMax":6, "cost":1, "enter":[20,50,100], "perround":5},
    //     {"name":"10局", "roundType":1, "roundMax":10, "cost":2, "enter":[40,100,200], "perround":5},
    //     {"name":"20局", "roundType":1, "roundMax":20, "cost":4, "enter":[80,200,400], "perround":5}
    //   ]
    // },
      //房卡
    "roomCard": {
      "6" : {
        "61":{"name":"6局", "cost":{"2":{ "final":1},"4":{ "final":1}}},
        "62":{"name":"12局", "cost":{"2":{ "final":1},"4":{ "final":1}}},
        "63":{"name":"24局", "cost":{"2":{ "final":2},"4":{ "final":2}}},
        "64":{"name":"1圈", "cost":{"2":{ "final":1},"4":{ "final":1}}},
        "65":{"name":"2圈", "cost":{"2":{ "final":1},"4":{ "final":1}}},
        "66":{"name":"4圈", "cost":{"2":{ "final":2},"4":{ "final":2}}}
      },
      "7":{
        "71":{"name":"15局", "cost":{"3":{ "final":1}, "4":{ "final":1}, "5":{ "final":1}, "6":{ "final":1}}},
        "72":{"name":"30局", "cost":{"3":{ "final":2}, "4":{ "final":2}, "5":{ "final":2}, "6":{ "final":2}}}  
      },
      "102":{
        "6":{"name":"6局", "cost":{"3":{ "final":1}}},
        "10":{"name":"10局", "cost":{"3":{ "final":1}}},
        "20":{"name":"20局", "cost":{"3":{ "final":2}}}
      }
    }
  },
}

module.exports = HuaDianConfig;