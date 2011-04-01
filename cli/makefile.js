console.log('Making CLI...');

import('conditional.js');

var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1,
	_bindir		= makejs.argumentedFlags['--bindir'] || '/usr/bin/',
	_binname	= makejs.argumentedFlags['--binname'] || 'calculatoure';


function all(){
	console.log('Checking for API commonjs extension...');
	shell('cd ../api/; makejs commonjs --passFlags ' + makejs.rawFlags + ' --no-shims');
	console.log('Compiling...');
	var data = Conditional.parseJS(open('calculatoure-cli'), [])();
	shell('mkdir bin/ -p');
	save('bin/' + _binname, data);
	shell('chmod ugo+x bin/' + _binname);
}

function install(){
	shell('mv bin/' + _binname + ' ' + _bindir);
}

function clean(){
	shell('rm bin/ -p');
}

function uninstall(){
	shell('rm ' + _bindir + _binname);
}
