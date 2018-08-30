
/*  function dosth
  1. 获取page=1 的 10条数据
  2. 把数据拼装成 dom 放到页面
  3. 使用瀑布流去摆放 dom 位置
  4. page++

  当 lead 出现在眼前的时候

  1. 获取page=2 的 10条数据
  2. 把数据拼装成 dom 放到页面
  3. 使用瀑布流去摆放 dom 位置
  4. page++
*/

var curPage = 1,
    perPageCount =10,
    colSumHeight = [],
    nodeWidth = $('.item').outerWidth(true),
    colNum = parseInt($('#pic-ct').width()/nodeWidth)

// 初始化高度数组    
for(var i = 0; i < colNum; i++){
  colSumHeight[i] = 0
}

var isDataArrive = true

start()


function start(){
  getData(function(newList){
    // console.log(newList)
    isDataArrive = true
    $.each(newList, function(idx, news){
      var $node = getNode(news)  //拿到数据进行拼接
      //当节点里的图片全部加载后再使用瀑布流计算，否则会因为图片未加载 item 高度计算错误导致瀑布流高度计算出问题
      $node.find('img').load(function(){
        $('#pic-ct').append($node)
        waterFallPlace($node)
      })
    })
  })
  isDataArrive = false
}

// 滑动时判断隐藏元素是否在视野中
$(window).scroll(function(){
  if(!isDataArrive){
    return
  }
  if(isVisible($('#load'))){
    // console.log('start load')
    start()
  }
})

//  ajax获取数据
function getData(callback){
  $.ajax({
    url: 'http://platform.sina.com.cn/slide/album_tech',
    dataType: 'jsonp',
    jsonp: 'jsoncallback',
    data: {
      app_key: '1271687855',
      num: perPageCount,
      page: curPage
    }
  }).done(function(ret){
    // console.log(ret)
    if(ret && ret.status && ret.status.code === "0"){
      callback(ret.data);  //如果数据没问题，那么生成节点并摆放好位置
      curPage++
    }else{
      console.log('get error data')
    }
  });
}

//  拼接数据
function getNode(item){
  var tpl = ''
    tpl += '<li class="item">';
    tpl += ' <a href="'+ item.url +'" class="link"><img src="' + item.img_url + '" alt=""></a>';
    tpl += ' <h4 class="header">'+ item.short_name +'</h4>';
    tpl += '<p class="desp">'+item.short_intro+'</p>';
    tpl += '</li>';

  return $(tpl)
}

// 瀑布流
function waterFallPlace($node){
  var idx = 0;
  minSumHeight = colSumHeight[0];

  for(var i = 0; i<colSumHeight.length; i++){
    if(colSumHeight[i]<minSumHeight){
      idx = i;
      minSumHeight = colSumHeight[i];
    }
  }

  $node.css({
    left: nodeWidth*idx,
    top: minSumHeight,
    opacity: 1
  })

  colSumHeight[idx] = $node.outerHeight(true) + colSumHeight[idx];

  // Math.max.apply(null,arr)来获取数组中的最小值
  // 解释 https://segmentfault.com/q/1010000007113820
  $('#pic-ct').height(Math.max.apply(null,colSumHeight))
}

// 判断元素否在视野内
function isVisible($el){
  var scrollH = $(window).scrollTop(),
      winH = $(window).height(),
      top = $el.offset().top;

  if(top < winH + scrollH){
    return true
  }else{
    return false
  }
}
