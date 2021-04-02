module.exports = (props) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${ props.title ? `${props.title} | Ramune` : 'Ramune' }</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/2.3.2/css/bootstrap.min.css">
      <link rel="stylesheet" type="text/css" href="/css/index.css">
      <meta name="description" content="The open manga repository. Read manga online for free!">
      <meta name="keywords" content="manga,free,anime,ramune">
      <meta name="id" content="${props.req.params.id}">
      <script src="https://code.jquery.com/jquery.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/2.3.2/js/bootstrap.min.js"></script>
    </head>
    <body>
      <div id="preload" style="display:none;"></div> 
      <div id="titlebarContainer">
        <div id="titlebar">
          <button class="titlebarButton" id="backButton" onclick="history.back()">
            <i class="icon-chevron-left icon-white"></i>
          </button>

          <span id="titlebarText"></span>

          <button class="titlebarButton" id="fitButton" title="Change fit">
            <i class="icon-resize-full icon-white"></i>
          </button>
          <button class="titlebarButton" id="invertButton" title="Invert reading direction">
            <i class="icon-random icon-white"></i>
          </button>
        </div>
      </div>

      <div id="pageLeft"></div>
      <div id="pageRight"></div>

      <div id="pageView"></div>

      <div id="pageFooter">
        <span id="pageCounter">0/?</span>
      </div>
      
      <script src="/js/reader.js"></script>
    </body>
  </html>
`