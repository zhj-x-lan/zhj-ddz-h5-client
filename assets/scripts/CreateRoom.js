cc.Class({
    extends: cc.Component,

    properties: {
        gamelist: null,

        currentGame: {
            default: null,
            type: cc.Node
        },
    },

    onLoad: function () {
        console.log('【1*---==================加载CreateRoom.js】');

         // 底分
        this._difen = this.currentGame.getChildByName('difen');
        this.dfNum = this._difen.getChildByName('num').getComponent(cc.Label);

        this._add = this._difen.getChildByName('add');
        this._sub = this._difen.getChildByName('sub');
        cc.vv.utils.addClickEvent(this._add, this.node, 'CreateRoom', 'onBtnDifenClicked');
        cc.vv.utils.addClickEvent(this._sub, this.node, 'CreateRoom', 'onBtnDifenClicked');

        // 局数
        this._jushu = this.currentGame.getChildByName('jushu');
        for (let i = 0; i < this._jushu.childrenCount; i++) {
            var n = this._jushu.children[i];
            if (n.name == 'RadioButton') {
                n.setTag('j' + i);
                cc.vv.utils.addToggleEvent(n.getComponent(cc.Toggle), this.node, 'CreateRoom', 'onToggleClicked');
            }
        }

        // 玩法
        this._wanfa = this.currentGame.getChildByName('wanfa');
        for (let i = 0; i < this._wanfa.childrenCount; i++) {
            var n = this._wanfa.children[i];
            if (n.name == 'RadioButton') {
                n.setTag('w' + i);
                cc.vv.utils.addToggleEvent(n.getComponent(cc.Toggle), this.node, 'CreateRoom', 'onToggleClicked');
            }
        }

        // 人数
        this._renshu = this.currentGame.getChildByName('renshu');
        for (let i = 0; i < this._renshu.childrenCount; i++) {
            var n = this._renshu.children[i];
            if (n.name == 'RadioButton') {
                n.setTag('r' + i);
                cc.vv.utils.addToggleEvent(n.getComponent(cc.Toggle), this.node, 'CreateRoom', 'onToggleClicked');
            }
        }

        // 均摊
        this._juntan = this.currentGame.getChildByName('juntan');
        this._juntan.on('toggle', this.onCheckboxClicked, this);

        var vip = this.currentGame.getChildByName('vip');
        // 视频防作弊
        this._cheat = vip.getChildByName('cheat');
        this._cheat.on('toggle', this.onCheckboxClicked, this);

        // 相邻玩家禁止加入
        this._near = vip.getChildByName('near');
        this._near.on('toggle', this.onCheckboxClicked, this);

        this.initRule();
    },

    initRule: function () {
        //默认 扣点
        this.gameType = 100002;
        
        //默认 底分1
        this.dfNum.string = 1;
        //默认 局数8
        this.kFlag = 1;
        //默认 无耗子
        this.arrPlayType = [4, 5];
        //默认 4人开局 
        this.kaijuMode = 0;
        //默认 不分摊房费
        this.kFeeType == 0;
        //防作弊 相邻禁止加入 默认关闭
        this.cheatAgainst = 0;
        this.nearAgainst = 0;
    },

    onBtnBack: function () {
        this.node.active = false;
    },

    onBtnOK: function () {
        this.node.active = false;
        this.createRoom();
    },

    createRoom: function () {
        var conf = this.createConf();

        console.warn('当前创建的房间规则为: ===============');
        console.warn(conf);

        cc.vv.gameMgr.createRoom(conf);
    },

    onToggleClicked: function (event) {
        var tagName = event.target.tag;

        var type = tagName.substring(0, 1);
        var num = Number(tagName.substring(1, 2));

        //房间类型，1-8圈，2 16圈
        if (type == 'j') {
            if (num == 0) {
                this.kFlag == 1;
            } else if (num == 1) {
                this.kFlag == 2;
            }
            return;
        }

        if (type == 'w') {
            this.arrPlayType = [];
            switch (num) {
                case 1:
                    console.warn('============================ 0');
                    this.arrPlayType.push(4);
                    this.arrPlayType.push(5);
                    break;
                case 2:
                    console.warn('============================ 1');
                    this.arrPlayType.push(6);
                    break;
                case 3:
                    console.warn('============================ 2');
                    this.arrPlayType.push(49);
                    break;
                case 4:
                    console.warn('============================ 3');
                    this.arrPlayType.push(45);
                    break;
            }

            return;
        }

        console.warn(event.target.isChecked);
        if (tagName == 'juntan') {
            
        }

    },

    onBtnDifenClicked: function (event) {
        console.warn(event.target.name);
        var opt = event.target.name;
        var num = Number(this.dfNum.string);
       
        if (opt == 'add') {
            if (num < 5) {
                this.dfNum.string = ++num;
            }
        } else if (opt == 'sub') {
            if (num > 1) {
                this.dfNum.string = --num;
            }
        }
    },

    onCheckboxClicked: function (event) {
        var name = event.detail.node.name;
        var state = event.detail.isChecked;
       
        if (state) {
            switch (name) {
                case 'juntan':
                    this.kFeeType == 1;
                    break;
                case 'cheat':
                    this.cheatAgainst == 1;
                    break;
                case 'near':
                    this.nearAgainst == 1;
                    break;
            }
        }
    },

    createConf: function () {
        console.warn('进入房间前, 追加默认的基本玩法类型: ====> ');
        this.arrPlayType.push(1);       //  自摸加底
        this.arrPlayType.push(2);       //  自摸加番
        this.arrPlayType.push(8);       //  抢杠胡
        this.arrPlayType.push(18);      //  暗杠可见
        this.arrPlayType.push(1002);    //  大胡 

        console.warn(this.arrPlayType);

        /** 测试动态开局 */
        //this.kaijuMode == 1;

        //临时代码: 2人扣点比赛
        var gameType = 100012;  //游戏类型 2人扣点 断线重连时,此方法不会调用.playNum默认为0
        if (gameType == 100012) {
            cc.vv.gameMgr.playerNum = 2;
        }

        var self = this;
        var conf = {
            'kMId': 61012,
            "kFlag": self.kFlag,             //房间类型，1-8圈，2 16圈
            "kCellscore": Number(self.dfNum.string),        //底分
            "kCheatAgainst": self.cheatAgainst,     // 是否防作弊，0:不防作弊 1：防作弊
            "kFeeType": self.kFeeType,          //费用类型 ，0:房主付费 1:玩家分摊
            "kGold": 1,             //房间抵住，单位元，最低为1元，最多不能超过100
            "kGpsLimit": 0,         // GPS限制:0,1
            "kGpsLng": "1",         // 经度
            "kGpsLat": "1",         // 纬度
            "kGreater2CanStart": self.kaijuMode, //>2可以开局
            "kHaoZiCardValue": {
            },
            /* "kPlayType": {          //玩法: 1-自摸加底 2-自摸加番
                1: 1,
                2: 2,
                3: 18,
                4: 10002,
                6: 随机
                49: 风
                45: 双
            }, */


            //1: '报听',
            //2: '带风',
            //8: '抢杠胡',
            //18: '暗杠可见',
            //45: '双耗子',
            //49: '风耗子',
            //1002: '大胡',

            //同时传45
            'kPlayType': self.arrPlayType,
            "kSecret": "123456",        //房间密码，如果为空，服务器会随机一个密码
            //"kState": self.gameType //4人扣点  //玩法规则: 0 转转  1  长沙  101-血战到底  102-血流成河
            "kState":gameType
            //动态开局,kState和4人的一样 只是通过startB 
        };
        return conf;
    },

    update: function (dt) {
        /* var type = this.getType();
        if (this.lastType != type) {
            this.lastType = type;
            for (var i = 0; i < this._gamelist.childrenCount; ++i) {
                this._gamelist.children[i].active = false;
            }

            var game = this._gamelist.getChildByName(type);
            if (game) {
                game.active = true;
            }
            this._currentGame = game;
        } */
    },
});