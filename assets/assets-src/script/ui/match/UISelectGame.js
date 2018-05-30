var gameDefine = require('gameDefine');
var matchHandler = require('matchHandler');
var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        pageView: cc.PageView,
        content: cc.Node,
        pageItem: cc.Node,
        btnItem: cc.Node,
        flag: cc.Node,
        flagItem: cc.Node,
        detail: cc.Node
    },

    onLoad: function () {
        this.initUIDetail();
        this.initPageContent();
    },

    initUIDetail: function(){
        this.detail.getComponent(cc.Label).string = "参与匹配获取积分";
    },
    initPageContent: function () {
        //移除所有子页面
        this.pageView.removeAllPages();
        this.content.removeAllChildren();

        var gameList = this.getOpenGameList();
        cc.log('..gameList:'+JSON.stringify(gameList));
        this.content.width = gameList.length * this.pageItem.width;

        var pageNumber = parseInt(gameList.length / 4);
        gameList.length % 4 > 0 ? pageNumber++ : null;

        for (var index = 0; index < pageNumber; index++) {
            var webNode = cc.instantiate(this.pageItem);
            this.pageView.addPage(webNode);

            webNode.active = true;
            webNode.position = cc.p(this.pageItem.x + index * this.pageItem.width, this.pageItem.y);

            this.initPageItem(webNode,gameList,index);
        }
        this.initPageFlag();
    },
    initPageItem: function(parent,list,index){
        if(parent == undefined){
            return;
        }
        for(var kk = 0;kk < parent.getChildrenCount();kk++){
            var child = parent.getChildren()[kk];
            if(child){
                child.active = false;
            }
        }

        var ii = index *4;
        var max = index *4 +4;

        var sur = list.length - max;
        sur < 0 ? max += sur : null;

        var interval = 0;
        var init_x = 0;
        var check = max - ii;
        if ( check % 2 > 0) {  //奇数
            init_x = 0- (parseInt(check / 2) * this.btnItem.width + parseInt(check / 2) * interval + this.btnItem.width / 2);
        } else {                   //偶数
            init_x = 0- (parseInt(check / 2) * this.btnItem.width + (parseInt(check / 2) - 1) * interval + interval / 2);
        }
        //节点锚点为0.5，所以设置位置时往右加半个节点宽度
        init_x += this.btnItem.width / 2;

        var name;
        var nodeIdx = 0;
        for(; ii < max; ii++ ){
            var gameType = list[ii];
            if(gameType == undefined){
                continue;
            }
            name = 'item'+nodeIdx;
            var ItemNode = parent.getChildByName(name);
            if(ItemNode == undefined){
                ItemNode = cc.instantiate(this.btnItem);
                ItemNode.parent = parent;
                ItemNode.name = name;
            }
            ItemNode.active = true;

            ItemNode.x = init_x + nodeIdx * (this.btnItem.width + interval);
            ItemNode.y = this.btnItem.y;

            var label = cc.find('label',ItemNode);
            label.getComponent(cc.Label).string = this.getGameNameByType(gameType);

            var limit = cc.find('limit',ItemNode);
            limit.getComponent(cc.Label).string = "进入条件："+ this.getGameLimitByType(gameType);

            var sprite = ItemNode.getComponent(cc.Sprite);
            this.loadItemSprite(sprite, gameType);

            ItemNode.tag = gameType;
            ItemNode.on(cc.Node.EventType.TOUCH_END, this.onSelectGameClick, this);

            nodeIdx++;
        }
    },
    loadItemSprite: function(sprite, gameType){

        var url = undefined;
        switch (gameType){
            case gameDefine.GameType.Game_Mj_Tianjin:
            case gameDefine.GameType.Game_Mj_Shishi:
            case gameDefine.GameType.Game_MJ_HuaDian:
            case gameDefine.GameType.Game_Mj_HZ:
            case gameDefine.GameType.Game_Mj_CC:
            case gameDefine.GameType.Game_Mj_Heb:{
                url = 'resources/home/match/majiang01.png';
            } break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ: {
                url = 'resources/home/match/doudizhu01.png';
            } break;
            case gameDefine.GameType.Game_Poker_DDZ: {
                url = 'resources/home/match/doudizhu01.png';
            } break;
            case gameDefine.GameType.Game_niu_niu: {
                url = 'resources/home/match/niuniu01.png';
            } break;
            case gameDefine.GameType.Game_TDK: {
                url = 'resources/home/match/tiandaken01.png';
            } break;
            case gameDefine.GameType.Game_Poker_13shui: {
                url = 'resources/home/match/shisanshui01.png';
            } break;
            case gameDefine.GameType.Game_Poker_paodekuai: {
                url = 'resources/home/match/paodekuaianniu01.png';
            } break;
        }
        if(url == undefined || sprite == undefined){
            return;
        }
        var texture = cc.textureCache.addImage(cc.url.raw(url));
        sprite.spriteFrame = new cc.SpriteFrame(texture);
    },
    initPageFlag: function () {
        //移除所有 flag 节点
        this.flag.removeAllChildren();

        var sum = this.pageView.getPages().length;
        var interval = 30;

        //计算出第一个 flag 的 x 轴位置
        var init_x = 0;
        if (sum % 2 > 0) {
            //奇数
            init_x = -(parseInt(sum / 2) * this.flagItem.width + parseInt(sum / 2) * interval + this.flagItem.width / 2);
        } else {
            //偶数
            init_x = -(parseInt(sum / 2) * this.flagItem.width + (parseInt(sum / 2) - 1) * interval + interval / 2);
        }
        for (var key = 0; key < sum; key++) {
            var flagItem;
            if (key == 0) {
                flagItem = this.flagItem;
            } else {
                flagItem = cc.instantiate(this.flagItem);
            }
            flagItem.name = "flag_" + key;
            this.flag.addChild(flagItem);

            flagItem.position = cc.p(init_x + key * (this.flagItem.width + interval), this.flagItem.y);
        }
        this.updatePageFlag();
    },
    updatePageFlag: function () {

        for (var key = 0; key < this.flag.getChildrenCount(); key++) {
            var node = this.flag.getChildren()[key];
            var click = node.getChildByName('click');
            click.active = false;
        }
        var index = this.pageView.getCurrentPageIndex();
        var name = "flag_" +index;
        var flagNode = this.flag.getChildByName(name);
        flagNode.getChildByName('click').active = true;
    },
    pageViewEvent: function () {
        this.updatePageFlag();
    },
    getOpenGameList: function(){
        var gameList = configMgr.getMatchGameType();
        if(gameList == undefined){
            return [];
        }
        return gameList;
    },
    getGameNameByType: function(type){
        var name = '';
        switch(type){
            case gameDefine.GameType.Game_Mj_Tianjin: {
                name = '天津麻将';
            } break;
            case gameDefine.GameType.Game_Mj_Shishi: {
                name = '石狮麻将';
            } break;
            case gameDefine.GameType.Game_MJ_HuaDian: {
                name = '桦甸麻将';
            } break;
            case gameDefine.GameType.Game_Mj_HZ: {
                name = '红中麻将';
            } break;
            case gameDefine.GameType.Game_Mj_CC: {
                name = '长春麻将';
            } break;
            case gameDefine.GameType.Game_Mj_Heb: {
                name = '哈尔滨麻将';
            } break;
            case gameDefine.GameType.Game_Poker_TianjinDDZ: {
                name = '天津斗地主';
            } break;
            case gameDefine.GameType.Game_Poker_DDZ: {
                name = '经典斗地主';
            } break;
            case gameDefine.GameType.Game_niu_niu: {
                name = '牛牛';
            } break;
            case gameDefine.GameType.Game_TDK: {
                name = '填大坑';
            } break;
            case gameDefine.GameType.Game_Poker_13shui: {
                name = '十三水';
            } break;
            case gameDefine.GameType.Game_Poker_paodekuai: {
                name = '跑得快';
            } break;
        }
        return name;
    },

    getGameLimitByType: function(type){
        var limit = '';

        var serverConfig = configMgr.getServerConfig();
        if(serverConfig == undefined || serverConfig.matchCoin == undefined){
            return limit;
        }

        var data = serverConfig.matchCoin[type];
        if(data == undefined || data.enter == undefined){
            return limit;
        }
        //限制条件暂取第一个
        limit = data.enter[0];
        return limit;
    },

    onSelectGameClick: function(event){
        if (inCD(1000)) {
            return;
        }
        var gameType = event.target.tag;
        cc.log("..gameType:"+gameType);
        matchHandler.signup(gameType);
    },

    onClose: function () {
        closeView(this.node.name);
    }
});