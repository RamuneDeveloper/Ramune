const shell = require('./components/shell');
module.exports = (props) => shell(`
  ${props.flash.map(flash => `
    <div class="flash-messages">
      ${flash.message}
    </div>
    <div class="sep"></div>
  `).join('')}
  <div class="container">
    <h1>Upload</h1>
    <form
      method="POST"
      action="/api/upload"
      enctype="multipart/form-data"
    >
      <h3>Manga</h3>
      ${props.req.query.id ? `
        <input type="hidden" id="manga-id" name="manga_id" value="${props.req.query.id}">
      ` : `
        <label for="manga-id">Manga ID</label>
        <input
          type="text"
          name="manga_id"
          id="manga-id"
          class="awesomplete"
          placeholder="Start typing the name of a manga"
          required
        /><br>
        <span class="subtitle">Or <a href="/create">submit a new manga!</a></span>
      `}

      <label for="source">Source</label>
      <input
        type="text"
        name="source"
        id="source"
        class="input-block-level"
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
    </form>
    <div id="upload">
      <button class="btn btn-success upload-button input-block-level" id="upload-button">
        Select or drop file
      </button>
      <small class="subtitle" style="margin-left: 5px;">2GB size limit. ZIP with JPEG/PNG/GIF only. Your upload will be sorted by alphanumeric order.</small>
    </div>
  </div>
  <script src="/js/upload.js"></script>
  <script src="/js/resumable.js"></script>
`, { req: props.req })