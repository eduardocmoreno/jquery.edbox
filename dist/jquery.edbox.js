/*
* jQuery Edbox plugin v.2.2.3
* @author Eduardo Moreno - eduardocmoreno[at]gmail[dot]com
* Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
*/

;(function($, settings, self) {

    function Edbox(options, el) {
        self = this;

        self.opt = $.extend({}, settings, options);

        self.$el = $(el);

        self.attr = {
            target: self.$el.attr('data-box-target'),
            html:   self.$el.attr('data-box-html'),
            image:  self.$el.attr('data-box-image'),
            url:    self.$el.attr('data-box-url'),
            header: self.$el.attr('data-box-header'),
            footer: self.$el.attr('data-box-footer')
        }

        var href = self.$el.attr('href');
        href = (/^(#.*)/).test(href) ? null : href;

        self.target = self.opt.target || self.attr.target;
        self.html   = self.opt.html   || self.attr.html;
        self.image  = self.opt.image  || self.attr.image;
        self.url    = self.opt.url    || self.attr.url || href;
        self.header = self.opt.header || self.attr.header;
        self.footer = self.opt.footer || self.attr.footer;

        self.$box        = $('<div class="edbox"/>');
        self.$boxError   = $('<div class="edbox-error"/>');
        self.$boxLoad    = $('<div class="edbox-load"/>');
        self.$boxBody    = $('<div class="edbox-body"/>');
        self.$boxClose   = $('<div class="edbox-close"/>');
        self.$boxContent = $('<div class="edbox-content"/>');
        self.$boxHeader  = $('<div class="edbox-header"/>');
        self.$boxFooter  = $('<div class="edbox-footer"/>');
        self.$boxTemp    = $('<div class="edbox-temp"/>');

        self.animateEvents = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

        self.init();
    }

    Edbox.prototype = {
        init: function(){
            self.base();

            var content = 
            self.target ||
            self.html ||
            self.image ||
            self.url;

            var alert = 
            self.opt.success && 'success' ||
            self.opt.info && 'info' ||
            self.opt.warning && 'warning' ||
            self.opt.danger && 'danger';

            if(!content && !alert){
                self.error('Undefined');
                return;
            }

            self.opt.beforeOpen();

            if(self.target){
                var $target = $(self.target);

                if ($target.length) {
                    $target
                    .after(self.$boxTemp)
                    .addClass('edbox-target');

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

            if(alert){
                self.alert(alert, self.opt[alert]);
                return;
            }
        },

        base: function(){
            self.$box
            .addClass(self.opt.addClass)
            .addClass(!self.opt.close && 'edbox-close-false')
            .add(self.$boxClose)
            .on('click', self.events.click);

            $('body').prepend(self.$box);
            $(window).on('keydown', self.events.keydown);
        },

        error: function(msg){
            self.$box.removeClass(self.opt.addClass);
            
            self.opt = settings;
            self.responseError = true;

            self.alert('danger', msg);
        },

        alert: function(type, msg){
            self.$box
            .addClass('edbox-alert edbox-alert-' + type)
            .append(
                $('<div/>')
                .addClass('edbox-alert-container')
                .append('<div>' + msg + '</div>', self.$boxClose)
                );

            self.toggle('open');
        },

        insert: function(content){
            self.$box.append(
                self.$boxBody
                .css({
                    width: self.opt.width,
                    height: self.opt.height
                })
                .append(
                    self.header ? self.$boxHeader.append(self.$boxClose, self.header) : self.$boxClose,
                    self.$boxContent.append(content),
                    self.footer && self.$boxFooter.append(self.footer)
                    )
                );

            self.boxCloseCssRight = self.$boxClose.css('right');

            self.toggle('open');
            
            $(window).on('resize', self.events.resize).resize();
        },        

        toggle: function(toggle, callback){
            toggle == 'close' && !self.loading && !self.responseError && self.opt.beforeClose();

            if(self.opt.animation){
                self.$box.children()
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
                        self.load.complete('error', (self.image || self.url) + ' ' + response.statusText.toLowerCase());
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
                var body_h      = self.$boxBody.outerHeight();
                var header_h    = self.$boxHeader.outerHeight();
                var footer_h    = self.$boxFooter.outerHeight();
                var content_h   = self.$boxContent.get(0).scrollHeight;                
                var overflow    = Math.ceil(body_h - (header_h + footer_h)) < content_h ? true : false;

                self.$box[overflow ? 'addClass' : 'removeClass']('edbox-scroll-y-true');
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
                .removeClass('edbox-helper-class')
                .appendTo(self.$boxTemp)
                .unwrap();

                self.loading && self.urlLoad.abort();
                
                self.$box.remove();
                
                $.removeData(window, 'edbox');
                
                !self.loading && !self.responseError && self.opt.afterClose();
            }
        }
    };

    $.edboxSettings = function(options){
        return $.extend(settings, options);
    };

    $.edbox = function (options, el){
        var data = $.data(window, 'edbox');

        if(options == 'close' && data){
            data.toggle('close');
            return;
        }

        if((typeof options == 'object' || $(el).length) && !data) {
            $.data(window, 'edbox', new Edbox(options, el));
            return;
        }
    };
    
    $.fn.edbox = function(options) {
        return this.each(function(){
            $(this).on('click', function(e) {
                e.preventDefault();
                $.edbox(options, this);
            });
        });
    };

})(jQuery, {
    target       : null,
    html         : null,
    image        : null,
    url          : null,
    
    success      : null,
    info         : null,
    warning      : null,
    danger       : null,
    
    header       : null,
    footer       : null,
    
    width        : null,
    height       : null,
    addClass     : null,
    
    close        : true,
    animation    : true,

    animateOpen  : 'edbox-animate-open',
    animateClose : 'edbox-animate-close',
    
    beforeOpen   : function() {},
    afterOpen    : function() {},
    beforeClose  : function() {},
    afterClose   : function() {}
});