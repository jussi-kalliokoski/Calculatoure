var version = 0.998;

function webapp(){
	shell('cd webapp; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function extensions(){
	shell('cd extension; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function api(){
	shell('cd api; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}
function bash(){
	shell('cd bash; makejs -v ' + version + ' --passed-flags ' + makejs.rawFlags.join(' '));
}

function all(){
	api();
	webapp();
	extensions();
	bash();
}
