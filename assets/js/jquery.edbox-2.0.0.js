/*
* jQuery Edbox plugin v.2.0.0
* @author Eduardo Moreno - eduardocmoreno[at]gmail[dot]com
* Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
*/

;(function($, settings, self) {

    function edbox(options, el) {
        self     = this;
        self.opt = $.extend({}, settings, options);

        self.target = self.opt.target || $(el).attr('data-box-target') || $(el).attr('href');
        self.html   = self.opt.html   || $(el).attr('data-box-html');
        self.image  = self.opt.image  || $(el).attr('data-box-image');
        self.url    = self.opt.url    || $(el).attr('data-box-url');

        self.$box          = $('<div class="' + self.opt.prefix + '"/>');
        self.$boxError     = $('<div class="' + self.opt.prefix + '-error"/>');
        self.$boxLoad      = $('<div class="' + self.opt.prefix + '-load"/>');
        self.$boxBody      = $('<div class="' + self.opt.prefix + '-body"/>');
        self.$boxClose     = $('<div class="' + self.opt.prefix + '-close"/>');
        self.$boxContent   = $('<div class="' + self.opt.prefix + '-content"/>');
        self.$boxHeader    = $('<div class="' + self.opt.prefix + '-header"/>');
        self.$boxFooter    = $('<div class="' + self.opt.prefix + '-footer"/>');
        self.$boxTemp      = $('<div class="' + self.opt.prefix + '-temp"/>');

        self.animateEvents = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

        self.init();
    }

    edbox.prototype = {
        init: function(){
            self.base();

            var content = self.target || self.html || self.image || self.url;

            if(!content){
                self.error('undefined content');
                return;
            }

            self.opt.beforeOpen();

            if(self.target){
                var $target = $(self.target);

                if ($target.length) {
                    $target
                    .after(self.$boxTemp)
                    .addClass(self.opt.prefix + '-helper-class');

                    self.insert($target);
                } else {
                    self.error('Unable to find element: "' + self.target + '"');
                }

                return;
            }

            if(self.html){
                self.insert(self.html);
                return;
            }

            if(self.image){
                self.imageObj = new Image();
                self.imageObj.src = self.image;

                self.imageObj.complete ? self.insert(self.imageObj) : self.load.start(self.image);

                return;
            }

            if(self.url){
                self.load.start(self.url);
                return;
            }
        },

        error: function(msg){
            self.responseError = true;

            self.$boxError
            .text('ERROR: ' + msg)
            .prepend(self.$boxClose.on('click', self.events.click));

            self.$box.append(self.$boxError);
            self.toggle('open');
        },

        base: function(){
            self.$box
            .addClass(self.opt.parentClass)
            .one('click', self.events.click);

            $('body').prepend(self.$box);

            $(window).one('keydown', self.events.keydown);
        },

        insert: function(content){
            self.$box.append(
                self.$boxBody
                .css({
                    width: self.opt.width,
                    height: self.opt.height
                })
                .append(
                    self.opt.header && self.$boxHeader.html(self.opt.header),
                    self.opt.close && self.$boxClose.one('click', self.events.click),
                    self.$boxContent.append(content),
                    self.opt.footer && self.$boxFooter.html(self.opt.footer)
                    )
                );

            $(window).on('resize', self.events.resize).resize();
            
            self.toggle('open');
        },        

        toggle: function(toggle, callback){
            toggle == 'close' && !self.loading && !self.responseError && self.opt.beforeClose();

            if(self.opt.animation){
                (self.loading ? self.$boxLoad : self.responseError ? self.$boxError : self.$boxBody)
                .addClass(toggle == 'open' ? self.opt.animateOpen : self.opt.animateClose)
                .one(self.animateEvents, function() {
                    typeof callback == 'function' ? callback() : self.callback[toggle]();
                });
            } else {
                typeof callback == 'function' ? callback() : self.callback[toggle]();
            }
        },

        load: {
            start: function(url){
                self.loading = true;

                self.$box.append(self.$boxLoad);

                self.toggle('open', function(){
                    self.urlLoad = $.ajax({
                        url: url,
                        cache: (self.image ? false : true)
                    })
                    .fail(function(response){
                        console.log(response);
                        self.load.complete('error', response);
                    })
                    .done(function(data){
                        self.load.complete('insert', null, self.imageObj || data);
                    });
                });
            },

            complete: function(method, response, content){
                self.toggle('close', function(){
                    self.loading = false;
                    self.$boxLoad.remove();
                    self[method](response || content);
                });
            }
        },

        events: {
            click: function(e){
                self.opt.close && e.target == e.currentTarget && self.toggle('close');
            },
            keydown: function(e){
                self.opt.close && e.which == 27 && self.toggle('close');
            },
            resize: function(){
                var body_h = self.$boxBody.outerHeight();
                var header_h = self.$boxHeader.outerHeight();
                var footer_h = self.$boxFooter.outerHeight();
                var content_h = self.$boxContent.get(0).scrollHeight;
                var overflow = Math.ceil(body_h - (header_h + footer_h)) < content_h ? true : false;
                self.$boxBody[overflow ? 'addClass' : 'removeClass'](self.opt.prefix + '-scroll-true');
            }
        },

        callback: {
            open: function(){
                !self.responseError && self.opt.afterOpen();
            },
            close: function(){
                $(window).off({
                    keydown: self.events.keydown,
                    resize: self.events.resize
                });

                !self.responseError && $(self.target)
                .removeClass(self.opt.prefix + '-helper-class')
                .appendTo(self.$boxTemp)
                .unwrap();

                if(self.loading){
                    self.image && self.imageObj.attr('src', null);
                    self.urlLoad && self.urlLoad.abort();
                } else if(!self.responseError) {
                    self.opt.afterClose();
                }

                self.$box.remove();

                $.removeData(window, 'edbox');
            }
        }
    };

    $.edboxSettings = function(options){
        return $.extend(settings, options);
    };

    $.edbox = function (options, el){
        var data = $.data(window, 'edbox');

        if(options === 'close' && data){
            data.toggle('close');
            return;
        }

        if((typeof options == 'object' || $(el).length) && !data) {
            $.data(window, 'edbox', new edbox(options, el));
            return;
        }
    };
    
    $.fn.edbox = function(options) {
        this.on('click', function(e) {
            e.preventDefault();
            $.edbox(options, this);
        });
    };

})(jQuery, {
    target       : null,
    html         : null,
    image        : null,
    url          : null,
    width        : null,
    height       : null,
    prefix       : 'edbox',
    parentClass  : '',
    header       : '',
    footer       : '',
    close        : true,
    animation    : true,
    animateOpen  : 'edbox-animate-open',
    animateClose : 'edbox-animate-close',
    beforeOpen   : function() {},
    beforeClose  : function() {},
    afterOpen    : function() {},
    afterClose   : function() {}
});