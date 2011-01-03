echo ('Generating HTML files...');
function all()
{
	var html = open('calculatoure.html').split('<!-- BUTTONS -->'),
	layout = open('buttonlayout.xml').split('\n\n'),
	layoutCaptions = [], layoutTypes = [], n, i, out = [];
	n = layout[0].split('\n');
	for (i=0; i<n.length; i++)
		layoutCaptions[i] = n[i].split('\t');
	n = layout[1].split('\n');
	for (i=0; i<n.length; i++)
		layoutTypes[i] = n[i].split('\t');
	for (i=0; i<layoutCaptions.length; i++)
	{
		layout = [];
		for (n=0; n<layoutCaptions[i].length; n++)
			layout[n] = '<button class="' + layoutTypes[i][n] + '">' + layoutCaptions[i][n] + '</button>';
		out.push(layout.join(''));
	}
	var buttons = out.join('<br />');
	save('../temp/index.html', html[0] + buttons + html[1]);
}
