var express = require('express');
var Bourne = require('bourne');
var bodyParser = require('body-parser');

var commentsDB = new Bourne('data/comments.json');

var router = express.Router();

// 注册中间件bodyParser
router.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));

// 增删改查
router.route('/comments')
	// 获取全部记录
	.get(function(req, res){

        // 由于id可能是字符串，要先转换为整型类型
        commentsDB.find({'ArticleId': parseInt(req.query.ArticleId, 10)}, function(err, data){
        	var result = [],
        		// 二级回复映射表
        		mapping={},
        		// 单条记录
        		record,
        		name,
        		i;

        	for (i = 0; i < data.length; i++) {
        		record = data[i];
        		if(record.Level === 1){
        			result.push(record);
        		}
        		if(record.Level === 2){
        			name = record.CommentLink;
        			if(!mapping[name]){
        				mapping[name] = [];
        			}
        			mapping[name].push(record);
        		}
        	};
			res.json({
				'items': result,
				'mapping': mapping
			});
		});
	})
	// 新建一条记录
	.post(function(req, res){
		var param = req.body;

		var isTopLevel = !param.CommentId;

		var record = {
			"ArticleId": +param.ArticleId,
			"UserId": GLOBAL.user.id,
			"UserName": GLOBAL.user.name,
			"CommentLink": isTopLevel ? 0 : param.CommentId,
			"PeopleName": param.PeopleName,
			"Content": param.Content,
			"TimeCreate": new Date().getTime(),
			"TimeModified": new Date().getTime(),
			"Level": isTopLevel ? 1 : 2
		};

		commentsDB.insert(record, function(err, data){
			res.json(data);
		});
	})

	// 更新单条记录
	.put(function(req, res){
		var params = req.body;

		commentsDB.update(
			{'Id': parseInt(params.Id, 10)},
			{
				$set: {
					"Content": params.Content,
					"TimeModified": new Date().getTime(),
				}
			},
			function(err, data){
				res.json(data[0]);
			}
		);
	})

	// 删除单条记录
	.delete(function(req, res){
		var params = req.body;

		commentsDB.delete({'Id': parseInt(params.Id, 10)}, function(){
			res.json(null)
		})
	})

// 点赞
router
	// 处理参数
	.param('id', function(req, res, next){
		// 有可能是post形式，也有可能是get形式
		req.dbQuery = {'Id': parseInt(req.params.id, 10)};
		next();
	})

	.route('/comments/:id/like')

	// 获取单条记录
	.put(function(req, res){
		commentsDB.findOne(req.dbQuery, function(err, data){
			console.log(data);
			var value = data.Like&&data.Like.split(',') || [];
			value.push(GLOBAL.user.id);

			commentsDB.update(
				req.dbQuery,
				{
					$set: {
						"Like": value.join()
					}
				},
				function(err, data){
					res.json(data);
				}
			);
		});
	})

module.exports = router;

