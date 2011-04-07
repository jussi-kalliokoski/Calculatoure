(function(CodeExpression, global){
	var	version		= /*# result += version; */,
		helpData	= [],
		answers		= [],
		globalBindings	= {},
		acceptAsIs	= ['+','-','/','*','%','(',')',',',':','?','^','~','&&','&','||','|','>','>>','>>>','<','<<','>=','<=','!','!=','!==','=','==','==='],
		mathFunctions	= ['pow','sin','asin','cos','acos','tan','atan','atan2','floor','ceil','round','abs','sqrt','max','min','log','exp'],
		mathConsts	= ['e', 'pi', 'sqrt2', 'sqrt1_2', 'ln2', 'ln10', 'log2e', 'log10e'],
		identifierTypes	= ['Identifier', 'Word'],
		numberTypes	= ['Number', 'Hexadecimal', 'Octal'],
		modePrefixes	= {'8': '0', '10': '', '16': '0x'},
		parensOpMatch	= /[\x7b\x7d\x5b\x5d\x28\x29]/g,
		parensOpeners	= ['[', '{', '('],
		parensClosers	= [']', '}', ')'],
		parensOperators	= parensOpeners.concat(parensClosers);

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

	function defineGlobal(name, content){
		Object.defineProperty(globalBindings, name, {
			get: function(){
				return content;
			},
			enumerable: true
		});
	}

	function assignGlobals(){
		var i;
		for (i=0; i<mathFunctions.length; i++){
			defineGlobal(mathFunctions[i], Math[mathFunctions[i]]);
		}
		for (i=0; i<mathConsts.length; i++){
			defineGlobal(mathConsts[i], Math[mathConsts[i].toUpperCase()]);
		}
		defineGlobal('whack', whack);
		defineGlobal('frac', frac);
		defineGlobal('help', help);
		defineGlobal('deg', 1 / 180 * Math.PI);
		defineGlobal('turns', 2 * Math.PI);
		defineGlobal('base', parseInt);
		defineGlobal('ans', ans);
		defineGlobal('answer', ans);
		defineGlobal('rand', rand);
		defineGlobal('random', rand);
	}

	// Custom functions

	function whack(num){
		return (num-1) % 9 + 1;
	}

	function frac(num){
		return num - Math.floor(num);
	}

	function help(about){
		var i;
		for (i=0; i<helpData.length; i++){
			if (helpData[i].f === about){
				return '$help:<br/>' + helpData[i].h;
			}
		}
		return '$help:<br />type help(&lt;function name&gt;) to get help with that specific function.';
	}

	function ans(i){
		return answers[i] || 0;
	}

	function rand(b){
		return Math.random(b);
	}

	function autoComplete(data){
		var	results = [],
			word	= /[a-z]+$/i.exec(data),
			l,
			prefix,
			key;
		if (word){
			word	= word[0];
			l	= word.length;
			prefix	= data.substr(0, data.length - l);
			for (key in globalBindings){
				if (globalBindings.hasOwnProperty(key) && key.substr(0, l) === word){
					results.push( prefix + key + (typeof globalBindings[key] === 'function' ? '(' : '') );
				}
			}
		}
		return results;
	}

	function createHelp(name, func, help){
		helpData.push({n: name, f: func, h: help});
	}

	function generateHelps(){
		createHelp('ans', ans, 'ans(n) returns the n:th answer and ans returns ans(0).');
		createHelp('random', rand, 'random (or rand) is a random number. Use as a constant.');
		createHelp('PI', 'pi', 'pi is an approximate of the constant pi.');
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

		whack.toString = function(){ return 'function whack() { [native code] }'; };
		frac.toString = function(){ return 'function frac() { [native code] }'; };
		help.toString = function(){ return 'function help() { [native code] }'; };
		ans.toString = function(){ return ans(0); };
		rand.toString = function(){ return rand(); };
	}

	function createExpr(mexpr){
		var i, expr = '', content, type, prevtype;
		for(i=0; i < mexpr.length; i++){
			if (mexpr[i].type === 'Whitespace'){
				continue;
			}
			prevtype = type;
			content = mexpr[i].content.toLowerCase();
			type = mexpr[i].type;
			if ( (isIn(type, numberTypes) || isIn(type, identifierTypes)) && (isIn(prevtype, numberTypes) || isIn(prevtype, identifierTypes)) ){
				expr += '*';
			}

			if (isIn(type, numberTypes)){
				expr += content;
			} else if (isIn(content, acceptAsIs)) {
				expr += content;
			} else if (type === 'Identifier' || type === 'Word'){
				expr += 'g["'+content+'"]';
			} else if (type === 'Operator' && isIn(content, parensOperators)) {
				expr += isIn(content, parensOpeners) ? '(' : ')';
			} else {
				throw 'Unexpected ' + type;
			}
		}
		return expr;
	}

	function writeDown(mexpr){
		var i, s = [];
		for(i=0; i<mexpr.length; i++){
			if (mexpr[i].content.toLowerCase() === 'pi'){
				s.push('pi');
			} else if(mexpr[i].type !== 'Whitespace') {
				s.push(mexpr[i].content.toLowerCase());
			}
		}
		return s.join(' ');
	}

	function Result(data, type, original, numeric){
		if (this.constructor !== Result){
			return new Result(data, type, original, numeric);
		}
		this.data = data;
		this.type = type;
		this.original = original;
		this.value = numeric;
		this.toString = function(){
			return this.data;
		};
	}

	function calculate(mexpr, mode){
		try{
			var	expr	= createExpr(mexpr),
				func	= new Function( 'var g = arguments[0]; return ""+(' + expr + ')' ),
				ans, result, num;
			if (mode === undefined){
				mode = 10;
			}
			num = func(globalBindings);
			if (num[0] === '$'){
				return Result(num.substr(1), 'help');
			}
			result = num;
			num = Number(num);
			if (isNaN(num)){
				num = 0;
			}
			answers.unshift(num);
			if (!isNaN(result)){
				result = Number(result).toString(mode);
				if (modePrefixes[mode] !== undefined){
					result = modePrefixes[mode] + result;
				} else {
					result = 'base(' + result + ', ' + mode + ')';
				}
			}
			return Result(result, 'result', writeDown(mexpr), num);
		} catch(e){
			return Result(e, 'error');
		}
	}

	function calculatoure(c, m){
		var	open	= [0, 0, 0],
			closed	= [0, 0, 0],
			i;
		c.replace(parensOpMatch, function(a){
			isIn(a, parensOpeners) ? open[parensOpeners.indexOf(a)]++ : closed[parensClosers.indexOf(a)]++;
		});
		for (i=0; i<3; i++){
			while (open[i]-- > closed[i]){
				c += parensClosers[i];
			}
		}
		return calculate( new CodeExpression(c, 'JavaScript'), m );
	}

	assignGlobals();
	generateHelps();

	global.calculatoure		= calculatoure;
	calculatoure.calculate		= calculatoure;
	calculatoure.help		= helpData;
	calculatoure.version		= version;
	calculatoure.autoComplete	= autoComplete;

}(CodeExpression, this));
