/**
 * @author Jussi Kalliokoski
 * @version /*# result += version; */
*/
(function(CodeExpression, global){
	var	version		= /*# result += version; */,
		helpData	= [],
		answers		= [],
		globalBindings	= {},
		acceptAsIs	= ['+','-','/','*','%','(',')',',',':','?','^','~','&&','&','||','|','>','>>','>>>','<','<<','>=','<=','!','!=','!==','=','==','==='],
		mathFunctions	= ['pow','sin','asin','cos','acos','tan','atan','atan2','floor','ceil','round','abs','sqrt','max','min','log','exp'],
		mathConsts	= ['e', 'pi', 'sqrt2', 'sqrt1_2', 'ln2', 'ln10', 'log2e', 'log10e'],
		numberTypes	= ['Number', 'Hexadecimal', 'Octal', 'Degal'],
		modePrefixes	= {'8': '0', '10': '', '16': '0x'},
		opLiterals	= {
			'AND':	'&',
			'OR':	'|',
			'XOR':	'^',
			'NOT':	'~'
		},
		parensOpMatch	= /[\x7b\x7d\x5b\x5d\x28\x29]/g,
		parensOpeners	= ['[', '{', '('],
		parensClosers	= [']', '}', ')'],
		parensOperators	= parensOpeners.concat(parensClosers);

/**
 * Checks if object is in an array.
 *
 * @private
 * @param needle The object to seek for within the array.
 * @param {Array} haystack The array to seek within.
*/
	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

/**
 * Binds an item to the global scope of the Calculatoure.
 *
 * @private
 * @param {String} name The variable name with which the object is bound to the global scope.
 * @param content The object to be bound.
*/
	function defineGlobal(name, content){
		Object.defineProperty(globalBindings, name, {
			get: function(){
				return content;
			},
			enumerable: true
		});
	}

/**
 * Handles assigning the default list of items in the global scope.
 *
 * @private
*/
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

/**
 * Iterates the sum of all the numbers in an unsigned integer until it is reduced to only one number.
 *
 * @private
 * @param {number} num The number to whack.
 * @return {number} The whacked number.
*/
	function whack(num){
		return (num-1) % 9 + 1;
	}

/**
 * Removes the integer part of a number and returns only the fraction part.
 *
 * @private
 * @param {number} The number to perform the operation on.
 * @return {number} The fraction part of the number.
*/
	function frac(num){
		return num - Math.floor(num);
	}

/**
 * Returns the help entry for a specified function.
 *
 * @private
 * @param {Function} about The function to seek the help entry for.
 * @return {String} The helpdata for specified function.
*/
	function help(about){
		var i;
		for (i=0; i<helpData.length; i++){
			if (helpData[i].f === about){
				return '$help:<br/>' + helpData[i].h;
			}
		}
		return '$help:<br />type help(&lt;function name&gt;) to get help with that specific function.';
	}

/**
 * Returns the Calculatoure's answer i operations backwards.
 *
 * @private
 * @param {number} i The number of operations before the current answer.
 * @return The answer of the specified operation.
*/
	function ans(i){
		return answers[i] || 0;
	}

/**
 * Returns a random number based on a seed.
 *
 * @private
 * @param {number} b The seed.
 * @return {number} A random number.
*/
	function rand(b){
		return Math.random(b);
	}

/**
 * Attempts to autoComplete a Calculatoure expression.
 *
 * @param {String} data The expression to perform the operation on.
 * @return {Array} The suggested ways to complete the expression.
*/
	function autoComplete(data){
		var	results = [],
			word	= /[\$_a-z][\$_a-z0-9]*$/i.exec(data),
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

/**
 * Creates a help entry for a specified function.
 *
 * @private
 * @param {String} name The name of the function.
 * @param {Function} func The function to create the help entry for.
 * @param {String} help The help entry for the function.
*/
	function createHelp(name, func, help){
		helpData.push({n: name, f: func, h: help});
	}

/**
 * Binds a function to the global scope and creates a help entry for it.
 *
 * @param {String} name The name of the function.
 * @param {Function} func The function to bind.
 * @param {String} help (Optional) The help entry for the function.
*/
	function addFunction(name, func, help){
		defineGlobal(name, func);
		help && createHelp(name, func, help);
	}

/**
 * Handles assigning the help entries for internal functions and variables.
*/
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

/**
 * Pre-parses and compiles a CodeExpression for calculation.
 *
 * @private
 * @param {CodeExpression} mexpr The CodeExpression to perform the operation on.
 * @return {Function} The compiled expression.
*/
	function createExpr(mexpr){
		var i, expr = '', content, type, prevtype;
		for(i=0; i < mexpr.length; i++){
			if (mexpr[i].type === 'Whitespace'){
				continue;
			}
			prevtype	= type;
			content		= mexpr[i].content.toLowerCase();
			type		= mexpr[i].type;
			if ( (isIn(type, numberTypes) || type === 'Identifier') && (isIn(prevtype, numberTypes) || prevtype === 'Identifier') ){
				expr += '*';
			}

			if (isIn(type, numberTypes)){
				expr += content;
			} else if (isIn(content, acceptAsIs)) {
				expr += content;
			} else if (type === 'Identifier'){
				expr += 'g["'+content+'"]';
			} else if (type === 'Operator' && opLiterals[content.toUpperCase()]) {
				expr += opLiterals[content.toUpperCase()];
			} else if (type === 'Operator' && isIn(content, parensOperators)) {
				expr += isIn(content, parensOpeners) ? '(' : ')';
			} else {
				throw 'Unexpected ' + type;
			}
		}
		return new Function( 'var g = arguments[0]; return ""+(' + expr + ')' );
	}

/**
 * Generates a human readable representation of a CodeExpression object.
 *
 * @private
 * @param {CodeExpression} mexpr The CodeExpression to perform the operation on.
 * @return {String} A human readable representation of the CodeExpression object.
*/
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

/**
 * Creates a Result object of the given parameters.
 *
 * @private
 * @constructor
 * @this Result
 * @param data The uncasted result.
 * @param {String} type The type of the result.
 * @param {String} original The original expression.
 * @param {number} numeric The numeric value of the result.
*/
	function Result(data, type, original, numeric){
		var self = this;
		if (!(self instanceof Result)){
			return new Result(data, type, original, numeric);
		}
		self.data	= data;
		self.type	= type;
		self.original	= original;
		self.value	= numeric;
/**
 * Returns the uncasted data attached to the Result.
*/
		self.toString	= function(){
			return self.data;
		};
	}

/**
 * Calculates a CodeExpression and returns the Result of it, in the selected base.
 *
 * @param {CodeExpression} mexpr The CodeExpression to calculate.
 * @param {number} mode The base in which to return the answer.
 * @return {Result} The Result object of the expression.
*/
	function calculate(mexpr, mode){
		try{
			var	expr	= createExpr(mexpr),
				ans, result, num;
			mode === undefined && (mode = 10);
			num = expr(globalBindings);
			if (num[0] === '$'){
				return Result(num.substr(1), 'help');
			}
			result = num;
			num = Number(num);
			isNaN(num) && (num = 0);
			answers.unshift(num);
			if (!isNaN(result)){
				result = Number(result).toString(mode);
				result = modePrefixes[mode] !== undefined ? modePrefixes[mode] + result : 'base(' + result + ', ' + mode + ')';
			}
			return Result(result, 'result', writeDown(mexpr), num);
		} catch(e){
			return Result(e, 'error');
		}
	}

/**
 * Pre-parses a string and calculates the CodeExpression representation of it.
 *
 * @param {String} c The expression to perform the operation on.
 * @param {number} m The base in which to return the answer.
 * @return {Result} The result object of the expression.
*/
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
		return calculate( new CodeExpression(c, 'Calculatoure'), m );
	}

	assignGlobals();
	generateHelps();

	global.calculatoure		= 
	calculatoure.calculate		= calculatoure;
	calculatoure.help		= helpData;
	calculatoure.version		= version;
	calculatoure.autoComplete	= autoComplete;
	calculatoure.addFunction	= addFunction;
/**
 * The global scope object of Calculatoure.
*/
	calculatoure.global		= globalBindings;

}(CodeExpression, this));
