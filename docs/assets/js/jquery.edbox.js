/*
* jQuery Edbox plugin v.2.5.0
* @author Eduardo Moreno - eduardocmoreno[at]gmail[dot]com
* Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
*/

; (function ($, settings, self) {

  function Edbox(options, el) {
    self = this;

    self.opt = $.extend({}, settings, options);

    self.$el = $(el);

    var href = self.$el.attr('href');
    href = (/^(#.*)/).test(href) ? null : href;

    self.target = self.$el.attr('data-box-target') || self.opt.target;
    self.copy = $.parseJSON(self.$el.attr('data-box-copy') || self.opt.copy) === true ? true : false;
    self.html = self.$el.attr('data-box-html') || self.opt.html;
    self.image = self.$el.attr('data-box-image') || self.opt.image;
    self.url = self.$el.attr('data-box-url') || self.opt.url || href;
    self.success = self.$el.attr('data-box-success') || self.opt.success;
    self.info = self.$el.attr('data-box-info') || self.opt.info;
    self.warning = self.$el.attr('data-box-warning') || self.opt.warning;
    self.danger = self.$el.attr('data-box-danger') || self.opt.danger;
    self.header = self.$el.attr('data-box-header') || self.opt.header;
    self.footer = self.$el.attr('data-box-footer') || self.opt.footer;
    self.width = self.$el.attr('data-box-width') || self.opt.width;
    self.height = self.$el.attr('data-box-height') || self.opt.height;
    self.addClass = self.$el.attr('data-box-add-class') || self.opt.addClass;
    self.animateOpen = self.$el.attr('data-box-animate-open') || self.opt.animateOpen;
    self.animateClose = self.$el.attr('data-box-animate-close') || self.opt.animateClose;

    self.beforeOpen = self.$el.attr('data-box-before-open') ? new Function(self.$el.attr('data-box-before-open')) : self.opt.beforeOpen;
    self.afterOpen = self.$el.attr('data-box-after-open') ? new Function(self.$el.attr('data-box-after-open')) : self.opt.afterOpen;
    self.beforeClose = self.$el.attr('data-box-before-close') ? new Function(self.$el.attr('data-box-before-close')) : self.opt.beforeClose;
    self.afterClose = self.$el.attr('data-box-after-close') ? new Function(self.$el.attr('data-box-after-close')) : self.opt.afterClose;

    self.close = self.$el.attr('data-box-close') ? JSON.parse(self.$el.attr('data-box-close')) : self.opt.close;
    self.animation = self.$el.attr('data-box-animation') ? JSON.parse(self.$el.attr('data-box-animation')) : self.opt.animation;

    self.$box = $('<div class="edbox"/>');
    self.$boxError = $('<div class="edbox-error"/>');
    self.$boxLoad = $('<div class="edbox-load"/>');
    self.$boxBody = $('<div class="edbox-body"/>');
    self.$boxClose = $('<div class="edbox-close"/>');
    self.$boxContent = $('<section class="edbox-content"/>');
    self.$boxHeader = $('<header class="edbox-header"/>');
    self.$boxFooter = $('<footer class="edbox-footer"/>');
    self.$boxTemp = $('<div class="edbox-temp"/>');

    self.animateEvents = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

    self.init();
  }

  Edbox.prototype = {
    init: function () {
      self.base();

      var content =
        self.target ||
        self.html ||
        self.image ||
        self.url;

      var alert =
        self.success && 'success' ||
        self.info && 'info' ||
        self.warning && 'warning' ||
        self.danger && 'danger';

      if (!content && !alert) {
        self.error('Undefined');
        return;
      }

      self.beforeOpen();

      if (self.target) {
        var $target = $(self.target);

        if ($target.length) {
          if (self.copy) {
            $target = $target.clone();
          } else {
            $target
              .after(self.$boxTemp)
              .addClass('edbox-target');
          }

          self.insert($target);
        } else {
          self.error('Unable to find element: "' + self.target + '"');
        }

        return;
      }

      if (self.html) {
        self.insert(self.html);
        return;
      }

      if (self.image) {
        self.imageObj = new Image();
        self.imageObj.src = self.image;

        self.imageObj.complete ? self.insert(self.imageObj) : self.load.start(self.image);

        return;
      }

      if (self.url) {
        self.load.start(self.url);
        return;
      }

      if (alert) {
        self.alert(alert, self[alert]);
        return;
      }
    },

    base: function () {
      self.$box
        .addClass(self.addClass)
        .addClass(!self.close && 'edbox-close-false')
        .add(self.$boxClose)
        .on('click', self.events.click);

      $('body').prepend(self.$box);
      $(window).on('keydown', self.events.keydown);
    },

    error: function (msg) {
      self.$box.removeClass(self.opt.addClass);

      self.opt = settings;
      self.responseError = true;

      self.alert('danger', msg);
    },

    alert: function (type, msg) {
      self.$box
        .addClass('edbox-alert edbox-alert-' + type)
        .append(
          $('<div/>')
            .addClass('edbox-alert-container')
            .append('<div>' + msg + '</div>', self.$boxClose)
        );

      self.toggle('open');
    },

    insert: function (content) {
      self.$box.append(
        self.$boxBody
          .css({
            width: self.width,
            height: self.height
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

    toggle: function (toggle, callback) {
      toggle == 'close' && !self.loading && !self.responseError && self.beforeClose();

      if (self.animation) {
        self.$box.children()
          .removeClass(self.animateOpen, self.animateClose)
          .addClass(toggle == 'open' ? self.animateOpen : self.animateClose)
          .one(self.animateEvents, function () {
            typeof callback == 'function' ? callback() : self.callback[toggle]();
          });
      } else {
        typeof callback == 'function' ? callback() : self.callback[toggle]();
      }
    },

    load: {
      start: function (url) {
        self.loading = true;
        self.$box.append(self.$boxLoad);
        self.toggle('open', function () {
          self.urlLoad = $.ajax({
            url: url,
            cache: (self.image ? false : true)
          }).fail(function (response) {
            self.load.complete('error', (self.image || self.url) + ' ' + response.statusText.toLowerCase());
          }).done(function (data) {
            self.load.complete('insert', null, self.imageObj || data);
          });
        });
      },

      complete: function (method, response, content) {
        self.toggle('close', function () {
          self.loading = false;
          self.$boxLoad.remove();
          self[method](response || content);
        });
      }
    },

    events: {
      click: function (e) {
        self.close && e.target == e.currentTarget && self.toggle('close');
      },
      keydown: function (e) {
        self.close && e.which == 27 && self.toggle('close');
      },
      resize: function () {
        var body_h = self.$boxBody.outerHeight();
        var header_h = self.$boxHeader.outerHeight();
        var footer_h = self.$boxFooter.outerHeight();
        var content_h = self.$boxContent.get(0).scrollHeight;
        var overflow = Math.ceil(body_h - (header_h + footer_h)) < content_h ? true : false;

        self.$box[overflow ? 'addClass' : 'removeClass']('edbox-scroll-y-true');
      }
    },

    callback: {
      open: function () {
        !self.responseError && self.afterOpen();
      },
      close: function () {
        $(window).off({
          keydown: self.events.keydown,
          resize: self.events.resize
        });

        !self.responseError && !self.copy && $(self.target)
          .removeClass('edbox-helper-class')
          .appendTo(self.$boxTemp)
          .unwrap();

        self.loading && self.urlLoad.abort();

        self.$box.remove();

        $.removeData(window, 'edbox');

        !self.loading && !self.responseError && self.afterClose();
      }
    }
  };

  $.edboxSettings = function (options) {
    return $.extend(settings, options);
  };

  $.edbox = function (options, el) {
    var data = $.data(window, 'edbox');

    if (options == 'close' && data) {
      data.toggle('close');
      return;
    }

    if ((typeof options == 'object' || $(el).length) && !data) {
      $.data(window, 'edbox', new Edbox(options, el));
      return;
    }
  };

  $.fn.edbox = function (options) {
    return this.each(function () {
      $(this).on('click', function (e) {
        e.preventDefault();
        $.edbox(options, this);
      });
    });
  };

  $('[edbox]').edbox();

})(jQuery, {
  target: null,
  copy: false,
  html: null,
  image: null,
  url: null,

  success: null,
  info: null,
  warning: null,
  danger: null,

  header: null,
  footer: null,

  width: null,
  height: null,
  addClass: null,

  close: true,
  animation: true,

  animateOpen: 'edbox-animate-open',
  animateClose: 'edbox-animate-close',

  beforeOpen: function () { },
  afterOpen: function () { },
  beforeClose: function () { },
  afterClose: function () { }
});