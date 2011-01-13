(function(global){
	var	version		= /*# result += version; */,
		helpData	= [],
		acceptAsIs	= ['+','-','/','*','%','(',')',',',':','?','^','~','&&','&','||','|','>','>>','>>>','<','<<','>=','<=','!','!=','!==','=','==','==='],
		mathFunctions	= ['pow','sin','asin','cos','acos','tan','atan','atan2','floor','ceil','round','abs','sqrt','max','min','log','exp'],
		customFunctions	= ['whack', 'frac', 'ans', 'answer', 'help'],
		units		= ['deg', 'turn'],
		numberTypes	= ['Number', 'Hexadecimal', 'Octal'],
		modes		= ['Binary', 0, 0, 0, 0, 0, 'Octal', 0, 'Decimal', 0, 0, 0, 0, 0, 'Hexadecimal'],
		modePrefixes	= {'8': '0', '10': ' ', '16': '0x'},
		
		nav, results, gui, formulaBox, guiButtons, infoBox, helpBox, shareBox, modeSwitch,
		helpData = [], memHistory = [], prev = [0], memHistoryPos = -1, mini = 'mini',
		globalBindings = {},
	
		bind		= Jin.bind,
		getById		= Jin.byId,
		getByTag	= Jin.byTag,
		getByClass	= Jin.byCl;

	assignGlobals();

	createHelp('ans', 'ans', 'ans(n) returns the n:th answer and ans returns ans(0).');
	createHelp('random', 'random', 'random (or rand) is a random number. Use as a constant.');
	createHelp('pi', 'pi', 'pi is an approximate of the constant pi.');
	createHelp('e', 'e', 'e is the base of the natural logarithm.');
	createHelp('base', parseInt, 'base(a,n) converts a from the base of n to default.');
	createHelp('sin', Math.sin, 'sin(&alpha;) converts an angle value to an x coordinate.');
	createHelp('cos', Math.cos, 'cos(&alpha;) converts an angle value to an y coordinate.');
	createHelp('tan', Math.tan, 'tan(&alpha;) converts an angle value to a line modifier factor (k).');
	createHelp('asin', Math.asin, 'asin(num) inverse function of sin(&alpha;).');
	createHelp('acos', Math.acos, 'acos(num) inverse function of cos(&alpha;).');
	createHelp('atan', Math.atan, 'atan(num) inverse function of tan(&alpha;).');
	createHelp('atan2', Math.atan2, 'atan2(y, x) inverse function of tan(&alpha;).');
	createHelp('pow', Math.pow, 'pow(a, b) returns a<sup>b</sup>');
	createHelp('sqrt', Math.sqrt, 'sqrt(a) returns the square root of a.');
	createHelp('log', Math.log, 'log(a, b) returns the natural logarithm of a (E-based).');
	createHelp('exp', Math.exp, 'exp(a) returns the value of E<sup>a</sup>.');
	createHelp('abs', Math.abs, 'abs(a) returns the absolute value of a.');
	createHelp('max', Math.max, 'max(a,b,...) returns the highest value in arguments.');
	createHelp('min', Math.min, 'min(a,b,...) returns the lowest value in arguments.');
	createHelp('floor', Math.floor, 'floor(a) returns a, rounded downwards to the nearest integer.');
	createHelp('ceil', Math.ceil, 'ceil(a) returns a, rounded updwards to the nearest integer.');
	createHelp('round', Math.round, 'round(a) returns a, rounded to the nearest integer.');
	createHelp('frac', frac, 'frac(a) returns the decimal part of a number.');
	createHelp('whack', whack, 'whack(a) returns all the numbers in a added together and repeated until only one number remains.');
	whack.toString = function(){return 'function whack() { [native code] }'};
	frac.toString = function(){return 'function frac() { [native code] }'};
	help.toString = function(){return 'function help() { [native code] }'};
	global.calculate = calculate;

	Jin(function(){
		nav = getById('nav');
		results = getById('results');
		gui = getById('buttons');
		formulaBox = getById('formula');
		helpBox = getById('help');
		shareBox = getById('share');
		infoBox = getById('info');

		infoBox.innerHTML = '<h1>About Calculatoure</h1>Version '+version+'<br />Uses <a href="http://code.google.com/p/jin-js/" target="_blank">jin.js</a> (v. '+Jin.version+') and <a href="http://code.google.com/p/codeexpression-js/" target="_blank">CodeExpression.js</a><br />Type help() for help regarding functions.<br />Calculatoure is open source, as well as the modules it uses. You can see the development <a href="http://code.google.com/p/calculatoure/" target="_blank">here</a>. (Also for unobfuscated code)';
		bind(infoBox, 'click', function(){ info(); });

		(function(){
			var i, l, a, o;
			for (i=0, l=helpData.length, a=[]; i<l; i++)
				a.push(helpData[i].h);
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
				mode.appendChild(o);
			}
		})();

		bind(document, 'keydown', function(e){
			switch(e.which)
			{
				case 13:
					calculate(new CodeExpression(formulaBox.value, 'JavaScript'));
					if (memHistoryPos !== 0){
						var i;
						while((i = memHistory.indexOf(formulaBox.value)) !== -1){
							memHistory.splice(i, 1);
						}
						memHistory.unshift(formulaBox.value);
					}
					memHistoryPos = -1;
					formulaBox.value = '';
					break;
				case 38:
					if (memHistoryPos >= memHistory.length - 1)
						return;
					formulaBox.value = memHistory[++memHistoryPos];
					break;
				case 40:
					memHistoryPos--;
					if (memHistoryPos < 0)
					{
						memHistoryPos = -1;
						formulaBox.value = '';
					}
					else
						formulaBox.value = memHistory[memHistoryPos];
					break;
				default:
					/*# if (f.debug) */console.log(e.which);/*# */
			}
		});
		numpadButtons = Jin(getById('buttons').getElementsByTagName('button'));
		numpadButtons.bind('click', function(){ if (this.innerHTML !== 'Calculate') fixData(this); })
		.each(function(){
			for (var i=0, l=helpData.length; i<l; i++)
				if (helpData[i].n === this.innerHTML)
				{
					this.title = helpData[i].h.replace(/&alpha;/, 'a');
					return;
				}
		});
		bind(getById('calculate'), 'click', function(){
			calculate(new CodeExpression(formulaBox.value, 'JavaScript'));
			memHistory.unshift(formulaBox.value);
			memHistoryPos = -1;
			formulaBox.value = '';
		});
		Jin(nav.getElementsByTagName('a')).each(function(){
			var target = this.href.substr(3),
			doWhat;
			if (target === 'Show')
				doWhat = showGui;
			else if (target === 'About')
				doWhat = info;
			else if (target === 'Help')
				doWhat = toggleHelp;
			else if (target === 'Share')
				doWhat = toggleShare;

			Jin.bind(this, 'click', function(e){
				if(e.preventDefault)
					e.preventDefault();
				doWhat();
			});
		});
		addLine('Welcome to Calculatoure!');
		addLine('Type help(func) for help about a specific function.');
	});

	// Custom functions

	function whack(num)
	{
		return (num-1) % 9 + 1;
	}

	function frac(num)
	{
		return num - Math.floor(num);
	}

	function help(about)
	{
		for (var i=0; i<helpData.length; i++)
			if (helpData[i].f === about)
			{
				addLine('help:<br/>' + helpData[i].h);
				return '$';
			}
		addLine('help:<br />type help(&lt;function name&gt;) to get help with that specific function.');
		return '$';
	}

	// Other

	function createHelp(name, func, help)
	{
		helpData.push({n: name, f: func, h: help});
	}

	function info()
	{
		if (Jin.hasClass(infoBox, mini))
			Jin.addClass(gui, mini);
		else
			Jin.removeClass(gui, mini);
		Jin.toggleClass(infoBox, mini);
		Jin.addClass(shareBox, mini);
		Jin.addClass(helpBox, mini);
	}

	function showGui()
	{
		Jin.removeClass(gui, mini);
		Jin.addClass(shareBox, mini);
		Jin.addClass(helpBox, mini);
		Jin.addClass(infoBox, mini);
	}

	function toggleHelp()
	{
		if (Jin.hasClass(helpBox, mini))
			Jin.addClass(gui, mini);
		else
			Jin.removeClass(gui, mini);
		Jin.toggleClass(helpBox, mini);
		Jin.addClass(shareBox, mini);
		Jin.addClass(infoBox, mini);
	}

	function toggleShare()
	{
		if (Jin.hasClass(shareBox, mini))
			Jin.addClass(gui, mini);
		else
			Jin.removeClass(gui, mini);
		Jin.toggleClass(shareBox, mini);
		Jin.addClass(helpBox, mini);
		Jin.addClass(infoBox, mini);
	}

	function fixData(button)
	{
		var	str	= button.innerHTML
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&'),
			cl	= button.className;
		if(str === 'clear')
			return formulaBox.value = '';
		if (cl !== 'op' && cl !== 'num' && str !== 'ans' && str.length > 2)
			str += '(';
		pushStr(str);
	}

	function addLine(str, type)
	{
		var div = document.createElement('div');
		div.innerHTML = str;
		Jin.addClass(div, type);
		results.appendChild(div);
		results.scrollTop = results.scrollHeight;
	}

	function pushStr(str)
	{
		var length = formulaBox.length,
		start = formulaBox.selectionStart,
		end = formulaBox.selectionEnd,
		sel = formulaBox.value.substr(start, end);
		formulaBox.value = formulaBox.value.substr(0, start) + str; + formulaBox.value.substr(end);
/*# if (!f.mobile) */
		formulaBox.focus();
/*# */
	}

	function isIn(needle, haystack)
	{
		for (var i=0, l=haystack.length; i<l; i++)
			if (haystack[i] === needle)
				return true;
		return false;
	}

	function createExpr(mexpr)
	{
		var i, expr = '', content, type, prevtype;
		for(i=0; i < mexpr.length; i++)
		{
			if (mexpr[i].type === 'Whitespace'){
				continue;
			}
			prevtype = type;
			content = mexpr[i].content.toLowerCase();
			type = mexpr[i].type;
			if ( (isIn(type, numberTypes) || type === 'Identifier') && (isIn(prevtype, numberTypes) || prevtype === 'Identifier') ){
				expr += '*';
			}

			if (isIn(type, numberTypes))
				expr += content;
			else if (isIn(content, acceptAsIs))
				expr += content;
	/*		else if (isIn(content, mathFunctions) || isIn(content, customFunctions))
				expr += 'g["'+content+'"]';
			else if (isIn(content, units))
				expr += '*' + 'g["'+content+'"]'; */
			else switch(content)
			{
				case 'pi':
					expr += 'Math.PI';
					break;
				case 'rand':
				case 'random':
					expr += 'Math.random()';
					break;
				case 'e':
					expr += 'Math.E';
					break;
				default:
					if (type === 'Identifier'){
						expr += 'g["'+content+'"]';
					} else {
						throw 'Unexpected ' + type;
					}
			}
		}
		return expr;
	}

	function writeDown(mexpr)
	{
		for(var i=0, s=[]; i<mexpr.length; i++)
		{
			if (mexpr[i].content.toLowerCase() == 'pi')
				s.push('pi');
			else if(mexpr[i].type != 'Whitespace')
				s.push(mexpr[i].content.toLowerCase());
		}
		return s.join(' ');
	}

	function calculate(mexpr)
	{
		try{
			var num, expr = createExpr(mexpr), func = new Function('var g = arguments[0]; return ""+(' + expr + ')'), ans, result, mode = Number(modeSwitch.value);
			
			ans = function(n){
				return prev[n];
			};
			ans.toString = function(){ return prev[0]; };
			if (globalBindings.ans !== undefined){
				delete globalBindings.ans;
			}
			if (globalBindings.answer !== undefined){
				delete globalBindings.answer;
			}
			defineGlobal('ans', ans);
			defineGlobal('answer', ans);
			num = func(globalBindings);
			if (num === '$')
				return;
			result = num;
			num = Number(num);
			if (isNaN(num))
				num = 0;
			prev.unshift(num);
			if (!isNaN(result)){
				result = Number(result).toString(mode);
				if (modePrefixes[mode]){
					result = modePrefixes[mode] + result;
				} else {
					result = 'base(' + result + ', ' + mode + ')';
				}
			}
			addLine(writeDown(mexpr), 'expression');
			addLine(result, 'result');
		}
		catch(e)
		{
/*# if(f.debug) */
			console.log(expr);
/*# */
			addLine(e, 'error');
		}
	}

	function assignGlobals(){
		var i, l = mathFunctions.length;
		for (i=0; i<l; i++){
			defineGlobal(mathFunctions[i], Math[mathFunctions[i]]);
		}
		defineGlobal('whack', whack);
		defineGlobal('frac', frac);
		defineGlobal('help', help);
		defineGlobal('deg', 1 / 180 * Math.PI);
		defineGlobal('turn', 2 * Math.PI);
		defineGlobal('base', parseInt);
	}

	function defineGlobal(name, content){
		Object.defineProperty(globalBindings, name, {
			get: function(){
				return content;
			},
			configurable: true
		});
	}
})(this);
