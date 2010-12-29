(function(window){
	var version = /*# result += version; */;
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
		switch(about)
		{
			case Math.sin:
				addLine('help:<br />sin(&alpha;) converts an angle value to an x coordinate.');
				break;
			case Math.cos:
				addLine('help:<br />cos(&alpha;) converts an angle value to an y coordinate.');
				break;
			case Math.tan:
				addLine('help:<br />tan(&alpha;) converts an angle value to a line modifier factor (k).');
				break;
			case Math.asin:
				addLine('help:<br />asin(num) inverse function of sin(&alpha;).');
				break;
			case Math.acos:
				addLine('help:<br />acos(num) inverse function of cos(&alpha;).');
				break;
			case Math.atan:
				addLine('help:<br />atan(num) inverse function of tan(&alpha;).');
				break;
			case Math.atan2:
				addLine('help:<br />atan2(y, x) inverse function of tan(&alpha;).');
				break;
			case Math.pow:
				addLine('help:<br />pow(a, b) returns a<sup>b</sup>');
				break;
			case Math.sqrt:
				addLine('help:<br />sqrt(a) returns the square root of a.');
				break;
			case Math.log:
				addLine('help:<br />log(a, b) returns the natural logarithm of a (E-based).');
				break;
			case Math.exp:
				addLine('help:<br />exp(a) returns the value of E<sup>a</sup>.');
				break;
			case Math.abs:
				addLine('help:<br />abs(a) returns the absolute value of a.');
				break;
			case Math.max:
				addLine('help:<br />max(a,b,...) returns the highest value in arguments.');
				break;
			case Math.min:
				addLine('help:<br />min(a,b,...) returns the lowest value in arguments.');
				break;
			case Math.floor:
				addLine('help:<br />floor(a) returns a, rounded downwards to the nearest integer.');
				break;
			case Math.ceil:
				addLine('help:<br />ceil(a) returns a, rounded updwards to the nearest integer.');
				break;
			case Math.round:
				addLine('help:<br />round(a) returns a, rounded to the nearest integer.');
				break;
			case frac:
				addLine('help:<br />frac(a) returns the decimal part of a number.');
				break;
			case whack:
				addLine('help:<br />whack(a) returns all the numbers in a added together and repeated until only one number remains.');
				break;
			default:
				addLine('help:<br />type help(&lt;function name&gt;) to get help with that specific function.');
		}
		return '!HELP';
	}
	function info()
	{
		var inf = document.getElementById('info');
		if (inf)
		{
			Jin.removeClass(inf, 'active');
			setTimeout(function(){ if (inf && inf.parentNode) inf.parentNode.removeChild(inf); }, 2000);
			return 'Hiding info...';
		}
		inf = document.createElement('div');
		inf.id = 'info';
		inf.innerHTML = '<h1>About Calculatoure</h1>Version '+version+'<br />Uses <a href="http://code.google.com/p/jin-js/" target="_blank">jin.js</a> (v. '+Jin.version+') and MathExpression.js<br />Type help() for help regarding functions.<br />Calculatoure is open source, as well as the modules it uses. You can try out the beta version <a href="/calculatoure/full/">here</a>. (Also for unobfuscated code)';
		document.body.appendChild(inf);
		setTimeout(function(){Jin.addClass(inf, 'active');}, 1);
		Jin.bind(inf, 'click', function(){ info(); });
		return 'Showing info...';
	}
	whack.toString = function(){return 'function whack() { [native code] }'};
	frac.toString = function(){return 'function frac() { [native code] }'};
	help.toString = function(){return 'function help() { [native code] }'};
	info.toString = function(){info(); return ''};
	window.calculate = calculate;
	var prev = 0;

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
			console.log(expr);
			addLine(e, 'error');
		}
	}

	function createExpr(mexpr)
	{
		var i, expr = '';
		for(i=0; i < mexpr.length; i++)
		{
			if (mexpr[i].type === 'Whitespace')
				continue;
			if (mexpr[i].type === 'Number')
			{
				expr += mexpr[i].content + ' ';
				continue;
			}
			switch(mexpr[i].content.toLowerCase())
			{
				case '+':
				case '-':
				case '/':
				case '*':
				case '%':
				case '(':
				case ')':
				case ',':
				case ':':
				case '?':
				case '^':
				case '~':
				case '&&':
				case '||':
				case '>':
				case '<':
				case '>=':
				case '<=':
				case '!':
				case '!=':
				case '!==':
				case '==':
				case '===':
					expr += mexpr[i].content;
					break;
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
				case 'pow':
				case 'sin':
				case 'asin':
				case 'cos':
				case 'acos':
				case 'tan':
				case 'atan':
				case 'atan2':
				case 'pow':
				case 'floor':
				case 'ceil':
				case 'round':
				case 'abs':
				case 'sqrt':
				case 'max':
				case 'min':
				case 'log':
				case 'exp':
					expr += 'Math.'+mexpr[i].content.toLowerCase();
					break;
				case 'e':
					expr += 'Math.E';
					break;
				case 'whack':
				case 'frac':
				case 'help':
				case 'info':
				case 'x':
					expr += mexpr[i].content.toLowerCase();
					break;
				default:
					throw 'Unexpected ' + mexpr[i].type;
			}
		}
		return expr;
	}

	var results, formulabox, gui, typebox, memhist = [], numpadButtons;
	memhist.position = -1;

	Jin(function(){
		results = document.getElementById('results');
		formulabox = document.getElementById('formulabox');
		gui = document.getElementById('gui');
		typebox = document.getElementById('typebox');
		Jin.bind(document, 'keydown', function(e){
			switch(e.which)
			{
				case 13:
					calculate(new MathExpression(typebox.value));
					if (memhist.position != 0)
						memhist.unshift(typebox.value);
					memhist.position = -1;
					typebox.value = '';
					break;
				case 38:
					if (memhist.position >= memhist.length - 1)
						return;
					typebox.value = memhist[++memhist.position];
					break;
				case 40:
					memhist.position--;
					if (memhist.position < 0)
					{
						memhist.position = -1;
						typebox.value = '';
					}
					else
						typebox.value = memhist[memhist.position];
					break;
				default:
					/*# if (f.debug) */console.log(e.which);/*# */
			}
		});
		numpadButtons = Jin(document.getElementById('numpad').getElementsByTagName('button'));
		numpadButtons.bind('click', function(){ var str = this.innerHTML.replace(/&lt;/, '<').replace(/&gt;/, '>'); if(str == 'clear') typebox.value = ''; else pushStr(str+((str.length > 2 && str !== 'random') ? '(' : '')) });
		Jin.bind(document.getElementById('calculate'), 'click', function(){
			calculate(new MathExpression(typebox.value));
			memhist.unshift(typebox.value);
			memhist.position = -1;
			typebox.value = '';
		});
		Jin.bind(document.getElementById('header'), 'click', function(){ info(); });
	});

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
		var length = typebox.length,
		start = typebox.selectionStart,
		end = typebox.selectionEnd,
		sel = typebox.value.substr(start, end);
		typebox.value = typebox.value.substr(0, start) + str; + typebox.value.substr(end);
/*# if (!f.mobile) */
		typebox.focus();
/*# */
	}
})(window);
