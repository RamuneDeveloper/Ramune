const shell = require('./components/shell');
module.exports = (props) => shell(`
  <div class="container">
    ${props.results.length ? `
      <div class="row">
        <div class="span2">
          <img src="/assets/${props.results[0].cover}">
        </div>
        <div class="span10">
          <h1>${props.results[0].eng_title}</h1>
          <p>${props.results[0].description}</p>
          ${Object.keys(props.uploads).length && props.uploads[Object.keys(props.uploads)[0]].length ? `
            <a href="${'/release/' + JSON.stringify(props.uploads[Object.keys(props.uploads)[0]][0].id)}">
              <button class="btn btn-primary">Start Reading</button>
            </a>
          ` : ''}
        </div>
      </div>
      <div class="row">
        <div class="span12">
          ${Object.keys(props.uploads).length ? `
            <h2>Chapters</h2>
            ${Object.keys(props.uploads).map(chapter_num => `
              <details>
                <summary>
                  <h4>Chapter ${chapter_num}</h4>
                </summary>
                ${props.uploads[chapter_num].length ? `
                  <ul>
                    ${props.uploads[chapter_num].map(upload => `
                      <li>
                        ${upload.group || `<span class="subtitle">No group</span>`}${upload.source ? ` - <i>${upload.source}</i>` : ''}<br>
                        ${/* ${[1, 2, 3, 4, 5].map(i => i <= upload.rating ? '<i class="icon-star icon-white"></i>' : '<i class="icon-star-empty icon-white"></i>').join('')} (${upload.rating_count}) */''}
                        <div class="upload-buttons">
                          <a href="${'/release/' + upload.id}">
                            <button class="btn btn-primary">Read</button>
                          </a>
                          <a href="${'/download/' + upload.id}" download="${props.results[0].eng_title}_chapter${chapter_num}_${upload.id}.zip">
                            <button class="btn btn-success">Download</button>
                          </a>
                        </div>
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
              </details>
            `).join('')}
          `: '<h4 class="subtitle">No chapters.</h4>'}
        </div>
      </div>
    ` : `<h1 class="subtitle">There's nothing here.</h1>`}
  </div>
`, { req: props.req })