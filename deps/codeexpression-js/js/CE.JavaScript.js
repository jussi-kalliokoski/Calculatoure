(function(){
	var
		identifierBeginsWith		= /[a-zA-Z_\$]/,
		identifierContinuesWith		= /[a-zA-Z0-9_\$]/,
		crazyRegExpMatch		= /\/(\\[^\x00-\x1f]|\[(\\[^\x00-\x1f]|[^\x00-\x1f\\\/])*\]|[^\x00-\x1f\\\/\[])+\/[gim]*/, //GEEZ, this is horrifying, but can't think of a better way to do this.
		reservedWords			= ['boolean', 'break', 'byte', 'case', 'catch', 'char', 'continue', 'default', 'delete', 'do', 'double', 'else', 'false', 'final', 'finally', 'float', 'for', 'function', 'if', 'in', 'instanceof', 'int', 'long', 'new', 'null', 'return', 'short', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with'],
		keyWords			= ['abstract', 'debugger', 'enum', 'goto', 'implements', 'native', 'protected', 'synchronized', 'throws', 'transient', 'volatile'],
		futureWords			= ['as', 'class', 'export', 'extends', 'import', 'interface', 'is', 'namespace', 'package', 'private', 'public', 'static', 'super', 'use'];

		devourToken	= CodeExpression.devourToken,
		JS 		= CodeExpression.createLanguage('JavaScript');

	function isIn(needle, haystack)
	{
		for (var i=0, l=haystack.length; i<l; i++)
			if (haystack[i] === needle)
				return true;
		return false;
	}

	JS.addRule('Comment', function(left, str){
		if (left.substr(0, 2) !== '/*')
			return;
		var token = '/*',
		temp = left.substr(2);
		while (temp.length && temp.substr(0, 2) !== '*/')
		{
			token += temp[0];
			temp = temp.substr(1);
		}
		token += '*/';
		if (token.length > left.length)
			throw('Error: unterminated comment');
		return token;
	});

	JS.addRule('Comment', function(left, str){
		if (left.substr(0, 2) === '//')
			return devourToken(left, /[^\n]/);
	});

	JS.addRule('RegExp', function(left, str){
		if (left.search(crazyRegExpMatch) === 0)
			return left.match(crazyRegExpMatch)[0];
		/*if (left[0] !== '/') // Well I don't think this, the old way, is much better, especially considering it malfunctions.
			return;
		var token = left[0],
		nextChar = '\\',
		temp = left.substr(token.length),
		searchQuery = /[^\/\\]/;
		while(nextChar === '\\')
		{
			if (temp[0] === '\\')
			{
				token += '\\'+temp[1];
				temp = temp.substr(2);
			}
			token += devourToken(temp, searchQuery);
			temp = left.substr(token.length);
			nextChar = temp[0];
		}
		if (left.length === token.length || token.length == 1)
			return; // Comment, not a RegExp, or unterminated RegExp.
		token += left[token.length];
		token += devourToken(left.substr(token.length), /[gim]/);
		return token;*/
	});

	JS.addRule('String', function(left, str){
		if (left.search(/["']/) !== 0)
			return;
		var token = left[0],
		nextChar = '\\',
		temp = left.substr(token.length),
		searchQuery = (token === '"') ? /[^"\\]/ : /[^'\\]/;
		while(nextChar === '\\')
		{
			if (temp[0] === '\\')
			{
				token += '\\'+temp[1];
				temp = temp.substr(2);
			}
			token += devourToken(temp, searchQuery);
			temp = left.substr(token.length);
			nextChar = temp[0];
		}
		if (left.length === token.length)
			throw('Error: unterminated string');
		token += left[token.length];
		return token;
	});

	JS.addRule('Identifier', function(left, str){
		if (left.search(identifierBeginsWith) !== 0)
			return;
		var tok = devourToken(left, identifierContinuesWith), r = {content: tok};
		if (isIn(tok, reservedWords))
			r.type = 'ReservedWord';
		else if (isIn(tok, keyWords))
			r.type = 'KeyWord';
		else if (isIn(tok, futureWords))
			r.type = 'FutureWord';
		else
			return tok;
		return r;
	});

	JS.addRule('Hexadecimal', function(left, str){
		if (left.search(/0[xX][0-9A-Fa-f]/) === 0)
			return '0x' + devourToken(left.substr(2), /[0-9A-Fa-f]/);
	});

	JS.addRule('Octal', function(left, str){
		if (left.search(/0[0-7]/) === 0)
			return '0' + devourToken(left.substr(1), /[0-7]/);
	});

	JS.addRule('Number', function(left, str){
		if (left.search(/[0-9]/) === 0)
		{
			var tok = devourToken(left, /[0-9]/),
			moreLeft = left.substr(tok.length);
			
			if (tok.search(/\./) === 0)
				tok += '.'+devourToken(moreLeft.substr(1), /[0-9]/);
			return tok;
		}
	});

	JS.addRule('Whitespace', function(left, str){
		if (left.search(/[\n\t\r ]/) === 0)
			return devourToken(left, /[\n\t\r ]/);
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/[!=]/) === 0)
			return devourToken(left, /[!=]/, 1) + devourToken(left.substr(1), /=/, 2);
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/&/) === 0)
			return devourToken(left, /&/, 2);
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/[|]/) === 0)
			return devourToken(left, /[|]/, 2);
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/[+\-*\/%]/) !== 0)
			return;
		var token = devourToken(left, /[+\-*\/]/, 1) + ((left.search(/[+\-]/) === 0) ? devourToken(left.substr(1), /[+\-=]/, 1) : devourToken(left.substr(1), /[=]/, 1));
		if (token === '+-' || token === '-+')
			return token[0];
		return token;
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/[?()\[\]{}\.,:;~\^]/) === 0)
			return left[0];
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/[<>]=/) === 0)
			return devourToken(left, /[<>]/, 1) + '=';
		
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(/>/) === 0)
			return devourToken(left, />/, 3);
		if (left.search(/</) === 0)
			return devourToken(left, /</, 2);
	});
})();
