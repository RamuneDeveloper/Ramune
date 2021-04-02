const shell = require('./components/shell');
module.exports = (props) => shell(`
  ${props.flash.map(flash => `
    <div class="flash-messages">
      ${flash.msg}
    </div>
  `).join('')}
  <div class="container">
    <h1>Upload</h1>
    <form
      method="POST"
      action="/api/upload"
      enctype="multipart/form-data"
    >
      <h3>Manga</h3>
      <label for="manga-id">Manga ID</label>
      <input
        type="text"
        name="manga_id"
        id="manga-id"
        class="awesomplete"
        placeholder="Start typing the name of a manga"
      /><br>
      <input type="checkbox" class="visually-hidden" id="new-manga" name="new_manga" value="yes">
      <span class="subtitle">Or <label style="display:inline" for="new-manga" id="new-manga-button">submit a new manga!</label></span>
      <div class="new-manga-dialog">
        <label for="eng-title">English title</label>
        <input
          type="text"
          name="eng_title"
          id="eng-title"
          placeholder="(required)"
        />
        <label for="romaji-title">Romaji title</label>
        <input type="text" name="romaji_title" id="romaji-title"/>
        <label for="japanese-title">Japanese title</label>
        <input type="text" name="japanese_title" id="japanese-title"/>
        <label for="artist">Artist</label>
        <input type="text" name="artist" id="artist"/>
        <label for="author">Author</label>
        <input type="text" name="author" id="author"/>
        <label for="description">Description</label>
        <textarea type="text" name="description" id="description" rows="4" placeholder="(required)"></textarea>
        <label for="cover">Cover image</label>
        <input id="cover" type="file" name="cover" accept="image/jpeg,image/png"><br>
        <span class="subtitle">Required. JPEG/PNG only.</span>
      </div>
      <label for="source">Source</label>
      <input
        type="text"
        name="source"
        id="source"
      /><br>
      <span class="subtitle">
        If this upload is a mirror from a different website, or created by a group you aren't a part of, optionally credit them in the field above.<br>
      </span><br>
      <h3>Volume/Chapter</h3>
      <label for="volume">Volume number</label>
      <input type="text" name="volume" id="volume"/><br>
      <span class="subtitle">Leave blank if this upload is not part of a volume.</span>
      <label for="chapter">Chapter number</label>
      <input type="text" name="chapter" id="chapter" required placeholder="(required)"/>
      <h3>File</h3>
      <label for="upload_file">Upload file</label>
      <input id="cover" type="file" name="upload_file" accept="application/zip" required/><br>
      <span class="subtitle">ZIP with JPEG/PNG/GIF only. Your upload will be sorted by alphanumeric order.</span><br>
      <button type="submit" class="btn btn-success">Submit</button>
    </form>
  </div>
  <script src="/js/upload.js"></script>
`, { req: props.req })