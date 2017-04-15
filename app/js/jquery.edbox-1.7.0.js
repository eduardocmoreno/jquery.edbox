/*
 * jQuery Edbox plugin v.1.7.0
 * @author Eduardo Carneiro Moreno - eduardocmoreno[at]gmail[dot]com
 * Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
 */

var edboxInstance = false;

(function($) {
	
	$.extend({
		
		edbox: function(settings, elem){
			
			var defaults = {
				content     : null,
				width       : null,
				height      : null,
				prefixId    : 'box',
				parentClass : '',
				header      : '',
				footer      : '',
				disableClose: false,
				animation   : true,
				fx          : 'slide',
				duration    : 'fast',
				easing      : 'swing',
				beforeOpen  : function() {},
				beforeClose : function() {},
				onOpen      : function() {},
				onClose     : function() {}
			};
			
			var	options = $.extend({}, defaults, settings);
			var	window_h = $(window).height();
			var	window_w = $(window).width();
				
				var box          = $('<div id="' + options.prefixId + '"/>');
				var boxWrapper   = $('<div id="' + options.prefixId + '-wrapper"/>');
				var boxClose     = $('<div id="' + options.prefixId + '-close"/>');
				var boxContainer = $('<div id="' + options.prefixId + '-container"/>');
				var boxContent   = $('<div id="' + options.prefixId + '-content"/>');
				var boxHeader    = $('<div id="' + options.prefixId + '-header"/>');
				var boxFooter    = $('<div id="' + options.prefixId + '-footer"/>');

			if(!edboxInstance){
				edboxInstance = true;
				
				options.beforeOpen();


				$('body').prepend(
					box.prepend(
						boxWrapper.prepend(
							boxClose,
							boxContainer.prepend(
								options.header && boxHeader,
								boxContent,
								options.footer && boxFooter
							)
						)
					)
				);

				boxWrapper.css('background','red');

				/*var box = $('#' + options.prefixId)
					.prepend()

				var boxWrapper = $('#' + options.prefixId + '-wrapper')
					.prepend('<div id="' + options.prefixId + '-container"/>')
					.prepend('<a href="#" id="' + options.prefixId + '-close" title="close"></button>');
					
				var boxContainer = $('#' + options.prefixId + '-container')
					.prepend('<div id="' + options.prefixId + '-content"/>');

				var boxClose = $('#' + options.prefixId + '-close');*/

				return;
				
				$.fx.off = !options.animation;

				$(document)
					.on('keydown', closeOnEsc)
					.on('click', [box, boxClose], function(e) {
						e.preventDefault();
						!options.disableClose && closeBox();
					})
					.data('closeBox', closeBox);

				var content = options.content || $(elem).attr('href') || $(elem).attr('data-content');
				
				if (content == null || content == '') {
					error('Content option is empty');
				} else {
					content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

					var getExt = content.lastIndexOf('.') > 0 && content.substr(content.lastIndexOf('.') + 1).toLowerCase();
					var getId = content.indexOf('#') == 0;
					var getAt = content.indexOf('@') > -1;
					var getWhiteSpace = content.indexOf(' ') > -1;
					var getTag = content.search(/(<([^>]+)>)/ig) > -1;

					//File or image
					if (!getWhiteSpace && !getId && !getAt && !getTag && getExt) {
						var ts = new Date()/60000;
						
						var boxLoad = $('body')
							.prepend('<div id="' + options.prefixId + '-load" />')
							.find('#' + options.prefixId + '-load')
							.setFx(options.fx, options.duration, options.easing, function() {
								if ($.inArray(getExt, ['jpg', 'jpeg', 'gif', 'png']) > -1) {
									$('<img/>')
										.attr('src', content + '?v=' + ts)
										.on('error', function() {
											hideLoading(function() {
												error('Image \"' + content + '\" not found');
											});
										})
										.on('load', function() {
											boxContent.append(this);
											hideLoading(openBox);
										});
								} else {
									boxContent.load(content, function(response, status, xhr) {
										hideLoading(function() {
											status == "error" ? error('File \"' + content + '\" ' + xhr.statusText.toLowerCase()) : openBox();
										});
									});
								}
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
						var boxHeader = boxContent
							.prepend('<div id="' + options.prefixId + '-header">' + options.header + '</div>')
							.find('#' + options.prefixId + '-header');
					}

					if (options.footer) {
						var boxFooter = boxContent
							.append('<div id="' + options.prefixId + '-footer">' + options.footer + '</div>')
							.find('#' + options.prefixId + '-footer');
					}

					options.disableClose && boxClose.hide();

					boxWrapper.css('visibility', 'visible');

					$(window).on('resize', function(){
						boxWrapper.css('padding-bottom', options.footer && boxFooter.outerHeight());
						
						boxContent
							.css({
								height: 'auto',
								width: 'auto'
							})
							.css({
								height: box.outerHeight() - (options.header && boxHeader.outerHeight()) - (options.footer && boxFooter.outerHeight()),
								width: box.outerWidth()
							})
					}).resize();

					boxWrapper
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

					boxWrapper.add(boxLoad)
						.stop()
						.setFx(options.fx, options.duration, options.easing, function() {
							contentHtml && $('#' + options.prefixId + '-temp').html(contentHtml).find(content).unwrap();
							box.detach();
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
		this.on('click', function(e){
			e.preventDefault();
			$.edbox(settings, this);
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