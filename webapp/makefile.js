function _isIn(needle, haystack)
{
	var i, l = haystack.length;
	for (i=0; i<l; i++){
		if (haystack[i] === needle){
			return true;
		}
	}
	return false;
}

function _remove(needle, haystack){
	var i;
	for (i=0; i<haystack.length; i++){
		if (haystack[i] === needle){
			haystack.splice(i--, 1);
		}
	}
	return haystack;
}

import('conditional.js');

var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1,
	_globalFlags	= [];

if (!_isIn('--no-compress', makejs.flags)){
	_globalFlags.push('compress');
	if (!_isIn('--no-gzip', makejs.flags)){
		_globalFlags.push('gzip');
	}
}
if (_isIn('--use-shims', makejs.flags)){
	_globalFlags.push('shims');
}

console.log('Making webapp v. ' + version + ' with flags ' + _globalFlags.join(', '));

function _compile(flags){
	console.log('Compiling...');
	if (_isIn('shims', flags)){
		shell('cd ../api/; makejs -v ' + version + ' --use-shims');
	} else {
		shell('cd ../api/; makejs -v ' + version);
	}
	shell('cp ../api/calculatoure.api.js temp/');
	console.log('Making UI...');
	var data	= open('../deps/jin.js/js/jin.js') + 
			Conditional.parseJS(open('js/calculatoure.ui.js'), flags)();
	save('temp/calculatoure.ui.js', data);
	data		= Conditional.parseJS(open('css/calculatoure.css'), flags)();
	save('temp/calculatoure.css', data);
}

function _compress(name, flags){
	flags = flags || _globalFlags;
	if (_isIn('compress', flags)){
		console.log('Compressing...');
		shell('yui-compressor temp/calculatoure.api.js -o out/' + name + '/calculatoure.api.js');
		shell('yui-compressor temp/calculatoure.ui.js -o out/' + name + '/calculatoure.ui.js');
		shell('yui-compressor temp/calculatoure.css -o out/' + name + '/calculatoure.css');
		if (_isIn('gzip', flags)){
			shell('cd out/' + name + '/; gzip calculatoure.api.js -c -f > calculatoure.api.jgz');
			shell('cd out/' + name + '/; gzip calculatoure.ui.js -c -f > calculatoure.ui.jgz');
			shell('cd out/' + name + '/; gzip calculatoure.css -c -f > calculatoure.cgz');
			shell('cp misc/webapp-htaccess out/' + name + '/.htaccess');
		}
	} else {
		shell('cp temp/* out/' + name + '/');
	}
}

function _makeHTML(name, flags){
	flags = flags || _globalFlags;
	shell('cd html/; makejs ' + name + ' -v ' + version);
	shell('cp temp/index.html out/' + name + '/');
}

function _copyImages(name, flags){
	flags = flags || _globalFlags;
	console.log('Copying images...');
	shell('cp ../img/favicon.png out/' + name);
	shell('cp ../img/dark.png out/' + name);
	shell('cp ../img/light.png out/' + name);
	if (name !== 'webkit'){
		shell('cp ../img/gradient.png out/' + name);
	}
}

function _start(name, flags){
	flags = flags || _globalFlags;
	console.log('Making ' + name + ' version...');
	var	flags		= [name].concat(_globalFlags);
	console.log('Using flags ' + flags.join(', '));
	shell('mkdir out/' + name + '/ temp -p');
	shell('rm out/' + name + '/* -f');
	_compile(flags);
	_compress(name, flags);
	_makeHTML(name, flags);
	_copyImages(name, flags);
	return flags;
}

function common(){
	var	flags		= _start('common');
}

function webkit(){
	var	flags		= [].concat(_globalFlags),
		manifest;

	_remove('compress', flags);
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
	shell('rm out temp -fr');
}

function onfinish(){
	console.log('Done!');
}
