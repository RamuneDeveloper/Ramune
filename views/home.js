const shell = require('./components/shell');
module.exports = (props) => shell(`
  ${props.flash.map(flash => `
    <div class="flash-messages">
      ${flash.message}
    </div>
    <div class="sep"></div>
  `).join('')}
  <div class="container text-center">
    ${props.results.length ? `
      <div class="row manga-container">
      ${props.results.map(manga => `
        <a href="/manga/${manga.id}">
          <div class="manga-preview">
            <h4>${manga.eng_title}</h4>
            <div class="manga-preview-image">
              <img class="img-rounded" src="/assets/${manga.cover}">
            </div>
          </div>
        </a>
      `).join('')}
      </div>
    ` : '<h1 class="subtitle">No uploads.</h1>'}
  </div>
`, { req: props.req })