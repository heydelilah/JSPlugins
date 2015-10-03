
var CommentControl = function(selector){
    this.init(selector);
};

$.extend(CommentControl.prototype, {
    init: function (selector) {
        var me = this;

        me.$el = $(selector);

        me.config = {
            // 当前登陆者花名
            'USER_NAME': window.user.name,

            // 评论模块－单页显示数量
            'COMMENT_PAGE_LIMIT': 20,

            // 评论
            'COMMENT_URL': '/api/comments'
        };

        // 全局弹框 －回复评论
        me.$panelReply = null;
        // 全局弹框 －编辑评论
        me.$panelEdit = null;

        // 蒙板
        me.$loading = me.$el.find('.J_loading');

        // 获取当前文章id
        var id = window.location.search.match(/id=(\d+)/);
        me.articleId = id ? id[1] : 10;

        // 分页器配置
        me.pager = {
            total: 0, // 评论总数
            page: 1,  // 当前页码
            limit: 20 // 单页显示数
        };

        // 当前回复对象的id
        me.commentId = 0;
        // 当前回复对象的花名
        me.peopleName = '';

        // 分页器
        me.pagination = null;

        // 绑定事件
        me.initEvents();

        // 初始化子模块
        me.initPager();
        me.initReplyPanel();
        me.initEditPanel();

        me.$el.find('.J_User').text(me.config.USER_NAME);

        // 加载评论数据
        me.load();

    },

    // 绑定事件
    initEvents: function () {
        var me = this;

        // 展板－展开 收起
        me.$el.on('click', '.J_CommentToggleBtn', $.proxy(me.onTogglePanel, me));

        // 控件事件：回复，喜欢，编辑，删除
        me.$el.on('click', '.J_reply', $.proxy(me.onReplyClick, me));
        me.$el.on('click', '.J_edit', $.proxy(me.onEditClick, me));
        me.$el.on('click', '.J_like', $.proxy(me.onLikeClick, me));
        me.$el.on('click', '.J_delete', $.proxy(me.onDeleteClick, me));

        // 按钮事件：评论
        me.$el.on('click', '.J_Comment', $.proxy(me.onComment, me));
        me.$el.on('click', '.J_Comment_cancel', $.proxy(me.onCommentCancel, me));

        // 按钮事件：编辑
        me.$el.on('click', '.J_Edit', $.proxy(me.onEdit, me));
        me.$el.on('click', '.J_Edit_cancel', $.proxy(me.onEditCancel, me));
    },
    // 初始化回复弹框
    initReplyPanel: function(){
        var me = this,
            $target = me.$el.find('[commentReplyPopwin]');

        me.$panelReply = $([
            '<div class="comment_popwin J_Comment_panel hidden">',
                '<div class="head">',
                    '<span class="comment_head_name mr5"><a class="J_Name_send">'+me.config.USER_NAME+'</a></span>',
                    '<span>回复</span>',
                    '<span class="comment_head_name ml5"><a class="J_Name_receive"></a></span>',
                '</div>',
                '<textarea class="J_Comment_textarea" name="" id=""></textarea>',
                '<div class="buttons">',
                    '<button class="btn btn-default mr5 J_Comment_cancel">取消</button>',
                    '<button class="btn btn-primary J_Comment">评论</button>',
                '</div>',
            '</div>'
        ].join('')).appendTo($target);
    },
    // 初始化编辑弹框
    initEditPanel: function(){
        var me = this,
            $target = me.$el.find('[commentEditPopwin]');

        me.$panelEdit = $([
            '<div class="comment_popwin J_Comment_panel comment_edit_popwin hidden">',
                '<textarea class="J_Comment_textarea" name="" id=""></textarea>',
                '<div class="buttons">',
                    '<button class="btn btn-default mr5 J_Edit_cancel">取消</button>',
                    '<button class="btn btn-primary J_Edit">保存</button>',
                '</div>',
            '</div>'
        ].join('')).appendTo($target);
    },
    // 初始化分页器
    initPager: function(){
        var me = this;
        me.pagination = new PaginationControl('[pagination]', $.proxy(me.eventChangePage, me));
    },

    // 加载数据
    load: function(){
        var me = this;

        me.showLoading();

        // 拉数据
        $.get(
            me.config.COMMENT_URL,
            {
                'ArticleId': me.articleId, // 文章Id
                'PageSize': me.pager.limit,
                'PageIndex': me.pager.page
            },
            $.proxy(me.onData, me)
        );
    },
    // 拉回数据
    onData: function(data){
        var me = this;

        me.hideLoading();

        // 全局数据
        me.setData(data);

        // 构建评论分页器
        me.pagination.setData({
            // 评论总数
            'total': me.pager.total,
            // 单页显示数
            'limit': me.config.COMMENT_PAGE_LIMIT,
            // 当前页码
            'page': me.pager.page
        }).build();

        // 设置总评论数
        me.$el.find('.J_CommentAll').text(me.pager.total);

        // 开始构建
        me.reset().build();
    },
    // 设置数据
    setData: function(data){
        var me = this,
            comments = data.items,
            // 映射表 －二级回复
            mapping = data.mapping,
            // 映射表 －点赞
            like,
            // 当前登陆用户 点赞过的评论
            ILike,

            result = [],
            i, ii, valueI, valueII, replyList;

        for (i = 0; i < comments.length; i++) {
            // 单条一级评论
            valueI = comments[i];

            replyList = mapping[valueI.Id] || [];

            // 创建一个新数组
            var child = [];

            for (ii = 0; ii < replyList.length; ii++) {
                // 单条二级评论
                valueII = replyList[ii];

                child.push({
                    'Id': valueII.Id,
                    'User_send': valueII.UserName,
                    'Date': me._formatDate(valueII.TimeCreate, "yyyy-MM-dd hh:mm"),
                    'Content': valueII.Content,
                    'User_receive': valueII.PeopleName,
                    'IsAuthor': me.config.USER_NAME == valueII.UserName
                })
            };

            like = valueI.Like && valueI.Like.split(',')||[];
            ILike = _.find(like, function(chr){
                return +chr === window.user.id;
            });

            result.push({
                'Id': valueI.Id,
                'Name': valueI.UserName,
                'Date': me._formatDate(valueI.TimeCreate, "yyyy-MM-dd hh:mm"),
                'Content': valueI.Content,
                'List':child,
                'List_amt': child.length,
                'Like': like.length || 0,
                'IsAuthor': me.config.USER_NAME == valueI.UserName,
                'IsAuthorLike': ILike
            });
        };

        // 更新评论总数
        me.pager.total = comments.length;

        me.data = result;
    },
    // 重置弹框位置
    reset: function(){
        var me = this;

        me.$panelReply.appendTo(me.$el.find('[commentReplyPopwin]'));
        me.$panelEdit.appendTo(me.$el.find('[commentEditPopwin]'));

        return me;
    },
    // 构建
    build: function () {
        var me = this,
            html = $.trim($('#J_comment_template').html());
            var compiled = _.template(html),
            compiledHtml = compiled({'comments': me.data});

        me.$el.find('.commentList').html(compiledHtml);
    },

    // 响应“回复”事件 －弹出评论框
    onReplyClick: function(e){
        var me = this,
            $target = $($(e.currentTarget).parent()[0]),
            id = $target.attr('data-id'),
            name = $target.attr('data-name');

        // 更新当前回复对象信息
        me.commentId = id;
        me.peopleName = name;

        me.showReplyPanel($target);
    },
    // 响应“发布评论”事件️
    onComment: function (e) {
        var me = this,
            $target = $(e.currentTarget),
            $textarea = $target.parents('.J_Comment_panel').find('textarea'),

            value = $textarea.val();

        // 更新当前回复对象id
        if($target.attr('data-type')){
            me.commentId = 0;
        }

        if(value){
            $.ajax({
                type:'POST',
                url: me.config.COMMENT_URL,
                data: {
                    'ArticleId': me.articleId, // 文章Id
                    'CommentId': me.commentId || '',                        // 评论ID
                    'PeopleName': me.commentId ? me.peopleName: '',    // 回复对象的花名
                    'Content': value                                // 评论内容
                },
                success:function(data) {
                    console.log(data);

                    // 清空textarea
                    $textarea.val('');

                    me.load();
                },
                error: function(data) {
                    console.log(data);
                }
            });

            me.hidePanel('reply');
        }else{
            alert('请输入评论内容')
        }
    },
    // 响应“取消评论”事件
    onCommentCancel: function(e){
        var me = this;

        me.hidePanel('reply');
    },
    // 响应“编辑”事件 －弹框编辑框
    onEditClick: function (e) {
        var me = this,
            $target = $(e.currentTarget);
            $ctrl = $($target.parent()[0]),
            id = $ctrl.attr('data-id');

            me.$content = $ctrl.siblings('.comment_content');
            value = me.$content.text();
            me.$content.hide();

        // 更新当前回复对象信息
        me.commentId = id;

        me.showEditPanel($ctrl, value);
    },
    // 响应“编辑”事件
    onEdit: function(e){
        var me = this,
            $target = $(e.currentTarget),
            $textarea = $target.parents('.J_Comment_panel').find('textarea'),

            value = $textarea.val();
        me.$content.show();
        if(value){
            $.ajax({
                type:'PUT',
                url: me.config.COMMENT_URL,
                data: {
                    'Id': +me.commentId,
                    'Content': value
                },
                success:function(data) {
                    console.log(data);
                    me.load();
                },
                error: function(data) {
                    console.log(data);
                }
            });

            me.hidePanel('edit');
        }else{
            alert('请输入内容')
        }
    },
    // 响应“取消编辑”事件
    onEditCancel: function(e){
        var me = this;

        me.$content.show();

        me.hidePanel('edit');
    },

    // 响应“删除”事件
    onDeleteClick: function(e){
        var me = this,
            $target = $(e.currentTarget).parent(),
            id = $target.attr('data-id');

        if(confirm('确定要删除此评论吗？')){
            $.ajax({
                type:'Delete',
                url: me.config.COMMENT_URL,
                data: {
                    'Id': +id
                },
                success:function(data) {
                    me.load();
                },
                error: function(data) {
                    console.log(data);
                }
            });
        }
    },
    // 响应“点赞”事件
    onLikeClick: function(e){
        var me = this,
            $target = $(e.currentTarget).parent(),
            id = $target.attr('data-id'),
            alreadyLike = $target.find('.J_like em').hasClass('glyphicon-heart');

        // 不可重复点赞
        if(!alreadyLike){
            $.ajax({
                type:'PUT',
                url: me.config.COMMENT_URL+'/'+id+'/like',
                success:function(data) {
                    console.log(data);
                    me.load();
                },
                error: function(data) {
                    console.log(data);
                }
            });
        }
    },

    // 子模块事件 －分页器
    eventChangePage: function (page) {
        var me = this;

        me.pager.page = page;

        me.load();
    },

    // 显示编辑框
    showEditPanel: function(target, value){
        var me = this,
            $target = target,
            $textarea = me.$panelEdit.find('textarea');


        $textarea.val($.trim(value));

        me.$panelEdit.addClass('G_block').removeClass('hidden');
        $target.before(me.$panelEdit);
    },
    // 显示回复框
    showReplyPanel: function(target){
        var me = this,
            $target = target,
            $textarea = me.$panelReply.find('textarea');

        me.$panelReply.find('.J_Name_receive').text(me.peopleName);
        $textarea.empty();

        me.$panelReply.addClass('G_block').removeClass('hidden');
        $target.after(me.$panelReply);
    },
    // 隐藏框
    hidePanel: function(type){
        var me = this;

        var $el = type=='reply' ? me.$panelReply: me.$panelEdit;

        $el.addClass('hidden').removeClass('G_block');
    },

    // 展开／收起
    onTogglePanel: function (e) {
        var me = this,
            $btn = $(e.currentTarget),
            $wrapper = me.$el.find('.commentContent');

        if ($btn.hasClass('glyphicon-menu-up')) {
            $wrapper.css('display', 'none');
            $btn.removeClass('glyphicon-menu-up')
                .addClass('glyphicon-menu-down');
            return;
        }

        if ($btn.hasClass('glyphicon-menu-down')) {
            $wrapper.css('display', 'inherit');
            $btn.removeClass('glyphicon-menu-down')
                .addClass('glyphicon-menu-up');
            return;
        }
    },


    showLoading: function(){
        var me = this,
            $wrapper = me.$el.find('.commentList');

        me.$loading.css({
            'width': $wrapper.outerWidth(),
            'height': $wrapper.outerHeight()
        }).show();
    },
    hideLoading: function(){
        var me = this;

        me.$loading.css({
            'width': 0,
            'height': 0
        }).hide();
    },

    // 日期格式化函数 －内部调用
    _formatDate: function(value, format){
        var date = new Date(value);

        var o = {
            "M+" : date.getMonth()+1, //month
            "d+" : date.getDate(), //day
            "h+" : date.getHours(), //hour
            "m+" : date.getMinutes(), //minute
            "s+" : date.getSeconds(), //second
            "q+" : Math.floor((date.getMonth()+3)/3), //quarter
            "S" : date.getMilliseconds() //millisecond
        };

        if(/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        }

        for(var k in o) {
            if(new RegExp("("+ k +")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
            }
        }
        return format;
    }

});
