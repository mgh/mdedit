var optimist = require("optimist");
var express = require("express");
var path = require("path");
var spawn = require("child_process").spawn;
var fs = require("fs");
var ff = require("ff");

if (process.argv.length < 3) {
	console.log('usage: mdedit source.markdown [target.html]');
	process.exit(1);
}

var app = express();
var publicDir = path.join(__dirname, "public");
var filename = process.argv[2];
var outputFilename = process.argv[3] || (process.argv[2] + '.html');
var filePath = path.dirname(filename);

console.log('serving', path.basename(filename), 'from', filePath);

var _contents = '';
if (fs.existsSync(filename)) {
	try {
		_contents = fs.readFileSync(filename);
	} catch (e) {
		console.error(e);
	}
}

app.use('/', express.static(publicDir));
app.use('/', express.static(filePath));

app.use('/read', function (req, res) {
	res.send(_contents);
});

app.use('/write', function (req, res) {
	var buf = [];
	req.on('data', function (data) {
		buf.push(data.toString());
	});

	req.on('end', function () {
		var f = ff(function () {
			_contents = buf.join('');
			fs.writeFile(filename, _contents, f());
		}, function () {
			var markdown = spawn("markdown_py", [filename, "-f", outputFilename, "-x", "extra", "-x", "codehilite", "-x", "toc"]);
			markdown.on('exit', f());
		}, function () {
			fs.readFile(outputFilename, f());
		}, function (contents) {
			res.send(contents);
		}).error(function (e) {
			console.log("error", e);
			res.send(500, e);
		});
	});

});

app.listen(3000);

