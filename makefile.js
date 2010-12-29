var version = 0.991,
globalFlags = [];

import("js/conditional.js");

function all()
{
	common();
	webkit();
	mobile();
}

function common()
{
	var flags = ['common'].concat(globalFlags);
	compile(flags);
	compress("common");
	shell("cp img/* common/");
	shell("cp html/index.html common/");
}

function webkit()
{
	var flags = ['webkit'].concat(globalFlags);
	compile(flags);
	compress("webkit");
	shell("cp img/* webkit/");
	shell("cp html/index.html webkit/");
}

function mobile()
{
	var flags = ['mobile'].concat(globalFlags);
	compile(flags);
	compress("mobile");
	shell("cp img/* mobile/");
	shell("cp html/index.html mobile/");
}

function clean()
{
	shell("rm temp/* -f");
	shell("rm common/* -f");
	shell("rm webkit/* -f");
	shell("rm mobile/* -f");
}

function compile(flags)
{
	var data = open("js/jin.js") + open("js/MathExpression.js") + ConditionalJS.parse(open("js/calculatoure.js"), flags)();
	save("temp/calculatoure.js", data);
	data = ConditionalJS.parse(open("css/calculatoure.css"), flags)();
	save("temp/calculatoure.css", data);
}

function compress(directory)
{	
	shell("yui-compressor temp/calculatoure.js -o " + directory + "/calculatoure.js");
	shell("yui-compressor temp/calculatoure.css -o " + directory + "/calculatoure.css");
}

function debug()
{
	globalFlags.push('debug');
}
