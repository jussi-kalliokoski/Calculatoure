(function(Jin, calculatoure){
	var	nav, results, gui, formulaBox, infoBox, helpBox, shareBox, modeSwitch, numpadButtons, refToggle,
		helpData = calculatoure.help, memHistory = [], memHistoryPos = -1, mini = 'mini',
		modes		= ['Binary', 0, 0, 0, 0, 0, 'Octal', 0, 'Decimal', 0, 0, 0, 0, 0, 'Hexadecimal'],
	
		bind		= Jin.bind,
		getById		= Jin.byId,
		appendChildren	= Jin.appendChildren,
		removeClass	= Jin.removeClass,
		addClass	= Jin.addClass,
		create		= Jin.create;

	function touchSetting(setting, value){
		var storage = window.localStorage;
		if (storage){
			if (typeof value !== 'undefined'){
				storage[setting] = value;
				return value;
			} else {
				return storage[setting];
			}
		}
		return '';
	}

	function updateReflection(){
		var	setting	= touchSetting('reflection') !== 'no',
			body	= document.body;
		refToggle.checked = setting;
		if (setting){
			addClass(body, 'ref');
		} else {
			removeClass(body, 'ref');
		}
	}

	function info(){
		if (Jin.hasClass(infoBox, mini)){
			Jin.addClass(gui, mini);
		} else {
			Jin.removeClass(gui, mini);
		}
		Jin.toggleClass(infoBox, mini);
		Jin.addClass(shareBox, mini);
		Jin.addClass(helpBox, mini);
	}

	function showGui(){
		Jin.removeClass(gui, mini);
		Jin.addClass(shareBox, mini);
		Jin.addClass(helpBox, mini);
		Jin.addClass(infoBox, mini);
	}

	function toggleHelp(){
		if (Jin.hasClass(helpBox, mini)){
			Jin.addClass(gui, mini);
		} else {
			Jin.removeClass(gui, mini);
		}
		Jin.toggleClass(helpBox, mini);
		Jin.addClass(shareBox, mini);
		Jin.addClass(infoBox, mini);
	}

	function toggleShare(){
		if (Jin.hasClass(shareBox, mini)){
			Jin.addClass(gui, mini);
		} else {
			Jin.removeClass(gui, mini);
		}
		Jin.toggleClass(shareBox, mini);
		Jin.addClass(helpBox, mini);
		Jin.addClass(infoBox, mini);
	}

	function pushStr(str){
		var	start	= formulaBox.selectionStart,
			end	= formulaBox.selectionEnd;

		formulaBox.value = formulaBox.value.substr(0, start) + str + formulaBox.value.substr(end);
/*# if (!f.mobile) */
		formulaBox.focus();
/*# */
	}

	function fixData(button){
		var	str	= button.innerHTML
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&'),
			cl	= button.className;
		if(str === 'clear'){
			return (formulaBox.value = '');
		}
		if (cl !== 'op' && cl !== 'num' && str !== 'ans' && str.length > 2){
			str += '(';
		}
		pushStr(str);
	}

	function calculate(e){
		var res = calculatoure(e, Number(modeSwitch.value));
		if (res.original){
			addLine(res.original, 'expression');
		}
		addLine(res.data, res.type);
	}

	function assignElements(){
		nav = getById('nav');
		results = getById('results');
		gui = getById('buttons');
		formulaBox = getById('formula');
		helpBox = getById('help');
		shareBox = getById('share');
		infoBox = getById('info');
		numpadButtons = Jin(getById('buttons').getElementsByTagName('button'));
	}

	function fillDynamicElements(){
		infoBox.innerHTML = '<h1>About Calculatoure</h1>Version ' +
			calculatoure.version +
			'<br />Uses <a href="https://github.com/jussi-kalliokoski/jin.js" target="_blank">jin.js</a> (v. ' +
			Jin.version +
			') and <a href="https://github.com/jussi-kalliokoski/CodeExpression.js" target="_blank">CodeExpression.js</a><br />' +
			'Type help() for help regarding functions.<br />Calculatoure is open source, as well as the modules it uses.' +
			'You can see the development <a href="https://github.com/jussi-kalliokoski/Calculatoure" target="_blank">here</a>.' +
			'(Also for unobfuscated code)<br /><a href="http://www.calculatoure.com">calculatoure.com</a>';

		(function(){
			var i, l, a, o;
			for (i=0, l=helpData.length, a=[]; i<l; i++){
				a.push(helpData[i].h);
			}
			a.sort();
			helpBox.innerHTML += a.join('<br />');

			modeSwitch = a = getById('mode');
			for (i=0, l=modes.length; i<l; i++){
				o = Jin.create('option');
				o.value = i+2;
				o.innerHTML = modes[i] || (i+2) + '-base';
				if (i === 8){
					o.selected = 'true';
				}
				modeSwitch.appendChild(o);
			}
		}());
		numpadButtons.each(function(){
			var i, l=helpData.length;
			for (i=0; i<l; i++){
				if (helpData[i].n === this.innerHTML){
					this.title = helpData[i].h.replace(/&alpha;/, 'a');
					return;
				}
			}
		});
		var refToggler = create({html: '<br/>'});
		appendChildren(infoBox, refToggler);
		refToggle = create('input', {type: 'checkbox', id: 'refToggle'});
		appendChildren(refToggler, refToggle, create('label', {'for': 'refToggle', html: 'Toggle reflection'}));
		updateReflection();
	}

	function calculateHit(){
		calculate(formulaBox.value);
		var i;
		while((i = memHistory.indexOf(formulaBox.value)) !== -1){
			memHistory.splice(i, 1);
		}
		memHistory.unshift(formulaBox.value);
		memHistoryPos = -1;
		formulaBox.value = '';
	}

	function doBindings(){
		bind(document, 'keydown', function(e){
			switch(e.which)
			{
				case 13:
					calculateHit();
					break;
				case 27:
					formulaBox.value = '';
					break;
				case 38:
					if (memHistoryPos >= memHistory.length - 1){
						return;
					}
					formulaBox.value = memHistory[++memHistoryPos];
					break;
				case 40:
					memHistoryPos--;
					if (memHistoryPos < 0){
						memHistoryPos = -1;
						formulaBox.value = '';
					} else {
						formulaBox.value = memHistory[memHistoryPos];
					}
					break;
				default:
					/*# if (f.debug) */console.log(e.which);/*# */
			}
		});
		numpadButtons.bind('click', function(){
			if (this.innerHTML !== 'Calculate'){
				fixData(this);
			}
		});
		bind(getById('calculate'), 'click', calculateHit);
		Jin(nav.getElementsByTagName('a')).each(function(){
			var target = this.href.substr(3),
			doWhat;
			if (target === 'Show'){
				doWhat = showGui;
			} else if (target === 'About') {
				doWhat = info;
			} else if (target === 'Help') {
				doWhat = toggleHelp;
			} else if (target === 'Share') {
				doWhat = toggleShare;
			}

			Jin.bind(this, 'click', function(e){
				if(e.preventDefault){
					e.preventDefault();
				}
				doWhat();
			});
		});
		bind(refToggle, 'change', function(){
			touchSetting('reflection', this.checked ? 'yes' : 'no');
			updateReflection();
		});
	}

	function addLine(str, type){
		var div = create();
		div.innerHTML = str;
		Jin.addClass(div, type);
		results.appendChild(div);
		results.scrollTop = results.scrollHeight;
	}

	Jin(function(){
		assignElements();
		fillDynamicElements();
		doBindings();
		addLine('Welcome to Calculatoure!');
		addLine('Type help(func) for help about a specific function.');
	});
}(Jin, calculatoure));
