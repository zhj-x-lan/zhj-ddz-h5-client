var shopConfig = require('shopConfig');
var gameDefine = require('gameDefine');
var shopHandler = require('shopHandler');
cc.Class({
    extends: cc.Component,

    properties: {
        clickBtns: {
            default: [],
            type: [cc.Node]
        },
        panelViews: {
            default: [],
            type: [cc.Node]
        },

        jifenStr: cc.Label,
        coinStr: cc.Label,
        commodityPrefab: cc.Prefab,

        jifenScollView: cc.ScrollView,
        coinScollView: cc.ScrollView,
    },
    onLoad: function () {
        this.initGoodsType();
        registEvent('onCardChange', this, this.showNumber);
    },
    onEnable: function () {
        this.showPanel(2);
        this.showNumber();
    },
    onDestroy: function () {
        unregistEvent('onCardChange', this, this.showNumber);
    },
    clickShowView: function (evt) {
        this.showPanel(evt.target.name.split('_')[1]);
    },
    showPanel: function (index) {
        for (var i = 0; i < this.clickBtns.length; i++) {
            var btnNode = this.clickBtns[i];
            var btn = btnNode.getComponent(cc.Button);
            var tname = 'btn_' + index;
            if (btnNode.name == tname) {
                btn.interactable = false;
            } else {
                btn.interactable = true;
            }
        }
        this.showView(index);
    },
    showView: function (index) {
        for (var i = 0; i < this.panelViews.length; i++) {
            var viewNode = this.panelViews[i];
            // var view = viewNode.getComponent(cc.Button);
            var vname = 'View_' + index;
            if (viewNode.name == vname) {
                viewNode.active = true;
            } else {
                viewNode.active = false;
            }
        }
    },
    initGoodsType: function () {
        for (var key in shopConfig) {
            var data = shopConfig[key];
            if (data.costType) {
                if (data.costType == gameDefine.shopCostType.Shop_Cost_Point) {
                    var jifenPrefsb = cc.instantiate(this.commodityPrefab);
                    this.jifenScollView.content.addChild(jifenPrefsb);

                    jifenPrefsb.getComponent('goodsType').getButtonId(key);
                    jifenPrefsb.getComponent('goodsType').initUI(data);

                    var childLen = this.jifenScollView.content.childrenCount - 1;
                    jifenPrefsb.x = -354 + childLen % 4*230;
                    jifenPrefsb.y = -98 - parseInt(childLen/4)*197;
                    this.jifenScollView.content.height = parseInt(this.jifenScollView.content.childrenCount/4)*197;
                    
                }else if (data.costType == gameDefine.shopCostType.Shop_Cost_Card) {
                    var coinPrefsb = cc.instantiate(this.commodityPrefab);
                    this.coinScollView.content.addChild(coinPrefsb);

                    coinPrefsb.getComponent('goodsType').getButtonId(key);
                    coinPrefsb.getComponent('goodsType').initUI(data);

                    var childLen = this.coinScollView.content.childrenCount - 1;
                    coinPrefsb.x = -354 + childLen % 4*230;
                    coinPrefsb.y = -98 - parseInt(childLen/4)*197;
                    this.coinScollView.content.height = parseInt(this.coinScollView.content.childrenCount/4)*197;
                }
            }
        }
    },
    showNumber: function () {
        var jifenNum = 0;
        var coinNum = 0;
        if (GameData.player.point) {
            jifenNum = GameData.player.point;
        }
        if (GameData.player.coin) {
            coinNum = GameData.player.coin;
        }
        this.jifenStr.getComponent(cc.Label).string = jifenNum;
        this.coinStr.getComponent(cc.Label).string = coinNum;
    },

    closeNode: function () {
        closeView(this.node.name);
    },
});
