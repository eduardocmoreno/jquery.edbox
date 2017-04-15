/*
 * jQuery Edbox plugin v.1.5.0
 * @author Eduardo Carneiro Moreno - eduardocmoreno[at]gmail[dot]com
 * Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
 */

(function($){
	var edboxInstance = false;

	$.fn.edbox = function(settings){
		var defaults = {
			content     : null,
			width       : null,
			height      : null,
			className   : 'box',
			prefixId    : 'box',
			htmlClose   : '<img src="images/close-modal.png"/>',
			header      : '',
			footer      : '',
			onOpen      : function(){},
			onClose     : function(){},
			disableClose: false,
			imgLoad     : 'images/box-load.gif',
			animation   : true,
			fx          : 'slide',
			duration    : 'fast',
			easing      : 'swing'
		};

		var options = $.extend({}, defaults, settings);

		return this.each(function(){
			var elem = $(this).on('click', function(e){
				!edboxInstance && buildBox();
				e.preventDefault();
			});

			var content = options.content || elem.attr('href') || elem.attr('data-content');

			function buildBox(){
				edboxInstance = true;

				var boxOverlay = $('body')
					.prepend('<div id="' + options.prefixId + '-overlay"/>')
					.find('#' + options.prefixId + '-overlay')
					.css({
						'display' : 'block',
						'height'  : '100%',
						'left'    : '0',
						'position': 'fixed',
						'top'     : '0',
						'width'   : '100%',
						'z-index' : '100'
					});

				var box = boxOverlay
					.after('<div id="' + options.prefixId + '"/>')
					.next('#' + options.prefixId)
					.css({
						'display'   : 'block',
						'left'      : '50%',
						'overflow'  : 'hidden',
						'position'  : 'fixed',
						'top'       : '50%',
						'visibility': 'hidden',
						'z-index'   : '101'
					});

				var boxContent = box
					.append('<div id="' + options.prefixId + '-content"/>')
					.find('#' + options.prefixId + '-content')
					.css({
						'border'    : 0,
						'display'   : 'block',
						'margin'    : 0,
						'overflow-x': 'hidden',
						'overflow-y': 'hidden',
						'padding'   : 0
					});

				var boxHeader = box
					.prepend('<div id="' + options.prefixId + '-header">' + options.header + '</div>')
					.find('#' + options.prefixId + '-header');

				var boxFooter = box
					.append('<div id="' + options.prefixId + '-footer">' + options.footer + '</div>')
					.find('#' + options.prefixId + '-footer');

				var boxClose = box
					.prepend('<a href="#" id="' + options.prefixId + '-close">' + options.htmlClose + '</a>')
					.children('#' + options.prefixId + '-close')
					.css({
						'cursor'     : 'pointer',
						'display'    : 'block',
						'position'   : 'absolute',
						'right'      : 5,
						'white-space': 'nowrap',
						'z-index'    : '100'
					});

				$.fx.off = !options.animation;

				$(document)
					.on('keydown', closeOnEsc)
					.on('click', '#' + options.prefixId + '-close, #' + options.prefixId + '-overlay', function(e){
						!options.disableClose && closeBox();
						e.preventDefault();
					})
					.data('closeBox', closeBox);

				if(content == null || content == ''){
					error('The content option was not set');
				} else {
					content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

					var getExt = content.lastIndexOf('.') > 0 && content.substr(content.lastIndexOf('.') + 1).toLowerCase(),
						getId = content.indexOf('#') == 0,
						getAt = content.indexOf('@') > -1,
						getWhiteSpace = content.indexOf(' ') > -1,
						getTag = content.search(/(<([^>]+)>)/ig) > -1;

					//File or image
					if(!getWhiteSpace && !getId && !getAt && !getTag && getExt){
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
							.error(function(){
								error('\"' + options.imgLoad + '\" not found');
							})
							.css('display', 'block')
							.load(function(){
								boxLoad
									.append(imgLoad)
									.css({
										'margin-left': -boxLoad.outerWidth(true) / 2,
										'margin-top' : -boxLoad.outerHeight(true) / 2,
										'visibility' : 'visible'
									})
									.hide()
									.setFx(options.fx, options.duration, options.easing, function(){
										if($.inArray(getExt, ['jpg', 'jpeg', 'gif', 'png']) > -1){
											$('<img/>')
												.attr('src', content + '?random=' + (new Date()).getTime())
												.error(function(){
													hideLoading(function(){
														error('Image \"' + content + '\" not found');
													});
												})
												.load(function(){
													$(this).appendTo(boxContent);
													hideLoading(openBox);
												})
												.css('display', 'block');
										} else {
											boxContent.load(content, function(response, status, xhr){
												hideLoading(function(){
													status == "error" ? error('File \"' + content + '\" ' + xhr.statusText.toLowerCase()) : openBox();
												});
											});
										}
									});
							});
					}

					//DOM Element
					else if(!getWhiteSpace && !getAt && !getTag && getId){
						if($(content).length){
							$(content)
								.clone()
								.appendTo(boxContent)
								.show();
							openBox();
						} else {
							error('Element \"' + content + '\" not found');
						}
					}

					//HTML
					else if(getTag){
						boxContent.html(content);
						openBox();
					}

					//Text
					else {
						boxContent.text(content);
						openBox();
					}
				}

				function openBox(){

					var box_h = box.outerHeight(true),
						box_w = box.outerWidth(true),
						boxContent_w = boxContent.outerWidth(true),
						boxContent_h = boxContent.outerHeight(true),
						window_w = $(window).width(),
						window_h = $(window).height(),
						newWidth = options.width || boxContent_w,
						newHeight = options.height || boxContent_h;

					if(box_w + 40 > window_w){
						newWidth = window_w - 40 - (box_w - box.width());
					}

					if(box_h + 40 > window_h){
						newHeight = window_h - 40 - (box_h - box.height()) - boxHeader.outerHeight(true) - boxFooter.outerHeight(true);
					}

					boxContent
						.height(newHeight - boxContent.height(0).outerHeight())
						.width(newWidth - boxContent.width(0).outerWidth())
						.show();

					if(boxContent_w > newWidth){
						boxContent.css('overflow-x', 'scroll');
					}

					if(boxContent_h > newHeight){
						var body = $('body'),
							scroll_w = body.width() - body.css('overflow-y', 'scroll').width();
						body.css('overflow-y', 'auto');
						!options.header && boxClose.css('right', scroll_w + 3);
						boxContent.css({
							'overflow-y': 'scroll',
							'width'     : boxContent.width() + scroll_w
						});
					}

					!options.header && boxHeader.detach();
					!options.footer && boxFooter.detach();
					!options.htmlClose && boxClose.detach();

					box
						.css({
							'margin-left': -box.outerWidth(true) / 2,
							'margin-top' : -box.outerHeight(true) / 2,
							'visibility' : 'visible'
						})
						.hide()
						.setFx(options.fx, options.duration, options.easing, function(){
							options.onOpen();
						});
				}

				function closeOnEsc(e){
					!options.disableClose && e.which == 27 && closeBox();
				}

				function closeBox(callback){
					$(document)
						.off('keydown', closeOnEsc)
						.off('click', '#' + options.prefixId + '-close, .' + options.prefixId + '-overlay');

					(box.height() ? box : boxLoad)
						.stop()
						.setFx(options.fx, options.duration, options.easing, function(){
							boxOverlay
								.add(box)
								.add(boxLoad)
								.detach();
							edboxInstance = false;
							typeof callback === "function" ? callback() : options.onClose();
						});
				}

				function hideLoading(callback){
					boxLoad
						.stop()
						.delay('slow')
						.setFx(options.fx, options.duration, options.easing, function(){
							$(this).detach();
							callback();
						});
				}

				function error(msg){
					boxContent
						.append('<div id="' + options.prefixId + '-error"></div>')
						.find('#' + options.prefixId + '-error')
						.css('color', '#C00')
						.text('ERROR: ' + msg + '!');
					openBox();
				}
			}
		});
	};

	$.edbox = function(settings){
		$('<a/>').edbox(settings).click();
	};

	$.edbox.close = function(callback){
		edboxInstance && $(document).data('closeBox')(callback);
	};

	$.fn.setFx = function(fx, duration, easing, callback){
		return this.each(function(){
			var elem = $(this), effect;
			switch(fx){
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