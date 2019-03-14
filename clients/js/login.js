const username = document.querySelector('#username')

const alett = document.querySelector('.alert')

const password = document.querySelector('#password')

const url = 'http://localhost:3000/user/login'

const frmLogin = document.querySelector('#form-login')

frmLogin.addEventListener('submit', login)

function login(e) {
  e.preventDefault()

  return (fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: username.value, password: password.value })
  })
    .then(res => res.json())
    .then(result => {
      if (result.token) {
        sessionStorage.setItem('id', result.id)
        sessionStorage.setItem('token', result.token)
        window.location = './dashboard.html'
      } else {
        alett.style.display = 'block'
      }
    })
    .catch(err => {
      return (console.log('not now  ' + err))
    }))
}