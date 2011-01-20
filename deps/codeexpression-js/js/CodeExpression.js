var CodeExpression = (function(){

	function Token(content, type, subtype){
		this.content = content;
		this.type = type;
		this.subtype = subtype;
		this.toString = function(){
			return this.content;
		};
	}

	function devourToken(string, reg, length){
		var	str	= string,
			ret	= '',
			i	= 0;
		while (str.search(reg) === 0 && (!length || i++ < length)){
			ret += str[0];
			str = str.substr(1);
		}
		return ret;
	}

	function getLineAndCol(pos, str){
		var	newp	= 0,
			p	= 0,
			line	= 0,
			col	= 0;
		do{
			newp = str.indexOf('\n');
			if (newp >= pos){
				col = pos - p;
				break;
			}
			p = newp;
			line++;
		} while (p < pos);
		p = {
			line: line,
			col: col,
			toString: function(){
				return 'line ' + this.line + ', col ' + this.col;
			}
		};
		return p;
	}

	function tokenizeMath(str, checks){
		var	left		= str,
			tokens		= [],
			token, tokentype, tokensub,
			stuck		= 0,
			i, n, cont;
		while(left.length){
			if (stuck++ > str.length){
				throw('Error in tokenizing string at ' + getLineAndCol(str.length - left.length, str) );
			}
			token = '';
			tokensub = undefined;
			cont = false;
			for (i=0; i<checks.length && !token; i++){
				token = checks[i](left, str);
				if (token && token.constructor === Array){ // What an ugly mess, it's vomiting multiple tokens at us. I guess it's XML. Pucker up and take it with a smile.
					for (n=0; n<token.length; n++){
						left = left.substr(token[n].content.length);
						tokens.push(new Token(token[n].content, token[n].type, token[n].subtype));
					}
					cont = true;
				} else if (token && token.type) {
					tokentype = token.type;
					tokensub = token.subtype;
					token = token.content;
				} else {
					tokentype = checks[i].type;
				}
				
			}
			if (!token){
				token = left[0];
				tokentype = 'ILLEGAL';
			}
			if (cont){
				continue;
			}
			left = left.substr(token.length);
			tokens.push(new Token(token, tokentype, tokensub));
		}
		return new CodeExpression(tokens, checks.name);
	}

	function CodeExpression(arg1, arg2){
		if (this.constructor !== CodeExpression){
			return new CodeExpression(arg1, arg2);
		}

		if (typeof arg1 === 'string' && typeof arg2 === 'string'){
			return tokenizeMath(arg1, CodeExpression.languages[arg2]);
		} else if (arg1.constructor !== Array){
			throw 'Invalid arguments';
		}

		this.type = arg2;
		var i, length = arg1.length;
		for (i=0; i<length; i++){
			this[i] = arg1[i];
		}

		Object.defineProperty(this, 'length', {
			get: function(){
				return length;
			}
		});

		this.toString = function(){
			var i, s = [];
			for (i=0; i<length; i++){
				s.push(this[i].content+' ('+this[i].type+')');
			}
			return s.toString();
		};
	}

	function Language(name){
		var l = [];
		l.addRule = function(type, rule){
			rule.type = type;
			this.push(rule);
		};
		l.name = name;
		return l;
	}

	CodeExpression.name = 'CodeExpression';
	CodeExpression.languages = {};
	CodeExpression.devourToken = devourToken;
	CodeExpression.createLanguage = function(name){
		return ( CodeExpression.languages[name] = Language(name) );
	};

	return CodeExpression;
}());
