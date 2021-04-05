const shell = require('./components/shell');
module.exports = (props) => shell(`
  <div class="container">
    <div class="row">
      <div class="span12">
        <h3>${props.account.username.endsWith('s') ? props.account.username + '\'' : props.account.username + '\'s'} uploads</h3>
      </div>
    </div>
    <div class="row">
      <div class="span12">
        ${props.uploads.length ? `
          <table width="100%" class="chapterlist">
            <thead>
              <tr>
                <th>Manga</th>
                <th>Chapter</th>
                <th>Group</th>
                <th>Source</th>
                <th>Uploader</th>
              </tr>
            </thead>
            <tbody>
              ${props.uploads.map((upload, i) => `
                <tr>
                  <td class="detail-column">
                    <a href="/manga/${props.manga[i].id}">${props.manga[i].eng_title}</a>
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
                    <a href="/users/${upload.uploader}">${props.account.username}</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `: '<h4 class="subtitle">No chapters.</h4>'}
      </div>
    </div>
  </div>
`, { req: props.req })
