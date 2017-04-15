/*
 * jQuery Edbox plugin v.1.6.1
 * @author Eduardo Carneiro Moreno - eduardocmoreno[at]gmail[dot]com
 * Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
 */

(function($) {
	var edboxInstance = false;

	$.extend({
		edbox: function(settings, elem){
			var defaults = {
				content     : null,
				width       : null,
				height      : null,
				prefixId    : 'box',
				htmlClose   : '<img src="images/close-modal.png"/>',
				header      : '',
				footer      : '',
				beforeOpen  : function() {},
				beforeClose : function() {},
				onOpen      : function() {},
				onClose     : function() {},
				disableClose: false,
				imgLoad     : 'images/box-load.gif',
				animation   : true,
				fx          : 'slide',
				duration    : 'fast',
				easing      : 'swing'
			},
				options = $.extend({}, defaults, settings),
				window_h = $(window).height(),
				window_w = $(window).width();

			if(!edboxInstance){
				edboxInstance = true;
				options.beforeOpen();

				var el = $(elem),
					content = options.content || el.attr('href') || el.attr('data-content');

				var boxOverlay = $('body')
						.prepend('<div id="' + options.prefixId + '-overlay"/>')
						.find('#' + options.prefixId + '-overlay')
						.css({
							'height'  : '100%',
							'left'    : '0',
							'position': 'fixed',
							'top'     : '0',
							'width'   : '100%',
							'z-index' : '100'
						}),
					box = boxOverlay
						.after('<div id="' + options.prefixId + '"/>')
						.next('#' + options.prefixId)
						.css({
							'margin'    : 0,
							'position'  : 'fixed',
							'visibility': 'hidden',
							'z-index'   : '101'
						}),
					boxContent = box
						.append('<div id="' + options.prefixId + '-content"/>')
						.find('#' + options.prefixId + '-content')
						.css({
							'margin'    : 0,
							'overflow-x': 'hidden',
							'overflow-y': 'hidden',
							'position'  : 'relative'
						});

				

				$.fx.off = !options.animation;

				$(document)
					.on('keydown', closeOnEsc)
					.on('click', '#' + options.prefixId + '-close, #' + options.prefixId + '-overlay', function(e) {
						!options.disableClose && closeBox();
						e.preventDefault();
					})
					.data('closeBox', closeBox);

				if (content == null || content == '') {
					error('Content option is empty');
				} else {
					content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

					var getExt = content.lastIndexOf('.') > 0 && content.substr(content.lastIndexOf('.') + 1).toLowerCase(),
						getId = content.indexOf('#') == 0,
						getAt = content.indexOf('@') > -1,
						getWhiteSpace = content.indexOf(' ') > -1,
						getTag = content.search(/(<([^>]+)>)/ig) > -1;

					//File or image
					if (!getWhiteSpace && !getId && !getAt && !getTag && getExt) {
						var boxLoad = boxOverlay
							.after('<div id="' + options.prefixId + '-load" />')
							.next('#' + options.prefixId + '-load')
							.css({
								'display'   : 'inline-block',
								'left'      : '50%',
								'overflow'  : 'hidden',
								'position'  : 'fixed',
								'top'       : '50%',
								'visibility': 'hidden',
								'z-index'   : '102'
							});

						var imgLoad = $('<img/>')
							.attr({
								'src': options.imgLoad + '?random=' + (new Date()).getTime()
							})
							.error(function() {
								error('\"' + options.imgLoad + '\" not found');
							})
							.css('display', 'block')
							.load(function() {
								boxLoad
									.append(imgLoad)
									.css({
										'margin-left': -boxLoad.outerWidth(true) / 2,
										'margin-top' : -boxLoad.outerHeight(true) / 2,
										'visibility' : 'visible'
									})
									.hide()
									.setFx(options.fx, options.duration, options.easing, function() {
										if ($.inArray(getExt, ['jpg', 'jpeg', 'gif', 'png']) > -1) {
											$('<img/>')
												.attr('src', content + '?random=' + (new Date()).getTime())
												.error(function() {
													hideLoading(function() {
														error('Image \"' + content + '\" not found');
													});
												})
												.load(function() {
													$(this).appendTo(boxContent);
													hideLoading(openBox);
												})
												.css('display', 'block');
										} else {
											boxContent.load(content, function(response, status, xhr) {
												hideLoading(function() {
													status == "error" ? error('File \"' + content + '\" ' + xhr.statusText.toLowerCase()) : openBox();
												});
											});
										}
									});
							});
					}

					//DOM Element
					else if (!getWhiteSpace && !getAt && !getTag && getId) {
						if ($(content).length) {
							var contentHtml = $(content).clone();
							$(content)
								.wrap('<div id="' + options.prefixId + '-temp"/>')
								.appendTo(boxContent)
								.show();
							openBox();
						} else {
							error('Element \"' + content + '\" not found');
						}
					}

					//HTML
					else if (getTag) {
						boxContent.html(content);
						openBox();
					}

					//Text
					else {
						boxContent.text(content);
						openBox();
					}
				}

				function openBox() {
					if (options.header) {
						var boxHeader = box
							.prepend('<div id="' + options.prefixId + '-header">' + options.header + '</div>')
							.find('#' + options.prefixId + '-header');
					}

					if (options.footer) {
						var boxFooter = box
							.append('<div id="' + options.prefixId + '-footer">' + options.footer + '</div>')
							.find('#' + options.prefixId + '-footer');
					}

					if (options.htmlClose) {
						var boxClose = box
							.prepend('<a href="#" id="' + options.prefixId + '-close">' + options.htmlClose + '</a>')
							.children('#' + options.prefixId + '-close')
							.css({
								'cursor'     : 'pointer',
								'display'    : 'block',
								'position'   : 'absolute',
								'white-space': 'nowrap',
								'z-index'    : '100'
							});
					}
					var boxExtraHeight = box.outerHeight() - box.height(),
						boxExtraWidth = box.outerWidth() - box.width(),
						boxContentExtraHeight = boxContent.outerHeight() - boxContent.height(),
						boxContentExtraWidth = boxContent.outerWidth() - boxContent.width();

					box.css({
						'width'     : options.width,
						'height'    : options.height,
						'max-height': window_h - 40 - boxExtraHeight,
						'max-width' : window_w - 40 - boxExtraWidth
					});

					boxContent.css({
						'height': box.height() - boxContentExtraHeight - (options.header && boxHeader.outerHeight(true)) - (options.footer && boxFooter.outerHeight(true))
					});

					if (boxContent[0].scrollWidth > boxContent.width() + boxContentExtraWidth) {
						boxContent.css('overflow-x','scroll');
					}

					if (boxContent[0].scrollHeight > boxContent.height() + boxContentExtraHeight) {
						boxContent.css('overflow-y','scroll');

						var divScroll = $('body')
								.prepend('<div id="' + options.prefixId + '-scroll"/>')
								.find('#' + options.prefixId + '-scroll')
								.css({
									'visibility': 'hidden',
									'position'  : 'absolute',
									'height'    : 100,
									'overflow-y': 'scroll'
								});

						!options.header && options.htmlClose && parseInt(boxClose.css('right')) && boxClose.css('right', divScroll.width() + parseInt(boxClose.css('right')));
						
						divScroll.detach();
					}

					box
						.css({
							'left'       : '50%',
							'margin-left': -box.outerWidth() / 2,
							'margin-top' : -box.outerHeight() / 2,
							'top'        : '50%',
							'visibility' : 'visible'
						})
						.hide()
						.setFx(options.fx, options.duration, options.easing, function() {
							options.onOpen();
						});
				}

				function closeOnEsc(e) {
					!options.disableClose && e.which == 27 && closeBox();
				}

				function closeBox(callback) {
					options.beforeClose();

					$(document)
						.off('keydown', closeOnEsc)
						.off('click', '#' + options.prefixId + '-close, #' + options.prefixId + '-overlay');

					(box.height() ? box : boxLoad)
						.stop()
						.setFx(options.fx, options.duration, options.easing, function() {
							contentHtml && $('#' + options.prefixId + '-temp').html(contentHtml).find(content).unwrap();
							boxOverlay
								.add(box)
								.add(boxLoad)
								.detach();
							edboxInstance = false;
							typeof callback === "function" ? callback() : options.onClose();
						});
				}

				function hideLoading(callback) {
					boxLoad
						.stop()
						.delay('slow')
						.setFx(options.fx, options.duration, options.easing, function() {
							$(this).detach();
							callback();
						});
				}

				function error(msg) {
					options = defaults;
					boxContent
						.append('<div id="' + options.prefixId + '-error"></div>')
						.find('#' + options.prefixId + '-error')
						.text('ERROR: ' + msg + '!');
					openBox();
				}
			}
		}
	});

	$.fn.edbox = function(settings){
		this.click(function(e) {
			$.edbox(settings, this);
			e.preventDefault();
		});
	}

	$.edbox.close = function(callback) {
		edboxInstance && $(document).data('closeBox')(callback);
	};

	$.fn.setFx = function(fx, duration, easing, callback) {
		return this.each(function() {
			var elem = $(this), effect;
			switch (fx) {
				case 'fade':
					effect = fx + (elem.is(':visible') ? 'Out' : 'In');
					break;
				case 'slide':
					effect = fx + (elem.is(':visible') ? 'Up' : 'Down');
					break;
				case 'toggle':
					effect = elem.is(':visible') ? 'hide' : 'show';
					break;
			}
			elem[effect](duration, easing, callback);
		});
	};

})(jQuery);