var blog = angular.module('blog', ['ngRoute', 'ngSanitize', 'angular-loading-bar']);
blog.config([
	'$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/article/list.html',
				controller: 'IndexCtrl'
			})
			.when('/article/:id', {
				templateUrl: 'views/article/view.html',
				controller: 'ArticleViewCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	}
]);
var _api = 'http://www.ddhigh.com/api/home';
blog.controller('IndexCtrl', [
	'$scope', '$http', function($scope, $http) {
		$scope.busy = false;
		$scope.limit = 10;
		$scope.total = 0;
		$scope.currentPage = 1;
		$scope.pages = 1;
		$scope.load = function() {
			if ($scope.busy) {
				return;
			}
			$scope.busy = true;
			$http.get(_api+'/article/lists/page/'+$scope.currentPage).success(function(data) {
				$scope.busy = false;
				if (data.total != undefined && data.total > 0) {
					$scope.busy = false;
					$scope.total = data.total;
					$scope.list = data.list;
					$scope.category = data.category;
					$scope.pages = Math.ceil(data.total/$scope.limit);
				}
			});
		};
		$scope.prev = function() {
			if ($scope.currentPage > 1) {
				$scope.currentPage--;
				$scope.load();
			}
		};
		//下一页
		$scope.next = function() {
			if ($scope.currentPage < $scope.pages) {
				$scope.currentPage++;
				$scope.load();
			}
		};
	}
]);
blog.controller('ArticleViewCtrl', [
	'$scope', '$http', '$routeParams', '$rootScope', '$location', function($scope, $http, $routeParams, $rootScope, $location) {
		$scope.comments = [];
		$scope.article = {};
		//加载文章内容
		$http.get(_api+'/article/view/id/'+$routeParams.id).success(function(data) {
			if (data.error) {
				alert(data.error);
				$location.path('/');
			}
			else {
				$rootScope.title = data.post_title+' - Lei Xia\'s Blog';
				$scope.article = data;
			}
		});
		//加载评论
		$http.get(_api+'/comment/lists/id/'+$routeParams.id).success(function(data) {
			if (data == "null") {
				$scope.comments = [];
			}
			else {
				$scope.comments = data;
			}
		});
		//评论
		$scope.post = function(comment) {
			if ($scope.busy) {
				return;
			}
			$scope.busy = true;
			$http.post(_api+'/comment/post/id/'+$routeParams.id, comment).success(function(data) {
				$scope.busy = false;
				if (data.error) {
					alert(data.error);
				}
				else {
					if ($scope.comments.length == 0) {
						$scope.comments = [data];
					}
					else {
						$scope.comments.splice(0,0,data);
					}
				}
			});
		};
	}
]);