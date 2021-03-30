const shell = require('./components/shell');
// unfinished
module.exports = (props) => shell(`
  <div class="container">
    <h1>Upload</h1>
    <form method="POST" action="/api/upload">
      <h3>Manga</h3>
      <label for="manga-id">Manga ID</label>
      <input
        type="text"
        name="manga_id"
        id="manga-id"
        placeholder="Start typing the name of a manga"
      /><br>
      <input type="checkbox" class="visually-hidden" id="new-manga" name="new-manga" value="yes">
      <small class="subtitle">Or <label style="display:inline" for="new-manga" id="new-manga-button">submit a new manga!</label></small>
      <div class="new-manga-dialog">
        <label for="eng-title">English title</label>
        <input
          type="text"
          name="eng_title"
          id="eng-title"
          placeholder="(required)"
          required
        />
        <label for="romaji-title">Romaji title</label>
        <input type="text" name="romaji_title" id="romaji-title"/>
        <label for="romaji-title">Japanese title</label>
        <input type="text" name="japanese_title" id="japanese-title"/>
        <label for="artist">Artist</label>
        <input type="text" name="artist" id="artist"/>
        <label for="author">Author</label>
        <input type="text" name="author" id="author"/>
        <label for="description">Description</label>
        <textarea type="text" name="description" id="description" rows="4"></textarea>
        <label for="cover">Cover image</label>
        <input id="cover" type="file" name="cover" accept="image/jpeg,image/png">
      </div>
      <h3>Chapter</h3>
      <label for="chapter">Identifier</label>
      <input type="text" name="chapter" id="chapter"/>
    </form>
  </div>
  <script src="/js/upload.js"></script>
`, { req: props.req })