var tdk_roomData = require('tdkRoomData');
var gameDefine = require('gameDefine');

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
        emoChatContainer : cc.Node,
        chatAnimationPrefab : cc.Prefab,
        fastVoiceItem : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        // this.emoButton = cc.find('emoButton',this.node);
        // this.wordButton = cc.find('wordButton',this.node);
        // this.emoButtonShow = cc.find('emoButtonShow',this.node);
        // this.wordButtonShow = cc.find('wordButtonShow',this.node);
        // this.emoPanel = cc.find('emoPanel',this.node);
        // this.wordPanel = cc.find('wordPanel',this.node);
        
        this.chatInput = cc.find('allPanel/EditBox',this.node).getComponent(cc.EditBox);
        this.sendButton = cc.find('allPanel/sendButton',this.node);
        // this.emoButton.on(cc.Node.EventType.TOUCH_START, this.onEmoButton,this);
        // this.wordButton.on(cc.Node.EventType.TOUCH_START, this.onWordButton,this);
        //this.sendButton.on(cc.Node.EventType.TOUCH_START, this.onSendButton,this);
        //this.onEmoButton();
        this.chatInput.string = '';
        var animationCount = 16;
        for(var i = 0; i < animationCount; i++)
        {
            var charEmo = cc.instantiate(this.chatAnimationPrefab);
            this.emoChatContainer.addChild(charEmo);
            charEmo.x = -350 + i % 6*140;//Math.floor(i/3)*60
            charEmo.y = -60 - parseInt(i/6)*150;
            var animation = charEmo.getComponent(cc.Animation);
            if(i < animationCount)
            {
                var aniName = animation.getClips()[i].name;
                // cc.log('aniName : ' + aniName);
                charEmo.name = aniName;
                animation.play(aniName);
                charEmo.on(cc.Node.EventType.TOUCH_END, this.onEmoClick,this);
            }
        }
        this.initFastVoiceItems();
        cc.log('GameData.client.gameType = '+GameData.client.gameType);
        if (GameData.client.gameType === gameDefine.GameType.Game_niu_niu || GameData.client.gameType === gameDefine.GameType.Game_TDK) {
            this.NN_selectEmoAndWord(0,1);
        }else{
            this.selectEmoAndWord(0,1);
        }
    },

    initFastVoiceItems : function()
    {   
        var talks = ['嘛钱不钱的，乐呵乐呵得了。','哎呀，出错牌了。','怒了啊，怒了啊。','今儿运气不错啊，没少赢。','楞嘛神儿！快点吧，花都谢了。','我要加油了啊。','这牌打的没谁了，谢了啊。','还让不让人活了，我要发威了','今儿输的太多了，太点背了。','土豪，咱们做朋友吧。','等下哈，我考虑考虑出嘛。','不好意思啊。'];
        var soundKeys = ['card_K_1','card_K_2','card_K_3','card_K_4','card_K_5','card_K_6','card_K_7','card_K_8','card_K_9','card_K_10','card_K_11','card_K_12'];
        if(GameData.client.gameType == gameDefine.GameType.Game_Poker_DDZ){
            talks = ['大家好，很高兴见到各位！','和你合作真是太愉快了。','快点儿啊！都等得我花都谢了。','你的牌打得也忒儿好咧！','不要吵了，专心玩游戏吧。','又断线了， 网络怎么这么差啊。','各位真不好意思，我要离开一会儿。','不要走，决战到天亮。','你是MM，还是GG','我们交个朋友吧，能不能告诉我你的联系方法呀。','再见了，我会想念大家的。'];
            soundKeys = ['Chat_0','Chat_1','Chat_2','Chat_3','Chat_4','Chat_5','Chat_6','Chat_7','Chat_8','Chat_9','Chat_10'];
        }
        if(GameData.client.gameType == gameDefine.GameType.Game_Poker_TianjinDDZ){
            talks = ['大家好，很高兴见到各位！','和你合作真是太愉快了。','快点儿啊！都等得我花都谢了。','你的牌打得也忒儿好咧！','不要吵了，专心玩游戏吧。','又断线了， 网络怎么这么差啊。','各位真不好意思，我要离开一会儿。','不要走，决战到天亮。','你是MM，还是GG','我们交个朋友吧，能不能告诉我你的联系方法呀。','再见了，我会想念大家的。'];
            soundKeys = ['Chat_0','Chat_1','Chat_2','Chat_3','Chat_4','Chat_5','Chat_6','Chat_7','Chat_8','Chat_9','Chat_10'];
        }
        if(GameData.client.gameType == gameDefine.GameType.Game_Poker_paodekuai){
            talks = ['大家好，很高兴见到各位！','和你合作真是太愉快了。','快点儿啊！都等得我花都谢了。','你的牌打得也忒儿好咧！','不要吵了，专心玩游戏吧。','又断线了， 网络怎么这么差啊。','各位真不好意思，我要离开一会儿。','不要走，决战到天亮。','你是MM，还是GG','我们交个朋友吧，能不能告诉我你的联系方法呀。','再见了，我会想念大家的。'];
            soundKeys = ['Chat_0','Chat_1','Chat_2','Chat_3','Chat_4','Chat_5','Chat_6','Chat_7','Chat_8','Chat_9','Chat_10'];
        }
        if(GameData.client.gameType == gameDefine.GameType.Game_niu_niu){
            talks = ['大家好，很高兴见到各位','初来乍到，请大家手下留情','快点吧，花开花谢好几回了','别拼了，没牛就是没牛','不好意思，又赢了','底裤都要输光了咯','我先走了，后会有期','怎么又是你坐庄啊','从天堂到地狱，我路过人间'];
            soundKeys = ['voice_0','voice_1','voice_2','voice_3','voice_4','voice_5','voice_6','voice_7','voice_8'];
        }
        if(GameData.client.gameType == gameDefine.GameType.Game_TDK){
            if(tdk_roomData.getPlayerSexByUid(GameData.player.uid) == 1){
                talks = ['走着瞧','你这牌打的太让人无语了','呵呵，没了吧','看你打牌可真费劲','你沙愣的，我们还是朋友','眼瞅都下班了，你快点呗'];
                soundKeys = ['chat_01','chat_02','chat_03','chat_04','chat_05','chat_06'];
            }else{
                talks = ['小样的你给我等着','拜托有你这样玩牌的吗','哈哈，没了吧','快点吧，牌在你手上都下崽了','朋友，看你打牌可真费劲','喂，你还在不在'];
                soundKeys = ['chat_11','chat_12','chat_13','chat_14','chat_15','chat_16'];
            }
            
        }

        if(GameData.client.gameType == gameDefine.GameType.Game_MJ_HuaDian
        ||GameData.client.gameType == gameDefine.GameType.Game_Mj_CC
        ||GameData.client.gameType == gameDefine.GameType.Game_Mj_Heb){
            talks = ['赢的我都过意不去了！','我掐指一算，你这是要点炮呀！','等会，我寻思寻思！','能不能行啦！赶紧的！','城市套路深！我想回农村！','老铁醒醒，该你出牌了。'];
            soundKeys = ['card_K_1','card_K_2','card_K_3','card_K_4','card_K_5','card_K_6'];
        }

        for(var i = 0; i < talks.length; i++)
        {
            var voiceItem = cc.instantiate(this.fastVoiceItem);
            voiceItem.parent = this.fastVoiceItem.parent;
            voiceItem.x = this.fastVoiceItem.x;//( + i % 3 * 300)
            voiceItem.y = this.fastVoiceItem.y - i*61;//(Math.floor(i/3)*60)
            cc.find('Label',voiceItem).getComponent(cc.Label).string = talks[i];
            voiceItem.getComponent('FastVoiceButton').sound = soundKeys[i];
        }
        this.fastVoiceItem.getParent().height = this.fastVoiceItem.parent.childrenCount*this.fastVoiceItem.height;
        this.fastVoiceItem.active = false;
    },

    onEmoClick : function(e)
    {
        cc.log('on emo click : ' + e.target.name);
        var aniName = e.target.name;
        ChatHandler.getInstance().requestChat('emo',aniName,function(rtn){});
        this.onClose();
        //closeView(this.node.name);
    },

    onDestroy : function()
    {

    },

    // onEmoButton : function()
    // {
    //     this.emoPanel.active = true;
    //     this.wordPanel.active = false;

    //     this.emoButton.active = false;
    //     this.emoButtonShow.active = true;

    //     this.wordButton.active = true;
    //     this.wordButtonShow.active = false;
    // },

    // onWordButton : function()
    // {
    //     this.emoPanel.active = false;
    //     this.wordPanel.active = true;

    //     this.emoButton.active = true;
    //     this.emoButtonShow.active = false;

    //     this.wordButton.active = false;
    //     this.wordButtonShow.active = true;
    // },

    onSendButton : function()
    {
        if(this.chatInput.string != '')
        {
            ChatHandler.getInstance().requestChat('word',this.chatInput.string,function(rtn){});
            this.chatInput.string = '';
            this.onClose();
            //closeView(this.node.name);
        }
    },
    selectEmoAndWord: function(evt, type){
        var emoScoreView = cc.find('allPanel/emoScrollView',this.node);
        var wordScoreView = cc.find('allPanel/wordScrollView',this.node);
        var wordBtn = cc.find('allPanel/switchToggle/wordBtn',this.node);
        var emoBtn = cc.find('allPanel/switchToggle/emoBtn',this.node);
        var wordBtn_stop = cc.find('allPanel/switchToggle/wordBtn_stop',this.node);
        var emoBtn_stop = cc.find('allPanel/switchToggle/emoBtn_stop',this.node);
        if (type == 1) {
            wordBtn.active = true;
            emoBtn_stop.active = true;
            wordScoreView.active = true;

            emoBtn.active = false;
            wordBtn_stop.active = false;
            emoScoreView.active = false;
        }else if (type == 2) {
            wordBtn.active = false;
            emoBtn_stop.active = false;
            wordScoreView.active = false;
            
            emoBtn.active = true;
            wordBtn_stop.active = true;
            emoScoreView.active = true;
        }
    },
    NN_selectEmoAndWord: function(evt, type){
        var emoScoreView = cc.find('allPanel/emoScrollView',this.node);
        var wordScoreView = cc.find('allPanel/wordScrollView',this.node);
        var wordBtn = cc.find('allPanel/wordSprite',this.node);
        var emoBtn = cc.find('allPanel/emoSprite',this.node);
        var wordBtn_stop = cc.find('allPanel/wordButton',this.node);
        var emoBtn_stop = cc.find('allPanel/emoButton',this.node);
        if (type == 1) {
            wordBtn.active = true;
            emoBtn_stop.active = true;
            wordScoreView.active = true;

            emoBtn.active = false;
            wordBtn_stop.active = false;
            emoScoreView.active = false;
        }else if (type == 2) {
            wordBtn.active = false;
            emoBtn_stop.active = false;
            wordScoreView.active = false;
            
            emoBtn.active = true;
            wordBtn_stop.active = true;
            emoScoreView.active = true;
        }
    },
    onClose : function()
    {
        for(var i = 0; i < this.emoChatContainer.childrenCount; i++)
        {
            var charEmo = this.emoChatContainer.children[i];
            var animation = charEmo.getComponent(cc.Animation);
            var aniName = animation.getClips()[i].name;
            animation.stop(aniName);
        }

        closeView(this.node.name);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
