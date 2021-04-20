const shell = require('./components/shell')
module.exports = props => shell(`
  ${props.flash.map(flash => `
    <div class="flash-messages">
      ${flash.message}
    </div>
    <div class="sep"></div>
  `).join('')}
  <div class="container">
    <div style="flex-direction: row" class="login-container">
      <h3>Register</h3>
      <form
        method="POST"
        action="/api/register"
      >
        <label for="username">Username</label>
        <input type="text" name="username" required/>
        <label for="password">Password</label>
        <input type="password" name="password" required/><br>
        <label for="confirm">Confirm Password</label>
        <input type="password" name="confirm" required/><br>
        <button class="btn" type="submit">Register</button><br>
        <label>Already have an account? <a href="/login">Login!</a></label>
      </form>
    </div>
  </div>
`, { req: props.req })