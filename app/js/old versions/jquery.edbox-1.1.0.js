/*
 * jQuery Edbox plugin v.1.1.0
 * @author Eduardo Carneiro Moreno
 * Code under MIT License
 */

(function($){

	//Set an instance to prevent calling plugin more than one time
	var instance = false;

	//Let's get started
	$.fn.edbox = function(settings){

		var defaults = {
				content:null,
				width:null,
				height:null,
				animation:true,
				boxClass:'box',
				boxBgColor:'#fff',
				overlayBgColor:'#000',
				overlayOpacity:'.5',
				closeBtContent:'<img src="images/close-modal.png"/>',
				loadImgSrc:'images/box-load.gif',
				duration:'fast',
				easing:'swing'
			},
			options = $.extend({}, defaults, settings),
			content,
			contentClone,
			box,
			boxOverlay,
			boxContent,
			boxLoad,
			boxClose;

		//Check if there is a selector
		if(this.length){
			return this.each(function(){
				var elem = $(this).on('click', function(e){
					buildBox();
					e.preventDefault();
				});
				content = options.content || elem.attr('href') || elem.attr('data-content');
			});
		} else {
			if(!instance){
				instance = true;
				content = options.content;
				buildBox();
			}
		}

		//Function that will bild the minimal structure to start
		function buildBox(){

			//Creating elements
			$('body').prepend('<div class="' + options.boxClass + '-overlay"/><div class="' + options.boxClass + '"><a href="#" class="' + options.boxClass + '-close">' + options.closeBtContent + '</a><div class="' + options.boxClass + '-content"/></div>');

			boxOverlay = $('.' + options.boxClass + '-overlay').css({
				'background-color':options.overlayBgColor,
				'opacity':options.overlayOpacity,
				'width':'100%',
				'height':'100%',
				'position':'fixed',
				'top':'0',
				'left':'0',
				'z-index':'100'
			});

			box = $('.' + options.boxClass);

			boxContent = $('.' + options.boxClass + '-content');

			box.add(boxContent).css('display', 'none');

			boxClose = box.children('.' + options.boxClass + '-close').css({
				'display':'none',
				'position':'absolute',
				'cursor':'pointer',
				'white-space':'nowrap'
			});

			//Enable or disable animation
			$.fx.off = !options.animation;

			//Closing box events
			$(document)
				.on('keyup', function(e){
					e.keyCode == 27 && closeBox();
				})
				.on('click', '.' + options.boxClass + '-close, .' + options.boxClass + '-overlay', function(e){
					closeBox();
					e.preventDefault();
				});

			//Check if content option was set
			if(content == null || content == ''){
				error('The content option was not set');
				return false;
			}

			//Remove white spaces from the beginning and the end of the string
			content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

			//Check if the string has an extension, white spaces or is an element id
			var getExt = content.lastIndexOf('.') > 0 && content.substr(content.lastIndexOf('.') + 1).toLowerCase(),
				getId = content.indexOf('#') == 0,
				getWhiteSpace = content.indexOf(' ') > -1;

			//File
			if(!getWhiteSpace && !getId && getExt){
				boxLoad = boxOverlay.after('<div class="' + options.boxClass + '-load" />').next('.' + options.boxClass + '-load');
				var loading = $('<img/>')
					.attr({
						'src':options.loadImgSrc + '?random=' + (new Date()).getTime() //dodge cache
					})
					.error(function(){
						error('\"' + options.loadImgSrc + '\" not found');
					})
					.css('padding', '10px')
					.load(function(){
						boxLoad
							.append(loading)
							.css({
								'background':options.boxBgColor,
								'height':loading.outerHeight(),
								'width':loading.outerWidth(),
								'margin-top':-loading.outerHeight() / 2,
								'margin-left':-loading.outerWidth() / 2,
								'top':'50%',
								'left':'50%',
								'position':'fixed',
								'display':'none',
								'z-index':'102'
							})
							.slideDown(options.duration, options.easing, function(){
								if($.inArray(getExt, ['jpg', 'jpeg', 'gif', 'png']) > -1){
									var contentImg = $('<img/>')
										.attr('src', content + '?random=' + (new Date()).getTime())
										.error(function(){
											hideLoading(function(){
												error('Image \"' + content + '\" not found');
											});
										})
										.load(function(){
											boxContent.html(contentImg);
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
			else if(!getWhiteSpace && getId){
				if($(content).length){
					contentClone = $(content).clone();
					boxContent.append(contentClone.show());
					openBox();
				} else {
					error('Element \"' + content + '\" not found');
				}
			}

			//HTML or text
			else {
				boxContent.append(content);
				openBox();
			}
		}

		function openBox(){
			//Show the box to be able to get dimensinons
			box.show();

			//Get dimensions
			var horizontalPad = parseInt(box.css('padding-right')) + parseInt(box.css('padding-left')),
				verticalPad = parseInt(box.css('padding-top')) + parseInt(box.css('padding-bottom')),
				width = options.width || boxContent.outerWidth(),
				height = options.height || boxContent.outerHeight(),
				windowWidth = $(window).width(),
				windowHeight = $(window).height();

			width + horizontalPad + 20 > windowWidth && (width = windowWidth - horizontalPad - 20);
			height + verticalPad + 20 > windowHeight && (height = windowHeight - verticalPad - 20);

			//Set properties and open
			boxContent.css({
				'display':'inline-block',
				'width':width,
				'height':height,
				'overflow-x':'hidden',
				'overflow-y':'auto'
			});

			boxClose.find('img').css('display', 'block').end().css({
				'display':'block',
				'margin-left':width
			});

			box.css({
				'background-color':options.boxBgColor,
				'display':'none',
				'height':height,
				'left':'50%',
				'margin-left':-(width + horizontalPad) / 2,
				'margin-top':-(height + verticalPad) / 2,
				'overflow':'hidden',
				'position':'fixed',
				'top':'50%',
				'width':width,
				'z-index':'101'
			}).stop().slideDown(options.duration, options.easing);

		}

		//Functions
		function closeBox(){
			box.stop().slideUp(options.duration, options.easing, function(){
				boxOverlay.add(box).add(boxLoad).detach();
			});
			instance = false;
		}

		function hideLoading(callBack){
			boxLoad.stop().delay('slow').slideUp(options.duration, options.easing, function(){
				$(this).detach();
				callBack();
			});
		}

		function error(msg){
			boxContent.append('<div class="' + options.boxClass + '-error"></div>').find('.' + options.boxClass + '-error').css({
				'color':'#C00'
			}).text('ERROR: ' + msg + '!');
			openBox();
		}

	};

})(jQuery);