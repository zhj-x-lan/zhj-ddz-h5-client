/**
 * Created by user on 2017/11/22.
 */
var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        left_node: cc.Node,
        right_node: cc.Node,

    },

    onLoad: function () {
    },

    playChat : function( data,direction,type,sex ){
        this.left_node.active = false;
        this.right_node.active = false;

        var chatNode;
        switch ( direction ) {
            case 'left':{
                chatNode = this.left_node;
            }break;
            case 'right':{
                chatNode = this.right_node;
            }break;
        }
        if( chatNode == undefined ) {
            return;
        }
        chatNode.active = true;

        var wordNode = cc.find('word',chatNode);
        var emoNode = cc.find('emo',chatNode);
        var yuyinNode = cc.find('yuyinNode',chatNode);
        if(type == 'word')
        {
            var content = data.detail.msg.data;

            var chatBg = cc.find('word/bg',chatNode);
            var chatLabel = cc.find('word/Label',chatNode).getComponent(cc.Label);
            var contentStr = content;
            chatBg.width = 20+contentStr.length * 24;
            wordNode.getComponent('SSSHideComponent').show(3);
            chatLabel.string = contentStr;
        }
        else if(type == 'fast')
        {
            var soundKey = data.detail.msg.data.sound;
            var content = data.detail.msg.data.content;
            var chatBg = cc.find('word/bg',chatNode);
            var chatLabel = cc.find('word/Label',chatNode).getComponent(cc.Label);
            var contentStr = getShortStr(content,10);
            chatBg.width = contentStr.length * 30;
            wordNode.getComponent('SSSHideComponent').show(3);
            chatLabel.string = contentStr;
            soundMngr.instance.playAudioChat(soundKey,sex);
        }
        else if(type == 'emo')
        {
            var animationName = data.detail.msg.data;
            emoNode.getComponent(cc.Animation).play(animationName);
            emoNode.getComponent('SSSHideComponent').show(3);
        }
        else if(type == 'yuyin')
        {
            if(!GameData.isPlayVioce){
                return;
            }
            var soundurl = data.detail.msg.data;
            if (cc.sys.OS_ANDROID == cc.sys.os)
            {
                jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "playRecord", "(Ljava/lang/String;)V",soundurl);
            }
            else if(cc.sys.OS_IOS == cc.sys.os)
            {
                jsb.reflection.callStaticMethod("AppController", "playRecord:", String(soundurl));
            }
            var yuyinAnim = cc.find('yuyinAnimNode/yuyinAnim',yuyinNode);
            yuyinAnim.getComponent(cc.Animation).play("yuyinduihua");
            yuyinNode.getComponent('SSSHideComponent').show(3);
        }
    },

    // update: function (dt) {

    // },
});