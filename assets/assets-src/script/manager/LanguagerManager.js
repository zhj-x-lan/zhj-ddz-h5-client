// //Lang是全局变量，根据当前的语言种类设置Lang的值，使用时，调用Lang.xxx就可以调用相应的语言了
// var Lang = null;

// var LanguageManager = cc.Class = ({
//      properties: {

//     //默认语言
//     defaultLang : null,
//     //当前语言
//     curLang : null,

//     //语言类型
//     LanguageType : {
//         Tianjinhua : 'Tianjinhua',
//         Putonghua : 'Putonghua'
//     },
//     },
//     statics:
//     {
//         instance : null,
//     },

//     // use this for initialization
//     onLoad: function () {
//         cc.game.addPersistRootNode(this.node);
//         SoundMngr.instance = this;
//         this.defaultLang = this.LanguageType.Putonghua;
//         this.curLang = this.Tianjinhua;
//         this.setLang(this.defaultLang);
//     },
//     setLang : function(langType){
//         if(!this.LanguageType.hasOwnProperty(langType)){
//             cc.log('do not support this language' );
//             return;
//         }
//         cc.log('now language is ' +  langType);
//         this.curLang = langType;
//         switch (langType){
//             case this.LanguageType.Tianjinhua:
//                 Lang = _Tianjinhua;
//                 break;
//             case this.LanguageType.Putonghua:
//                 Lang = _Putonghua;
//                 break;
//             default :
//                 Lang = _Putonghua;
//         }
//     }
// });