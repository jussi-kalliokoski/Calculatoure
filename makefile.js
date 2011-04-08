var version = 0.9991;

function webapp(){
	shell('cd webapp; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function extensions(){
	shell('cd extension; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function api(){
	shell('cd api; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
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
