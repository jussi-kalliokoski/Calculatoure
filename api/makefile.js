var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1,
	_force		= makejs.flags.indexOf('-f') !== -1 || makejs.flags.indexOf('--force') !== -1;
	_shims		= makejs.flags.indexOf('--use-shims') !== -1 && makejs.flags.indexOf('--no-shims') === -1;

import('conditional.js');
import('build.js');

function all(){
	console.log('Making Calculatoure API...');
	shell('cd deps/CodeExpression.js/; makejs --just Calculatoure');
	
	var	sameFlags	= false,
		data		= '';

	try{
		sameFlags = open('.makejs.config') == makejs.rawFlags.join(' ');
	} catch(e){}

	if (sameFlags){
		if (!_force && all.isUpToDate()){
			console.log('Already up to date!');
			return;
		}
	} else {
		save('.makejs.config', makejs.rawFlags.join(' '));
	}

	if (_shims){
		data = open('js/shims.js');
	}

	data	+= open('deps/CodeExpression.js/CodeExpression.full.js') +
		Conditional.parseJS(open('js/calculatoure.api.js'), [])();
	save('calculatoure.api.js', data);
	shell('yui-compressor calculatoure.api.js -o calculatoure.api.min.js');
	console.log('Done!');
}

function commonjs(){
	console.log('Installing commonjs extension...');
	shell('mkdir ~/.node_modules/calculatoure/ -p');
	shell('cp calculatoure.api.js ~/.node_modules/calculatoure/index.js');
}

function test(){
	shell('node unit-tests/unit-test.js');
}

function clean(){
	shell('rm calculatoure.api.js calculatoure.api.min.js .makejs.config -f');
}

Build.createBuild(all, ['calculatoure.api.js'], ['deps/CodeExpression.js/CodeExpression.full.js', 'js']);
Build.createBuild(commonjs, [], [all]);
Build.createBuild(test, [], [commonjs]);
