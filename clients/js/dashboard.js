const id = sessionStorage.getItem('id')
const token = sessionStorage.getItem('token')

const url = 'http://localhost:3000/user/dashboard'

const name = document.querySelector('#name')
const surname = document.querySelector('#surname')
const email = document.querySelector('#email')

window.addEventListener('load', loadData(id))

function loadData(id) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ id: id })
    })
        .then(res => res.json())
        .then(res => console.log(res))
}

function render(data) {
    document.title += `Welcome ${data.username}`
    name.innerHTML += data.name
    surname.innerHTML += data.surname
    email.innerHTML += data.email
}