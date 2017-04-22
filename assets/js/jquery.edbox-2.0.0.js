/*
* jQuery Edbox plugin v.2.0.0
* @author Eduardo Moreno - eduardocmoreno[at]gmail[dot]com
* Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
*/

;(function(defaults, $, ed) {

    function edbox(options, el) {
        ed     = this;
        ed.opt = $.extend({}, defaults, options);


        ed.target = ed.opt.target || $(el).attr('data-box-target') || $(el).attr('href');
        ed.html   = ed.opt.html   || $(el).attr('data-box-html');
        ed.image  = ed.opt.image  || $(el).attr('data-box-image');
        ed.url    = ed.opt.url    || $(el).attr('data-box-url');
        

        ed.box          = $('<div class="' + ed.opt.prefix + '"/>');
        ed.boxError     = $('<div class="' + ed.opt.prefix + '-error"/>');
        ed.boxLoad      = $('<div class="' + ed.opt.prefix + '-load"/>');
        ed.boxBody      = $('<div class="' + ed.opt.prefix + '-body"/>');
        ed.boxClose     = $('<div class="' + ed.opt.prefix + '-close"/>');
        ed.boxContent   = $('<div class="' + ed.opt.prefix + '-content"/>');
        ed.boxHeader    = $('<div class="' + ed.opt.prefix + '-header"/>');
        ed.boxFooter    = $('<div class="' + ed.opt.prefix + '-footer"/>');
        ed.boxTemp      = $('<div class="' + ed.opt.prefix + '-temp"/>');

        ed.animateEvents = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

        ed.init();
    }

    edbox.prototype = {
        init: function(){
            ed.base();

            if(!(ed.target || ed.html || ed.image || ed.url)){
                ed.error('undefined content');
                return;
            }

            ed.opt.beforeOpen();

            if(ed.target){
                var elem = $(ed.target);

                if (elem.length) {
                    elem.after(ed.boxTemp);
                    ed.insert(elem.addClass(ed.opt.prefix + '-helper-class'));
                }

                else {
                    ed.error('Unable to find \"' + ed.target + '\" element');
                }

                return;
            }

            if(ed.html){
                ed.insert(ed.html);
                return;
            }

            if(ed.image){
                ed.imageObj = new Image();
                ed.imageObj.src = ed.image;

                ed.imageObj.complete ? ed.insert(ed.imageObj) : ed.load.init('image');

                return;
            }

            if(ed.url){
                ed.load.init('url');
                return;
            }
        },

        error: function(msg){
            ed.responseError = true;

            ed.boxError
            .text('ERROR: ' + msg)
            .prepend(ed.boxClose.on('click', ed.events.click));

            ed.box.append(ed.boxError);
            ed.toggle('open');
        },

        load: {
            init: function(type){
                ed.loading = true;

                ed.box.append(ed.boxLoad);

                ed.toggle('open', function(){
                    ed.load[type]();                    
                });
            },

            image: function(){
                ed.imageObj = $('<img/>')
                .attr('src', ed.image)
                .on('error', function(response){
                    ed.load.done('error', response);
                })
                .on('load', function(){
                    ed.load.done('insert', null, this);
                });
            },

            url: function(){
                ed.urlLoad = $.get(ed.url)
                .fail(function(response){
                    ed.load.done('error', response);
                })
                .done(function(data){
                    ed.load.done('insert', null, data);
                });
            },

            done: function(method, response, data){
                ed.toggle('close', function(){
                    ed.loading = false;
                    ed.boxLoad.remove();
                    ed[method](response || data);
                });
            }        
        },

        events: {
            click: function(e){
                ed.opt.close && e.target == e.currentTarget && ed.toggle('close');
            },
            keydown: function(e){
                ed.opt.close && e.which == 27 && ed.toggle('close');
            },
            resize: function(){
                var body_h = ed.boxBody.outerHeight();
                var header_h = ed.boxHeader.outerHeight();
                var footer_h = ed.boxFooter.outerHeight();
                var content_h = ed.boxContent.get(0).scrollHeight;
                var overflow = Math.ceil(body_h - (header_h + footer_h)) < content_h ? true : false;
                ed.boxBody[overflow ? 'addClass' : 'removeClass'](ed.opt.prefix + '-scroll-true');
            }
        },

        base: function(){
            $('body').prepend(
                ed.box.addClass(ed.opt.parentClass).one('click', ed.events.click)
                );

            $(window).one('keydown', ed.events.keydown);

            return this;
        },

        insert: function(content){
            ed.box.append(
                ed.boxBody
                .css({
                    width: ed.opt.width,
                    height: ed.opt.height
                })
                .append(
                    ed.opt.header && ed.boxHeader.html(ed.opt.header),
                    ed.boxClose.one('click', ed.events.click),
                    ed.boxContent.append(content),
                    ed.opt.footer && ed.boxFooter.html(ed.opt.footer)
                    )
                )

            !ed.opt.close && ed.boxClose.css('display', 'none');
            $(window).on('resize', ed.events.resize).resize();
            ed.toggle('open');
        },

        callback: {
            open: function(){
                if(!ed.loading && !ed.responseError){
                    ed.image && ed.boxLoad.remove();
                    ed.opt.afterOpen();
                }
            },
            close: function(){
                $(window).off({
                    keydown: ed.events.keydown,
                    resize: ed.events.resize
                });

                $(ed.target).length && $(ed.target)
                .removeClass(ed.opt.prefix + '-helper-class')
                .appendTo(ed.boxTemp)
                .unwrap();

                ed.loading ? ed.imageObj.attr('src', null) : !ed.responseError && ed.opt.afterClose();

                ed.box.remove();
            }
        },

        toggle: function(toggle, callback){
            if(ed.opt.animation){
                (ed.loading ? ed.boxLoad : (ed.responseError ? ed.boxError : ed.boxBody))
                .addClass(toggle == 'open' ? ed.opt.animateOpen : ed.opt.animateClose)
                .one(ed.animateEvents, function() {
                    typeof callback == 'function' ? callback() : ed.callback[toggle]();
                });
            } else {
                typeof callback == 'function' ? callback() : ed.callback[toggle]();
            }
        }
    }

    $.extend({
        edbox: function (options){
            var data = $.data(window, 'edboxData');

            if(typeof options === 'string' && options === 'close' && typeof data == 'object'){
                data.toggle('close');
                $.removeData(window, 'edboxData');
                return;
            }

            if(typeof options == 'object' && !data) {
                $.data(window, 'edboxData', new edbox(options));
                return;
            }
        },
        edboxDefaults: function(options){
            return $.extend(defaults, options);
        }
    })
    .fn.extend({
        edbox: function(options) {
            this.on('click', function(e) {
                e.preventDefault();
                $.data(window, 'edboxData', new edbox(options, this));
            });
        }
    });

})({
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
}, jQuery);