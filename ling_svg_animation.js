/*
   svg path 随页面滚动自动执行动画

/*=============================================================================
   svg_scroll_animation.js by lingGW bacoolcom@126.com
   //本程序依靠 jQuery
   //可监听页面滚动 的svg动画 
   //使用方法  只对svg 的path, line ,polyline有效
   *1、建立实使 
   如：
   window.svg_scroll_animation = new svg_scroll_animation({
	     //放置默认参数
	       path_selector : '.svg_path_auto_animation',
	       easing : "linear",  //默认定时函数这项，没啥用
	       duration: '1.5s',   //动画延续时间 
	       delay : '0.5s',     //延时执行
	       repeat : false,     //是否重复
	       init:true,
	      //animation_name: 'my_svg_animation',
	       threshold:0.5,   //在区域内的偏移量 保持默认则可
		  
	   });	//这些设置对所有元素生效
	   
	//在svg 元素 放置 class ="svg_path_auto_animation"   //跟参数值相同 path_selector
	
	也可以对 各个path 、line 、polyline单独设置 
	在path line polyline 可放 data-svg-repeat = "ture" 或 "false" //可单独设置是否重复
	
	在path line polyline 可放 data-svg-duration = "1.5s"//可单独设置动画执行时间
	
	在path line polyline 可放 data-svg-delay = "0.5s" //可单独设置延时执行
	
	在path line polyline 可放 data-svg-percent = "80" //使线画到百分之几
   
   
/*===========================================================================*/


