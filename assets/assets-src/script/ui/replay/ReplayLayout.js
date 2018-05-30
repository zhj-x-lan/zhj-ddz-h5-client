cc.Class({
    extends: cc.Component,

    properties: {
        //nodes
        downHandCardPrefab: cc.Prefab,
        downHandCardParent: cc.Node,
        downDisCardPrefab: cc.Prefab,
        downDisCardParent: cc.Node,
        downPengCardPrefab: cc.Prefab,
        downPengCardParent: cc.Node,

        leftHandCardPrefab: cc.Prefab,
        leftHandCardParent: cc.Node,
        leftDisCardPrefab: cc.Prefab,
        leftDisCardParent: cc.Node,
        leftPengCardPrefab: cc.Prefab,
        leftPengCardParent: cc.Node,

        rightHandCardPrefab: cc.Prefab,
        rightHandCardParent: cc.Node,
        rightDisCardPrefab: cc.Prefab,
        rightDisCardParent: cc.Node,
        rightPengCardPrefab: cc.Prefab,
        rightPengCardParent: cc.Node,

        upHandCardPrefab: cc.Prefab,
        upHandCardParent: cc.Node,
        upDisCardPrefab: cc.Prefab,
        upDisCardParent: cc.Node,
        upPengCardPrefab: cc.Prefab,
        upPengCardParent: cc.Node,

        _showDis: false,
        _showObtain: false,
        _showPeng: false,

        _hasLayout: false,
    },

    // use this for initialization
    onLoad: function () {
        this._showDis = false;
        this._showObtain = false;
        this._showPeng = false;
        this._hasLayout = false;
    },

    init: function () {
        if (this._hasLayout == false) {
            this.initLeftCard();
            this.initDownCard();
            this.initRightCard();
            this.initUpCard();
            this._hasLayout = true;
        }
    },

    initLeftCard: function () {
        //hand cards
        for (var i = 0; i < GameData.client.handsize; i++) {
            var cardNode = cc.instantiate(this.leftHandCardPrefab);
            cardNode.name = "handCard" + i;
            cardNode.parent = this.leftHandCardParent;
            cardNode.y = 31 * GameData.client.handsize - i * 31;
        }
        //obtain card
        var obtainCardNode = cc.instantiate(this.leftHandCardPrefab);
        obtainCardNode.name = 'obtain';
        obtainCardNode.parent = this.leftHandCardParent;
        obtainCardNode.y = -20;
        obtainCardNode.active = this._showObtain;

        //dis cards
        for (var j = 0; j < 26; j++) {
            var tableCardNode = cc.instantiate(this.leftDisCardPrefab);
            tableCardNode.name = 'disCard' + j;
            tableCardNode.parent = this.leftDisCardParent;
            tableCardNode.x = -Math.floor(j / 10) * 48;
            tableCardNode.y = -j % 10 * 31;
            tableCardNode.active = this._showDis;
        }
        //peng cards
        for (var k = 0; k < 4; k++) {
            var pengCardNode = cc.instantiate(this.leftPengCardPrefab);
            pengCardNode.name = "pengCard" + k;
            pengCardNode.parent = this.leftPengCardParent;
            pengCardNode.x = 0;
            pengCardNode.y = -100 * k;
            pengCardNode.active = this._showPeng;
        }
    },

    initRightCard: function () {
        //hand cards
        for (var i = 0; i < GameData.client.handsize; i++) {
            var cardNode = cc.instantiate(this.rightHandCardPrefab);
            cardNode.setLocalZOrder(GameData.client.handsize - i);
            cardNode.name = "handCard" + i;
            cardNode.parent = this.rightHandCardParent;
            cardNode.y = -GameData.client.handsize * 31 + i * 31;
        }

        //obtain card
        var obtainCardNode = cc.instantiate(this.rightHandCardPrefab);
        obtainCardNode.name = 'obtain';
        obtainCardNode.parent = this.rightHandCardParent;
        obtainCardNode.y = 20;
        obtainCardNode.active = this._showObtain;

        //dis cards
        for (var j = 0; j < 26; j++) {
            var tableCardNode = cc.instantiate(this.rightDisCardPrefab);
            tableCardNode.setLocalZOrder(GameData.client.handsize - j);
            tableCardNode.name = 'disCard' + j;
            tableCardNode.parent = this.rightDisCardParent;
            tableCardNode.x = Math.floor(j / 10) * 48;
            tableCardNode.y = j % 10 * 31;
            tableCardNode.active = this._showDis;
        }

        //peng cards
        for (var k = 0; k < 4; k++) {
            var pengCardNode = cc.instantiate(this.rightPengCardPrefab);
            pengCardNode.name = "pengCard" + k;
            pengCardNode.parent = this.rightPengCardParent;
            pengCardNode.x = 0;
            pengCardNode.y = 100 * k;
            pengCardNode.active = this._showPeng;
        }
    },

    initDownCard: function () {
        //hand cards
        for (var i = 0; i < GameData.client.handsize; i++) {
            var cardNode = cc.instantiate(this.downHandCardPrefab);
            cardNode.name = "handCard" + i;
            cardNode.parent = this.downHandCardParent;
            cardNode.x = -70 * GameData.client.handsize + 70 * i;
        }

        //obtain card
        var obtainCardNode = cc.instantiate(this.downHandCardPrefab);
        obtainCardNode.name = 'obtain';
        obtainCardNode.parent = this.downHandCardParent;
        obtainCardNode.x = 40;
        obtainCardNode.active = this._showObtain;

        //table cards
        for (var j = 0; j < 26; j++) {
            var tableCardNode = cc.instantiate(this.downDisCardPrefab);
            tableCardNode.name = 'disCard' + j;
            //tableCardNode.setLocalZOrder(26-j);
            tableCardNode.parent = this.downDisCardParent;
            tableCardNode.x = 0 + j % 10 * 37;
            tableCardNode.y = 0 - Math.floor(j / 10) * 50;
            tableCardNode.active = this._showDis;
        }

        //peng cards
        for (var k = 0; k < 4; k++) {
            var pengCardNode = cc.instantiate(this.downPengCardPrefab);
            pengCardNode.name = "pengCard" + k;
            pengCardNode.parent = this.downPengCardParent;
            pengCardNode.x = k * 230;
            pengCardNode.y = 0;
            pengCardNode.active = this._showPeng;
        }
    },

    initUpCard: function () {
        //hand cards
        for (var i = 0; i < GameData.client.handsize; i++) {
            var cardNode = cc.instantiate(this.upHandCardPrefab);
            cardNode.name = "handCard" + i;
            cardNode.parent = this.upHandCardParent;
            cardNode.x = 40 * GameData.client.handsize - 40 * i;
        }

        //obtain card
        var obtainCardNode = cc.instantiate(this.upHandCardPrefab);
        obtainCardNode.name = 'obtain';
        obtainCardNode.parent = this.upHandCardParent;
        obtainCardNode.x = -20;
        obtainCardNode.active = this._showObtain;

        //dis cards
        for (var j = 0; j < 26; j++) {
            var tableCardNode = cc.instantiate(this.upDisCardPrefab);
            tableCardNode.name = 'disCard' + j;
            tableCardNode.setLocalZOrder(26 - j);
            tableCardNode.parent = this.upDisCardParent;
            tableCardNode.x = 0 - j % 10 * 33;
            tableCardNode.y = 0 + Math.floor(j / 10) * 45;
            tableCardNode.active = this._showDis;
        }

        //peng cards
        for (var k = 0; k < 4; k++) {
            var pengCardNode = cc.instantiate(this.upPengCardPrefab);
            pengCardNode.name = "pengCard" + k;
            pengCardNode.parent = this.upPengCardParent;
            pengCardNode.x = -k * 130;
            pengCardNode.y = 0;
            pengCardNode.active = this._showPeng;
        }
    },





    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});