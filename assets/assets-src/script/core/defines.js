
var ActionType = {
  obtain: 'obtain',
  discard: 'discard',
  peng: 'peng',
  minggang: 'minggang',
  minggangself: 'minggangself',
  angang: 'angang',
  hu: 'hu',
  chi: 'chi'
};

var GangType = {
    Gang_Ming: 1, //明杠
    Gang_An: 2, //暗杠
    Gang_Bu: 3, //补杠
};

var YoujinType = {
  An1: 1,  //暗游1
  An2: 2,  //暗游2
  An3: 3,  //暗游3
  Ming: 10, //明游
};
var HuaDian = {
    OPERATION:{ //操作类型
        OPERATION_PASS:-1,//过
        OPERATION_PENG :1,//碰
        OPERATION_GONGGANG:2,//公杠
        OPERATION_ANGANG:3,//暗杠
        OPERATION_MINGGANG:4,//明杠
        OPERATION_CHI: 5,//吃
        OPERATION_DIANPAO_HU :7,//点炮胡
        OPERATION_HU :8,//胡
        OPERATION_QIANGGANG_HU:9,//抢杠胡
        OPERATION_TING: 10,//听
        OPERATION_CHI_TING:11,//吃听
        OPERATION_PENG_TING:12,//碰听
        OPERATION_GONGGANG_TING:13,//公杠听
        OPERATION_ANGANG_TING:14,//暗杠听
        OPERATION_MINGGANG_TING:15,//明杠听
        OPERATION_SHOWCARD:20, //出牌
        OPERATION_ASSIGNED:30, //摸牌
        OPERATION_HUANBAO:31, //换宝
        OPERATION_FENZHANG:32, //分张
        OPERATION_BAO_ANGANG:33,//宝暗杠
        OPERATION_BAO_MINGGANG:34,//宝明杠
        OPERATION_XUAN_FENG_GANG: 35, // 旋风杠
        OPERATION_XI_GANG: 36,  // 囍杠
        OPERATION_YAO_GANG: 37, // 幺杠
        OPERATION_JIU_GANG: 38, // 九杠
        OPERATION_BU_XUAN_FENG_GANG: 39,  // 补风杠
        OPERATION_BU_XI_GANG: 40,  //补囍杠
        OPERATION_BU_YAO_GANG: 41,  //补幺杠
        OPERATION_BU_JIU_GANG: 42  //补九杠

    },
    WINTYPE:{
        NONE:0,//
        DIANPAOWIN:1,//点炮胡
        DIANPAOLOSE:2,//炮手
        ZIMO:3, //自摸
        LIUJU:4  //流局
    },
    ErrorCode:{
        DINGBAOFAIL:301//'定宝牌库没牌了'
    },
    RunStateEmnum:{
        PIAO:1, //飘
        BEGIN:2,//开始
        END:3//结束
    }
}

//不要在这个文件里加定义了
//新的玩法相关定义到玩法文件夹里
//新的公共类型定义到config/gameDefine.js里