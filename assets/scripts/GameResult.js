cc.Class({
    extends: cc.Component,

    properties: {
        _gameresult:null,
        _seats: [],
        _heads: [], //排行榜玩家头像(Sprite)
    },

    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        this._gameresult = this.node.getChildByName("game_result");
        this._gameresult.active = false;
        
        var seats = this._gameresult.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
            this._seats.push(seats.children[i].getComponent("Seat"));
            this._heads.push(seats.children[i].getChildByName('icon').getComponent(cc.Sprite));
        }
        
        var btnClose = cc.find("Canvas/game_result/btnClose");
        if(btnClose){
            cc.vv.utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked");
        }
        
        var btnReturn = cc.find("Canvas/game_result/btnReturn");
        if(btnReturn){
            cc.vv.utils.addClickEvent(btnReturn, this.node, "GameResult", "onBtnReturnClicked");
        }

        var btnShare = cc.find("Canvas/game_result/btnShare");
        if(btnShare){
            cc.vv.utils.addClickEvent(btnShare,this.node,"GameResult","onBtnShareClicked");
        }
        
        //初始化网络事件监听器
        var self = this;
        this.node.on('game_end',function(data){
            self._gameresult.active = true;
            console.log('整轮游戏结算信息:--------');
            self.onGameEnd(data.detail);
            var data = data.detail;
            //房间号:
            var roomId = cc.vv.gameMgr.kDeskId;
            //房主:
            var fangzhu = data.kCreatorNike;
            //玩法:
            var wanfa = '扣点点 底分: 1 局数: 8';
        });
    },

    onGameEnd:function(data){
        var userMap = cc.vv.gameMgr.userMap;
        //计算最大分数
        var maxscore = -1;
        var maxindex = -1;
        data.kGold.length = cc.vv.gameMgr.playerNum;
        for (let i = 0; i < data.kGold.length; i++) {
            var seat = userMap[i];
            seat.score = data.kGold[i];
            
            if (seat.score > maxscore) {
                maxscore = seat.score;
                maxindex = i;
            }
        }
        console.log('最大分数: ' + maxscore);
        console.log('大赢家玩家位置: ' + maxindex);
        this._seats[maxindex].setDayingjia(true);

        var len = cc.vv.gameMgr.playerNum;
        for (let i = 0; i < 4; i++) {
            if (i > (len -1)) {
                continue;
            }
            var seat = userMap[i];
            this._seats[i].setInfo(seat.kNike, seat.score);
            this._seats[i].setId(seat.kId);
            /** 追加微信头像显示 */
          /*   var self = this;
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                console.warn('头像地址: ===> ' + seat.imageUrl);
                cc.loader.load({ url: seat.imageUrl, type: 'png' }, function (err, texture) {
                    if (err) { 
                        console.warn('请求头像资源失败...');
                        //self.scheduleOnce(loadImage, 3);
                    } else {
                        console.warn('头像资源获取成功');
                        var spriteFrame = new cc.SpriteFrame(texture);
                        self._heads[i].spriteFrame = spriteFrame;
                    }
                });
            } */

            //优化策略 缓存头像spriteFrame
            this._heads[i].spriteFrame = userMap[seat.kId].photo;
        }

    },
    
    onBtnCloseClicked:function(){
        console.warn('[GameResult.js]--> onBtnCloseClicked');
        cc.vv.gameMgr.clearGameData();
        cc.vv.gameMgr.removeGameListeners();
        cc.director.loadScene("hall");
    },
    
    onBtnReturnClicked: function () {
        console.warn('[GameResult.js]--> onBtnReturnClicked');
        console.warn('【返回大厅前清除所有游戏数据:===============================】');
        cc.vv.gameMgr.clearGameData();
        cc.vv.gameMgr.removeGameListeners();
        cc.director.loadScene("hall");
    },

    onBtnShareClicked:function(){
        cc.vv.alert.show('提示', '暂不支持分享功能');
    }
});
