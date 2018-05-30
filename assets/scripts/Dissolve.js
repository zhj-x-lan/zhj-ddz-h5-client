cc.Class({
    extends: cc.Component,

    properties: {
        lblNum: cc.Label,       //倒计时label
        lblTip: cc.Label,       //提示label
        ndeContent: cc.Node,    //显示内容节点


        _time: -1, //倒计时的初始时间
        _arrPlayers: [],    //玩家节点数组
        _arrNames: [],      //玩家名字
        _arrResults: [],    //解散态度
        _mapTips: null        //提示map
    },

    onLoad: function () {
        this.btn_agree = this.node.getChildByName('btn_agree');
        this.btn_reject = this.node.getChildByName('btn_reject');
        this.btn_ok = this.node.getChildByName('btn_ok');
        this.addClickEvent(this.btn_agree);
        this.addClickEvent(this.btn_reject);
        this.addClickEvent(this.btn_ok);

        var list = this.ndeContent.getChildByName('list');
        for (let i = 0; i < list.childrenCount; i++) {
            var s = list.children[i];
            s.active = false;
            this._arrPlayers.push(s);
            this._arrNames.push(s.getChildByName('name').getComponent(cc.Label));
            this._arrResults.push(s.getChildByName('vote').getComponent(cc.Label));
        }

        this.initView();

        this.initEventHandlers();

        this._mapTips = {};
        this._mapTips[-1] = ''; //默认不显示
        this._mapTips[0] = '有人拒绝,解散房间失败'; // 0 解散失败
        this._mapTips[1] = '游戏未开始,房主直接解散';
        this._mapTips[2] = '全部同意,解散成功';
        this._mapTips[3] = '操作超时，解散房间';

    },

    initView: function () {

    },

    show: function (disData) {
        console.error('解散数据面板显示 ===========================');
        console.error(disData);

        var errCode = disData.errCode;

        this._time = disData.time;

        if (errCode == 0) {
           
            var arrVotes = disData.arrVotes;
            console.error(arrVotes);

            //首先显示玩家节点
            for (let i = 0; i < cc.vv.gameMgr.playerNum; i++) {
                this._arrPlayers[i].active = true;
            }

            for (let i = 0; i < arrVotes.length; i++) {
                this._arrNames[i].string = arrVotes[i].name;
                let result = this._arrResults[i].string;
                let voted = false;
                switch (arrVotes[i].vote) {
                    case 1:
                        result = '[已同意]';
                        voted = true;
                        break;
                    case 0:
                        result = '[已拒绝]';
                        voted = true;
                        break;
                    case -1:
                        result = '[待确认]';
                        break;
                }
                this._arrResults[i].string = result;

                if (cc.vv.gameMgr.seatIndex == arrVotes[i].index) {
                    this.btn_agree.active = !voted;
                    this.btn_reject.active = !voted;
                }
            }
        }

        if (errCode != 0) {
             //更新label
             for (let i = 0; i < this.lblTip.node.childrenCount; i++) {
                this.lblTip.node.children[i].active = false;
            }
            this.lblTip.string = this._mapTips[disData.tag];
        }

        if (errCode == 1) {   //游戏未开始,直接解散
           
            //此时自己同意、拒绝都没必要显示
            this.btn_agree.active = false;
            this.btn_reject.active = false;
            this.btn_ok.active = true;
        }

        if (errCode == 2) {
            var arrVotes = disData.arrVotes;
            //首先显示玩家节点
            for (let i = 0; i < cc.vv.gameMgr.playerNum; i++) {
                this._arrPlayers[i].active = true;
            }

            for (let i = 0; i < arrVotes.length; i++) {
                this._arrNames[i].string = arrVotes[i].name;
                this._arrResults[i].string = '[已同意]';
            }
            this.btn_agree.active = false;
            this.btn_reject.active = false;
        }

        if (errCode == 3) {
            var arrVotes = disData.arrVotes;
            //首先显示玩家节点
            for (let i = 0; i < cc.vv.gameMgr.playerNum; i++) {
                this._arrPlayers[i].active = true;
            }

            for (let i = 0; i < arrVotes.length; i++) {
                this._arrNames[i].string = arrVotes[i].name;
                let result = this._arrResults[i].string;
                let voted = false;
                switch (arrVotes[i].vote) {
                    case 1:
                        result = '[已同意]';
                        voted = true;
                        break;
                    case 0:
                        result = '[已拒绝]';
                        voted = true;
                        break;
                    case -1:
                        result = '[待确认]';
                        break;
                }
                this._arrResults[i].string = result;
            }
            this.btn_agree.active = false;
            this.btn_reject.active = false;
        }

        if (errCode == 4) {
            var arrVotes = disData.arrVotes;
            //首先显示玩家节点
            for (let i = 0; i < cc.vv.gameMgr.playerNum; i++) {
                this._arrPlayers[i].active = true;
            }

            for (let i = 0; i < arrVotes.length; i++) {
                this._arrNames[i].string = arrVotes[i].name;
                let result = this._arrResults[i].string;
                let voted = false;
                switch (arrVotes[i].vote) {
                    case 1:
                        result = '[已同意]';
                        voted = true;
                        break;
                    case 0:
                        result = '[已拒绝]';
                        voted = true;
                        break;
                    case -1:
                        result = '[待确认]';
                        break;
                }
                this._arrResults[i].string = result;

                if (cc.vv.gameMgr.seatIndex == i) {
                    this.btn_agree.active = !voted;
                    this.btn_reject.active = !voted;
                }
            }
        }

        if (errCode != 0) {
            setTimeout(() => {
                this.node.destroy();
            }, 2000);
        }
    },

    initEventHandlers: function () {
        var self = this;
        cc.vv.dispatcher.on('61019', function (msgTbl) {
            
          
            var arrAgrees = msgTbl.kAgreeUserId;
            var arrWaits = msgTbl.kWaitUserId;
        });
    },

    updateDesicions: function (msgTbl, type) {


    },

    addClickEvent: function (btnOper) {
        cc.vv.utils.addClickEvent(btnOper, this.node, 'Dissolve', 'onDecBtnClicked');
    },

    onDecBtnClicked: function (event) {
        var btnName = event.target.name;
        switch (btnName) {
            case 'btn_agree':
                console.error('btn_agree');
                var data = {
                    'kFlag': 1
                };
                cc.vv.gameMgr.dispress_device_push(data.kFlag);
                break;
            case 'btn_reject':
                console.error('btn_reject');
                var data = {
                    'kFlag': 2
                };
                cc.vv.gameMgr.dispress_device_push(data.kFlag);
                break;
            case 'btn_ok':
                console.error('btn_agree');
                break;
        }
    },

    update: function (dt) {
        if (this._time > 0) {
            this._time -= dt;

            var pre = '';
            if (this._time < 0) {
                this._time = 0;
            }

            var t = Math.ceil(this._time);
            if (t < 10) {
                pre = "00";
            } else if (t < 100) {
                pre = '0';
            }
            this.lblNum.string = pre + t;
        }
    },

    onDestroy: function () {
        
    },
});
