var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        debugNode: {
            default: null,
            type: cc.Node
        },
        editCards: cc.EditBox,
        cardInput: cc.EditBox,
        parents: {
            default: [],
            type: cc.Node
        },
        debugBtn : cc.Node,
        cardType: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        // this.node.getComponent('SSSRoomMain').showDebugLayer();

        var setCardsOpen = configMgr.getSetCardsOpen();
        this.debugBtn.active = setCardsOpen;
    },

    onClose: function() {
        this.node.getComponent('SSSRoomMain').showDebugLayer();
    },

    onSetCards: function() {
        var self = this;
        var str1 = this.editCards.string.split(',');
        cc.log('debug str: ', JSON.stringify(str1));
        var cards = [];
        for (var i=0; i<str1.length; i++) {
            if (i >= GameData13.handSize) break;
            // var str2 = str1[i].split('_');
            var type = parseInt(str1[i])%10;
            var value = Math.floor(parseInt(str1[i]) / 10);
            cards.push({type: type, value: value - 1});
            // cards.push({value: str2[0], type: str2[1]});
        }
        cc.log('debug cards: ', JSON.stringify(cards));
        if (cardPoker13.up.length > 0) {
            var node = cc.find('upCardNode', this.cardType);
            self.debugNode.parent.getComponent('SSSRoomTable').setResetCard(node, 'up');
        }
        if (cardPoker13.mid.length > 0) {
            var node = cc.find('midCardNode', this.cardType);
            self.debugNode.parent.getComponent('SSSRoomTable').setResetCard(node, 'mid');
        }
        if (cardPoker13.down.length > 0) {
            var node = cc.find('downCardNode', this.cardType);
            self.debugNode.parent.getComponent('SSSRoomTable').setResetCard(node, 'down');
        }
        if (cardPoker13.up.length <= 0 || cardPoker13.mid.length <= 0 || cardPoker13.down.length <= 0) {   
            GameNet.getInstance().request("game.debugHandler.setCards", {roomid: GameData.player.roomid, cards: cards}, function(rtn) {
                self.debugNode.parent.getComponent('SSSRoomTable').checkedRecommendManner();
                self.debugNode.parent.getComponent('SSSRoomTable').showSpecialType(GameData13.player.type);
                cc.log('debug rtn: ', JSON.stringify(rtn));
            });
        }else {
            cc.log('没有重置上面三墩的牌，不能设置测试牌');
        }
    },

    testAllCardShow : function()
    {
        // for(var i = 0; i < this.parents.length; i++)
        // {
        //     var parent = this.parents[i];
        //     if(parent.name != 'layer_down')
        //     {
        //         cc.find('cardHand',parent).active = false;
        //     }
        // }
        // var cardId = this.cardInput.string;
        // this.testHand(cardId);
        // this.testPeng(cardId);
        // this.testDis(cardId);
    },

    testHand : function(cardId)
    {
        // for(var i = 0; i < this.parents.length; i++)
        // {
        //     var parent = this.parents[i];
        //     if(parent.name == 'layer_down')
        //     {
        //        var cardHandParent = cc.find('cardHand',parent);
        //        for(var n = 0; n < cardHandParent.childrenCount; n++)
        //        {
        //             var cardHand = cardHandParent.getChildByName('cardHand' + n);
        //             this.showCardContent(cardHand,'mj_card_xia_shou',cardId);
        //        }
        //     }
        // }       
    },

    testDis : function(cardId)
    {
        // for(var i = 0; i < this.parents.length; i++)
        // {
        //     var parent = this.parents[i];   
        //     parent.active = true; 
        //     var cardDis = cc.find('cardDis',parent);
        //     for(var n = 0; n < cardDis.childrenCount; n++)
        //     {
        //         var disCard = cardDis.getChildByName('card_face' + (n+1));
        //         disCard.active = true;
        //         if(parent.name == 'layer_down')
        //         {
        //             this.showCardContent(disCard,'mj_card_xia_chu',cardId);
        //         }
        //         else if(parent.name == 'layer_right')
        //         {
        //             this.showCardContent(disCard,'mj_card_you_chu',cardId);
        //         }
        //         else if(parent.name == 'layer_left')
        //         {
        //             this.showCardContent(disCard,'mj_card_zuo_chu',cardId);
        //         }
        //         else if(parent.name == 'layer_up')
        //         {
        //             this.showCardContent(disCard,'mj_card_shang_chu',cardId);
        //         }
        //     }
        // }   
    },

    testPeng : function(cardId)
    {
        // for(var i = 0; i < this.parents.length; i++)
        // {
        //     var parent = this.parents[i];
        //     for(var n = 0; n < GameData.room.joinermax; n++)
        //     {
        //         var pengParent = cc.find('cardPeng/cardPeng' + (n+1),parent);
        //         pengParent.active = true;
        //         for(var m = 0; m < 4; m++)
        //         {
        //             var cardFace = pengParent.getChildByName('card_face' + (m+1));
        //             cardFace.active = true;
        //             if(parent.name == 'layer_down')
        //             {
        //                 this.showCardContent(cardFace,'mj_card_xia_peng',cardId);
        //             }
        //             else if(parent.name == 'layer_right')
        //             {
        //                 this.showCardContent(cardFace,'mj_card_you_peng',cardId);
        //             }
        //             else if(parent.name == 'layer_left')
        //             {
        //                 this.showCardContent(cardFace,'mj_card_zuo_peng',cardId);
        //             }
        //             else if(parent.name == 'layer_up')
        //             {
        //                 this.showCardContent(cardFace,'mj_card_shang_chu',cardId);
        //             }
        //         }
        //     }
        // }
    },

    showCardContent : function(cardNode,cardHeader,cardId)
    {
        // var card = cardNode.getComponent('Card');
        // if(card == null)
        // {
        //     cc.log('missing card Component, please add it');
        //     return;
        // }
        // var cardIndex = card.index;

        // var iconUrl = 'resources/mjcard/' + cardHeader + '_' + cardIndex + '_' + cardId + '.png';
        // cc.log('load Card URL :' + iconUrl)
        // var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        // cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);        
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
