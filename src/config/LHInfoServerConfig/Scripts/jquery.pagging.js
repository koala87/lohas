/* * * * * * * * * * * * * * * * *
 * Pagination
 * javascript page navigation
 * * * * * * * * * * * * * * * * */

var Pagination = {

    code: '',
    obj:'',
    args:'',

    // --------------------
    // Utility
    // --------------------

    // converting initialize data
    Extend: function(e,data) {
        data = data || {};
        Pagination.size = data.size || 300;
        Pagination.page = data.page || 1;
        Pagination.step = data.step || 3;
        Pagination.pageCountId = data.pageCountID || 'pagination';
        Pagination.obj= e;
        Pagination.args= data;

    },

    // add pages by number (from [s] to [f])
    Add: function(s, f) {
        for (var i = s; i < f; i++) {
            Pagination.code += '<a class="pageNumber">' + i + '</a>';
        }
    },

    // add last page with separator
    Last: function() {
        Pagination.code += '<i>...</i><a class="pageNumber">' + Pagination.size + '</a>';
    },

    // add first page with separator
    First: function() {
        Pagination.code += '<a class="pageNumber">1</a><i>...</i>';
    },



    // --------------------
    // Handlers
    // --------------------

    // change page
    Click: function () {
        Pagination.page = +this.innerHTML;
        Pagination.Start();
        Pagination.Current();
		var current = parseInt($(this).text());
		if(typeof(Pagination.args.backFn)=="function"){
			Pagination.args.backFn(current);
		}
    },

    // previous page
    Prev: function () {
        Pagination.page--;
        if (Pagination.page < 1) {
            Pagination.page = 1;
        }
        Pagination.Start();
        Pagination.Current();
    },

    // First page
    //First: function () {
    //    Pagination.page = 1;
    //    Pagination.Start();
    //    Pagination.Current();
    //},

    // next page
    Next: function () {
        Pagination.page++;
        if (Pagination.page > Pagination.size) {
            Pagination.page = Pagination.size;
        }
        Pagination.Start();
        Pagination.Current();
    },

 


    // --------------------
    // Script
    // --------------------

    // binding pages
    Bind: function() {
        var a = Pagination.e.getElementsByTagName('a');
        for (var i = 0; i < a.length; i++) {
            if (+a[i].innerHTML == Pagination.page) a[i].className = a[i].className + ' current';
            a[i].addEventListener('click', Pagination.Click, false);
        }
    },

    // write pagination
    Finish: function() {
        Pagination.e.innerHTML = Pagination.code;
        Pagination.code = '';
        Pagination.Bind();
    },

    // find pagination type
    Start: function() {
        if (Pagination.size < Pagination.step * 2 + 6) {
            Pagination.Add(1, Pagination.size + 1);
        }
        else if (Pagination.page < Pagination.step * 2 + 1) {
            Pagination.Add(1, Pagination.step * 2 + 4);
            Pagination.Last();
        }
        else if (Pagination.page > Pagination.size - Pagination.step * 2) {
            Pagination.First();
            Pagination.Add(Pagination.size - Pagination.step * 2 - 2, Pagination.size + 1);
        }
        else {
            Pagination.First();
            Pagination.Add(Pagination.page - Pagination.step, Pagination.page + Pagination.step + 1);
            Pagination.Last();
        }
        Pagination.Finish();
    },



    // --------------------
    // Initialization
    // --------------------

    // binding buttons
    Current: function() {
        //$(".currentPage").text(Pagination.page);
       
        document.getElementById(Pagination.pageCountId + '_pageCountList').value = Pagination.page;
        $("." +Pagination.pageCountId  + "_totalPage").text(Pagination.size);
    },

    // create skeleton
    Create: function(e,data) {
        var html = [
            '<li><a class="firstPage icon">&lt;&lt;</a></li>', // first button
            '<li><a class="prevPage icon">&lt;</a></li>', // previous button
            	'<li><span></span></li>',  // pagination container
            '<li><a class="nextPage icon">&gt;</a></li>',  // next button
            '<li><a class="lastPage icon">&gt;&gt;</a></li>',// last button
            '<div class ="left">第<select class="pageCountList" id="' + Pagination.pageCountId + '_pageCountList"></select>页,<span>共</span><span class="' + Pagination.pageCountId + '_totalPage"></span>页</div>'
         ];

        e.innerHTML = html.join('');
        Pagination.e = e.getElementsByTagName('span')[0];
        Pagination.Buttons(e);

        for (var i = 1; i <= Pagination.size; i++) {
            $('#' + Pagination.pageCountId + ' .pageCountList').append("<option value='" + i + "'>" + i + "</option>");
        }
       
    },
    Buttons: function(e) {
        var nav = e.getElementsByTagName('a');
        //firstPage
        nav[0].addEventListener('click',
           // Pagination.First,
            function() { 
                Pagination.page = 1;
                Pagination.Start();
                Pagination.Current();
            },
            false);
        //prevPage
        nav[1].addEventListener('click', Pagination.Prev, false);
        //nextPage
        nav[2].addEventListener('click', Pagination.Next, false);
        //lastPage
        nav[3].addEventListener('click',
              function () {
                  Pagination.page = Pagination.size;
                  Pagination.Start();
                  Pagination.Current();
              },
            false);
    },

	BindEvent:function(obj,args){
	    return (function () {            
            
			obj.on("click",".pageNumber",function(){					
			    var current = parseInt($(this).text());                
				if(typeof(args.backFn)=="function"){
					args.backFn(current);
				}
			});

			obj.on("click","a.prevPage",function(){					
				var current = parseInt(obj.children("a.current").text());
				if(typeof(args.backFn)=="function"){
					args.backFn(current-1);
				}
			});

			obj.on("click","a.nextPage",function(){					
				var current = parseInt(obj.children("a.current").text());
				if(typeof(args.backFn)=="function"){
					args.backFn(current+1);
				}
			});
			obj.on("click", "a.firstPage", function () {
			    var current = parseInt(obj.children("a.current").text());
			    if (typeof (args.backFn) == "function") {
			        args.backFn(current - 1);
			    }
			});

			obj.on("click", "a.lastPage", function () {
			    var current = parseInt(obj.children("a.current").text());
			    if (typeof (args.backFn) == "function") {
			        args.backFn(current + 1);
			    }
			});
			obj.on("change", "#" + Pagination.pageCountId + '_pageCountList', function () {
			    var current = parseInt(document.getElementById(Pagination.pageCountId + '_pageCountList').value);
			    if (typeof (args.backFn) == "function") {
			        args.backFn(current);
			    }
			    Pagination.page = current;
			    Pagination.Start();
			    Pagination.Current();
			});
		})();
	},

    // init
    Init: function(e, args) {
        Pagination.Extend(e,args);
        Pagination.Create(e,args);
        Pagination.Start();
        Pagination.Current();
        Pagination.BindEvent($(e),args);
    }
};


