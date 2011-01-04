Array.prototype.isIn = function(needle)
{
	for (var i=0, l=this.length; i<l; i++)
		if (this[i] === needle)
			return true;
	return false;
}

var version = 0.991,
globalFlags = ["compress", "gzip"];
echo ("Building CALCULATOURE (v. " + version + ")");

import("conditional.js");

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
	makeHTML("common");
	copyImages("common");
}

function webkit()
{
	echo("Making webkit version...\n");
	var flags = ['webkit'].concat(globalFlags);
	compile(flags);
	compress("webkit");
	makeHTML("webkit");
	copyImages("webkit");
}

function mobile()
{
	echo("Making mobile version...\n");
	var flags = ['mobile'].concat(globalFlags);
	compile(flags);
	compress("mobile");
	makeHTML("mobile");
	copyImages("mobile");
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
		Conditional.parseJS(open("js/calculatoure.js"), flags)();
	save("temp/calculatoure.js", data);
	data = Conditional.parseJS(open("css/calculatoure.css"), flags)();
	save("temp/calculatoure.css", data);
}

function compress(directory)
{
	if (!globalFlags.isIn("gzip"))
		return;
	echo ("Compressing...");
	shell("yui-compressor temp/calculatoure.js -o " + directory + "/calculatoure.js");
	shell("yui-compressor temp/calculatoure.css -o " + directory + "/calculatoure.css");
	shell("cp misc/manifest.php " + directory + "/");
	if (globalFlags.isIn("gzip"))
	{
		shell("cd " + directory + "; gzip calculatoure.js -c -f > calculatoure.jgz");
		shell("cp misc/htaccess_for_jgz " + directory + "/.htaccess");
	}
}

function makeHTML(directory)
{
	shell("cd html/ && ls && makejs " + (globalFlags.isIn("gzip") ? "gzip " : "") + "all");
	shell("cp temp/index.html " + directory);
}

function copyImages(directory)
{
	shell("cp img/favicon.png " + directory);
	shell("cp img/dark.png " + directory);
	shell("cp img/light.png " + directory);
}

function debug()
{
	globalFlags.push('debug');
}

function onfinish()
{
	echo("Done!");
}
