var version = 0.998;

function webapp(){
	shell('cd webapp; makejs -v ' + version + ' ' + makejs.rawFlags.join(' '));
}

function extensions(){
	shell('cd extension; makejs -v ' + version + ' ' + makejs.rawFlags.join(' '));
}

function api(){
	shell('cd api; makejs -v ' + version + ' ' + makejs.rawFlags.join(' '));
}

function all(){
	api();
	webapp();
	extensions();
}
