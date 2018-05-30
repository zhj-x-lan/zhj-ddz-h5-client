/**
 * Created by user on 2017/9/25.
 */
cc.Class({
    extends: cc.Component,

    properties: {
        inviteNode: cc.Node,
        applyNode: cc.Node,
        clubBtnNode: cc.Node,

        clubHead: cc.Prefab,

        clubHeadNode: cc.Node
    },
    onLoad: function () {

        this.initUIRule();
        this.registerListener();
        this.operaUIActive(1);
        this.refreshUIMyClub();
        // this.refreshUIApplyClub();
    },

    registerListener: function () {
        registEvent('refreshUIClubData', this, this.refreshUIMyClub);
        registEvent('refreshUIClubInvite', this, this.refreshUIApplyClub);
        registEvent('refreshUIClubApply', this, this.refreshUIApplyClub);
    },

    uiUpDate: function () {},

    initUIRule: function () {
        if (!GameData.configData.agentWechat) return;
        var WXconfig = GameData.configData.agentWechat;

        var weixinStr = cc.find('applyClubPanel/BaseFrame1/LabelWeiXin', this.node);
        weixinStr.getComponent('cc.Label').string = WXconfig[0].agentConsult;
    },

    //type: 1:我的俱乐部，2：申请界面
    operaUIActive: function (type) {

        var applyClubPanel = cc.find('applyClubPanel', this.node);
        var myClubPanel = cc.find('myClubPanel', this.node);
        var myClubBtn = cc.find('btnTitleBg/myClubBtn', this.node);
        var applyClubBtn = cc.find('btnTitleBg/applyClubBtn', this.node);
        var myClubImg = cc.find('btnTitleBg/myClubImg', this.node);
        var applyClubImg = cc.find('btnTitleBg/applyClubImg', this.node);

        switch (type) {
            case 1:
                {

                    myClubBtn.active = true;
                    applyClubImg.active = false;
                    myClubPanel.active = true;

                    applyClubBtn.active = false;
                    myClubImg.active = false;
                    applyClubPanel.active = false;

                }
                break;
            case 2:
                {

                    myClubBtn.active = false;
                    applyClubImg.active = false;
                    myClubPanel.active = false;

                    applyClubBtn.active = true;
                    myClubImg.active = true;
                    applyClubPanel.active = true;

                }
                break;
        }
    },

    onUIMyClub: function () {
        //界面显示操作
        this.operaUIActive(1);
        //刷新界面数据显示
        this.refreshUIMyClub();

    },
    onUIApplyClub: function () {
        //界面显示操作
        this.operaUIActive(2);
        //刷新界面数据显示
        this.refreshUIApplyClub();

    },

    refreshUIMyClub: function () {
        ////////////////更新左侧俱乐部按钮
        if (!GameData.player.club) return;
        var clubNumber = Object.keys(GameData.player.club).length; //俱乐部个数

        var noneData = cc.find('myClubPanel/noneData', this.node);
        var clubImg = cc.find('myClubPanel/club_img', this.node);
        var BaseFrame = cc.find('myClubPanel/BaseFrame', this.node);
        var clubBtnScrollView = cc.find('myClubPanel/clubBtnScrollView', this.node);

        noneData.active = false;
        clubImg.active = false;
        BaseFrame.active = false;
        clubBtnScrollView.active = false;

        if (clubNumber <= 0) {
            noneData.active = true;
            return;
        } else {
            clubImg.active = true;
            BaseFrame.active = true;
            clubBtnScrollView.active = true;
        }
        var clubData = GameData.player.club;
        //将ScrollView里的全部子节点隐藏
        // for( var ii in this.clubBtnNode.parent.children ) {
        //     var item = this.clubBtnNode.parent.children[ii];
        //     if( !!item ) {
        //         item.active = false;
        //     }
        // }

        //设置ScrollView容器高度
        // var interval_h = cc.find( 'bigNode/ordinarySprite', this.clubBtnNode).height;
        // this.clubBtnNode.getParent().height = interval_h * clubNumber;

        // var index_invite = 1000;
        // for( var key in GameData.player.club )
        // {
        //     var clubData = GameData.player.club[key];
        //     if( clubData == undefined ) {
        //         continue ;
        //     }

        //     var clubItem = this.clubBtnNode.parent.getChildByTag(index_invite);
        //     if( clubItem == undefined ) {
        //         clubItem = this.clubBtnNode;
        //         if( (index_invite-1000) > 0 ) {
        //             clubItem = cc.instantiate(this.clubBtnNode);
        //             this.clubBtnNode.parent.addChild( clubItem );

        //             clubItem.setPosition( cc.p( this.clubBtnNode.x, this.clubBtnNode.y-interval_h*(index_invite-1000) ) );
        //         }
        //     }
        //     clubItem.setTag( index_invite );
        //     clubItem.active = true;

        //     var bigPanel = clubItem.getChildByName('bigNode');
        //     var smallPanel = clubItem.getChildByName('smallNode');

        //     bigPanel.active = false;
        //     smallPanel.active = false;

        //     //两种底板循环显示
        //     var tempPanel;
        //     if( index_invite % 2 > 0 ) {
        //         bigPanel.active = true;
        //         tempPanel = bigPanel;
        //     }
        //     else {
        //         smallPanel.active = true;
        //         tempPanel = smallPanel;
        //     }

        //     var clickImg = tempPanel.getChildByName('clickSprite');
        //     var ordinaryImg = tempPanel.getChildByName('ordinarySprite');
        //     var clubName = tempPanel.getChildByName('clubName');

        //     if( (index_invite-1000) == 0 ) {
        //         clickImg.active = true;
        //     } else {
        //         clickImg.active = false;
        //     }

        //     ordinaryImg.setTag(clubData.club_id);                                                     //将俱乐部ID设置tag
        //     clubName.getComponent('cc.Label').string = clubData.clubName;    //俱乐部名字

        //     ordinaryImg.on(cc.Node.EventType.TOUCH_END,this.refreshMyClubBtn,this);

        //     index_invite++;
        // }
        var bigPanel = this.clubBtnNode.getChildByName('bigNode');
        var smallPanel = this.clubBtnNode.getChildByName('smallNode');
        bigPanel.active = false;
        smallPanel.active = true;
        var clubName = smallPanel.getChildByName('clubName');
        clubName.getComponent('cc.Label').string = clubData.clubName;
        //默认刷新第一个俱乐部的信息
        // var clubId = GameData.player.club[0].club_id;         //第一个俱乐部的ID
        this.refreshMyClubInfo();
    },

    refreshMyClubBtn: function (event) {
        ////////////////更新俱乐部详细信息
        var clubId = parseInt(event.target.tag);

        for (var key in this.clubBtnNode.parent.children) {
            var item = this.clubBtnNode.parent.children[key];
            if (!!item) {
                var bigPanel = item.getChildByName('bigNode');
                var smallPanel = item.getChildByName('smallNode');
                var big_clickImg = bigPanel.getChildByName('clickSprite');
                var small_clickImg = smallPanel.getChildByName('clickSprite');
                big_clickImg.active = false;
                small_clickImg.active = false;
            }
        }

        var clickImg = event.target.parent.getChildByName('clickSprite');
        clickImg.active = true;

        this.refreshMyClubInfo(clubId);
    },

    refreshMyClubInfo: function () {
        // var clubData = GameData.getClubDataByClubId( clubId );
        var clubData = GameData.player.club;
        if (clubData == null) {
            cc.log("data is null !! clubId = " + clubId);
            return;
        }

        ////俱乐部详细信息
        var myClubPanel = cc.find('myClubPanel', this.node);
        var BaseFrame = cc.find('myClubPanel/BaseFrame', this.node);

        var clubName = cc.find('myClubPanel/BaseFrame/club_name', this.node);
        var clubMainName = cc.find('myClubPanel/BaseFrame/club_main_name', this.node);
        var clubID = cc.find('myClubPanel/BaseFrame/club_ID', this.node);
        var clubNumber = cc.find('myClubPanel/BaseFrame/club_number', this.node);
        var clubNotice = cc.find('myClubPanel/BaseFrame/club_notice', this.node);
        // var clubDiamond = cc.find('myClubPanel/BaseFrame/club_diamond',this.node);
        // var quitBtn = cc.find('myClubPanel/BaseFrame/quitBtn',this.node);

        clubName.getComponent('cc.Label').string = clubData.clubName;
        clubMainName.getComponent('cc.Label').string = "代理:" + clubData.clubID;
        clubID.getComponent('cc.Label').string = "ID:" + clubData.clubID;
        clubNumber.getComponent('cc.Label').string = "人数:" + clubData.clubNumber;
        // clubDiamond.getComponent('cc.Label').string = clubData.diamond;
        clubNotice.getComponent('cc.Label').string = clubData.clubNotify;

        if (clubData.clubNotify == undefined || clubData.clubNotify == "null") {
            clubNotice.getComponent('cc.Label').string = "此代理很懒，没有留下任何信息。";
        }

        // quitBtn.setTag(clubId);
        // quitBtn.on(cc.Node.EventType.TOUCH_END,this.sendQuitClub,this);

        //添加俱乐部头像
        if (this.clubHeadNode == undefined) {
            this.clubHeadNode = cc.instantiate(this.clubHead);
            myClubPanel.addChild(this.clubHeadNode);

            this.clubHeadNode.setScale(1.5);
            this.clubHeadNode.setPosition(cc.p(480, 430));
        }
        //this.clubHeadNode.getComponent('playerTemplate').setPlayer(GameData.player);
        this.clubHeadNode.getComponent('playerTemplate').setName('');
        this.clubHeadNode.getComponent('playerTemplate').showZhuang(false);
        this.clubHeadNode.getComponent('playerTemplate').enableHeadBtn(false);
        //this.clubHeadNode.getComponent('playerTemplate').setHeadIcon(GameData.player.headimgurl);

    },

    refreshUIApplyClub: function () {
        //更新规则信息


        ////////////////更新邀请列表
        var noneData = cc.find('applyClubPanel/BaseFrame2/noneData', this.node);
        var inviteScrollView = cc.find('applyClubPanel/BaseFrame2/inviteScrollView', this.node);

        noneData.active = false;
        inviteScrollView.active = false;

        var inviteNumber = Object.keys(GameData.player.clubInvite).length; //邀请信息个数
        cc.log('inviteNumber:' + inviteNumber);
        if (inviteNumber <= 0) {
            noneData.active = true;
        } else {
            inviteScrollView.active = true;
        }

        //将ScrollView里的全部子节点隐藏
        for (var ii in this.inviteNode.parent.children) {
            var item = this.inviteNode.parent.children[ii];
            if (!!item) {
                item.active = false;
            }
        }

        //设置ScrollView容器高度
        var interval_Y = 10;
        this.inviteNode.getParent().height = (this.inviteNode.height + interval_Y) * inviteNumber;

        var index_invite = 1000;
        for (var key in GameData.player.clubInvite) {
            var clubData = GameData.player.clubInvite[key];
            if (clubData == undefined) {
                continue;
            }

            var clubItem = this.inviteNode.parent.getChildByTag(index_invite);
            if (clubItem == undefined) {
                clubItem = this.inviteNode;
                if ((index_invite - 1000) > 0) {
                    clubItem = cc.instantiate(this.inviteNode);
                    this.inviteNode.parent.addChild(clubItem);

                    clubItem.setPosition(cc.p(this.inviteNode.x, this.inviteNode.y - (this.inviteNode.height + interval_Y) * (index_invite - 1000)));
                }
            }
            clubItem.setTag(index_invite);
            clubItem.active = true;

            var clubName = clubItem.getChildByName('clubName');
            var noBtn = clubItem.getChildByName('noBtn');
            var yseBtn = clubItem.getChildByName('yseBtn');

            noBtn.setTag(clubData.club_id); //将俱乐部ID设置tag
            yseBtn.setTag(clubData.club_id);

            clubName.getComponent('cc.Label').string = clubData.clubName; //俱乐部名字

            noBtn.on(cc.Node.EventType.TOUCH_END, this.noJoinClubClick, this);
            yseBtn.on(cc.Node.EventType.TOUCH_END, this.yesJoinClubClick, this);

            index_invite++;
        }

        ////////////////////更新申请列表
        var noneDataLabel = cc.find('applyClubPanel/BaseFrame3/noneData', this.node);
        var applyScrollView = cc.find('applyClubPanel/BaseFrame3/applyScrollView', this.node);

        noneDataLabel.active = false;
        applyScrollView.active = false;

        var applyNumber = Object.keys(GameData.player.clubApply).length; //申请信息个数
        cc.log("applyNumber:" + applyNumber);
        if (applyNumber <= 0) {
            noneDataLabel.active = true;
        } else {
            applyScrollView.active = true;
        }

        //将ScrollView里的全部子节点隐藏
        for (var jj in this.applyNode.parent.children) {
            var child = this.applyNode.parent.children[jj];
            if (!!child) {
                child.active = false;
            }
        }

        //设置ScrollView容器高度
        this.applyNode.getParent().height = (this.applyNode.height + interval_Y) * applyNumber;

        var index_apply = 2000;
        for (var key in GameData.player.clubApply) {
            var clubData = GameData.player.clubApply[key];
            if (clubData == undefined) {
                continue;
            }

            var clubItem = this.applyNode.parent.getChildByTag(index_apply);
            if (clubItem == undefined) {
                clubItem = this.applyNode;
                if ((index_apply - 2000) > 0) {
                    clubItem = cc.instantiate(this.applyNode);
                    this.applyNode.parent.addChild(clubItem);

                    clubItem.setPosition(cc.p(this.applyNode.x, this.applyNode.y - (this.applyNode.height + interval_Y) * (index_apply - 2000)));
                }
            }
            clubItem.setTag(index_apply);
            clubItem.active = true;

            var clubName = clubItem.getChildByName('clubName');
            clubName.getComponent('cc.Label').string = clubData.clubName; //俱乐部名字

            index_apply++;
        }
    },

    noJoinClubClick: function (event) {
        var clubId = event.target.tag;
        cc.log("noJoin" + clubId);

        ClubHandler.getInstance().doInvite(clubId, false);
    },

    yesJoinClubClick: function (event) {
        var clubId = event.target.tag;
        cc.log("yesJoin" + clubId);

        ClubHandler.getInstance().doInvite(clubId, true);
    },

    sendApply: function () {
        var applyId = cc.find('applyClubPanel/BaseFrame4/applyEditBox', this.node).getComponent(cc.EditBox).string;
        cc.log("sendApply" + applyId);
        ClubHandler.getInstance().reqJoinClub(applyId);
    },

    sendQuitClub: function (event) {
        var clubId = event.target.tag;
        cc.log("sendQuitClub" + clubId);
        ClubHandler.getInstance().reqQuitClub(GameData.player.uid, clubId);
        this.clubHeadNode.active = false;
    },

    onClose: function () {
        closeView('PanelClub');
    }
});