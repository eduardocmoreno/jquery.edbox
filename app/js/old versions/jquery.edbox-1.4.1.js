/*
 * jQuery Edbox plugin v.1.4.1
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
			htmlClose   : '<img src="images/close-modal.png"/>',
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
					.prepend('<div class="' + options.className + '-overlay"/>')
					.find('.' + options.className + '-overlay')
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
					.after('<div class="' + options.className + '"/>')
					.next('.' + options.className)
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
					.append('<div class="' + options.className + '-content"/>')
					.find('.' + options.className + '-content')
					.css({
						'display'   : 'block',
						'overflow-x': 'hidden',
						'overflow-y': 'hidden'
					});

				box
					.prepend('<a href="#" class="' + options.className + '-close">' + options.htmlClose + '</a>')
					.find('.' + options.className + '-close:first-child')
					.css({
						'cursor'     : 'pointer',
						'display'    : 'block',
						'position'   : 'absolute',
						'white-space': 'nowrap',
						'z-index'    : '1'
					});

				$.fx.off = !options.animation;

				$(document)
					.on('keydown', closeOnEsc)
					.on('click', '.' + options.className + '-close, .' + options.className + '-overlay', function(e){
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
							.after('<div class="' + options.className + '-load" />')
							.next('.' + options.className + '-load')
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
					var contentWidth = boxContent.outerWidth(true),
						contentHeight = boxContent.outerHeight(true),
						extraWidth = box.outerWidth(true) - box.width(),
						extraHeight = box.outerHeight(true) - box.height(),
						windowWidth = $(window).width(),
						windowHeight = $(window).height(),
						newWidth = options.width ? options.width - extraWidth : contentWidth,
						newHeight = options.height ? options.height - extraHeight : contentHeight;

					if(newWidth + extraWidth + 40 > windowWidth){
						newWidth = windowWidth - extraWidth - 40;
					}

					if(newHeight + extraHeight + 40 > windowHeight){
						newHeight = windowHeight - extraHeight - 40;
					}

					boxContent
						.width(newWidth - boxContent.width(0).outerWidth())
						.height(newHeight - boxContent.height(0).outerHeight())
						.hide()
						.fadeIn('slow');

					contentWidth > newWidth && boxContent.css('overflow-x', 'scroll');
					contentHeight > newHeight && boxContent.css('overflow-y', 'scroll');

					box
						.width(newWidth)
						.height(newHeight)
						.css({
							'margin-left': -box.outerWidth(true) / 2,
							'margin-top' : -box.outerHeight(true) / 2,
							'visibility' : 'visible'
						})
						.hide()
						.setFx(options.fx, options.duration, options.easing);
				}

				function closeOnEsc(e){
					!options.disableClose && e.which == 27 && closeBox();
				}

				function closeBox(callback){
					$(document)
						.off('keydown', closeOnEsc)
						.off('click', '.' + options.className + '-close, .' + options.className + '-overlay');

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
						.append('<div class="' + options.className + '-error"></div>')
						.find('.' + options.className + '-error')
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