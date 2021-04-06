const shell = require('./components/shell');
module.exports = (props) => shell(`
  <div class="container">
    ${props.results.length ? `
      <div class="row">
        <div class="span2">
          <img class="manga-cover" src="/assets/${props.results[0].cover}">
        </div>
        <div class="span10">
          <br>
          <span class="manga-title">${props.results[0].eng_title}</span>
          ${props.results[0].romaji_title ? `<span class="subtitle">(${props.results[0].romaji_title})</span>` : ''}
          ${props.results[0].japanese_title ? `<span class="subtitle">(${props.results[0].japanese_title})</span>` : ''}
          <p>
            ${props.results[0].author ? `<b>Author:</b> <a href="/?q=${props.results[0].author}">${props.results[0].author}</a><br>` : ''}
            ${props.results[0].artist ? `<b>Artist:</b> <a href="/?q=${props.results[0].artist}">${props.results[0].artist}</a><br>` : ''}
            <b>Description:</b> ${props.results[0].description}
          </p>
          ${props.uploads.length ? `
            <a href="${'/release/' + props.uploads[0].id}">
              <button class="btn btn-primary">Start Reading</button>
            </a>
          ` : ''}
        </div>
      </div>
      <div class="row">
        <div class="span12">
          ${props.uploads.length ? `
            <h2>Chapters</h2>
            <table width="100%" class="chapterlist">
              <thead>
                <tr>
                  <th width="203px"></th>
                  <th>Chapter</th>
                  <th>Group</th>
                  <th>Source</th>
                  <th>Uploader</th>
                </tr>
              </thead>
              <tbody>
                ${props.uploads.map((upload, i) => `
                  <tr>
                    <td class="upload-buttons">
                      <a href="${'/release/' + upload.id}">
                        <button class="btn btn-primary">Read</button>
                      </a>
                      <a href="${'/download/' + upload.id}" download="${upload.eng_title}_chapter${upload.chapter_id}_${upload.id}.zip">
                        <button class="btn btn-success">
                          <span class="fas fa-download"></span>
                        </button>
                      </a>
                      ${props.password || props.req.session.account_id === upload.uploader ? `
                        <a href="${'/edit/' + upload.id}">
                          <button class="btn btn-warning">
                            <span class="fas fa-edit"></span>
                          </button>
                        </a>
                      ` : `
                        <button class="btn btn-warning" disabled>
                          <span class="fas fa-edit"></span>
                        </button>
                      `}
                      ${props.req.session.account_id === upload.uploader ? `
                        <a href="${'/delete/' + upload.id}">
                          <button class="btn btn-danger">
                            <span class="fas fa-trash"></span>
                          </button>
                        </a>
                      ` : `
                        <button class="btn btn-danger" disabled>
                          <span class="fas fa-trash"></span>
                        </button>
                      `}
                    </td>
                    <td class="detail-column">
                      <span>${upload.volume_id && upload.volume_id > 0 ? `Vol. ${upload.volume_id} ` : ''}Ch. ${upload.chapter_id}</span>
                    </td>
                    <td class="detail-column">
                      ${upload.group ? `<span>${upload.group}</span>` : '<span class="subtitle">None</span>'}
                    </td>
                    <td class="detail-column">
                      ${upload.source ? `<span>${upload.source}</span>` : '<span class="subtitle">None</span>'}
                    </td>
                    <td class="detail-column">
                      ${props.uploaders[i] ? `<a href="/users/${upload.uploader}">${props.uploaders[i]}</a>` : '<span class="subtitle">System</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `: '<h4 class="subtitle">No chapters.</h4>'}
        </div>
      </div>
    ` : `<h1 class="subtitle">There's nothing here.</h1>`}
  </div>
`, { req: props.req })
