/*
 * jQuery Edbox plugin v.1.0.0
 * @author Eduardo Carneiro Moreno
 * Code under MIT License
 */

(function($){

	var instance = false;

	$.fn.edbox = function(settings){

		var defaults = {
				content : null,
				width : null,
				height : null,
				boxBgColor : '#fff',
				overlayBgColor : '#000',
				overlayOpacity : '.5',
				closeBtContent : 'close X',
				loadImgSrc : 'images/loading.gif',
				animation: true,
				easing: null
			},
			options = $.extend({}, defaults, settings),
			content,
			contentClone;

		$(document).on('keyup', function(e){
			e.keyCode == 27 && closeBox();
		}).on('click','.box-close, .overlay', function(e){
			closeBox();
			e.preventDefault();
		});

		if(this.length){
			return this.each(function(){
				var	elem = $(this).on('click', function(e){
					buildBox();
					e.preventDefault();
				});
				content = elem.attr('data-content') || elem.attr('href');
			});
		} else {
			if(!instance){
				instance = true;
				content = options.content;
				buildBox();
			}
		}

		function buildBox(){
			$('body').prepend('<div class="overlay"/><div class="box"><div class="box-content" style="display:none;" /><a href="#" class="box-close">'+options.closeBtContent+'</a></div>');

			$('.overlay').css({
				'background-color' : options.overlayBgColor,
				'opacity' : options.overlayOpacity,
				'width' : '100%',
				'height' : '100%',
				'position' : 'fixed',
				'top' : '0',
				'left' : '0',
				'z-index' : '100'
			});

			$('.box-close').css({
				'display' : 'block',
				'position' : 'absolute',
				'top' : '5px',
				'right' : '5px',
				'border' : '0',
				'background-color' : 'none',
				'cursor' : 'pointer',
				'padding' : '5px',
				'white-space' : 'nowrap',
				'color' : '#000'
			});

			//Remove white spaces from the beginning and the end of the string
			content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

			//Detect if string have an extension, white spaces or if is an element
			var getExt = content.lastIndexOf('.') > 0 && content.substr(content.lastIndexOf('.')+1).toLowerCase(),
				getId = content.indexOf('#') == 0,
				getWhiteSpace = content.indexOf(' ') > -1;

			//File
			if(!getWhiteSpace && !getId && getExt){
				console.log('File');
				$('<div class="box-load" />').insertAfter('.overlay');
				var loading = $('<img/>').attr({
					'src' : options.loadImgSrc + '?random=' + (new Date()).getTime() //dodge cache
				}).error(function(){
					error('\"' + options.loadImgSrc + '\" not found');
				}).load(function(){
					$('.box-load').append($(this).css({
						'padding' : '10px'
					})).css({
						'background' : options.boxBgColor,
						'height' : loading.outerHeight(),
						'width' : loading.outerWidth(),
						'margin-top' : -loading.outerHeight()/2,
						'margin-left' : -loading.outerWidth()/2,
						'top' : '50%',
						'left' : '50%',
						'position' : 'fixed',
						'display' : 'none',
						'box-shadow' : '0 0 10px rgba(0,0,0,0.5)',
						'z-index' : '102'
					}).slideDown('fast', function(){
						if($.inArray(getExt, ['jpg', 'jpeg', 'gif', 'png']) > -1){
							var contentImg = $('<img/>').attr({
								'src' : content
							}).error(function(){
								hideLoading(function(){
									error('Image \"' + content + '\" not found');
								});
							}).load(function(){
								$('.box-content').html(contentImg);
								hideLoading(openBox);
							});
						} else {
							$('.box-content').load(content, function(response, status, xhr){
								hideLoading(function(){
									status == "error" ? error('File \"' + content + '\" ' + xhr.statusText.toLowerCase()) : openBox();
								});
							});
						}
					});
				});

			}

			//DOM Element
			else if(!getWhiteSpace && getId) {
				if($(content).length){
					contentClone = $(content).clone();
					$('.box-content').append(contentClone.show());
					openBox();
				} else {
					error('Element \"'+ content +'\" not found');
				}
			}

			//HTML or text
			else {
				$('.box-content').append(content);
				openBox();
			}
		}

		function openBox(){
			$('.box-content').css({
				'float' : 'left',
				'overflow' : 'hidden',
				'padding' : '30px',
				'white-space' : 'nowrap'
			}).show();

			//Get dimensions from content
			var width = options.width || $('.box-content').outerWidth();
			width > $(window).width() && (width = $(window).width() - 40);

			var height = options.height || $('.box-content').outerHeight();
			height > $(window).height() && (height = $(window).height() - 40);

			$('.box').css({
				'position' : 'fixed',
				'display' : 'none',
				'overflow' : 'hidden',
				'background-color' : options.boxBgColor,
				'width' : width+'px',
				'height' : height+'px',
				'top' : '50%',
				'left' : '50%',
				'margin-top' : -height/2,
				'margin-left' : -width/2,
				'overflow-y' : 'auto',
				'box-shadow' : '0 0 20px rgba(0,0,0,0.5)',
				'z-index' : '101'
			});

			options.animation ? $('.box').stop().slideDown('fast') : $('.box').show();
		}

		function closeBox(){
			$('.box').stop().slideUp('fast', function(){
				$('.overlay').add('.box').detach();
				instance = false;
			});
		}

		function hideLoading(callBack){
			$('.box-load').delay('fast').slideUp('fast', function(){
				$(this).detach();
				callBack();
			});
		}

		function error(msg){
			$('.box-content').append('<div class="box-error"></div>').find('.box-error').css({
				'color' : '#C00'
			}).text('ERROR: ' + msg + '!');
			openBox();
		}

	};

	$.fn.animation = function(){}

})(jQuery);