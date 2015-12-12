
var indexController = angular.module('indexController', []);

indexController.controller('indexCtrl', function ($scope, getAllData, editOrAdd, deleteConfig) {
    var curPage = 1,
        pageSize = 10,
        parmas = {
            "name": '',
            "value": '',
            "detail": '',
        };

  
    //取得当前 page 页数
    var currentPage = getQueryStringParameter("pageIndex");

    function paginationClick() {
        var curPage = parseInt($("#pagination .current").text());
        init(curPage);
    };

    init(curPage);

    function init(curPage) {
        // 初始数据
        getAllData.query(curPage, pageSize).then(function (data) {

            $scope.getAllData = data.data.items;

            //分页
            Pagination.Init(document.getElementById('pagination'), {
                size: data.data.num_pages,//总页数
                page: curPage,
                backFn: function (curPage) {
                    paginationClick();
                }
            });

        }, function (data) {
            $scope.getAllData = { error: 'no data' };
        });
    }

    //删除model show
    $scope.deleteModelShow = function (name) {
        $('#deleteModel').modal('show');
        $scope.deleteName = name;
    }
    
    //编辑model show
    $scope.editModelShow = function (name, val, detail) {
        clear();
        $('#editOrAddModel h4').text('编辑');
        $('#editOrAddModel').modal('show');
        $('#nameModel').attr('disabled', 'disabled');
        $scope.nameModel = name;
        $scope.nameValue = val;
        $scope.nameDetail = detail;
    }

    //添加model show
    $scope.addModelShow = function () {
        clear();
        $('#editOrAddModel h4').text('添加');
        $('#editOrAddModel').modal('show');
        $('#nameModel').removeAttr("disabled");
    }
    
    //添加 编辑 提交
    $scope.editOrAddModelModelSubmit = function () {

        //配置名称是否为空
        if (isEmpty($scope.nameModel)) {
            $('#error').text('配置名称不能为空！');
            return;
        };
        //配置值是否为空
        if (isEmpty($scope.nameValue)) {
            $('#error').text('配置值不能为空！');
            return;
        };
        //配置说明是否为空
        if (isEmpty($scope.nameDetail)) {
            $('#error').text('配置说明不能为空！');
            return;
        };

        if($scope.configValueOption == -1 || $scope.configValueOption == undefined) {
        	  $('#error').text('请选择配置值类型！');
              return;
        }
        //如果选择输入的是json 判断json 格式是否正确
        if ($scope.configValueOption == 1) {
            //判断返回值不是 json 格式
            try {
                var rdata = JSON.parse($scope.nameValue);
            } catch (err) {
                $('#error').text('配置值输入的json格式不正！');
                return;
            }
        }

        parmas.name = $scope.nameModel;
        parmas.value = $scope.nameValue;
        parmas.detail = $scope.nameDetail;

        // 初始数据
        editOrAdd.query(parmas).then(function (data) {
            if (data == null) {
                $('#editOrAddModel').modal('hide');
                init(parseInt($("#pagination .current").text()));
            }
           
        }, function (data) {
            $scope.getAllData = { error: 'no data' };
        });
    }

    //删除提交
    $scope.deleteModelSubmit = function () {

        deleteConfig.query($scope.deleteName).then(function (data) {
            $('#deleteModel').modal('hide');
            init(1);
        }, function (data) {
            $scope.getAllData = { error: 'no data' };
        })
    }

    function clear() {
        $scope.nameModel = '';
        $scope.nameValue = '';
        $scope.nameDetail = '';
        $('#error').text('');
    }
});


/**
   * 取得当前 page 页数  
   * @paramToRetrieve 
   *
*/
function getQueryStringParameter(paramToRetrieve) {
    var ps = document.URL.split("?");
    if (ps.length == 1) {
        return 1;
    }
    var params = ps[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}

/*
 * 判断字符串是否空
 * @param str
 * @return boolean
 */
function isEmpty(str) {
    if (str == undefined || trim(str) == "") {
        return true;
    }

    return false;
}

/*
 * 字符串两边去空格
 * @param str
 * @return boolean
 */
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}