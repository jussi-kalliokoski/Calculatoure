console.log('Making extensions...');

import('conditional.js');

var	version		= makejs.argumentedFlags['-v'] || makejs.argumentedFlags['--version'] || 0.1;

function chrome(){
	console.log('Making chrome extension...');
	shell('mkdir out/chrome -p');
	shell('cp html/popup.html out/chrome/');
	shell('cp ../img/favicon.png out/chrome/icon.png');
	var data	= Conditional.parseJS(open('misc/manifest.json'), [])();
	save('out/chrome/manifest.json', data);
}

function all(){
	chrome();
}
