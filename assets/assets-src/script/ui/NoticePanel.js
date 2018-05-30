cc.Class({
    extends: cc.Component,
    properties: {
        //页签 活动，公告
        hdBtn: cc.Node,
        hdLb: cc.Node,
        ggBtn: cc.Node,
        ggLb: cc.Node,

        hdScrollNode: cc.Node,
        hdBtnScrollNode: cc.Node,
        ggScrollNode: cc.Node,
        ggBtnScrollNode: cc.Node,

        hdBtnItem: cc.Node,
        ggBtnItem: cc.Node,
        toptitle: cc.Label,
        redPoint: cc.Node,

        //活动相关panel 0 绑定代理 1 补全用户资料
        activeArry: {
            default: [],
            type: [cc.Prefab]
        },
        //公告相关panel 0系统公告 1...
        GgArry: {
            default: [],
            type: [cc.Prefab]
        },
        //活动、公告存储数据的数量
        HdContentArry: [],
        GgContentArry: [],
        HdBtnsArry: [],
        GgBtnsArry: [],
        hdCurrIndex: 1,
        GgCurrIndex: 1,
    },
    onLoad: function () {
        this.initData();
        this.initUI();
        this.registerListener();
    },
    initData: function () {
        this.HdContentArry = [];
        this.GgContentArry = [];
        this.HdBtnsArry = [];
        this.GgBtnsArry = [];
        this.hdCurrIndex = 1;
        this.GgCurrIndex = 1;
        this.topHdTitle = ["绑定代理", '资料补全'];
        this.topGgTitle = ['公告'];
    },
    initUI: function () {

        //初始化活动ui
        this.initHdUI();
        //初始化公告ui
        this.initGgUI();
    },
    registerListener: function () {
        registEvent('closeAgentBind', this, this.closeAgentBind);
    },
    onDestroy: function () {
        unregistEvent('closeAgentBind', this, this.closeAgentBind);
    },
    initHdUI: function () {
        this.HdscrollContent = cc.find('view/content', this.hdScrollNode);
        //*********************初始化活动content************************//

        //绑定代理

        if (!GameData.player.agentFlag) {
            // this.changeTopTitle('绑定代理');
            // this.showHdAbout(true);
            // this.showGgAbout(false);
            var agentBindNode = cc.instantiate(this.activeArry[0]);
            agentBindNode.setTag(9999);
            this.HdscrollContent.addChild(agentBindNode);
            this.HdContentArry.push(agentBindNode);
        }
        // //资料补全
        // var playerInformationNode = cc.instantiate(this.activeArry[1]);
        // playerInformationNode.setTag(9998);
        // playerInformationNode.active = false;
        // this.HdscrollContent.addChild(playerInformationNode);
        // this.HdContentArry.push(playerInformationNode);
        //*********************初始化活动end************************//


        //**************************初始化活动的按钮***********************//
        for (var i = 0; i < this.HdContentArry.length; i++) {
            var item = cc.instantiate(this.hdBtnItem);
            item.active = true;
            item.parent = this.hdBtnItem.parent;
            item.name = 'btns' + (i + 2);
            item.setTag(i + 1);
            item.y = this.hdBtnItem.y - this.hdBtnItem.height * i;
            cc.log('item.y ' + item.y);
            cc.log('item.tag ' + item.tag);
            this.initSelectBtnsItem(item, (i + 1));
            this.HdBtnsArry.push(item);
        }
        //**************************初始化活动的按钮end***********************//
        if (this.HdContentArry.length == 0) {
            this.showDefaultData(1);
        }
    },
    initGgUI: function () {
        //this.HdscrollContent = cc.find('view/content',this.hdScrollNode);
        this.GgscrollContent = cc.find('view/content', this.ggScrollNode);
        var NoticeNode = cc.instantiate(this.GgArry[0]);
        this.GgscrollContent.addChild(NoticeNode);
        this.GgContentArry.push(NoticeNode);
    },
    initSelectBtnsItem: function (parent, i) {
        var btn1 = cc.find('btn1', parent);
        var btn2 = cc.find('btn2', parent);
        if (i == 2) {
            btn1.active = true;
            btn2.active = false;
        }
        btn1.setTag(i);
        btn1.on(cc.Node.EventType.TOUCH_END, this.selectHdBtnIndex, this);
    },
    //刷新ui界面 1 刷新活动ui 2刷新公告ui
    refreshUI: function (type) {
        if (this.selectPageType == 1) {
            // this.changeTopTitle('绑定代理');
            this.redPoint.active = false;
        } else {
            // this.changeTopTitle('公告');
        }
        console.log('type = ' + type);
        if (type == 1) {
            this.refreshHdUI();
        } else {
            this.refreshGgUI();
        }
    },
    refreshHdUI: function () {
        if (this.HdContentArry.length == 0) {
            this.showDefaultData(1);
        }
        //刷新活动左侧按钮
        for (var i = 0; i < this.HdBtnsArry.length; i++) {
            this.HdBtnsArry[i].y = this.hdBtnItem.y - this.hdBtnItem.height * i
            var btn1 = cc.find('btn1', this.HdBtnsArry[i]);
            var btn2 = cc.find('btn2', this.HdBtnsArry[i]);
            if (this.hdCurrIndex == this.HdBtnsArry[i].tag) {
                btn1.active = false;
                btn2.active = true;
            } else {
                btn1.active = true;
                btn2.active = false;
            }
        }
        //刷新活动内容
        for (var i = 0; i < this.HdContentArry.length; i++) {
            if (this.hdCurrIndex == i + 1) {
                this.HdContentArry[i].active = true;
            } else {
                this.HdContentArry[i].active = false;
            }
        }
        //刷新标题
        // this.changeTopTitle(this.topHdTitle[this.hdCurrIndex-1]);
    },
    refreshGgUI: function () {
        if (this.GgContentArry.length == 0) {
            this.showDefaultData(2);
        }
        if (this.HdContentArry.length > 0) {
            this.showRedPoint();
        }
    },
    selectUIType: function (eve, data) {
        //data 1:活动，2公告
        var flag = false;
        if (data == 1) {
            flag = true;
        }
        //刷新页签类型显示
        this.hdLb.active = flag;
        this.hdBtn.active = !flag;
        this.ggLb.active = !flag;
        this.ggBtn.active = flag;
        //刷新页签内容显示
        this.selectPageType = flag == true ? 1 : 2;
        this.showHdAbout(flag);
        this.showGgAbout(!flag);
        this.refreshUI(data);
    },
    selectHdBtnIndex: function (eve) {
        var index = eve.target.tag;
        this.hdCurrIndex = index;
        this.refreshHdUI();
    },
    //没有相关数据显示默认 1 活动 2 公告
    showDefaultData: function (type) {
        if (type == 1) {
            this.hdBtnItem.active = false;
            // this.changeTopTitle('暂无活动信息!');
        } else {
            this.ggBtnItem.active = false;
            // this.changeTopTitle('暂无公告信息!');
        }
    },
    //活动相关控件显隐
    showHdAbout: function (bool) {
        this.hdScrollNode.active = bool;
        this.hdBtnScrollNode.active = bool;
    },
    //公告相关控件显隐
    showGgAbout: function (bool) {
        this.ggScrollNode.active = bool;
        this.ggBtnScrollNode.active = bool;
    },
    changeTopTitle: function (str) {
        this.toptitle.string = str;
    },
    closeAgentBind: function () {
        this.HdscrollContent.removeChildByTag(9999, true);
        this.hdBtnItem.parent.removeChildByTag(1, true);
        this.HdContentArry.shift();
        this.HdBtnsArry.shift();
        this.hdCurrIndex = 1;
        this.refreshHdUI();
    },
    showRedPoint: function () {
        if (this.selectPageType == 1) return;
        this.redPoint.active = true;
    },
    close: function () {
        closeView(this.node.name);
    }
})