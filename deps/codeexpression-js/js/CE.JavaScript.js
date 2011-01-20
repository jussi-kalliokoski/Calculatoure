(function(CodeExpression){
	var
		identifierBeginsWith		= /[a-zA-Z_\$]/,
		identifierContinuesWith		= /[a-zA-Z0-9_\$]/,
		operatorMatch			= /[{}\(\)\[\]\.;,<>+\-\*%&|\^!~\?:=\/]/,
		crazyRegExpMatch		= /\/(\\[^\x00-\x1f]|\[(\\[^\x00-\x1f]|[^\x00-\x1f\\\/])*\]|[^\x00-\x1f\\\/\[])+\/[gim]*/, //GEEZ, this is horrifying, but can't think of a better way to do this.
		reservedWords			= ['boolean', 'break', 'byte', 'case', 'catch', 'char', 'continue', 'default', 'delete', 'do', 'double', 'else', 'false', 'final', 'finally', 'float', 'for', 'function', 'if', 'in', 'instanceof', 'int', 'long', 'new', 'null', 'return', 'short', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with'],
		keyWords			= ['abstract', 'debugger', 'enum', 'goto', 'implements', 'native', 'protected', 'synchronized', 'throws', 'transient', 'volatile'],
		futureWords			= ['as', 'class', 'export', 'extends', 'import', 'interface', 'is', 'namespace', 'package', 'private', 'public', 'static', 'super', 'use'],
		constructorWords		= ['Function', 'Object', 'Number', 'Date', 'String', 'RegExp', 'Array', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'Int8Array', 'Int16Array', 'Uint16Array', 'Int32Array', 'Float32Array', 'Float64Array'],
		predefinedWords			= ['undefined', 'null', 'infinity', 'Math', 'JSON'],
		predefinedFunctions		= ['eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'],
		namedWords			= [reservedWords, keyWords, futureWords, constructorWords, predefinedWords, predefinedFunctions],
		namedWordNames			= ['ReservedWord', 'KeyWord', 'FutureWord', 'ConstructorWord', 'PredefinedWord', 'PredefinedFunctionWord'],
		
		operators			= [ '{}()[].;,<>+-*%&|^!~?:=/',
							['<=', '>=', '==', '!=', '++', '--', '<<', '>>', '&&', '||', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/='],
							['===', '!==', '>>>', '<<=', '>>='], ['>>>=']],

		devourToken			= CodeExpression.devourToken,
		JS				= CodeExpression.createLanguage('JavaScript');

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

	JS.addRule('Comment', function(left, str){
		if (left.substr(0, 2) !== '/*'){
			return;
		}
		var token = '/*',
		temp = left.substr(2);
		while (temp.length && temp.substr(0, 2) !== '*/'){
			token += temp[0];
			temp = temp.substr(1);
		}
		token += '*/';
		if (token.length > left.length){
			throw('Error: unterminated comment');
		}
		return token;
	});

	JS.addRule('Comment', function(left, str){
		if (left.substr(0, 2) === '//'){
			return devourToken(left, /[^\n]/);
		}
	});

	JS.addRule('RegExp', function(left, str){
		if (left.search(crazyRegExpMatch) === 0){
			return left.match(crazyRegExpMatch)[0];
		}
	});

	JS.addRule('String', function(left, str){
		if (left.search(/["']/) !== 0){
			return;
		}
		var token = left[0],
		nextChar = '\\',
		temp = left.substr(token.length),
		searchQuery = (token === '"') ? /[^"\\]/ : /[^'\\]/;
		while(nextChar === '\\'){
			if (temp[0] === '\\'){
				token += '\\'+temp[1];
				temp = temp.substr(2);
			}
			token += devourToken(temp, searchQuery);
			temp = left.substr(token.length);
			nextChar = temp[0];
		}
		if (left.length === token.length){
			throw('Error: unterminated string');
		}
		token += left[token.length];
		return token;
	});

	JS.addRule('Identifier', function(left, str){
		if (left.search(identifierBeginsWith) !== 0){
			return;
		}
		var	tok	= devourToken(left, identifierContinuesWith),
			i;
		for (i=0; i < namedWords.length; i++){
			if (isIn(tok, namedWords[i])){
				return {
					content: tok,
					type: 'Word',
					subtype: namedWordNames[i]
				};
			}
		}
		return tok;
	});

	JS.addRule('Hexadecimal', function(left, str){
		if (left.search(/0[xX][0-9A-Fa-f]/) === 0){
			return '0x' + devourToken(left.substr(2), /[0-9A-Fa-f]/);
		}
	});

	JS.addRule('Octal', function(left, str){
		if (left.search(/0[0-7]/) === 0){
			var token = devourToken(left, /[0-7]/);
			if(token.length === 1){
				return;
			}
			return token;
		}
	});

	JS.addRule('Number', function(left, str){
		if (left.search(/[0-9]/) === 0){
			var tok = devourToken(left, /[0-9]/),
			moreLeft = left.substr(tok.length);
			
			if (moreLeft.search(/\./) === 0){
				tok += '.'+devourToken(moreLeft.substr(1), /[0-9]/);
			}
			return tok;
		}
	});

	JS.addRule('Whitespace', function(left, str){
		if (left.search(/[\n\t\r ]/) === 0){
			return devourToken(left, /[\n\t\r ]/);
		}
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(operatorMatch) === 0){
			var	token	= devourToken(left, operatorMatch, 4),
				i;
			for (i = 3; i >= 0; i--){
				if (isIn(token, operators[i])){
					return token;
				}
				token = token.substr(0, i);
			}
		}
	});
}(CodeExpression));
