const header = require('./header');

module.exports = (html, props = {}) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${ props.title ? `${props.title} | Ramune` : 'Ramune'}</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/2.3.2/css/bootstrap.min.css">
      <link rel="stylesheet" type="text/css" href="/css/index.css">
      <link rel="stylesheet" type="text/css" href="/css/awesomplete.css">
      <meta name="description" content="The open manga repository. Read manga online for free!">
      <meta name="keywords" content="manga,free,anime,ramune">
      <script src="https://code.jquery.com/jquery.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/2.3.2/js/bootstrap.min.js"></script>
      <script src="/js/awesomplete.min.js"></script>
    </head>
    <body>
      ${header({ req: props.req })}
      <div class="sep"></div>
      ${html}
    </body>
  </html>
`