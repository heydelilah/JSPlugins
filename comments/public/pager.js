var PaginationControl = function(selector){
    this.init(selector);
};

$.extend(PaginationControl.prototype, {

    init: function (selector, cb) {
        var me = this;

        me.$el = $(selector);

        me.eventChangePage = cb;

        // 评论总数
        me.total = 0;
		// 单页显示数
        me.limit = 20;
        // 当前页码
        me.page = 1;
        // 页数
        me.amount = 0;

        me.$el.addClass('pagination').css('visibility', 'inherit');

        me.initEvents();
    },
    initEvents: function(){
    	var me = this;

    	me.$el.on('click', 'li[data-index]', $.proxy(me.onButtonClick, me));
    	me.$el.on('click', 'li.previous', $.proxy(me.onPrevious, me));
    	me.$el.on('click', 'li.next', $.proxy(me.onNext, me));
    },
    // 构建
    build: function(){
    	var me = this;

        if(!me.amount){
            return false;
        }

    	me.$el.empty();

    	var html = '<ul class="pagerWrapper"><li class="previous"><span> < </span></li>';

    	for (var i = 0; i < me.amount; i++) {
    		html += '<li data-index="'+(i+1)+'"><span>'+(i+1)+'</span></li>';
    	};

    	html += '<li class="next"><span>下一页 ></span></ul></li>';

    	$(html).appendTo(me.$el);

    	me.render();
    },
    // 渲染状态
    render: function(){
    	var me = this,
    		$pre = me.$el.find('.previous'),
    		$next = me.$el.find('.next');

    	// 清除样式
		me.$el.find('li').removeClass('disabled active');

    	// 渲染按钮状态 －是否禁用
    	if(me.page === 1){
    		$pre.addClass('disabled');
    	}
    	if(me.page === me.amount){
    		$next.addClass('disabled');
    	}

    	// 渲染当前页激活状态
		me.$el.find('li[data-index='+me.page+']').addClass('active');
    },
    // 切换页
    changePage: function(page){
    	var me = this;

		if(me.page != page){
			// 更新页码
			me.page = +page;
    		me.eventChangePage(page);
		}
    },
    // 更新数据
    setData: function(data){
    	var me = this;

    	me.total = +data.total;
        me.limit = +data.limit;
        me.page = +data.page;
        me.amount = Math.ceil(me.total / me.limit);

    	return me;
    },

    onButtonClick: function(e){
    	var me = this,
    		$target = $(e.currentTarget),
    		page = $target.attr('data-index');

		me.changePage(page);
		me.render();
    },
    onNext: function(e){
    	var me = this;
    	if(me.page === me.amount){
    		return;
    	}
    	me.changePage(me.page+1);
    	me.render();
    },
    onPrevious: function(e){
    	var me = this;
    	if(me.page === 1){
    		return;
    	}
    	me.changePage(me.page-1);
    	me.render();
    }
});
