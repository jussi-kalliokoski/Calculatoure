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
		for (n=0; i<layoutCaptions[i].length; i++)
			layout[n] = '<button class="' + layoutTypes[i][n] + '">' + layoutCaptions[i][n] + '</button>';
		out.push(layout);
	}
	save('../temp/index.html', out.join('<br />'));
}
