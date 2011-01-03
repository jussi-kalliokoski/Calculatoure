var CodeExpression = (function(){
	CodeExpression.name = 'CodeExpression';

	function tokenizeMath(str, checks)
	{
		var left = str, tokens = [], token, tokentype, stuck = 0, i;
		while(left.length)
		{
			if (stuck++ > str.length) throw('Error in tokenizing string at '+getLineAndCol(str.length - left.length, str));
			token = '';
			for (i=0; i<checks.length && !token; i++)
			{
				token = checks[i](left, str);
				if (token && token.type)
				{
					tokentype = token.type;
					token = token.content;
				}
				else
					tokentype = checks[i].type;
				
			}
			if (!token)
			{
				token = 'ILLEGAL';
				tokentype = 'ILLEGAL';
			}
			left = left.substr(token.length);
			tokens.push(new Token(token, tokentype));
		}
		return new CodeExpression(tokens, checks.name);
	}

	function Token(content, type)
	{
		this.content = content;
		this.type = type;
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

	function CodeExpression(arg1, arg2)
	{
		if (this.constructor !== CodeExpression)
			return new CodeExpression(arg1, arg2);
		if (typeof arg1 === 'string' && typeof arg2 === 'string')
			return tokenizeMath(arg1, CodeExpression.languages[arg2]);
		else if (arg1.constructor !== Array)
			throw 'Invalid arguments';
		this.type = arg2;
		var i, length = arg1.length;
		for (i=0; i<length; i++)
			this[i] = arg1[i];
		this.__defineGetter__('length', function(){ return length; });
		this.toString = function()
		{
			for (var i=0, s=[]; i<length; i++)
				s.push(this[i].content+' ('+this[i].type+')');
			return s.toString();
		};
	}

	function getLineAndCol(pos, str)
	{
		var newp = p = line = col = 0;
		do
		{
			newp = str.indexOf('\n');
			if (newp >= pos)
			{
				col = pos - p;
				break;
			}
			p = newp;
			line++;
		} while (p < pos);
		p = {line: line, col: col,
		toString: function(){
			return 'line ' + this.line + ', col ' + this.col;
		}};
		return p;
	}

	function Language(name)
	{
		var l = new Array();
		l.addRule = function(type, rule){
			rule.type = type;
			this.push(rule);
		};
		l.name = name;
		return l;
	}

	CodeExpression.languages = {};
	CodeExpression.devourToken = devourToken;
	CodeExpression.createLanguage = function(name){return CodeExpression.languages[name] = Language(name);};

	return CodeExpression;
})();
