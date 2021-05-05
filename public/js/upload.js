if (document.getElementById('manga-id').type === 'text') {
  const mangaInput = document.getElementById('manga-id');
  const awesomplete = new Awesomplete(mangaInput, {
    filter: () => true,
    sort: false,
    list: []
  });
  mangaInput.addEventListener('input', (event) => {
    const inputText = event.target.value;
    fetch(`/api/autocomplete?q=${inputText}`)
      .then(res => res.json())
      .then(json => {
        awesomplete.list = json;
        awesomplete.evaluate();
      })
  });
}

document.getElementById('upload').style.opacity = '20%';

var activated = false;

function update() {
  if (activated) {
    document.getElementById('upload').innerHTML = '';
    document.getElementById('upload').innerHTML = `
      <button class="btn btn-success upload-button input-block-level" id="upload-button">
        Select or drop file
      </button>
      <small class="subtitle" style="margin-left: 5px;">2GB size limit. ZIP with JPEG/PNG/GIF only. Your upload will be sorted by alphanumeric order.</small>
    `;
    activated = false;
  }

  if (
    document.getElementById('chapter').value &&
    document.getElementById('manga-id').value
  ) {
    activated = true;
    document.getElementById('upload').style.opacity = '100%';
    var r = new Resumable({
      target: '/api/upload',
      chunkSize: 1 * 1024 * 1024,
      maxFiles: 1,
      simultaneousUploads: 10,
      testChunks: false,
      query:{
        manga_id: document.getElementById('manga-id').value,
        source: document.getElementById('source').value,
        volume: document.getElementById('volume').value,
        chapter: document.getElementById('chapter').value
      }
    });

    r.on('fileAdded', function () {
      document.getElementById('upload-button').classList.forEach(className => {
        if (className.startsWith('btn-')) {
          document.getElementById('upload-button').classList.remove(className)
        };
      });
      document.getElementById('upload-button').classList.add('btn-warning');
      document.getElementById('upload-button').innerHTML = 'Uploading...';
      r.upload();
    });

    r.on('fileSuccess', function() {
      document.getElementById('upload-button').classList.forEach(className => {
        if (className.startsWith('btn-')) {
          document.getElementById('upload-button').classList.remove(className)
        };
      });
      document.getElementById('upload-button').classList.add('btn-success');
      document.getElementById('upload-button').innerHTML = 'Done!';
      document.getElementById('upload-button').replaceWith(document.getElementById('upload-button').cloneNode(true))
    });

    r.on('fileError', function(file, msg) {
      document.getElementById('upload-button').classList.forEach(className => {
        if (className.startsWith('btn-')) {
          document.getElementById('upload-button').classList.remove(className)
        };
      });
      document.getElementById('upload-button').classList.add('btn-danger');
      document.getElementById('upload-button').innerHTML = msg;
    });

    r.on('fileProgress', function(file) {
      document.getElementById('upload-button').innerHTML = `Uploading... (${Math.floor((file.progress() / 1) * 100)}%)`;
    });
    
    r.assignBrowse(document.getElementById('upload-button'));
    r.assignDrop(document.getElementById('upload-button'));
  } else {
    document.getElementById('upload').style.opacity = '20%';
  }
}

document.getElementById('manga-id').addEventListener('input', update);
document.getElementById('source').addEventListener('input', update);
document.getElementById('volume').addEventListener('input', update);
document.getElementById('chapter').addEventListener('input', update);