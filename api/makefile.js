var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1;

import('conditional.js');

console.log('Making Calculatoure API...');

function all(){
	console.log('Checking if CodeExpression.js is up to date...');
	shell('cd deps/CodeExpression.js/; if [ -s CodeExpression.full.js ]; then echo "Up to date, moving on..."; else echo "Not up to date, making..."; makejs --just JavaScript; fi');
	var data	= open('deps/CodeExpression.js/CodeExpression.full.js') +
			Conditional.parseJS(open('js/calculatoure.api.js'), [])();
	save('calculatoure.api.js', data);
	shell('yui-compressor calculatoure.api.js -o calculatoure.api.min.js');
}

function test(){
	shell('node unit-tests/unit-test.js');
}

function onfinish(){
	console.log('Done!');
}
