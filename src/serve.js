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
var filePath = path.resolve(process.cwd(), path.dirname(filename));

console.log('serving', path.basename(filename), 'from', filePath, '[http://localhost:3000]');

app.use('/', express.static(publicDir));
app.use('/', express.static(filePath));

app.use('/read', function (req, res) {
	fs.readFile(filename, function (err, contents) {
		if (err) {
			console.error("Unknown error reading source file", err);
		} else {
			res.send(contents);
		}
	});
});

app.use('/write', function (req, res) {
	var buf = [];
	req.on('data', function (data) {
		buf.push(data.toString());
	});

	req.on('end', function () {
		var f = ff(function () {
			var res = JSON.parse(buf.join(''));
			fs.writeFile(filename, res.src, f());
			fs.writeFile(outputFilename, res.compiled, f());
		}, function () {
			res.send(200);
		}).error(function (e) {
			console.log("error", e);
			res.send(500, e);
		});
	});

});

app.listen(3000);

