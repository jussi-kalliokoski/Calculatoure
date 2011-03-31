console.log('Making bash executable...');

import('conditional.js');

var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1,
	_bindir		= makejs.argumentedFlags['--bindir'] || '/usr/bin/',
	_binname	= makejs.argumentedFlags['--binname'] || 'calculatoure';


function all(){
	console.log('Checking for API commonjs extension...');
	shell('cd ../api/; makejs commonjs --passFlags ' + makejs.rawFlags + ' --no-shims');
	console.log('Compiling...');
	var data = Conditional.parseJS(open('calculatoure-cli'), [])();
	save(_bindir + _binname, data);
	shell('chmod ugo+x ' + _bindir + _binname);
}
