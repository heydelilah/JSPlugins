
var UploaderControl = function(selector) {
	var me = this;
	me.$el = $(selector);
	me.init();
};

$.extend(UploaderControl.prototype, {
	init : function() {
		var me = this;

		me.config = {
			// 允许的附件后缀名称
			'ALLOW_SUFFIX': 'pdf,doc,docx,ppt,pptx,xlsx,txt',
			// 单个附件大小限制
			'ONE_SIZE_LIMIT': 25 * 1024 * 1024,
			// 所有附件加起来大小限制
			'ALL_SIZE_LIMIT': 1024 * 1024 * 1024,

			// 提示信息
			'ERROR_SUFFIX': '附件格式只支持：PPT、PDF、WORD、EXCEL、TXT',
            'ERROR_SIZE_ONE': '单个附件最大25MB',
            'ERROR_SIZE_ALL': '总上传数不能超过50MB'
		};

		/**
		 * 传参变量名说明：
		 * 	downloadable: 是否允许此文件被下载
		 * 	isShow: 是否允许展示此文件－单选
		 */

		// @todo: 以上两个自定义的属性不应放在 file 对象中；因为服务端是拿不到的


		// 上传按钮
		me.$uploadBtn = me.$el.find('.J_uploadBtn');
		// 展示区域
		me.$area = me.$el.find('.J_uploadList');
		// 上传结果展示区域
		me.$result = me.$el.find('.J_showResult');

		// 上传的文件
		me.files = [];
		// 文件大小总量
		me.totalSize = 0;
		// 文件序号
		me.index = 1;

		me.initEvents();
	},

	initEvents : function() {
		var me = this;

		// 绑定上传按钮事件
		me.$uploadBtn.on('change', $.proxy(me.onFileChange, me) );
		me.$el.on('click', '.Upload_listItem .downloadable', $.proxy(me.onToggleDownloadable, me) );
		me.$el.on('click', '.Upload_listItem .delete', $.proxy(me.onDelete, me) );
		me.$el.on('click', '.Upload_listItem .showable', $.proxy(me.onToggleShowable, me) );

		// 绑定保存表单事件
		me.$el.find('.J_save').on('click', $.proxy(me.onSave, me));
	},

	// 响应“允许下载”事件
	onToggleDownloadable: function(e){
		var me = this,
			fileList = me.files,
			$target = $(e.currentTarget),
			index = $target.parents('.Upload_listItem').attr('data-index');

		for (var i = 0; i < fileList.length; i++) {
			if(fileList[i].index === +index){
				fileList[i].downloadable = !fileList[i].downloadable
			}
		}
	},
	// 响应删除事件
	onDelete: function(e){
		var me = this,
			fileList = me.files,
			$target = $(e.currentTarget),
			index = $target.parents('.Upload_listItem').attr('data-index');

		for (var i = 0; i < fileList.length; i++) {
			if(fileList[i].index === +index){
				fileList.splice(i,1);
			}
		}

		me.render();
	},
	// 响应“设置展示”事件
	onToggleShowable: function(e){
		var me = this,
			fileList = me.files,
			$target = $(e.currentTarget),
			index = $target.parents('.Upload_listItem').attr('data-index');

		for (var i = 0; i < fileList.length; i++) {
			if(fileList[i].index === +index){
				fileList[i].isShow = true;
			}else{
				fileList[i].isShow = false;
			}
		}

		me.render();
	},
	// 文件改变
	onFileChange: function(e){
		var me = this;

		var fileList = me.$uploadBtn.get(0).files,
			file;

		for (var i = 0; i < fileList.length; i++) {
			file = fileList[i];

			// 检查格式；大小
			if(!me.validate(file)){
				continue;
			}

			file.index = me.index++;

			me.files.push(file);

			// 更新文件总大小
			me.totalSize+= file.size;
		}
		me.render();
	},

	render: function(){
		var me = this,
			fileList = me.files,
			file,html;

		me.$area.empty();

		for (var i = 0; i < fileList.length; i++) {
			file = fileList[i];

			$([
				'<div class="Upload_listItem" data-index="'+file.index+'">',
					'<em class="glyphicon glyphicon-paperclip"></em>',
					'<span class="name" title="'+file.name+'">',
						file.name,
					'</span>',

					'<span>',
						'<label class="downloadable">',
							'<input type="checkbox"'+(file.downloadable? 'checked': '')+'>',
							'允许下载',
						'</label>',
					'</span>',

					'<span>',
						'<label class="showable">',
							'<input type="radio"'+(file.isShow? 'checked': '')+'>',
							'设为展现',
						'</label>',
					'</span>',

					'<span class="delete btn btn-default">',
						'删除',
					'</span>',
				'</div>'
			].join('')).appendTo(me.$area);
		}
	},
	// 格式检查
	validate: function(file){
		var me = this,
			c = me.config;

		// 检查后缀
		var suffix = c.ALLOW_SUFFIX.split(','),
			name = file.name,
			result = false,
			suffixLen,i;


		for (i = 0; i < suffix.length; i++) {
			suffixLen = suffix[i].length;

			if (name.substr(name.length - suffixLen, suffixLen).toLowerCase() == suffix[i].toLowerCase()) {
				result = true;
				break;
			}
		}
		if(!result){
			console.error(c.ERROR_SUFFIX);
			return false
		}


		// 检查单个文件大小
		if(file.size>c.ONE_SIZE_LIMIT){
			console.error(c.ERROR_SIZE_ONE);
			return false;
		}


		// 检查所有文件总量
		if(me.totalSize+file.size > c.ALL_SIZE_LIMIT){
			console.error(c.ERROR_SIZE_ALL);
			return false;
		}

		// 检查是否重复上传 －名字相同
		// @优化todo: 不仅名字相同，大小也相同 才被认为是重复文件；


		return true;
	},
	// 获取数据
	getValue: function(){
		var me = this;

		return me.files;
	},
	// 响应“保存”事件
	onSave: function(e) {
		var me = this,
        	files = me.getValue(),
        	fd = new FormData();

		console.log(files, 'Upload files');

		for (var i = 0; i < files.length; i++) {
			fd.append('files', files[i]);
		};

        $.ajax({
        	url: '/upload',
        	method: 'POST',
        	data: fd,
			processData: false,
			contentType: false
        }).done(function(data){
        	console.log(arguments);
        	me.$result.addClass('done').text('SUCCESS').show().fadeOut( "slow");

        }).fail(function(data){
        	console.log(arguments);
        	me.$result.removeClass('done').text('FAILED').show().fadeOut( "slow");
        })

	}
});

new UploaderControl('[uploader]');

