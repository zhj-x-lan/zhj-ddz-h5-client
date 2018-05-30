var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        tabBtns: {
            default: [],
            type: [cc.Node]
        },

        targetPos: {
            default: [],
            type: [cc.Node]
        },

        scrollView: cc.ScrollView,
        content: cc.Node,
        _originalY: 0,
        richText1: cc.Node,
        richText2: cc.Node,
        richText3: cc.Node,
        richText4: cc.Node,
    },
    onLoad: function () {

        this._originalY = this.content.y;
    },
    onEnable: function () {
        this.refreshUI();
        this.gotoContent(1);
        if (gameDefine.ruleType.isRuleType) {
            this.gotoRuleContent();
        }
    },
    clickTabHandler: function (evt) {
        this.gotoContent(evt.target.name.split('_')[1]);
    },

    gotoContent: function (index) {
        for (var i = 0; i < this.tabBtns.length; i++) {
            var btnNode = this.tabBtns[i];
            var btn = btnNode.getComponent(cc.Button);
            var tname = 'btn_' + index;
            if (btnNode.name == tname) {
                btn.interactable = false;
            } else {
                btn.interactable = true;
            }
        }
        this.scrollView.scrollToOffset(cc.p(0, -this.targetPos[index - 1].y), 0.1);
    },
    gotoRuleContent: function () {
        for (var i = 0; i < this.tabBtns.length; i++) {
            var btnNode = this.tabBtns[i];
            var btn = btnNode.getComponent(cc.Button);
            var tname = 'btn_' + gameDefine.ruleType.type;
            if (btnNode.name == tname) {
                btn.interactable = false;
            } else {
                btn.interactable = true;
            }
        }
        this.scrollView.scrollToOffset(cc.p(0, -this.targetPos[gameDefine.ruleType.type - 1].y + gameDefine.ruleType.py), 0.1);
    },
    refreshUI: function () {
        var bool = true;

        console.log('bool ' + bool);
        this.richText1.active = bool;
        this.richText2.active = bool;
        this.richText3.active = bool;
        this.richText4.active = bool;
    },

    onClose: function (evt) {
        closeView(this.node.name);
        gameDefine.ruleType.isRuleType = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});