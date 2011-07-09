var	version		= 0.9992,
	_unitTests	= makejs.flags.indexOf('--unit-tests') !== -1;

function webapp(){
	shell('cd webapp; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function extensions(){
	shell('cd extension; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function api(){
	if (_unitTests){
		shell('cd api; makejs test -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
	} else {
		shell('cd api; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
	}
}

function cli(){
	shell('cd cli; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function all(){
	api();
	webapp();
	extensions();
	cli();
}
