var mahjongSprites = [];
var mjMap = {}; //用于spName --> id(索引)的快速索引
var MjMgr = cc.Class({
    extends: cc.Component,

    properties: {
        leftAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        rightAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        bottomAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        bottomFoldAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        pengPrefabSelf: {
            default: null,
            type: cc.Prefab
        },

        pengPrefabLeft: {
            default: null,
            type: cc.Prefab
        },

        tingPrefab: {
            default: null,
            type: cc.Prefab
        },

        //麻将背面牌,由于扣牌
        emptyAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        holdsEmpty: {
            default: [],
            type: [cc.SpriteFrame]
        },



        _sides: null,
        _pres: null,
        _foldPres: null,
        mjMap: null,
    },

    onLoad: function () {
        if (cc.vv == null) {
            return;
        }
        console.log('测试加载^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^MahjongMgr.js=====================');
        this._sides = ["myself", "right", "up", "left"];
        this._pres = ["M_", "R_", "B_", "L_"];
        this._foldPres = ["B_", "R_", "B_", "L_"];
        cc.vv.mahjongmgr = this;

        if (mahjongSprites.length > 0) {
            mahjongSprites = [];
        }
        //万
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("character_" + i);
        }
        //筒
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("dot_" + i);
        }
        //条
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("bamboo_" + i);
        }
        //东南西北风
        mahjongSprites.push("wind_east");
        mahjongSprites.push("wind_south");
        mahjongSprites.push("wind_west");
        mahjongSprites.push("wind_north");
        //中、发
        mahjongSprites.push("red");
        mahjongSprites.push("green");
        mahjongSprites.push("white");

        for (let i = 0; i < mahjongSprites.length; i++) {
            mjMap[mahjongSprites[i]] = i;
        }
    },

    init: function () {
        console.log('测试init调用---------------------');

        this._sides = ["myself", "right", "up", "left"];
        this._pres = ["M_", "R_", "B_", "L_"];
        this._foldPres = ["B_", "R_", "B_", "L_"];
        cc.vv.mahjongmgr = this;

        if (mahjongSprites.length > 0) {
            mahjongSprites = [];
        }
        //万
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("character_" + i);
        }
        //筒
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("dot_" + i);
        }
        //条
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("bamboo_" + i);
        }
        //东南西北风
        mahjongSprites.push("wind_east");
        mahjongSprites.push("wind_south");
        mahjongSprites.push("wind_west");
        mahjongSprites.push("wind_north");
        //中、发
        mahjongSprites.push("red");
        mahjongSprites.push("green");
        mahjongSprites.push("white");

        for (let i = 0; i < mahjongSprites.length; i++) {
            mjMap[mahjongSprites[i]] = i;
        }


        /*     //万
            for (var i = 1; i < 10; ++i) {
                mahjongSprites.push("character_" + i);
            }
            //筒
            for (var i = 1; i < 10; ++i) {
                mahjongSprites.push("dot_" + i);
            }
            //条
            for (var i = 1; i < 10; ++i) {
                mahjongSprites.push("bamboo_" + i);
            }
            //东南西北风
            mahjongSprites.push("wind_east");
            mahjongSprites.push("wind_south");
            mahjongSprites.push("wind_west");
            mahjongSprites.push("wind_north");
            //中、发、白
            mahjongSprites.push("red");
            mahjongSprites.push("green");
            mahjongSprites.push("white");
            for (let i = 0; i < mahjongSprites.length; i++) {
                mjMap[mahjongSprites[i]] = i;
            } */

    },

    getMahjongSpriteByID: function (id) {  //数组索引id ===> 'character_1' ... dot_1 ... bamboo_9 wind_north
        return mahjongSprites[id];
    },

    getMahjongType: function (id) {    //数组索引id ===> 花色
        if (id >= 0 && id < 9) {
            return 0; //万
        }
        else if (id >= 9 && id < 18) {
            return 1; //筒
        }
        else if (id >= 18 && id < 27) {
            return 2; //条
        } else if (id >= 27 && id < 34) {
            return 3; //东南西北红中发财白板
        }
    },

    getSpriteFrameByMJID: function (pre, mjid) {
        //mjid:为索引 ==> character_x ..
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
        spriteFrameName = pre + spriteFrameName;
        if (pre == "M_") {
            return this.bottomAtlas.getSpriteFrame(spriteFrameName);
        }
        else if (pre == "B_") {
            return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
        }
        else if (pre == "L_") {
            return this.leftAtlas.getSpriteFrame(spriteFrameName);
        }
        else if (pre == "R_") {
            return this.rightAtlas.getSpriteFrame(spriteFrameName);
        }
    },

    getAudioURLByMJID: function (id) {
        var realId = 0;
        if (id >= 0 && id < 9) {    //万
            realId = id + 11;
        }
        else if (id >= 9 && id < 18) {  //筒
            realId = id + 12;
        }
        else if (id >= 18 && id < 27) { //条
            realId = id - 17;
        } else {
            switch (id) {
                case 27:    //东
                    realId = 31;
                    break;
                case 28:    //南
                    realId = 51;
                    break;
                case 29:    //西
                    realId = 41;
                    break;
                case 30:    //北
                    realId = 61;
                    break;
                case 31:    //中
                    realId = 71;
                    break;
                case 32:    //发
                    realId = 81;
                    break;
                case 33:    //白
                    realId = 91;
                    break;
            }
        }
        return "nv/" + realId + ".mp3";
    },
    /**
     * 1-9: 条1~9
     * 11-19: 万1~9
     * 21-29: 筒1~9
     * , , , , 71, 81, 91: 中发白 
     */
    getEmptySpriteFrame: function (side) {
        if (side == "up") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_up");
        }
        else if (side == "myself") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
        }
        else if (side == "left") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
        }
        else if (side == "right") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
        }
    },
    getEmptySpriteFrameById: function (id) {
        switch (id) {
            case -1:
                return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
                break;
            case -2:
                return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
                break;
            case -3:
                return this.emptyAtlas.getSpriteFrame("e_mj_b_up");
                break;
            case -4:
                return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
                break;
        }
    },

    getHoldsEmptySpriteFrame: function (side) {
        if (side == "up") {
            return this.emptyAtlas.getSpriteFrame("e_mj_up");
        }
        else if (side == "myself") {
            return null;
        }
        else if (side == "left") {
            return this.emptyAtlas.getSpriteFrame("e_mj_left");
        }
        else if (side == "right") {
            return this.emptyAtlas.getSpriteFrame("e_mj_right");
        }
    },

    sortMJ: function (mahjongs) {
        console.warn('即将排序的数组为: ------------------>>>>>>>>>>>>>');
        console.warn(mahjongs);
        var self = this;
        mahjongs.sort(function (a, b) {
            return a - b;
        });
        console.log('<关注下>');
        return mahjongs;
    },

    getSide: function (localIndex) {
        return this._sides[localIndex];
    },

    getPre: function (localIndex) {
        return this._pres[localIndex];
    },

    getFoldPre: function (localIndex) {
        return this._foldPres[localIndex];
    },

    createTingItem: function (id, num) {
        var mjNode = cc.instantiate(this.tingPrefab);
        mjNode.anchorX = 0;
        mjNode.anchorY = 1;
        var numLabel = mjNode.getChildByName('num').getComponent(cc.Label);
        numLabel.string = num;
        var cardSpr = mjNode.getChildByName('card').getComponent(cc.Sprite);
        cardSpr.spriteFrame = this.getSpriteFrameByMJID('M_', id);
        return mjNode;
    },

    //用于显示牌转换(数组)
    converArr2Ids: function (MJArr) {
        if (mahjongSprites.length == 0) {
            this.init();
        }
        //character_ dot_ bamboo_
        var map = {
            '11': 'character_1',
            '12': 'character_2',
            '13': 'character_3',
            '14': 'character_4',
            '15': 'character_5',
            '16': 'character_6',
            '17': 'character_7',
            '18': 'character_8',
            '19': 'character_9',

            '21': 'dot_1',
            '22': 'dot_2',
            '23': 'dot_3',
            '24': 'dot_4',
            '25': 'dot_5',
            '26': 'dot_6',
            '27': 'dot_7',
            '28': 'dot_8',
            '29': 'dot_9',

            '31': 'bamboo_1',
            '32': 'bamboo_2',
            '33': 'bamboo_3',
            '34': 'bamboo_4',
            '35': 'bamboo_5',
            '36': 'bamboo_6',
            '37': 'bamboo_7',
            '38': 'bamboo_8',
            '39': 'bamboo_9',

            '41': 'wind_east',
            '42': 'wind_south',
            '43': 'wind_west',
            '44': 'wind_north',
            '45': 'red',
            '46': 'green',
            '47': 'white',
        };
        var IdArr = []; //mj id索引数组
        for (let i = 0; i < MJArr.length; i++) {
            var name = '';
            var mj = MJArr[i];
            name = mj[0] + '' + mj[1];
            IdArr.push(mjMap[map[name]]);
        }
        return IdArr;
    },

    /** 花色color和数字num转麻将id */
    converDesc2Id: function (color, num) {
        return this.converArr2Ids([[color, num]])[0];
    },

    /** 数值value转麻将id  比如41转东方id: 27*/
    converVal2Id: function (val) {
        var color = Number(val.toString().substring(0, 1));
        var num = Number(val.toString().substring(1, 2));
        return this.converDesc2Id(color, num);
    },

    //用于麻将牌转换(color, number --> id)
    converPai2Id: function (color, number) {
        //var arr = [color, number];
    },

    //用于出牌转换
    converId2Arr: function (id) {
        var arr = [];
        if (id >= 0 && id < 34) {
            var type = this.getMahjongType(id) + 1; //1:万 2:筒 3:条 4:东南西北中发白
            arr.push(type);
            var spName = mahjongSprites[id];
            var num = -1;
            if (id < 27) {
                num = Number(spName.split('_')[1]);
            } else {
                let map = {
                    27: 1,
                    28: 2,
                    29: 3,
                    30: 4,
                    31: 5,
                    32: 6,
                    33: 7
                };
                num = map[id];
            }
            arr.push(num);
        } else {
            console.log('传入的id为: =============================' + id);
            console.log('麻将id不合法...');
        }
        return arr;
    },

});
