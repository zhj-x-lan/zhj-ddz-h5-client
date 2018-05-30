var gameDefine = require('gameDefine');

cc.Class({
    extends: cc.Component,

    properties: {
        emoScrollView : cc.ScrollView,
        wordScrollView : cc.ScrollView,
        wordItem : cc.Node,
        chatInput : cc.EditBox,

        sendBtn : cc.Button,
        emoBtn : cc.Button,
        wordBtn : cc.Button,
        emoSprite : cc.Sprite,
        wordSprite : cc.Sprite,

        chatAnimationPrefab : cc.Prefab

    },

    onLoad: function () {

        this.emoContent = this.emoScrollView.content;
        this.wordContent = this.wordScrollView.content;

        this.initAnimationItems();
        this.initFastVoiceItems();

        this.onWordButton();

        this.emoScrollView.node.off(cc.Node.EventType.TOUCH_START, this.emoScrollView._onTouchMoved, this.emoScrollView, true);
        this.emoScrollView.node.off(cc.Node.EventType.TOUCH_MOVE, this.emoScrollView._onTouchMoved, this.emoScrollView, true);
        this.emoScrollView.node.off(cc.Node.EventType.TOUCH_END, this.emoScrollView._onTouchMoved, this.emoScrollView, true);
        this.emoScrollView.node.off(cc.Node.EventType.TOUCH_CANCEL, this.emoScrollView._onTouchMoved, this.emoScrollView, true);

        this.wordScrollView.node.off(cc.Node.EventType.TOUCH_START, this.wordScrollView._onTouchMoved, this.wordScrollView, true);
        this.wordScrollView.node.off(cc.Node.EventType.TOUCH_MOVE, this.wordScrollView._onTouchMoved, this.wordScrollView, true);
        this.wordScrollView.node.off(cc.Node.EventType.TOUCH_END, this.wordScrollView._onTouchMoved, this.wordScrollView, true);
        this.wordScrollView.node.off(cc.Node.EventType.TOUCH_CANCEL, this.wordScrollView._onTouchMoved, this.wordScrollView, true);
    },

    initAnimationItems :function()
    {
        var init_x = -175,init_y = -130,interval_w = 120,interval_h = 130;
        var animationCount = 16;
        for(var i = 0; i < animationCount; i++)
        {
            var charEmo = this.emoContent.children[i];
            if( charEmo == undefined ) {
                charEmo = cc.instantiate(this.chatAnimationPrefab);
                this.emoContent.addChild(charEmo);
            }

            charEmo.x = init_x + (i%4)*interval_w;
            charEmo.y = init_y - parseInt(i/4)*interval_h;

            var animation = charEmo.getComponent(cc.Animation);
            if( i < animationCount )
            {
                var aniName = animation.getClips()[i].name;
                charEmo.name = aniName;
                animation.play(aniName);
                charEmo.on(cc.Node.EventType.TOUCH_END, this.onEmoClick,this);
            }
        }
    },

    initFastVoiceItems : function()
    {
        var talks = ['想跑了是吧，全国都解放了。','楞嘛神儿！相面那。','嘛钱不钱的乐呵乐呵得了。','好嘛！一把十三不靠。','会玩儿嘛！竟放生张儿。','混儿都将了啊。'];
        var soundKeys = ['card_K_1','card_K_2','card_K_3','card_K_4','card_K_5','card_K_6'];
        if(GameData.client.gameType == gameDefine.GameType.Game_Mj_Shishi){
            talks = ['你们都是哪里的人呀？','来来来，血战到天明！','哈哈，上来就可以游金啦！','今天让你们输到不敢在玩麻将！','快点出牌，等的花儿都谢了','老人打牌比你打的都快！'];
        }
        else if( GameData.client.gameType == gameDefine.GameType.Game_Poker_13shui ) {
            talks = ['大家好，很高兴见到各位！','和你合作真是太愉快了。','快点儿啊！都等得我花都谢了。','你的牌打得也忒儿好咧！','不要吵了，专心玩游戏吧。','又断线了， 网络怎么这么差啊。','各位真不好意思，我要离开一会儿。','不要走，决战到天亮。'];//,'你是MM，还是GG','我们交个朋友吧，能不能告诉我你的联系方法呀。','再见了，我会想念大家的。'];
            soundKeys = ['Chat_0','Chat_1','Chat_2','Chat_3','Chat_4','Chat_5','Chat_6','Chat_7','Chat_8','Chat_9','Chat_10'];
        }

        for( var key in this.wordContent.children ) {
            var node = this.wordContent.children[key];
            node.active = false;
        }

        var interval = 20;
        this.wordContent.height = 650;//(this.wordItem.height+interval)*talks.length;

        for(var i = 0; i < talks.length; i++)
        {
            var voiceItem = this.wordContent.children[i];
            if( voiceItem == undefined ) {
                voiceItem = cc.instantiate(this.wordItem);
                voiceItem.parent = this.wordContent;
                voiceItem.x = this.wordItem.x;
                voiceItem.y = this.wordItem.y - (this.wordItem.height+interval)*i;
            }
            voiceItem.active = true;

            cc.find('label',voiceItem).getComponent(cc.Label).string = talks[i];
            voiceItem.getComponent('SSSFastVoiceButton').sound = soundKeys[i];
        }
    },

    onWordButton : function(){
        this.wordScrollView.node.active = true;
        this.emoScrollView.node.active = false;

        this.wordSprite.node.active = true;
        this.emoSprite.node.active = false;

        this.wordBtn.node.active = false;
        this.emoBtn.node.active = true;
    },

    onEmoButton : function(){
        this.wordScrollView.node.active = false;
        this.emoScrollView.node.active = true;

        this.wordSprite.node.active = false;
        this.emoSprite.node.active = true;

        this.wordBtn.node.active = true;
        this.emoBtn.node.active = false;
    },

    onEmoClick : function(e)
    {
        cc.log('on emo click : ' + e.target.name);
        var aniName = e.target.name;
        ChatHandler.getInstance().requestChat('emo',aniName,function(rtn){});
        closeSSSView(this.node.name);
    },

    onSendButton : function()
    {
        if(this.chatInput.string != '')
        {
            ChatHandler.getInstance().requestChat('word',this.chatInput.string,function(rtn){});
            this.chatInput.string = '';
            closeSSSView(this.node.name);
        }
    },

    onClose : function()
    {
        closeSSSView(this.node.name);
    },

    // update: function (dt) {

    // },
});
