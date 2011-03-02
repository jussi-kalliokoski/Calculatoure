function isIn(needle, haystack)
{
	var i, l = haystack.length;
	for (i=0; i<l; i++){
		if (haystack[i] === needle){
			return true;
		}
	}
	return false;
}

function remove(needle, haystack){
	var i;
	for (i=0; i<haystack.length; i++){
		if (haystack[i] === needle){
			haystack.splice(i--, 1);
		}
	}
}

import('conditional.js');

var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1,
	globalFlags	= [];

if (!isIn('--no-compress', makejs.flags)){
	globalFlags.push('compress');
	if (!isIn('--no-gzip', makejs.flags)){
		globalFlags.push('gzip');
	}
}

console.log('Making webapp v. ' + version + ' with flags ' + globalFlags.join(', '));

function _compile(flags){
	console.log('Compiling...');
	console.log('Checking if API is up to date...');
	shell('mkdir temp');
	shell('cd ../api/; if [ -s calculatoure.api.js ]; then echo "Up to date, moving on..."; else echo "Not up to date, making..."; makejs -v ' + version + '; fi');
	shell('cp ../api/calculatoure.api.js temp/');
	console.log('Making UI...');
	var data	= open('../deps/jin.js/js/jin.js') + 
			Conditional.parseJS(open('js/calculatoure.ui.js')(), flags);
	save('temp/calculatoure.ui.js', data);
	data		= Conditional.parseJS(open('js/calculatoure.css')(), flags);
	save('temp/calculatoure.css', data);
}

function _compress(name, flags){
	flags = flags || globalFlags;
	if (isIn('compress', flags){
		console.log('Compressing...');
		shell('yui-compressor temp/calculatoure.api.js -o out/' + name + '/calculatoure.api.js');
		shell('yui-compressor temp/calculatoure.ui.js -o out/' + name + '/calculatoure.ui.js');
		shell('yui-compressor temp/calculatoure.css -o out/' + name + '/calculatoure.css');
		if (isIn('gzip', flags)){
			shell('cd out/' + name + '/; gzip calculatoure.api.js -c -f > calculatoure.api.jgz');
			shell('cd out/' + name + '/; gzip calculatoure.ui.js -c -f > calculatoure.ui.jgz');
			shell('cd out/' + name + '/; gzip calculatoure.css -c -f > calculatoure.cgz');
			shell('cp misc/htaccess_for_jgz out/' + name + '/.htaccess');
		}
	} else {
		shell('cp temp/* out/' + name + '/');
	}
}

function _makeHTML(name, flags){
	flags = flags || globalFlags;
	shell('cd html/; makejs ' + name + ' -v ' + version);
	shell('cp temp/index.html out/ ' + name + '/');
}

function _copyImages(name, flags){
	flags = flags || globalFlags;
	shell('cp ../img/favicon.png out/' + name);
	shell('cp ../img/dark.png out/' + name);
	shell('cp ../img/light.png out/' + name);
}

function _start(name, flags){
	flags = flags || globalFlags;
	console.log('Making ' + name + ' version...');
	var	flags		= [name].concat(globalFlags);
	console.log('Using flags ' + flags.join(', '));
	shell('mkdir out/' + name + '/ -p');
	shell('rm out/' + name + '/* -f');
	_compile(flags);
	_compress(name, flags);
	_makeHTML(name, flags);
	_copyImages(name, flags);
	return flags;
}

function common(){
	var	flags		= _start('webkit');
}

function webkit(){
	var	flags		= [].concat(globalFlags),
		manifest;

	remove('compress', flags);
	flags = _start('webkit', flags);
		
	manifest		= open('misc/manifest.json');

	manifest		= Conditional.parseJS(manifest, flags)();
	save('out/webkit/manifest.json', manifest);
	shell('cp ../img/calculatoure.png out/webkit/icon_128.png; cp ../img/favicon.png out/webkit/icon_16.png');
	shell('cd out/webkit/; zip calculatoure *');
}

function mobile(){
	var	flags		= _start('mobile');
}

function all(){
	common();
	webkit();
	mobile();
}

function clean(){
	shell('rm out temp -f -p');
}

function onfinish(){
	console.log('Done!');
}
