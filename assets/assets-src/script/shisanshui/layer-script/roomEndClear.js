var roomEndClear = cc.Class({
    extends: cc.Component,

    properties: {

        roomEndClear: {
            default: null,
            type: cc.Node
        },
        gainsLayer: {
            default: null,
            type: cc.Node
        },
        detailLayer: {
            default: null,
            type: cc.Node
        },
        gainsBtn: {
            default: null,
            type: cc.Node
        },
        detailBtn: {
            default: null,
            type: cc.Node
        },

        gainsSprite : cc.Node,
        detailSprite : cc.Node,
        roomInfoNode:cc.Node,
        bottomNode:cc.Node,
        UIPlayerRoundDetail:cc.Node,

        content: {
            default: null,
            type: cc.Node
        },

        //roomInfoNode
        roomID: {
            default: null,
            type: cc.Label
        },
        roundNum: {
            default: null,
            type: cc.Label
        },
        houseOwner: {
            default: null,
            type: cc.Label
        },
        time: {
            default: null,
            type: cc.Label
        },

        fonts :{
            default:[],
            type:cc.Font
        },

        playerRound : cc.Prefab,
        roundDetailPanel : cc.Prefab,
        playerRoundDetail : cc.Prefab
    },

    onLoad: function () {
        this.cumulativeScore = 0; //玩家到当前局累计的分
        this.playerAllScoreList = []; //玩家总分列表

        this.playerRoundScoreList = [];
        this.roundCumulativeScoreList = [];

        //初始化控制界面显示房间战绩相关
        this.gainsLayer.active = true;
        this.detailLayer.active = false;
        this.gainsBtn.active = false;
        this.detailBtn.active = true;
        this.gainsSprite.active = true;
        this.detailSprite.active = false;
        this.roomInfoNode.active = true;
        this.bottomNode.active = true;

        //每局详情当前显示页数
        this.curPageIndex = 0;

        //初始化房间战绩
        this.initGainsLayer();
        //初始化每局详情
        this.initPlayerRoundScore();
        this.initDetailLayer();
        //初始化底部房间信息
        this.showRoomInfo();

        this.playAnimation();
        this.play();
    },

    onDestroy: function() {
    },

    play: function() {
        this.schedule(this.playAnimation, 1);
    },

    playAnimation: function() {
        var topNode = cc.find('topNode', this.roomEndClear);
        var animate = cc.find('animate', topNode);
        animate.getComponent(cc.Animation).play('paomadengdonghua');
    },

    initGainsLayer: function() {

        this.initPlayerAllScoreList();

        if(!this.playerRound){
            return;
        }
        for(var key = 0;key < GameData13.room.joinermax;key++)
        {
            var newNode = cc.instantiate(this.playerRound);
            newNode.parent = this.content;
            this.setPlayerRound(newNode,key+1,this.playerAllScoreList[key].score,GameData13.game.roundNum,this.playerAllScoreList[key].uid);
        }
    },
    initDetailLayer: function(){

        var roundMax = 0;   //总局数
        var pageMax = 14;   //一页最大数

        if (!GameData13.isEmptyObject(GameData13.gemaEndResult))
        {
            if (GameData13.gemaEndResult.history.length <= 0)
            {
                cc.log('GameData13.gemaEndResult.history is empty.');
                return;
            }else {
                roundMax = GameData13.gemaEndResult.history.length;
            }
        }

        var content = cc.find("layer",this.detailLayer);
        var index = this.curPageIndex*pageMax;

        for(var ii = 0;ii < content.getChildrenCount();ii++){
            var tempNode = content.getChildren()[ii];
            if(tempNode){
                tempNode.active = false;
            }
        }

        for (var key = 0; key < pageMax; key++)
        {
            if((index+key)>=roundMax){
                break;
            }

            var node = content.getChildren()[key];
            if( node == undefined ) {
                node = cc.instantiate(this.roundDetailPanel);
                node.parent = content;

                var init_x = node.width*0.05;
                var init_y = content.height - node.height*1.1;

                var node_x = init_x+parseInt(key%2)*(node.width*1.02);
                var node_y = init_y-parseInt(key/2)*(node.height*1.1);
                node.position = cc.p( node_x,node_y );
            }
            node.tag = index+key;
            node.active = true;
            node.on(cc.Node.EventType.TOUCH_END, this.showUIPlayerRoundDetail,this);

            this.setRoundDetail(node,index+key,this.playerRoundScoreList[index+key],this.roundCumulativeScoreList[index+key]);
        }

        //控制翻页按钮显隐
        var lastBtn = cc.find('lastButton',this.detailLayer);
        var nextBtn = cc.find('nextButton',this.detailLayer);

        lastBtn.on(cc.Node.EventType.TOUCH_END, this.lastPageBtnClick,this);
        nextBtn.on(cc.Node.EventType.TOUCH_END, this.nextPageBtnClick,this);

        /*if(roundMax <= pageMax){
            lastBtn.active = false;
            nextBtn.active = false;
        }*/
    },

    showUIPlayerRoundDetail:function(event){
        cc.log("UIPlayerRoundDetail");

        var node_tag = parseInt(event.target.tag);

        this.UIPlayerRoundDetail.active = true;

        this.initPlayerRoundDetailLayer(node_tag);
    },

    closeUIPlayerRoundDetail:function(){
        this.UIPlayerRoundDetail.active = false;
    },

    initPlayerRoundDetailLayer:function( index ){

        var data = GameData13.gemaEndResult.history[index];
        if(data == undefined || Object.keys(data).length <= 0){
            return;
        }

        var soundLabel = cc.find("soundLabel",this.UIPlayerRoundDetail);
        soundLabel.getComponent(cc.Label).string = index+1;

        var layer = cc.find("layer",this.UIPlayerRoundDetail);

        for(var ii = 0;ii < layer.getChildrenCount();ii++){
            var childNode = layer.getChildren()[ii];
            if(childNode){
                childNode.active = false;
            }
        }

        for(var key = 0;key < GameData13.joiners.length;key++){

            var joinersData = GameData13.joiners[key];
            if(joinersData == undefined){
                continue;
            }
            var node = layer.getChildren()[key];
            if(node == undefined){
                node = cc.instantiate(this.playerRoundDetail);
                node.parent = layer;

                var init_x = 5;
                var init_y = layer.height-node.height;

                var node_x = init_x+parseInt(key%2)*(node.width+5);
                var node_y = init_y-parseInt(key/2)*node.height;
                node.position = cc.p(node_x,node_y);
            }
            node.active = true;

            var pRDC = node.getComponent('playerRoundDetail'); //playerRoundDetail组件
            pRDC.id = key;
            pRDC.setRoundNum(index);
            pRDC.showPlayerRoundDetail();
        }
    },

    initPlayerAllScoreList: function() {
        var allScore = 0;
        if (!GameData13.isEmptyObject(GameData13.gemaEndResult)) {
            if (GameData13.gemaEndResult.score.length <= 0) {
                cc.log('GameData13.gameEndResult.score is empty.');
                return;
            }
            for (var i = 0; i < GameData13.room.joinermax; i++) {
                allScore = GameData13.gemaEndResult.score[GameData13.joiners[i].uid];
                this.playerAllScoreList.push({score: Number(allScore), uid: GameData13.joiners[i].uid});
            }
        }else {
            cc.log('GameData13.gameEndResult is empty.');
        }
        this.sortScoreArray(this.playerAllScoreList);
        cc.log('playerAllScoreList: ', JSON.stringify(this.playerAllScoreList));
    },

    initPlayerRoundScore: function() {

        if(GameData13.gemaEndResult.history == undefined){
            cc.log("GameData13.gameEndResult.history is undefined");
            return;
        }

        cc.log("..history:"+JSON.stringify(GameData13.gemaEndResult.history));

        var score = 0;
        if (!GameData13.isEmptyObject(GameData13.gemaEndResult)) {
            if (GameData13.gemaEndResult.history.length <= 0) {
                cc.log('GameData13.gameEndResult.history is empty.');
                return;
            }
            for (var i = 0; i < GameData13.gemaEndResult.history.length; i++)
            {
                score = GameData13.gemaEndResult.history[i][GameData.player.uid].score;
                this.playerRoundScoreList.push(score);
                this.roundCumulativeScoreList.push(this.roundCumulativeScore(score));
            }
        }else {
            cc.log('GameData13.gameEndResult is empty.')
        }
    },

    //排列总分，玩家排名
    sortScoreArray: function(array) {
        array.sort(function(a, b) {
            return b.score - a.score;
        });
    },

    //显示头像
    showPlayerHead: function(parent,uid,winShow,mainShow)
    {
        var headNode = cc.find('player/headNode', parent);
        cc.loader.loadRes('shisanshui/prefab/poker13PlayerTemplate', function(err, prefab) {
            if (err) return;
            var head = cc.instantiate(prefab);
            headNode.addChild(head);

            head.getComponent('playerTemplate').setHeadIcon(GameData13.getJoinerByUid(uid).headimgurl);
            head.getComponent('playerTemplate').setSSSWinNodeActive(winShow);
            head.getComponent('playerTemplate').setSSSMainNodeActive(mainShow);
        });
    },

    showRoomInfo: function() {

        if (isChinese(GameData13.getJoinerByUid(GameData13.owner).name)) {
            this.houseOwner.string = '房主:'+getShortStr(GameData13.getJoinerByUid(GameData13.owner).name, 5);
        }else if (!isChinese(GameData13.getJoinerByUid(GameData13.owner).name)) {
            this.houseOwner.string = '房主:'+getShortStr(GameData13.getJoinerByUid(GameData13.owner).name, 8);
        }
        this.roomID.string = '房间:'+GameData13.getJoinerByUid(GameData13.owner).roomid;

        var roundNum = GameData13.game.roundNum>GameData13.room.roundmax?GameData13.room.roundmax:GameData13.game.roundNum;
        this.roundNum.string = '局数:'+roundNum;

        var date = new Date(GameData13.createtime);
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();

        var hours = date.getHours();
        if (hours < 10) {
            hours = '0'+hours+':';
        }else{
            hours = hours+':';
        }
        var minute = date.getMinutes();
        if (minute < 10) {
            minute = '0'+minute;
        }else{
            minute = minute;
        }
        /*var second = date.getSeconds();
        if (second < 10) {
            second = '0'+second;
        }else{
            second = second;
        }*/
        this.time.string = '开局时间:'+month+'-'+day+'  '+hours+minute;

        //设置每局详情看牌页面底部房间信息
        var lookCard_roomId = cc.find('roomID',this.UIPlayerRoundDetail);
        var lookCard_time = cc.find('time',this.UIPlayerRoundDetail);

        lookCard_roomId.getComponent(cc.Label).string = '房间:'+GameData13.getJoinerByUid(GameData13.owner).roomid;
        lookCard_time.getComponent(cc.Label).string = '开局时间:'+month+'-'+day+'  '+hours+minute;
    },

    //累加当前分数
    roundCumulativeScore: function(score) {
        this.cumulativeScore += score;
        return this.cumulativeScore;
    },

    setPlayerRound: function(parent, rank, allScore, round, uid) {

        var roundNum = cc.find('roundNum', parent);
        var scoreLabel = cc.find('scoreLabel', parent);
        var name = cc.find('player/name', parent);
        var id = cc.find('player/id', parent);
        var playerRank = cc.find('player/rank', parent);

        if (isChinese(GameData13.getJoinerByUid(uid).name)) {
            name.getComponent(cc.Label).string = getShortStr(GameData13.getJoinerByUid(uid).name, 5);
        }
        else if (!isChinese(GameData13.getJoinerByUid(uid).name)) {
            name.getComponent(cc.Label).string = getShortStr(GameData13.getJoinerByUid(uid).name, 8);
        }
        id.getComponent(cc.Label).string = uid;
        playerRank.getComponent(cc.Label).string = rank;
        roundNum.getComponent(cc.Label).string = round;

        if (allScore > 0) {
            scoreLabel.getComponent(cc.Label).font = this.fonts[0];
            scoreLabel.getComponent(cc.Label).string = "+"+allScore;
        }else if (allScore < 0) {
            scoreLabel.getComponent(cc.Label).font = this.fonts[1];
            scoreLabel.getComponent(cc.Label).string = allScore;
        }else if (allScore == 0) {
            scoreLabel.getComponent(cc.Label).font = this.fonts[2];
            scoreLabel.getComponent(cc.Label).string = allScore;
        }

        //添加头像
        var winShow = false,mainShow = false;
        if(rank == 1){
            winShow = true;
        }
        if(uid == GameData13.owner){
            mainShow = true;
        }
        this.showPlayerHead(parent,uid,winShow,mainShow);
    },

    setRoundDetail: function(parent, idx, score, cumulativeScore) {

        var roundDetail = parent.getComponent('roundDetail');
        roundDetail.id = idx;

        //设置第几局
        roundDetail.setRoundNumString( idx+1 );
        //设置单局得分
        roundDetail.setScoreNodeString( score );
        //设置总得分
        roundDetail.setAllScoreNodeString( cumulativeScore );
    },

    lastPageBtnClick:function(){
        cc.log("..last");

        if(this.curPageIndex <= 0){
            createSSSMoveMessage('已是第一页');
            return;
        }
        this.curPageIndex--;
        this.initDetailLayer();
    },

    nextPageBtnClick:function(){
        cc.log("..next");

        var length = GameData13.gemaEndResult.history.length;
        var pageSum = parseInt(length/14);
        if(pageSum >= 1){
            length%14 > 0 ? pageSum++ : null;
        }

        if(this.curPageIndex >= (pageSum-1)){
            createSSSMoveMessage('已是最后页');
            return;
        }
        this.curPageIndex++;
        this.initDetailLayer();
    },

    onGainsBtnCliked: function(evt) {
        this.detailLayer.active = false;
        this.gainsLayer.active = true;

        this.gainsBtn.active = false;
        this.detailBtn.active = true;

        this.gainsSprite.active = true;
        this.detailSprite.active = false;

        this.roomInfoNode.active = true;
        this.bottomNode.active = true;
    },

    onDetailBtnClied: function(evt) {

        this.gainsLayer.active = false;
        this.detailLayer.active = true;

        this.gainsBtn.active = true;
        this.detailBtn.active = false;

        this.gainsSprite.active = false;
        this.detailSprite.active = true;

        this.roomInfoNode.active = false;
        this.bottomNode.active = false;
    },

    onBackBtnClied: function(evt) {
        GameData13.clearAllGameData();
        GameData.player.roomid = undefined;
        GameData.SetLayerData.soundOpen = true;
        cc.director.loadScene('home');
    }
});
module.exports = roomEndClear;
