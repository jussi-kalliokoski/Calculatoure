(function(global){
	var	version		= /*# result += version; */,
		helpData	= [],
		acceptAsIs	= ['+','-','/','*','%','(',')',',',':','?','^','~','&&','&','||','|','>','>>','>>>','<','<<','>=','<=','!','!=','!==','==','==='],
		mathFunctions	= ['pow','sin','asin','cos','acos','tan','atan','atan2','pow','floor','ceil','round','abs','sqrt','max','min','log','exp'],
		customFunctions	= ['whack', 'frac', 'help', 'info', 'x'],
		results, gui, formulaBox, guiButtons,
		helpData = [], memHistory = [], memHistoryPos = -1, prev = 0;

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
	createHelp('sin', Math.exp, 'exp(a) returns the value of E<sup>a</sup>.');
	createHelp('sin', Math.abs, 'abs(a) returns the absolute value of a.');
	createHelp('sin', Math.max, 'max(a,b,...) returns the highest value in arguments.');
	createHelp('sin', Math.min, 'min(a,b,...) returns the lowest value in arguments.');
	createHelp('sin', Math.floor, 'floor(a) returns a, rounded downwards to the nearest integer.');
	createHelp('sin', Math.ceil, 'ceil(a) returns a, rounded updwards to the nearest integer.');
	createHelp('sin', Math.round, 'round(a) returns a, rounded to the nearest integer.');
	createHelp('sin', frac, 'frac(a) returns the decimal part of a number.');
	createHelp('sin', whack, 'whack(a) returns all the numbers in a added together and repeated until only one number remains.');
	whack.toString = function(){return 'function whack() { [native code] }'};
	frac.toString = function(){return 'function frac() { [native code] }'};
	help.toString = function(){return 'function help() { [native code] }'};
	info.toString = function(){info(); return ''};
	global.calculate = calculate;

	Jin(function(){
		results = document.getElementById('results');
		gui = document.getElementById('buttons');
		formulaBox = document.getElementById('formula');
		Jin.bind(document, 'keydown', function(e){
			switch(e.which)
			{
				case 13:
					calculate(new CodeExpression(formulaBox.value, 'JavaScript'));
					if (memHistoryPos != 0)
						memHistory.unshift(formulaBox.value);
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
		numpadButtons = Jin(document.getElementById('buttons').getElementsByTagName('button'));
		numpadButtons.bind('click', function(){ fixData(this); });
		Jin.bind(document.getElementById('calculate'), 'click', function(){
			calculate(new CodeExpression(formulaBox.value, 'JavaScript'));
			memHistory.unshift(formulaBox.value);
			memHistoryPos = -1;
			formulaBox.value = '';
		});
		//Jin.bind(document.getElementById('header'), 'click', function(){ info(); });
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
		/*var inf = document.getElementById('info');
		if (inf)
		{
			Jin.removeClass(inf, 'active');
			setTimeout(function(){ if (inf && inf.parentNode) inf.parentNode.removeChild(inf); }, 2000);
			return 'Hiding info...';
		}
		inf = document.createElement('div');
		inf.id = 'info';
		inf.innerHTML = '<h1>About Calculatoure</h1>Version '+version+'<br />Uses <a href="http://code.google.com/p/jin-js/" target="_blank">jin.js</a> (v. '+Jin.version+') and <a href="http://code.google.com/p/codeexpression-js/" target="_blank">CodeExpression.js</a><br />Type help() for help regarding functions.<br />Calculatoure is open source, as well as the modules it uses. You can see the development <a href="http://code.google.com/p/calculatoure/" target="_blank">here</a>. (Also for unobfuscated code)';
		document.body.appendChild(inf);
		setTimeout(function(){Jin.addClass(inf, 'active');}, 1);
		Jin.bind(inf, 'click', function(){ info(); });
		return 'Showing info...';*/
	}

	function fixData(button)
	{
		var	str	= button.innerHTML
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&'),
			cl	= button.className;
		if(str == 'clear')
			return formulaBox.value = '';
		if (cl !== 'op' && cl !== 'num' && str.length > 2)
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
		var i, expr = '', content, type;
		for(i=0; i < mexpr.length; i++)
		{
			content = mexpr[i].content.toLowerCase();
			type = mexpr[i].type;
			if (type === 'Whitespace')
				continue;
			if (type === 'Number' || type === 'Hexadecimal' || type === 'Octal')
				expr += content;
			else if (isIn(content, acceptAsIs) || isIn(content, customFunctions))
				expr += content;
			else if (isIn(content, mathFunctions))
				expr += 'Math.'+content;
			else switch(content)
			{
				case '=':
					expr += '==';
					break;
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
					throw 'Unexpected ' + mexpr[i].type;
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
			var num = prev, x = num, expr = createExpr(mexpr);
			eval('num='+expr);
			if (num === '!HELP')
				return;
			prev = num;
			addLine(writeDown(mexpr), 'expression');
			addLine(num, 'result');
		}
		catch(e)
		{
/*# if(f.debug) */
			console.log(expr);
/*# */
			addLine(e, 'error');
		}
	}
})(this);
