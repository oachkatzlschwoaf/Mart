$(document).ready(function(){
	$('input.customCheckbox').customCheckbox();
});
	
jQuery.fn.customSelect = function(_options) {
	var _options = jQuery.extend({
	selectStructure:'<div class="selectArea"><div class="selectIn"><div class="selectText"></div></div></div>',
	selectText:'.selectText',
	selectBtn:'.selectIn',
	selectDisabled:'.disabled',
	optStructure:'<div class="selectSub"><ul></ul></div>',
	maxHeight:false,optList:'ul'
}, _options);
	return this.each(function() {
		var select = jQuery(this);
		if(!select.hasClass('outtaHere')) {
			if(select.is(':visible')) {
				var replaced = jQuery(_options.selectStructure);
				var selectText = replaced.find(_options.selectText);
				var selectBtn = replaced.find(_options.selectBtn);
				var selectDisabled = replaced.find(_options.selectDisabled).hide();
				var optHolder = jQuery(_options.optStructure);
				var optList = optHolder.find(_options.optList);
				if(select.attr('disabled')) selectDisabled.show();
				select.find('option').each(function() {
					var selOpt = $(this);
					var _opt = jQuery('<li><a href="#">' + selOpt.html() + '</a></li>');
					if(selOpt.attr('selected')) {
						selectText.html(selOpt.html());
						_opt.addClass('selected');
					}
					_opt.children('a').click(function() {
						optList.find('li').removeClass('selected');
						select.find('option').removeAttr('selected');
						$(this).parent().addClass('selected');
						selOpt.attr('selected', 'selected');
						selectText.html(selOpt.html());
						select.change();
						optHolder.hide();
						return false;
					});
					optList.append(_opt);
				});
				replaced.width(select.outerWidth());
				replaced.insertBefore(select);
				replaced.addClass(select.attr('class'));
					optHolder.css({
						width: select.outerWidth(),
						display: 'none',
						position: 'absolute'
					});
				optHolder.addClass(select.attr('class'));
				jQuery(document.body).append(optHolder);
				
				var optTimer;
				replaced.hover(function() {
					if(optTimer) clearTimeout(optTimer);
				}, function() {
					optTimer = setTimeout(function() {
						optHolder.hide();
					}, 200);
				});
				optHolder.hover(function(){
					if(optTimer) clearTimeout(optTimer);
				}, function() {
					optTimer = setTimeout(function() {
						optHolder.hide();
					}, 200);
				});
				selectBtn.click(function() {
					if(optHolder.is(':visible')) {
						optHolder.hide();
					}
					else{
						optHolder.children('ul').css({height:'auto', overflow:'hidden'});
						optHolder.css({
							top: replaced.offset().top + replaced.outerHeight(),
							left: replaced.offset().left,
							display: 'block'
						});
						if(_options.maxHeight && optHolder.children('ul').height() > _options.maxHeight) optHolder.children('ul').css({height:_options.maxHeight, overflow:'auto'});
					}
					return false;
				});
				select.addClass('outtaHere');
			}
		}
	});
}

jQuery.fn.customRadio = function(_options){
	var _options = jQuery.extend({
		radioStructure: '<div></div>',
		radioDisabled: 'disabled',
		radioDefault: 'radioArea',
		radioChecked: 'radioAreaChecked'
	}, _options);
	return this.each(function(){
		var radio = jQuery(this);
		if(!radio.hasClass('outtaHere') && radio.is(':radio')){
			var replaced = jQuery(_options.radioStructure);
			replaced.addClass(radio.attr('class'));
			this._replaced = replaced;
			if(radio.is(':disabled')) { 
				replaced.addClass(_options.radioDisabled); 
				if(radio.is(':checked')) replaced.addClass('disabledChecked');
			}
			else if(radio.is(':checked')) replaced.addClass(_options.radioChecked);
			else replaced.addClass(_options.radioDefault);
			replaced.click(function(){
				if($(this).hasClass(_options.radioDefault)){
					radio.change();
					radio.attr('checked', 'checked');
					changeRadio(radio.get(0));
				}
			});
			radio.click(function(){
				changeRadio(this);
			});
			replaced.insertBefore(radio);
			radio.addClass('outtaHere');
		}
	});
	function changeRadio(_this){
		$('input:radio[name='+$(_this).attr("name")+']').not(_this).each(function(){
			if(this._replaced && !$(this).is(':disabled')) this._replaced.removeClass().addClass(_options.radioDefault);
		});
		_this._replaced.removeClass().addClass(_options.radioChecked);
		$(_this).trigger('change');
	}
}

jQuery.fn.customCheckbox = function(_options){
	var _options = jQuery.extend({
		checkboxStructure: '<div></div>',
		checkboxDisabled: 'disabled',
		checkboxDefault: 'checkboxArea',
		checkboxChecked: 'checkboxAreaChecked'
	}, _options);
	return this.each(function(){
		var checkbox = jQuery(this);
		if(!checkbox.hasClass('outtaHere') && checkbox.is(':checkbox')){
			var replaced = jQuery(_options.checkboxStructure);
			replaced.addClass(checkbox.attr('class'));
			this._replaced = replaced;
			if(checkbox.is(':disabled')) { 
				replaced.addClass(_options.checkboxDisabled);
				if(checkbox.is(':checked')) replaced.addClass('disabledChecked');
			}
			else if(checkbox.is(':checked')) replaced.addClass(_options.checkboxChecked);
			else replaced.addClass(_options.checkboxDefault);
			
			replaced.click(function(){
				if(!replaced.hasClass('disabled')){
					if(checkbox.is(':checked')) checkbox.removeAttr('checked');
					else checkbox.attr('checked', 'checked');
					changeCheckbox(checkbox);
				}
			});
			checkbox.click(function(){
				changeCheckbox(checkbox);
			});
			replaced.insertBefore(checkbox);
			checkbox.addClass('outtaHere');
		}
	});
	function changeCheckbox(_this){
		if(_this.is(':checked')) _this.get(0)._replaced.removeClass().addClass(_options.checkboxChecked);
		else _this.get(0)._replaced.removeClass().addClass(_options.checkboxDefault);
		_this.trigger('change');
	}
}