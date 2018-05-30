var gameDefine = require('gameDefine');

var DunHuaConfig = {
  gameName: "摸摸敦化麻将",  //游戏名称
  areaType: gameDefine.AreaType.Area_DunHua, //地区
  serverIP:'changchun.mahjong.ry-play.com',   //测试服务器
  serverPort:3010,  //端口
  versionText: "敦化测试版本",  //版号内容
  notice: "抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活.",
  wxShareUrl: "https://fir.im/dunhua",  //暂用天津
  wxWelcomeText: "摸摸敦化麻将欢迎你！",  //暂用天津
  loginLogo: "resources/login/ruoyudunhua.png", //登录界面LOGO
  //海报（如果不想显示一个不写就行）
  Poster: [],
  //包含游戏类型
  GameVisible: [
    gameDefine.GameType.Game_Mj_CC,
    gameDefine.GameType.Game_TDK
  ],
  //调牌是否开启
  SetCardsOpen: false,
  //匹配是否开启
  MatchGameType: [
      // gameDefine.GameType.Game_Mj_Tianjin,
      // gameDefine.GameType.Game_MJ_HuaDian,
      // gameDefine.GameType.Game_TDK,
      // gameDefine.GameType.Game_Poker_TianjinDDZ,
      // gameDefine.GameType.Game_Mj_CC,
      // gameDefine.GameType.Game_Poker_DDZ
  ],
    //比赛场是否开启
    FightGameType: [
    ],
    //本游戏统一付费类型
    CurrencyType: gameDefine.currencyType.Currency_Card,
  //游戏开启模式类型
  ModeType: {
    Game_Mj_CC:{
      CurrencyType: gameDefine.currencyType.Currency_Card,
      SettleType: []
    },

    Game_TDK: {
      CurrencyType: gameDefine.currencyType.Currency_Card,
      SettleType: []
    }
  },
  serverConfig: {
      //匹配金币场
      "matchCoin": {
          "1": {"name":"天津麻将匹配局", "roundType":1, "roundMax":1, "joinerMax":4, "cost":[100,300,1000],"enter":[5000,15000,10000]},
          "8": {"name":"天津斗地主匹配局", "roundType":1, "roundMax":1, "joinerMax":3, "cost":[100,300,1000], "enter":[2000,15000,10000]},
          "102": {"name":"经典斗地主匹配局", "roundType":1, "roundMax":1, "joinerMax":3, "cost":[100,300,1000], "enter":[2000,15000,10000]},
          "5": {"name":"牛牛匹配局", "roundType":1, "roundMax":1, "joinerMax":4, "cost":[300,1000,5000], "enter":[30000,100000,500000]},
          "6": {"name":"桦甸麻将匹配局", "roundType":1, "roundMax":1, "joinerMax":4, "cost":[100,300,1000], "enter":[5000,15000,100000]},
          "7": {"name":"填大坑匹配局", "roundType":1, "roundMax":1, "joinerMax":4, "cost":[300,1000,5000], "enter":[30000,100000,500000]},
          "10": {"name":"长春麻将匹配局", "roundType":1, "roundMax":1, "joinerMax":4, "cost":[100,300,1000], "enter":[5000,15000,100000]}
      },
      //比赛场
      "fight": {},
    //金币
    "roomCoin": {
      "1": [
        {"name":"4局", "roundType":1, "roundMax":4, "cost":{"2": {"final": 100},"3": {"final": 100},"4": {"final": 100}}, "enter":{"2": [10000,20000,50000],"3": [20000,40000,100000],"4": [20000,40000,100000]}},
        {"name":"8局", "roundType":1, "roundMax":8, "cost":{"2": {"final": 100},"3": {"final": 100},"4": {"final": 100}}, "enter":{"2": [20000,40000,100000],"3": [40000,80000,200000],"4": [40000,80000,200000]}},
        {"name":"16局", "roundType":1, "roundMax":16, "cost":{"2": {"final": 100},"3": {"final": 100},"4": {"final": 100}}, "enter":{"2":[40000,80000,200000],"3": [80000,160000,400000],"4": [80000,160000,400000]}},
        {"name":"1圈", "roundType":2, "roundMax":1, "cost":{"2": {"final": 100},"3": {"final": 100},"4": {"final": 100}}, "enter":{"2": [10000,20000,50000],"3": [20000,40000,100000],"4": [20000,40000,100000]}},
        {"name":"2圈", "roundType":2, "roundMax":2, "cost":{"2": {"final": 100},"3": {"final": 100},"4": {"final": 100}}, "enter":{"2": [20000,40000,100000],"3": [40000,80000,200000],"4": [40000,80000,200000]}},
        {"name":"4圈", "roundType":2, "roundMax":4, "cost":{"2": {"final": 100},"3": {"final": 100},"4": {"final": 100}}, "enter":{"2": [40000,80000,200000],"3": [80000,160000,400000],"4": [80000,160000,400000]}},
      ],
      "8": [
        {"name":"6局", "roundType":1, "roundMax":6, "cost":{"3": {"final": 100}}, "enter":{"3": [5000,10000,20000]}},
        {"name":"10局", "roundType":1, "roundMax":10, "cost":{"3": {"final": 100}}, "enter":{"3": [10000,20000,40000]}},
        {"name":"20局", "roundType":1, "roundMax":20, "cost":{"3": {"final": 100}}, "enter":{"3": [10000,20000,40000]}}
      ],
      "102": [
        {"name":"6局", "roundType":1, "roundMax":6, "cost":{"3": {"final": 100}}, "enter":{"3": [5000,10000,20000]}},
        {"name":"10局", "roundType":1, "roundMax":10, "cost":{"3": {"final": 100}}, "enter":{"3": [10000,20000,40000]}},
        {"name":"20局", "roundType":1, "roundMax":20, "cost":{"3": {"final": 100}}, "enter":{"3": [10000,20000,40000]}}
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
        "1": {"name": "4局","cost": {"2": {"final": 0},"3": {"final": 0},"4": {"final": 20}}},
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
        "10" : {
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
        "6":{"name":"6局", "cost":{"3":{ "final":2}}},
        "10":{"name":"10局", "cost":{"3":{ "final":3}}},
        "20":{"name":"20局", "cost":{"3":{ "final":6}}}
      },
      "11":{
        "10":{"name":"10", "cost":{"2": {"final": 0},"3":{"final":0}}},
        "20":{"name":"20", "cost":{"2": {"final": 0},"3":{"final":0}}},
        "30":{"name":"30", "cost":{"2": {"final": 0},"3":{"final":0}}}
      },
        "102":{
            "6":{"name":"6局", "cost":{"3":{ "final":2}}},
            "10":{"name":"10局", "cost":{"3":{ "final":3}}},
            "20":{"name":"20局", "cost":{"3":{ "final":6}}}
        }
    }
  },
}

module.exports = DunHuaConfig;