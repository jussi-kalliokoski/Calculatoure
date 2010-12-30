function all()
{
	var data = open('js/CodeExpression.js') + open('js/CE.JavaScript.js');
	save('CodeExpression.full.js', data);
	shell('yui-compressor CodeExpression.full.js -o CodeExpression.min.js');
}

function clean()
{
	shell('rm CodeExpression.full.js CodeExpression.min.js -f');
}
