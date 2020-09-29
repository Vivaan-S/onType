if (!document.cookie.includes('editorSession')) {
	document.cookie = 'editorSession=' + Math.random();
}
editorData = {
	editing: 'index.html'
};
db = new IndexedObejct('db', {
	files: {
		'index.html': {
			content: btoa('<!--  Add your code without A Doctype!  -->\n<!--  IMPORTANT! YOU CAN NOT SHARE YOUR FILE WITH THIS LINK!  -->\n<h1>onType</h1>\n<br>\n<p>index.html</p>'),
			mime: 'text/html'
		}
	}
});
db.onready.then(main);
function main() {
	window.files = db.data.files;
	updateFiles();
	edit('index.html', filese.children[0]);
}
function filterXSS(input) {
	return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function addFile() {
	let fileName = prompt('File Name:');
	if (!fileName) {
		return;
	}
	if (files[fileName]) {
		alert('File exists!');
		return;
	}
	let mime = toMime(fileName);
	let file = { mime: mime, content: '' };
	files[fileName] = file;
	updateFiles();
}
function updateFiles() {
	filese.innerHTML = '';
	for (key in db.data.files) {
		renderFile(db.data.files[key], key);
	}
}
function renderFile(file, name) {
	let additionalClass = '';
	if (name == 'index.html') {
		additionalClass += ' selected';
	}
	filese.innerHTML += `<div style="cursor:pointer;" class="file${additionalClass}" onclick="edit('${name}',this)">${filterXSS(
		name
	)}</div>`;
}
function removeFile() {
	let name = prompt('Enter file name to be permanenrly deleted');
	if (!name) {
		return;
	}
	if (!files[name]) {
		alert('File does not exist!');
		return;
	}
	delete files[name];
	if (editorData.editing == name) {
		edit('index.html', filese.children[0]);
	}
	updateFiles();
}
function edit(name, t) {
	filese.querySelector('.selected').classList.toggle('selected');
	t.classList.toggle('selected');
	let file = files[name];
	editor.value = atob(file.content);
	editorData.editing = name;
}
editor.onkeyup = editor.onpasta = function() {
	files[editorData.editing].content = btoa(editor.value);
};
function getFile(input) {
	var file = input.files[0];
	var reader = new FileReader();
	reader.readAsDataURL(file);
	return new Promise(function(rs) {
		reader.addEventListener('load', function() {
			rs(reader.result);
		});
	});
}
fileUpload.onchange = function() {
	getFile(fileUpload).then(function(data) {
		try {
			let parsed = data.match(/data\:(.*?)\;base64,(.*)/);
			let mime = parsed[1];
			let content = parsed[2];
			let extentionName = (
				filetypes.find(function(type) {
					return type.mime == mime;
				}) || { extension: 'txt' }
			).extension;
			let fileName = prompt(`How to name file?`, `file.${extentionName}`);
			let dataFile = {
				mime: mime,
				content: content
			};
			if (!fileName) {
				return;
			}
			if (files[fileName]) {
				alert('File already exists');
				return;
			}
			files[fileName] = dataFile;
			updateFiles();
		} catch (err) {
			alert(err);
		}
	});
};
function uploadToServer() {
	send(
		'/fife/upload',
		`files=${encodeURIComponent(JSON.stringify(files))}`
	).then(function() {
		location = '/';
	});
}
send = function(url, params) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(params);
	return new Promise(function(res) {
		xhr.onload = function() {
			res(xhr.responseText);
		};
	});
};
