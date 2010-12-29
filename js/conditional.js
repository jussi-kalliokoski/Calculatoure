ConditionalJS =
{
parse:
	function (code, flags)
	{
		var pos = 0, target = 0, result = '', i, func;
		result = 'func=function(){var f={},result=\'\';'
		if (flags)
			for (i=0; i<flags.length; i++)
				result += 'f.'+flags[i]+'=true;';
		while (pos < code.length)
		{
			target = code.indexOf('/*# ', pos)
			if (target == -1)
			{
				result += ' result+=\'' + parse(code.substr(pos)) + '\';';
				break;
			}
			result += ' result+=\'' + parse(code.substr(pos, target-pos)) + '\';';
			pos = target + 4;
			target = code.indexOf('*/', pos);
			if (target < -1)
				throw "***ConditionalJS: Unclosed CONDITIONAL tag at "+pos+'';
			result += code.substr(pos, target - pos);
			pos = target+2;
		}
		result += ' return result}';
		try{
			eval(result);
		}catch(e){
			throw '***ConditionalJS: Syntax error (' + e + ');';
		}
		return func;

		function parse(str)
		{
			return str.split('\'').join('\\\'').split('\n').join('\\n');
		}
	}
};
