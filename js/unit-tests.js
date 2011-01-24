(function(calculatoure){

var	tests = [
		'1 != 2',
		'012 !== 0x12',
		'2 === 2',
		'(1 + 2 * (1 + 2 * 3))',
		'!0',
		'1 && 2',
		'0 || 1',
		'1 ? 2 : 3',
		'x = 5',
		'x < 4',
		'x > 4',
		'x >= 5',
		'x <= 4',
		'1 >>> 2',
		'2 >> 3',
		'3 << 4',
		'x ^ 4',
		'~x',
		'5 & 2',
		'5 | 2',
		'25 % 4',
		'1 + 1',
		'1 - 1',
		'1 * 2',
		'1 / 2',
		'ans',
		'ans(2)',
		'whack(15)',
		'pow(2,4)',
		'sqrt(4)',
		'log(1)',
		'exp(1)',
		'asin(1)',
		'acos(1)',
		'atan(1)',
		'atan2(0.5, 0.5)',
		'max(1,2,3)',
		'min(1,2,3)',
		'sin(1)',
		'cos(1)',
		'tan(1)',
		'PI',
		'round(0.5)',
		'floor(0.5)',
		'ceil(0.5)',
		'frac(3.5)',
		'abs(-1)'
	],
	expecting = [
		'true',
		'true',
		'true',
		'15',
		'true',
		'2',
		'1',
		'2',
		'5',
		'false',
		'true',
		'true',
		'false',
		'0',
		'0',
		'48',
		'1',
		'-6',
		'0',
		'7',
		'1',
		'2',
		'0',
		'2',
		'0.5',
		'0.5',
		'2',
		'6',
		'16',
		'2',
		Math.log(1).toString(),
		Math.exp(1).toString(),
		Math.asin(1).toString(),
		Math.acos(1).toString(),
		Math.atan(1).toString(),
		Math.atan2(0.5, 0.5).toString(),
		Math.max(1,2,3).toString(),
		Math.min(1,2,3).toString(),
		Math.sin(1).toString(),
		Math.cos(1).toString(),
		Math.tan(1).toString(),
		Math.PI.toString(),
		'1',
		'0',
		'1',
		'0.5',
		'1'
	],
	results = [];



(function(){
	var i, l = tests.length, result, success = 0;
	console.log('Unit testing results:');
	for (i=0; i<l; i++){
		console.log('Test: ' + tests[i]);
		try{
			result = calculatoure(tests[i]);
			if (result.data === expecting[i]){
				success++;
				console.log('Result: ' + result.data + ' (as expected)');
			} else {
				console.error('Result: ' + result.data + ' (expecting ' + expecting[i] + ')');
			}
			results.push(result.data);
		} catch (e){
			console.error('Result: ' + e);
			results.push('Error! ' + e + ' (expecting ' + expecting[i] + ')');
		}
	}
	console.log('Testing complete. ' + success + ' / ' + tests.length + ' passed.');
}());

})(calculatoure);
