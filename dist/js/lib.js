/**
 * 回到顶部动画
 * @param options
 * @returns {$}
 */
$.fn.scrollTo = function(options) {
  var defaults = {
    toT: 0,    //滚动目标位置
    durTime: 300,  //过渡动画时间
    delay: 16,     //定时器时间
    callback: null   //回调函数
  };
  var opts = $.extend(defaults, options),
    timer = null,
    _this = this,
    curTop = _this.scrollTop(),//滚动条当前的位置
    subTop = opts.toT - curTop,    //滚动条目标位置和当前位置的差值
    index = 0,
    dur = Math.round(opts.durTime / opts.delay),
    smoothScroll = function(t) {
      index++;
      var per = Math.round(subTop / dur);
      if (index >= dur) {
        _this.scrollTop(t);
        window.clearInterval(timer);
        if (opts.callback && typeof opts.callback == 'function') {
          opts.callback();
        }
        return;
      } else {
        _this.scrollTop(curTop + index * per);
      }
    };
  timer = window.setInterval(function() {
    smoothScroll(opts.toT);
  }, opts.delay);
  return _this;
};

/**
 * 加载状态机
 * @param options
 * @constructor
 */
function LoaderState(options) {
  this.options = {};
  $.extend(this.options, options);
  // 0:未加载, 1:加载中, 2:无内容
  this.state = 0;
  this.minTime = this.options.minTime ? this.options.minTime : 500;
  this.lastChange = new Date().getTime();
}

function stateMethod(state, flag) {
  return function() {
    if (flag) {
      var defer = $.Deferred();

      setTimeout(function() {
        this.state = state;
        this.lastChange = new Date().getTime();

        defer.resolve();
      }.bind(this), this.getTimestamp());

      return defer.promise();
    } else {
      this.lastChange = new Date().getTime();
      this.state = state;
    }
  };
}

function isMethod(state) {
  return function() {
    return this.state === state;
  };
}

LoaderState.prototype.getTimestamp = function() {
  return Math.max(0, this.minTime - (new Date().getTime() - this.lastChange));
};
LoaderState.prototype.loading = stateMethod(1);
LoaderState.prototype.static = stateMethod(0, true);
LoaderState.prototype.isStatic = isMethod(0);
LoaderState.prototype.end = stateMethod(2, true);

/**
 * 瀑布流
 * @param options
 * @constructor
 */
function Waterfall(options) {
  this.options = {
    loadDistance: 50
  };
  $.extend(this.options, options);
  this.scrollContainer = this.options.scrollContainer;
  this.listContainer = this.options.listContainer;
  this.loader = this.options.loader;
  this.loaderState = new LoaderState({ minTime: this.options.minTime });

  if (this.options.getTotalHeihgt) this.getTotalHeihgt = this.options.getTotalHeihgt;
  if (this.options.getUrl) {
    if ($.isFunction(this.options.getUrl)) {
      this.getUrl = this.options.getUrl;
    } else {
      this.getUrl = function() {
        return this.options.getUrl;
      }.bind(this);
    }
  }

  this.containerHeight = this.scrollContainer.height();

  this.init();
}

Waterfall.prototype.init = function() {
  this.scrollContainer.scroll(function() {
    if ((this.getTotalHeihgt() - this.scrollContainer.scrollTop() - this.containerHeight < this.options.loadDistance) &&
      this.loaderState.isStatic()) {
      this.loaderState.loading();
      this.loader.show();
      $.get(this.getUrl()).done(function(response) {
        if (response === '' || response.toString().toLowerCase() === 'false') {
          this.loaderState.end().then(function() {
            this.loader.hide();
          }.bind(this));
        } else {
          this.loaderState.static().then(function() {
            this.loader.hide();

            var arr = $(response).filter(function() {
              return this.nodeType !== 3;
            });
            this.listContainer.append(arr);
            var imgLoad = imagesLoaded(arr);
            imgLoad.on('progress', function(instance, image) {
              image.img.parentElement.classList.add('loaded');
            });
          }.bind(this));
        }
      }.bind(this));
    }
  }.bind(this));
};

Waterfall.prototype.getTotalHeihgt = function() {
  return this.listContainer.height();
};

Waterfall.prototype.getUrl = function() {
  return this.scrollContainer.data('url');
};

$(function() {
  $('[toggle-class]').each(function() {
    var $this = $(this);
    var className = $this.attr('toggle-class');
    $this.tap(function() {
      if ($this.hasClass(className)) {
        $this.removeClass(className);
      } else {
        $this.addClass(className);
      }
    });
  });

  new RandomImage();
});

function RandomImage(options) {
  this.options = {
    url: 'http://lorempixel.com/index.php',
    width: 640,
    height: 640,
  };

  $.extend(this.options, options);

  this._init();
}

RandomImage.Categories = ['abstract', 'animals', 'business', 'cats', 'city', 'food', 'nightlife',
  'fashion', 'people', 'nature', 'sports', 'technics', 'transport'];

RandomImage.prototype._init = function() {
  console.log('fwfeww');
  //$.get(this.options.url, { x: this.options.width, y: this.options.height }, function(data) {
  //  console.log(data);
  //});
};

RandomImage.prototype._getRandomCate = function() {
  return RandomImage.Categories[parseInt(Math.random() * RandomImage.Categories.length)];
};
