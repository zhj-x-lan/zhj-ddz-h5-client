cc.Class({
    extends: cc.Component,

    properties: {
        spineNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },


    showEffect: function (type) {
        cc.log('show effect: ' + type);
        if (type == undefined) {
            return;
        }
        var spineUrl = '',
            spineAnim = '';
        switch (type) {
            case ActionType.peng:
                spineUrl = 'spine/table/peng';
                spineAnim = 'animation';
                break;
            case ActionType.minggang:
                spineUrl = 'spine/table/gang';
                spineAnim = 'a';
                break;
            case ActionType.minggangself:
                spineUrl = 'spine/table/gang';
                spineAnim = 'a';
                break;
            case ActionType.angang:
                spineUrl = 'spine/table/gang';
                spineAnim = 'a';
                break;
            case ActionType.hu:
                spineUrl = 'spine/table/hu';
                spineAnim = 'a';
                break;
            case ActionType.chi:
                spineUrl = 'spine/table/chi';
                spineAnim = 'a';
                break;
            case 'buhua':
                spineUrl = 'shishi/animation/bu/bu';
                spineAnim = 'animation';
                break;
        }

        var spineNode = this.spineNode;
        this.spineNode.active = true;
        cc.loader.loadRes(spineUrl, sp.SkeletonData, function (err, res) {
            var spine = spineNode.getComponent('sp.Skeleton');
            spine.skeletonData = res;
            spine.animation = spineAnim;
        });
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});