const shell = require('./components/shell');
module.exports = (props) => shell(`
  ${props.flash.map(flash => `
    <div class="flash-messages">
      ${flash.message}
    </div>
    <div class="sep"></div>
  `).join('')}
  <div class="container">
    <h1>Submit new manga</h1>
    <form
      method="POST"
      action="/api/create"
      enctype="multipart/form-data"
    >
      <label for="eng-title">English title</label>
      <input
        type="text"
        name="eng_title"
        id="eng-title"
        placeholder="(required)"
        class="input-xlarge"
      />

      <label for="romaji-title">Romaji title</label>
      <input type="text" name="romaji_title" id="romaji-title" class="input-xlarge"/>

      <label for="japanese-title">Japanese title</label>
      <input type="text" name="japanese_title" id="japanese-title" class="input-xlarge"/>

      <label for="artist">Artist</label>
      <input type="text" name="artist" id="artist" class="input-xlarge"/>

      <label for="author">Author</label>
      <input type="text" name="author" id="author" class="input-xlarge"/>

      <label for="description">Description</label>
      <textarea
        type="text"
        name="description"
        id="description"
        rows="4"
        placeholder="(required)"
        class="input-block-level"
      ></textarea>

      <label for="cover">Cover image</label>
      <input id="cover" type="file" name="cover" accept="image/jpeg,image/png"><br>
      <span class="subtitle">Required. JPEG/PNG only.</span><br>

      <button type="submit" class="btn btn-success">Submit</button>
    </form>
  </div>
`, { req: props.req })