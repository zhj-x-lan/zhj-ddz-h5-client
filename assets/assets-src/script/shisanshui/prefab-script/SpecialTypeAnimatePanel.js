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
        specialName: {
            default: null,
            type: cc.Label,
        },
        animation: {
            default: null,
            type: cc.Node,
        },
        poker: {
            default: null,
            type: cc.Node,
        }
    },

    // use this for initialization
    onLoad: function () {
        // this.handSize = GameData13.handSize;
        // this.showCards();
    },

    showCards: function() {
        var str = "resources/shisanshui/cardUI";
        var special = this.id;
        var cardHand = [];
        for (var uid in GameData13.roomResult.cards) {
            cc.log('special and uid: ',uid, special);
            if (GameData13.roomResult.cards[uid].special == special) {
                cc.log('allCards: ', GameData13.roomResult.cards[uid].allCards);
                cardHand = GameData13.roomResult.cards[uid].allCards;
                break;
            }
        }
        for (var i = 0; i < GameData13.handSize; i++) {
            var card = cc.find('cardhand/'+'card'+i, this.poker);
            if (cardHand.length <= 0) {
                cc.log('special cardHand of null');
                return;
            }
            var iconUrl = str + "/" + (cardHand[i].value+1) + '_' + (cardHand[i].type+1) + ".png";
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            card.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }
    },

    play: function() {

    },

    setSpecialName: function(name, id) {
        this.id = id;
        this.specialName.string = name;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
