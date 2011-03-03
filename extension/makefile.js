console.log('Making extensions...');

import('conditional.js');

var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1;

function chrome(){
	console.log('Making chrome extension...');
	shell('mkdir out/chrome -p');
	shell('cp html/popup.html out/chrome/');
	shell('cp ../img/favicon.png out/chrome/icon.png');
	shell('cp ../img/dark.png out/chrome/');
	shell('cp ../img/light.png out/chrome/');
	var data	= Conditional.parseJS(open('misc/manifest.json'), [])();
	save('out/chrome/manifest.json', data);
	shell('cd ../api/; if [ -s calculatoure.api.js ]; then echo "Up to date, moving on..."; else echo "Not up to date, making..."; makejs -v ' + version + '; fi');
	shell('cp ../api/calculatoure.api.js out/chrome/');
}

function all(){
	chrome();
}
