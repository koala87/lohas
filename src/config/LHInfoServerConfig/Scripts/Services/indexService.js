'use strict';

var indexService = angular.module('indexService', []);

var serviceUrl = '';

//分页查询配置信息
indexService.service('getAllData', ['$http', '$q', function ($http, $q) {

    var url = serviceUrl + '/rs/configs/';
    return {
        query: function (curPage, pageSize) {
            var deferred = $q.defer();
            $http.get(
                url + curPage + '/' + pageSize,
	            {
	                headers: { 'accept': 'application/json;odata=verbose' }
	            }
			).success(function (data, status, headers, config) {
			    var dataInfo = data;
			    deferred.resolve(dataInfo);

			}).error(function (data, status, headers, config) {
			    deferred.reject(data);
			});
            return deferred.promise;
        }
    }
}]);

//新增或者编辑
indexService.service('editOrAdd', ['$http', '$q', function ($http, $q) {

    var url = serviceUrl + '/rs/configs';
    return {
        query: function (parmas) {
            var deferred = $q.defer();
            $http.post(
                url,parmas,
	            {
	                headers: { 'accept': 'application/json;odata=verbose' }
	            }
			).success(function (data, status, headers, config) {
			    var dataInfo = data.data;
			    deferred.resolve(dataInfo);

			}).error(function (data, status, headers, config) {
			    deferred.reject(data);
			});
            return deferred.promise;
        }
    }
}]);

//删除配置信息
indexService.service('deleteConfig', ['$http', '$q', function ($http, $q) {

    var url = serviceUrl + '/rs/configs/delete/';
    return {
        query: function (name) {
            var deferred = $q.defer();
            $http.get(
                url + name ,
	            {
	                headers: { 'accept': 'application/json;odata=verbose' }
	            }
			).success(function (data, status, headers, config) {
			    var dataInfo = data.data;
			    deferred.resolve(dataInfo);

			}).error(function (data, status, headers, config) {
			    deferred.reject(data);
			});
            return deferred.promise;
        }
    }
}]);

