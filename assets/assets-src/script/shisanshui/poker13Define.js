var CardType = {
  Spade:0,    //方块
  Heart:1,    //梅花
  Diamond:2,  //红心
  Club:3,     //黑桃
  King:4      //王牌
};

//基础牌型
var CommonType = {
  WuLong: {
    id:1, 
    str: 'wulong1'
  },                     //乌龙
  DuiZi: {
    id:2, 
    str: 'duizi1'
  },                     //对子
  LiangDui: {
    id:3, 
    str: 'liangdui1'
  },                     //两对
  SanTiao: {
    id:4, 
    str: 'santiao1'
  },                      //三条
  ShunZi: {
    id:5, 
    str: 'shunzi1'
  },                      //顺子
  TongHua: {
    id:6, 
    str: 'tonghua1'
  },                      //同花
  HuLu: {
    id:7, 
    str: 'hulu1'
  },                      //葫芦
  TieZhi: {
    id:8, 
    str: 'tiezhi1'
  },                      //铁支
  TongHuaShun: {
    id:9, 
    str: 'tonghuashun1'
  },                      //同花顺
  WuTong: {
    id:10, 
    str: 'wutong1'
  }                       //五同
};

var CommonSize = {
  WuLong: 5,       //乌龙
  DuiZi: 2,        //对子
  LiangDui: 4,     //两对
  SanTiao: 3,      //三条
  ShunZi: 5,       //顺子
  TongHua: 5,      //同花
  HuLu: 5,         //葫芦
  TieZhi: 4,       //铁支
  TongHuaShun: 5,  //同花顺
  WuTong: 5,       //五同
};

var RecommendType = {
  DuiZi: 'DuiZi',
  LiangDui: 'LiangDui',
  SanTiao:'SanTiao',
  ShunZi: 'ShunZi',
  TongHua: 'TongHua',
  HuLu: 'HuLu',
  TieZhi: 'TieZhi',
  TongHuaShun: 'TongHuaShun',
  WuTong: 'WuTong'
};

//特殊牌型
var SpecialType = {
  SanTongHua: {
    id:1, 
    score:3, 
    name:'三同花'
  },  //三同花
  SanShunZi: {
    id:2, 
    score:3, 
    name:'三顺子'
  },   //三顺子
  LiuDuiBan: {
    id:3, 
    score:3, 
    name:'六对半'
  },   //六对半

  WuDuiSanTiao: {
    id:10, 
    score:5, 
    name:'五对三条'
  },   //五对三条
  CouYiSe: {
    id:11, 
    score:5, 
    name:'凑一色'
  },         //凑一色
  QuanXiao: {
    id:12, 
    score:5, 
    name:'全小'
  },       //全小
  QuanDa: {
    id:13, 
    score:5, 
    name:'全大'
  },         //全大

  ShiErHuangZu: {
    id:20, 
    score:6, 
    name:'十二皇族'
  },      //十二皇族
  SanHuangWuDi: {
    id:21, 
    score:6, 
    name:'三皇五帝'
  },      //三皇五帝
  SanTongHuaShun: {
    id:22, 
    score:6, 
    name:'三同花顺'
  },    //三同花顺

  SiTaoSanTiao: {
    id:30, 
    score:20, 
    name:'四套三条'
  },      //四套三条
  YiTianLong: {
    id:31, 
    score:20, 
    name:'一条龙'
  },        //一条龙

  SanFenTianXia: {
    id:40, 
    score:36, 
    name:'三分天下'
  },     //三分天下

  ZhiZunQingLong: {
    id:50, 
    score:108, 
    name:'至尊青龙'
  },    //至尊青龙

  QuanLeiDa: {
    id: 60, 
    name: '全垒打'
  }
};

var cardPoker13 = {
  'up': [],
  'mid': [],
  'down': []
};

var AutoScene = {
  SCENE_HORIZONTAL: 1,
  SCENE_VERTICAL: 2
};


var moveCard = {
  oneCard: 0,
  towCard: 0
};

var prefabTag = {
  playerRoundTag: 1000,
  roundDetailPanelTag: 2000,
  playerRoundDetailTag: 3000
};

var AnimateType = {
  Start: 'kaishi',   //开始

  JieSuan: 'jiesuan', //结算

  QuanLeiDa: 'quanleida',      //全垒打
  QiangJi: 'qiangji',     //枪击

  ChongSan: 'chongsan',        //冲三
  HuLu: 'hulu',                //葫芦
  TieZhi: 'tiezhi',            //铁枝
  TongHuaShun: 'tonghuashun',  //同花顺
  WuTong: 'wutong',            //五同

  SanTongHua: 'santonghua',  //三同花
  SanShunZi: 'sanshunzi',    //三顺子
  LiuDuiBan: 'liuduiban',    //六对半

  WuDuiSanTiao: 'wuduisantiao',   //五对三条
  CouYiSe: 'couyise',             //凑一色
  QuanXiao: 'quanxiao',           //全小
  QuanDa: 'quanda',               //全大

  ShiErHuangZu: 'shierhuangzu',        //十二皇族
  SanHuangWuDi: 'sanhuangwudi',        //三皇五帝
  SanTongHuaShun: 'santonghuashun',    //三同花顺

  SiTaoSanTiao: 'sitaosantiao',      //四套三条
  YiTianLong: 'yitiaolong',          //一条龙

  SanFenTianXia: 'sanfentianxia',     //三分天下

  ZhiZunQingLong: 'zhizunqinglong',    //至尊青龙
};

//十三水音效类型枚举
var SSS_AudioType = {
  SAT_1:'btn_click',                     //按钮点击
  SAT_2:'compare_fly_coin',              //小结算金币飞到中间音效
  SAT_3:'compare_fly_coin',              //小结算金币飞到他人音效
  SAT_4:'coin_income',                   //小结算金币飞入自己的音效
  SAT_5:'compare_special',               //特殊牌型音效
  SAT_6:'compare_click_sound',           //组牌时扑克牌点击音
  SAT_7:'poker_deal',                    //发牌音效
  SAT_8:'xianggong',                     //倒水
};
//十三水说话音效类型枚举
var SSS_SpeakAudioType = {
  Start:'start_compare',           //开始比牌
  DaQiang:'daqiang1',              //打枪
  CommonType: {
    WuLong:'common1',              //乌龙
    DuiZi:'common2',               //对子
    LiangDui:'common3',            //两队
    SanTiao:'common4',             //三条
    ShunZi:'common5',              //顺子
    TongHua:'common6',             //同花
    HuLu:'common7',                //葫芦
    TieZhi:'common8',              //铁支
    TongHuaShun:'common9',         //同花顺
    WuTong:'common10',             //五同
    ChongSan:'type1',              //冲三
    ZhongDunHuLu:'type2',          //中墩葫芦
  },
  SpecialType: {
    QiangJi:'daqiang3',            //打枪枪声
    QuanLeiDa:'special1',          //全垒打
    SanTongHua:'special2',         //三同花
    SanShunZi:'special3',          //三顺子
    LiuDuiBan:'special4',          //六对半
    WuDuiSanTiao:'special5',       //五对三条
    SiTaoSanTiao:'special6',       //四套三条
    CouYiSe:'special7',            //凑一色
    QuanXiao:'special8',           //全小
    QuanDa:'special9',             //全大
    SanFenTianXia:'special10',     //三分天下
    SanTongHuaShun:'special11',    //三同花顺
    ShiErHuangZu:'special12',      //十二皇族
    YiTianLong:'special13',        //一条龙
    ZhiZunQingLong:'special14',    //至尊青龙
  },
};