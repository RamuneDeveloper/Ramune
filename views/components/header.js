module.exports = props => `
  <div class="navbar navbar-inverse navbar-static-top">
    <div class="navbar-inner">
      <div class="container">
        <a class="brand" href="/">ramune</a>
        <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </a>
        <div class="nav-collapse collapse">
          <ul class="nav">
            <li><a href="/">Manga</a></li>
            ${props.req.session && props.req.session.account_id ? `
              <li><a href="/upload">Upload</a></li>
              <li><a href="/api/logout">Logout</a></li>
            ` : `
              <li><a href="/login">Login</a></li>
            `}
            ${/*
              <li><a href="/following">Following</a></li>
              <li><a href="/groups">Groups</a></li>
              <li><a href="/users">Users</a></li>
              <li><a href="/upload">Upload</a></li>
              <li><a href="/info">Info</a></li>
            */''}
          </ul>
          <form class="navbar-search pull-right">
            <input type="text" class="search-query" placeholder="Search">
          </form>
        </div>
      </div>
    </div>
  </div>
`