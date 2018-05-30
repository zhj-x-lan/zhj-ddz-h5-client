var configMgr = require('configMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        pageView: cc.PageView,
        pageItem: cc.Node,
        pageFlag: cc.Node,
        pageFlagItem: cc.Node
    },

    onLoad: function () {

        //自动翻页限制累计时间
        this.limit_time = 0;

        this.posterData = configMgr.getPoster();
        if(this.posterData == undefined || this.posterData.length <= 0){
            return;
        }

        this.pageContent = this.pageView.content;

        this.pageContent.width = this.posterData.length * this.pageItem.width;

        this.initPageContent();
    },
    update: function (dt) {

        var sum = this.pageView.getPages().length;
        if(sum <= 1){
            return;
        }

        this.limit_time += dt;
        if (this.limit_time > 3) {
            this.limit_time = 0;
            this.changeCurPageIndex();
            this.updatePageFlag();
        }
        this.updatePageFlag();
    },

    initPageContent: function () {

        //移除所有子页面
        this.pageView.removeAllPages();
        this.pageContent.removeAllChildren();

        for (var key = 0; key < this.posterData.length; key++) {
            var url = this.posterData[key];
            if (url.length <= 0) {
                continue;
            }

            var webNode;
            if (key == 0) {
                webNode = this.pageItem;
            } else {
                webNode = cc.instantiate(this.pageItem);
            }
            this.pageView.addPage(webNode);

            webNode.position = cc.p(this.pageItem.x + key * this.pageItem.width, this.pageItem.y);

            var sprite = webNode.getChildByName('sprite');
            this.loadImage(url, sprite);
        }

        this.initPageFlag();

        var sum = this.pageView.getPages().length;
        if(sum <= 1){
            this.pageView.elastic = false;
        }
    },

    loadImage: function (url, sprite) {
        var texture = cc.textureCache.addImage(cc.url.raw(url));
        sprite.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
    },

    initPageFlag: function () {

        //移除所有 flag 节点
        this.pageFlag.removeAllChildren();

        var sum = this.pageView.getPages().length;
        var interval = 30;

        //计算出第一个 flag 的 x 轴位置
        var init_x = 0;
        if (sum % 2 > 0) {
            //奇数
            init_x = -(parseInt(sum / 2) * this.pageFlagItem.width + parseInt(sum / 2) * interval + this.pageFlagItem.width / 2);
        } else {
            //偶数
            init_x = -(parseInt(sum / 2) * this.pageFlagItem.width + (parseInt(sum / 2) - 1) * interval + interval / 2);
        }

        for (var key = 0; key < sum; key++) {
            var flagItem;
            if (key == 0) {
                flagItem = this.pageFlagItem;
            } else {
                flagItem = cc.instantiate(this.pageFlagItem);
            }
            flagItem.name = "falgItem_" + key;
            this.pageFlag.addChild(flagItem);

            flagItem.position = cc.p(init_x + key * (this.pageFlagItem.width + interval), this.pageFlagItem.y);
        }

        this.updatePageFlag();
    },

    changeCurPageIndex: function () {
        var index = this.pageView.getCurrentPageIndex() + 1;
        if ((index + 1) > this.pageView.getPages().length) {
            index = 0;
        }
        this.pageView.setCurrentPageIndex(index);
    },

    updatePageFlag: function () {

        for (var key = 0; key < this.pageFlag.getChildrenCount(); key++) {
            var node = this.pageFlag.getChildren()[key];
            var click = node.getChildByName('click');
            click.active = false;
        }

        var index = this.pageView.getCurrentPageIndex();
        var name = "falgItem_" + index;
        var flagNode = this.pageFlag.getChildByName(name);
        flagNode.getChildByName('click').active = true;

    },

    pageViewEvent: function () {
        var sum = this.pageView.getPages().length;
        if(sum <= 1){
            return;
        }

        this.limit_time = 0;
        this.updatePageFlag();
    },

    onClose: function () {
        closeView('PosterPanel');
    }
});