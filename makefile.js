Array.prototype.isIn = function(needle)
{
	for (var i=0, l=this.length; i<l; i++)
		if (this[i] === needle)
			return true;
	return false;
}

Array.prototype.remove = function(needle){
	for (var i=0; i<this.length; i++){
		if (this[i] === needle){
			this.splice(i--, 1);
		}
	}
}

var version = 0.996,
globalFlags = ["compress", "gzip"],
flagsTampered = false;
echo ("Building CALCULATOURE (v. " + version + ")");
shell("mkdir out/common out/mobile out/webkit temp -p");

import("conditional.js");

function all()
{
	flagsTampered = false;
	common();
	webkit();
//	mobile();
}

function common()
{
	flagsTampered = false;
	echo("Making common version...\n");
	var flags = ['common'].concat(globalFlags);
	echo("Using flags " + flags);
	compile(flags);
	compress("common");
	makeHTML("common");
	copyImages("common");
}

function webkit()
{
	flagsTampered = false;
	echo("Making webkit version...\n");
	shell("rm out/webkit/* -f");
	var flags = ['webkit'].concat(globalFlags),
	manifest = open("misc/manifest.json");
	echo("Using flags " + flags);
	manifest = Conditional.parseJS(manifest, flags)();
	save("out/webkit/manifest.json", manifest);
	compile(flags);
	compress("webkit", []);
	makeHTML("webkit");
	copyImages("webkit");
	shell("cp img/calculatoure.png out/webkit/icon_128.png; cp img/favicon.png out/webkit/icon_16.png");
	shell("cd out/webkit/; zip calculatoure *");
}

function mobile()
{
	flagsTampered = false
	echo("Making mobile version...\n");
	var flags = ['mobile'].concat(globalFlags);
	echo("Using flags " + flags);
	compile(flags);
	compress("mobile");
	makeHTML("mobile");
	copyImages("mobile");
}

function clean()
{
	flagsTampered = false;
	echo ("Cleaning up...");
	shell("rm temp/* -f");
	shell("rm out/common/* -f");
	shell("rm out/webkit/* -f");
	shell("rm out/mobile/* -f");
	shell("cd deps/codeexpression-js/;makejs clean");
}

function compile(flags)
{
	echo ("Compiling...");
	shell("cd deps/codeexpression-js/;makejs");
	var data = open("deps/codeexpression-js/CodeExpression.min.js") +
		Conditional.parseJS(open("js/calculatoure.api.js"), flags)();
	if (flags.isIn("unitTests")){
		data += open("js/unit-tests.js");
	}
	save("temp/calculatoure.api.js", data);
	data = open("js/jin.js") +
		Conditional.parseJS(open("js/calculatoure.ui.js"), flags)();
	save("temp/calculatoure.ui.js", data);
	data = Conditional.parseJS(open("css/calculatoure.css"), flags)();
	save("temp/calculatoure.css", data);
}

function compress(directory, flags)
{
	flags = flags || globalFlags;
	echo ("Compressing...");
	shell("yui-compressor temp/calculatoure.api.js -o out/" + directory + "/calculatoure.api.js");
	shell("yui-compressor temp/calculatoure.ui.js -o out/" + directory + "/calculatoure.ui.js");
	shell("yui-compressor temp/calculatoure.css -o out/" + directory + "/calculatoure.css");
	//shell("cp misc/manifest.php out/" + directory + "/");
	if (flags.isIn("gzip"))
	{
		shell("cd out/" + directory + "; gzip calculatoure.api.js -c -f > calculatoure.api.jgz");
		shell("cd out/" + directory + "; gzip calculatoure.ui.js -c -f > calculatoure.ui.jgz");
		shell("cp misc/htaccess_for_jgz out/" + directory + "/.htaccess");
	}
}

function makeHTML(directory)
{
	shell("cd html/ && ls && makejs " + (globalFlags.isIn("gzip") ? "gzip " : "") + "all");
	shell("cp temp/index.html out/" + directory);
}

function copyImages(directory)
{
	shell("cp img/favicon.png out/" + directory);
	shell("cp img/dark.png out/" + directory);
	shell("cp img/light.png out/" + directory);
}

function debug()
{
	flagsTampered = true;
	globalFlags.push('debug');
}

function noGzip()
{
	flagsTampered = true;
	globalFlags.remove('gzip');
}

function unitTests()
{
	flagsTampered = true;
	globalFlags.push('unitTests');
}

function noCompress()
{
	flagsTampered = true;
	globalFlags.remove('compress');
}

function onfinish()
{
	if (flagsTampered){
		all();
	}
	echo("Done!");
}
