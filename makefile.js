var version = 0.991,
globalFlags = [];
echo ("Building CALCULATOURE (v. " + version + ")");

import("js/conditional.js");

function all()
{
	common();
	webkit();
	mobile();
}

function common()
{
	echo("Making common version...\n");
	var flags = ['common'].concat(globalFlags);
	compile(flags);
	compress("common");
	shell("cp img/* common/");
	makeHTML("common");
}

function webkit()
{
	echo("Making webkit version...\n");
	var flags = ['webkit'].concat(globalFlags);
	compile(flags);
	compress("webkit");
	shell("cp img/* webkit/");
	makeHTML("webkit");
}

function mobile()
{
	echo("Making mobile version...\n");
	var flags = ['mobile'].concat(globalFlags);
	compile(flags);
	compress("mobile");
	shell("cp img/* mobile/");
	makeHTML("mobile");
}

function clean()
{
	echo ("Cleaning up...");
	shell("rm temp/* -f");
	shell("rm common/* -f");
	shell("rm webkit/* -f");
	shell("rm mobile/* -f");
	shell("cd deps/codeexpression-js/;makejs clean");
}

function compile(flags)
{
	echo ("Compiling...");
	shell("cd deps/codeexpression-js/;makejs");
	var data = open("js/jin.js") +
		open("deps/codeexpression-js/CodeExpression.min.js") +
		ConditionalJS.parse(open("js/calculatoure.js"), flags)();
	save("temp/calculatoure.js", data);
	data = ConditionalJS.parse(open("css/calculatoure.css"), flags)();
	save("temp/calculatoure.css", data);
}

function compress(directory)
{
	echo ("Compressing...");
	shell("yui-compressor temp/calculatoure.js -o " + directory + "/calculatoure.js");
	shell("yui-compressor temp/calculatoure.css -o " + directory + "/calculatoure.css");
}

function makeHTML(directory)
{
	shell("cd html/;makejs");
	shell("cp temp/index.html " + directory);
}

function debug()
{
	globalFlags.push('debug');
}
