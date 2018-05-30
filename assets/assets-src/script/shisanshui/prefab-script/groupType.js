cc.Class({
    extends: cc.Component,

    properties: {
        groupType: cc.Node,
        cardType_1: cc.Node,
        cardType_2: cc.Node,
        cardType_3: cc.Node,
        id:0,
        selected:false,
    },

    // use this for initialization
    onLoad: function () {
        this.commendTypeUrl = {
            WuLong: 'wulong',       //乌龙
            DuiZi: 'duizi',        //对子
            LiangDui: 'lingdui',     //两对
            SanTiao: 'santiao',      //三条
            ShunZi: 'shunzi',       //顺子
            TongHua: 'tonghua',      //同花
            HuLu: 'hulu',         //葫芦
            TieZhi: 'tiezhi',       //铁支
            TongHuaShun: 'tonghuasun',  //同花顺
            WuTong: 'wutong'       //五同
        }
    },

    showRecommend: function(commend) {
        this.commendType = [];
        this.commendType = commend[this.id];
        cc.log('commendType: ', JSON.stringify(this.commendType));
        var url = "resources/shisanshui/tableUI/selectCardType/";
        for (var i = 0; i < this.commendType.length; i++) {
            for (var _type in CommonType) {
                if (CommonType[_type].id == this.commendType[i].type) {
                    var cardType = cc.find('cardType_'+(3 - i), this.groupType);
                    var texture = cc.textureCache.addImage(cc.url.raw(url+this.commendTypeUrl[_type]+'.png'));
                    cardType.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                    break;
                }
            }
        }
    },

    showRecommendCard: function() {
        WriteLog('showRecommendCard');
        
        var content = this.groupType.parent;
        var view = content.parent;
        var scrollView = view.parent;
        var cardGroup = scrollView.parent;
        var poker = cardGroup.parent;
        var neatenNode = poker.parent;
        var cardType = cc.find('cardType', poker);
        //重置牌
        var resetCard = function(cardRow, row) {
            var cardRowNode = cc.find(cardRow, cardType);
            if (cardPoker13[row].length > 0) {
                neatenNode.parent.getComponent('SSSRoomTable').setResetCard(cardRowNode, row);
            }
        }
        //理牌
        var cards_row = function(cards, length, cardRow, row) {
            cc.log('cards: ', JSON.stringify(cards));
            var cardRowNode = cc.find(cardRow, cardType);
            if (cardPoker13[row].length <= 0) {
                neatenNode.parent.getComponent('SSSRoomTable').setCheckedCards(cards);
                neatenNode.parent.getComponent('SSSRoomTable').showCardRow(row, cardRowNode, length);
            }
        }
        resetCard('upCardNode', 'up');
        resetCard('midCardNode', 'mid');
        resetCard('downCardNode', 'down');
        cards_row(this.commendType[0].cards, 5, 'downCardNode', 'down');
        cards_row(this.commendType[1].cards, 5, 'midCardNode', 'mid');
        cards_row(this.commendType[2].cards, 3, 'upCardNode', 'up');
    },

    onGroupBtnCliked: function() {
        console.log('group id: ', this.id);
        var space = 50; //两个groupType的间距
        var distance = this.groupType.getContentSize().width + space; //两个groupType锚点的距离
        this.selected = true;
        var contentNode = this.groupType.parent;
        var viewNode = contentNode.parent;
        var scrollViewNode = viewNode.parent;
        var scrollView = scrollViewNode.getComponent(cc.ScrollView);
        var time = 0.1;
        var actionTo = cc.moveTo(time, cc.p(0-distance*this.id, scrollView.getContentPosition().y));
        contentNode.runAction(actionTo);

        //点亮边框
        var twinkle = cc.find('twinkle', this.groupType);
        twinkle.active = true;
        cc.log('onGroupBtnClied event: ', scrollView.getContentPosition());
        
        //基础牌型理牌
        this.showRecommendCard();
    }    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
