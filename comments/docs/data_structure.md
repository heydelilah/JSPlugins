api design

#### 字段

[
  {
    "ArticleId": 10,					// 对应的文章Id
    "UserId": 1,						// 发布者Id／当前登陆用户
    "UserName": "Delilah",				// 发布者的名字
    "CommentLink": 0,					// 如果是二级回复，此字段记录对应的评论id
    "PeopleName": "",					// 如果是二级回复，此字段记录回复者的名称
    "Content": "sd",					// 评论内容
    "Level": 1,							// 等级：1 主级回复，2 次级回复
    "Id": 107,							// 评论Id
    "Like": "2,3",						// 点赞的人们的Ids
    "TimeCreate": 1443863871289,		// 创建时间
    "TimeModified": 1443863871289		// 修改时间
  },
  {
    "ArticleId": 10,
    "UserId": 1,
    "UserName": "Delilah",
    "CommentLink": "107",
    "PeopleName": "Delilah",
    "Content": "s",
    "TimeCreate": 1443864024023,
    "TimeModified": 1443864024023,
    "Level": 2,
    "Id": 108
  }
]

#### 接口

#### `/api/comments` － 列出所有评论

1. GET
2. 发送参数：

	'ArticleId'
	'PageSize'
	'PageIndex'

3. 返回数据：

#### `/api/comments` － 新建一条评论

1. POST
2. 发送参数：

	'ArticleId': 	// 文章Id
	'CommentId': 	// 评论ID
	'PeopleName': 	// 回复对象的花名
	'Content': 		// 评论内容

3. 返回数据：

#### `/api/comments` － 更新某条评论

1. PUT
2. 发送参数：

	'Id'
	'Content'

3. 返回数据：

#### `/api/comments` － 删除某条评论

1. DELETE
2. 发送参数：

	'Id'

3. 返回数据：

###

- 用户Id: 1-9
- 文章Id: 10-99
- 评论Id: 100-999

用户表

	User: [
	    {
	        "Id": 1,
	        "Name": "Delilah"
	    },
	    {
	        "Id": 2,
	        "Name": "Ming"
	    }
	]