window.svg_scroll_animation = (function ($,window) {
  var $window = $(window);
  

  function svg_auto_animation(options) {

      this.options = this.extend(this.defaults, options);
      this.docElem = this.options.elem;
     /* this.styleBank = {};

      if (this.options.init == true) this.init();*/
	  this.obj_store = null;  //存储所有svg对象的数组
	  this.is_has_svg = false; //页面是否有svg对象
	  
	  this.init();
	  
	  
	  
  }

  svg_auto_animation.prototype = {

    defaults: 
	{
	   container : window,  //定义容器(默认为窗口)
	   path_selector : '.svg_path_auto_animation',
	   easing : "linear",  //默认定时函数
	   duration: '1.5s',
	   delay : '0.5s',
	   repeat : false,
	   init:true,
	   //animation_name: 'my_svg_animation',
	   threshold:0.5,   //在区域内的偏移量
	   elem: window.document.documentElement
    
    },
   //===========================
   
   init:function()
   {
	  var $this = this;
	  var abc =null;
	  
	  this.add_init_css();
      //首次执行
	    $this.obj_store.forEach(function(el,index)
		  {
		     if($this.inviewport(el,$this.options))  //在可视区域
			 {
			     $this.update(el,index);
 
			 }
			
		  });
		  
	  
	  //---监听滚动，处理重新加载动画 （针对path, line, polyline）
	  $(this.options.container).bind("scroll",function(event){
		  $this.obj_store.forEach(function(el,index)
		  {
		     if($this.inviewport(el,$this.options))
			 {
			     $this.update(el,index);

			 }
			 else
			 {
			 
			   $this.repeat(el);   //复位已完成动作的svg
			   console.dir(el.getAttribute('data-svg-scroll-complete'))
			 
			 }
		  });
	     // abc = $this.inviewport($this.obj_store[0],$this.options);
		  //console.dir(abc)
	  });
   
   },
    /*=============================================================================*/
	
	store_all_svg_obj:function()
	{  
	   var temp_arr = null;
	   //this.elems = Array.prototype.slice.call(this.docElem.querySelectorAll('[data-scroll-reveal]'));
	   // this.elems.forEach(function (el, i) {
	   this.obj_store = Array.prototype.slice.call(this.docElem.querySelectorAll(this.options.path_selector+" "+"path"));
	   
	   temp_arr = Array.prototype.slice.call(this.docElem.querySelectorAll(this.options.path_selector+" "+"line"));
	   if(temp_arr.length > 0)
	   {
	     this.obj_store = this.obj_store.concat(temp_arr);  //合并
		 //temp_arr =null 
	   }
	   
	   temp_arr =Array.prototype.slice.call(this.docElem.querySelectorAll(this.options.path_selector+" "+"polyline"));
	   if(temp_arr.length > 0)
	   {
	     this.obj_store = this.obj_store.concat(temp_arr);  //合并
		 //
	   }
	   temp_arr =null ;
	   
	   this.is_has_svg = this.obj_store.length > 0 ? true:false;  //是否用svg数组对象
	  //console.dir(this.is_has_svg)
	},
	
	
	//=============================================================================
	
	//---添加初始css
	add_init_css:function()
	{
	   var $this = this;
	   
	   this.store_all_svg_obj();  //缓存所有所有置标的svg
	   
	   
	   if(!this.is_has_svg)
	   return false;
	   
	   //console.dir(this.obj_store)
	   //----
	  //this.obj_store储存的应应该为jq对象
	// var style_val = "";
	this.obj_store.forEach(function (elm, index) {
			var obj_length = 0;
			if(elm.tagName=='path')
			{
			   obj_length = $this.getPathLength(elm);
			};
			
		   if(elm.tagName=='line')
			{
			   obj_length = $this.getLineLength(elm);
			};
			
		   if(elm.tagName=='polyline')
			{
			   obj_length = $this.getPolylineLength(elm);
			};
			
		  $this.add_one_init_css(elm,obj_length);
		 // style_val = style_val + $this.creat_animation_style(elm,obj_length,index);
	  });
	  //console.dir(style_val);
	  //var css = document.createElement('style');
	      //css.type='text/style';
	  //    css.innerHTML=style_val;
	  //    $('head').append(css);
	  
	   
	},
	
	
	
	//==============================================================================
	/*
	* 初始化动画元素
	* 
	*@param {node, int}
	*returns none 
	*/
	add_one_init_css:function(obj,obj_length)
	{
	   
	   var obj_length = obj_length;  //对象的线长度 
	   var stroke_dasharray = obj_length+", "+obj_length;//置初始值 //style="stroke-dasharray: 391, 393; stroke-dashoffset:0;" 
	   var stroke_dashoffset = obj_length;//置初始值 //style="stroke-dasharray: 391, 393; stroke-dashoffset:0;"
	   obj.path_length =  obj_length;
	   $(obj).css({'stroke-dasharray':stroke_dasharray, 'stroke-dashoffset':stroke_dashoffset});
	   //var animaiton_css = ""
	   
	   //写入css3 from to style,\
	    
	   
	   
	},
	/*创建动画style--直接用jq,不使用css3动画
	* @el [obj]
	* path_length  svg total line length ,
	* index this.store 的下标
	*/
	creat_animation_style:function(el,path_length,index)
	{
		var sdd = (el.getAttribute('svg-data-percent'));     //要滚动到总长的百分几()
	    var percent = parseFloat(sdd) > 0 ? (1- (sdd/100)) * el.path_length : 0;
	    var style_txt = "@keyframes "+this.options.animation_name+"_"+index+" {from {stroke-dashoffset:"+path_length+";} to {stroke-dashoffset:"+percent+";}}";
		el.key_dash_name = this.options.animation_name+"_"+index;
		return style_txt;
		
	},
	//========================================================
  /*
   * 获取path的总长度
   *
   * @param {node} line The line element to calculate length of
   * @returns {Number} Length of the line
   */
	getPathLength:function(path)
	{
	  return path.getTotalLength();
	},
	
	//========================================================
	 /*
   * 获取line的总长度
   *
   * @param {node} line The line element to calculate length of
   * @returns {Number} Length of the line
   */
    getLineLength:function(line) {
    var x1 = line.getAttribute('x1');
    var x2 = line.getAttribute('x2');
    var y1 = line.getAttribute('y1');
    var y2 = line.getAttribute('y2');

    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
  },
  //==========================================================
    /*
   * 获取polyline的总长
   *
   * @param {node} polyline The polyline element to calculate length of
   * @returns {Number} Length of the polyline
   */
   getPolylineLength:function(polyline) {
    var dist = 0;
    var x1, x2, y1, y2;
    var i;
    var points = polyline.points.numberOfItems;

    for (i = 1; i < points; i++){
      x1 = polyline.points.getItem(i - 1).x;
      x2 = polyline.points.getItem(i).x;
      y1 = polyline.points.getItem(i - 1).y;
      y2 = polyline.points.getItem(i).y;

      dist += Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }

    return dist;
  },
  
//======================================================
  
  /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    belowthefold: function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    },

    rightoffold : function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    },

   abovethetop : function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    },

    leftofbegin : function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    },

    inviewport: function(element, settings) {
         return !this.rightoffold(element, settings) && !this.leftofbegin(element, settings) &&
                !this.belowthefold(element, settings) && !this.abovethetop(element, settings);
     },

	
	//=============================
	//-------更新svg style,  画动画
    update: function (el,index) 
	{
      //---判断有没有repeat (重复画)，不重复就依据 index 删除数组相应的项，可以单独设置某一项重复 
	  /*
	  *构造css3动画值
	  */
	  var that = this;
	 
	  //如果有这个属性，不执行
	  if(el.getAttribute('data-svg-scroll-complete'))return;
	  //console.dir(el)
	  var sdd = (el.getAttribute('data-svg-delay'));  //单独设置的delay
	  var delay = parseFloat(sdd) > 0 ? sdd : this.options.delay;
	  
	  var sdd = (el.getAttribute('data-svg-duration'));  //单独设置的执行的时间
	  var duration = parseFloat(sdd) > 0 ? sdd : this.options.duration;
	  
	  sdd = (el.getAttribute('data-svg-percent'));     //要滚动到总长的百分几()
	  var percent = parseFloat(sdd) > 0 ? (1- (sdd/100)) * el.path_length : 0;
	  
	  var is_repeat = el.getAttribute('data-svg-repeat');
	  if(is_repeat)
	  {
	     is_repeat = (is_repeat ==='false') ? false : is_repeat;
	  }
	  
	  
	  
	  //$(el).css({'animation':  'mmdash '+that.options.duration+' '+that.options.easing+' '+delay });
	 // var old_style = el.getAttribute('style');
	 // var now_style ='';
	 /* if(old_style.length <=0 || old_style=='undefined')
	  {
	     now_style ="animation: "+el.key_dash_name+" "+ that.options.duration+" "+that.options.easing+" "+delay+";"
	  }
	  else
	  {
		if(old_style.lastIndexOf(';') < old_style.length-1)
		{
		   old_style = old_style+";";
		}
	    now_style = old_style+"animation: "+el.key_dash_name+" "+ that.options.duration+" "+that.options.easing+" "+delay+";"
		
	  }*/
	  //el.addEventListener("webkitAnimationEnd", function(){ $(el).css('stroke-dashoffset',percent)}, false); 
	  var total_time = (duration.toLowerCase()).indexOf('ms') > 0 ? parseInt(duration) : ((duration.toLowerCase()).indexOf('s')>0 ? parseFloat(duration)*1000 : parseInt(duration));  //转为ms,纯数字
	   
	   //total_time = total_time ;
	  var delay_time = (delay.toLowerCase()).indexOf('ms') > 0 ? parseInt(delay) : ((delay.toLowerCase()).indexOf('s')>0 ? parseFloat(delay)*1000 : parseInt(delay));  //转为ms,纯数字
	   
	   //total_time = total_time + delay_time;
	 
	  //el.setAttribute('style',now_style);
	  //用setTimeout来设置延迟
	  //依靠jq简单省事
	  setTimeout(function(){ $(el).animate({strokeDashoffset:percent},total_time);},delay_time)
	 
	   //duration + delay 为 timeout效力
	   
	   
	   //动作执行完成后执行
	   
	   //setTimeout(function(){$(el).css('stroke-dashoffset',percent);return false;}, (total_time-10))
	  
	  
	  ///
	  
	  el.setAttribute('data-svg-scroll-complete',true); //置完成
	  
	  //---检测是否有设置重复或单独设置重复
	  
	  if(!this.options.repeat && is_repeat)
	  {
	     el.is_repeat = true;   
	  }
	  
	  //--删除数据元素，减轻每次循环 
	   if((!this.options.repeat && !is_repeat) || (this.options.repeat && !is_repeat))
	  {
		 
		 this.obj_store.splice(index,1);
	     //this.obj_store = true;   
	  }
	  
	  
	 
    },
	
	//----复位
	repeat:function(el)
	{
		if(!this.options.repeat && !el.getAttribute('data-svg-repeat'))return false;
		if(this.options.repeat && el.getAttribute('data-svg-repeat')==='false')return false;
		
		
		var that = this;
		//var style = "";
		//var new_style='';
		//console.dir(el.setAttribute("data-svg-scroll-complete"))
		if(el.getAttribute("data-svg-scroll-complete")){//$("[data-svg-scroll-complete]").each(function(){
			
			$(el).removeAttr('data-svg-scroll-complete');  //删除完成标记
			$(el).css({'stroke-dashoffset':el.path_length})   //重置 stroke-dashoffset值
			
		}
	},
	
	//=============================
   extend: function (a, b){
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    }
	

  }; // end prototype

  return svg_auto_animation;
})(jQuery,window);
