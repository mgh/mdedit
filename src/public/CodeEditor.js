import .codemirror.codemirror;
import .codemirror.javascript;

import squill.Widget;

exports = Class(squill.Widget, function () {
	this.buildWidget = function () {
		this.editor = new CodeMirror(this._el, this._opts);
		if (_cssLoaded) {
			_cssLoaded.run(this, function () {
				// force a refresh when the stylesheet loads! this.editor.refresh is not good enough
				this.editor.setValue(this.editor.getValue());
			});
		}
	}

	this.refresh = function () { this.editor.refresh(); }

	this.setValue = function (value) { return this.editor.setValue(value); }
	this.getValue = function (value) { return this.editor.getValue(value); }
});

import squill.cssLoad;
import lib.Callback;

var _cssLoaded = new lib.Callback();
squill.cssLoad.get("/codemirror/codemirror.css", function () {
	_cssLoaded.fire();
	_cssLoaded = null;
});
