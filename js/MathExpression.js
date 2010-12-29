(function(window, definer){
	MathExpression.name = definer;
	window[definer] = MathExpression;
	MathExpression.identifierBeginsWith = /[a-zA-Z_\$]/;
	MathExpression.identifierContinuesWith = /[a-zA-Z0-9_\$]/;
	MathExpression.numberBeginsWith = /[0-9]/;
	MathExpression.numberContinuesWith = /[0-9\.xXA-Fa-f]/;
	MathExpression.checks = [
		function(left, str) // RegExp
		{
			if (left[0] !== '/')
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
			return token;
		},
		function(left, str) // Comment
		{
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
		},
		function(left, str) // Comment
		{
			if (left.substr(0, 2) === '//')
				return devourToken(left, /[^\n]/);
		},
		function(left, str) // String
		{
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
		},
		function(left, str) // Identifier
		{
			if (left.search(MathExpression.identifierBeginsWith) === 0)
				return devourToken(left, MathExpression.identifierContinuesWith);
		},
		function(left, str) // Number
		{
			if (left.search(MathExpression.numberBeginsWith) === 0)
				return devourToken(left, MathExpression.numberContinuesWith);
		},
		function(left, str) // Whitespace
		{
			if (left.search(/[\n\t\r ]/) === 0)
				return devourToken(left, /[\n\t\r ]/);
		},
		function(left, str) // Operator
		{
			if (left.search(/[<>=]/) === 0)
				return devourToken(left, /[<>=]/, 1) + devourToken(left.substr(1), /[<>=]/, 1);
		},
		function(left, str) // Operator
		{
			if (left.search(/[!=]/) === 0)
				return devourToken(left, /[!=]/, 1) + devourToken(left.substr(1), /=/, 2);
		},
		function(left, str) // Operator
		{
			if (left.search(/&/) === 0)
				return devourToken(left, /&/, 2);
		},
		function(left, str) // Operator
		{
			if (left.search(/[|]/) === 0)
				return devourToken(left, /[|]/, 2);
		},
		function(left, str) // Operator
		{
			if (left.search(/[+\-*\/]/) !== 0)
				return;
			var token = devourToken(left, /[+\-*\/]/, 1) + ((left.search(/[+\-]/) === 0) ? devourToken(left.substr(1), /[+\-=]/, 1) : devourToken(left.substr(1), /[=]/, 1));
			if (token === '+-' || token === '-+')
				return token[0];
			return token;
		},
		function(left, str) // Operator
		{
			if (left.search(/[?()\[\]{}%\.,:;~\^<>]/) === 0)
				return left[0];
		}
	];
	for (var i=0, n=['RegExp', 'Comment', 'Comment', 'String', 'Identifier', 'Number', 'Whitespace', 'Operator', 'Operator', 'Operator', 'Operator', 'Operator', 'Operator']; i<n.length; i++)
		MathExpression.checks[i].type = n[i];


	function tokenizeMath(str)
	{
		var left = str, tokens = [], tokentypes = [], token, tokentype, stuck = 0, i;
		while(left.length)
		{
			if (stuck++ > str.length) throw('Error in tokenizing string '+left);
			token = '';
			for (i=0; i<MathExpression.checks.length && !token; i++)
			{
				token = MathExpression.checks[i](left, str);
				tokentype = MathExpression.checks[i].type;
			}
			if (!token)
			{
				token = 'ILLEGAL';
				tokentype = 'ILLEGAL';
			}
			left = left.substr(token.length);
			tokens.push(token);
			tokentypes.push(tokentype);
		}
		return new MathExpression(tokens, tokentypes);
	}

	function devourToken(string, reg, length)
	{
		var str = string, ret = '', i=0;
		while (str.search(reg) === 0 && (!length || i++ < length))
		{
			ret += str[0];
			str = str.substr(1);
		}
		return ret;
	}

	function MathExpression(arg1, arg2)
	{
		if (this.constructor !== MathExpression)
			return new MathExpression(arg1, arg2);
		if (typeof arg1 === 'string')
			return tokenizeMath(arg1);
		else if (arg1.constructor !== Array || arg2.constructor !== Array || arg1.length != arg2.length)
			throw 'Invalid arguments';
		var i, length = arg1.length;
		for (i=0; i<length; i++)
			this[i] = {content: arg1[i], type: arg2[i], level: 0};
		this.__defineGetter__('length', function(){ return length; });
		this.toString = function()
		{
			for (var i=0, s=[]; i<length; i++)
				s.push(this[i].content+' ('+this[i].type+')');
			return s.toString();
		};
	}
})(window, 'MathExpression');
