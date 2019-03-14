const id = sessionStorage.getItem('id')
const token = sessionStorage.getItem('token')
const frmEdit = document.querySelector('#frm-edit')


const name = document.querySelector('#name')
const surname = document.querySelector('#surname')
const email = document.querySelector('#email')

var profileData = null;


window.addEventListener('load', loadData(id))

frmEdit.addEventListener('submit', profileUpdate)

function loadData(id) {
const url = 'http://localhost:3000/user/dashboard'
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ id: id })
    })
        .then(res => res.json())
        .then(res => {
            profileData = res.profile
            render(profileData)
        })
}

function render(data) {
    document.title += `Welcome\t  ${data.username}`
    name.innerHTML += data.name
    surname.innerHTML += data.surname
    email.innerHTML += data.email
}

function profileUpdate(e){
    e.preventDefault()
    const data ={
        id: profileData.id,
        name: frmEdit['name'].value ? frmEdit['name'].value : profileData.name,
        surname: frmEdit['surname'].value ? frmEdit['surname'].value : profileData.surname,
        email: frmEdit['email'].value ? frmEdit['email'].value : profileData.email,
        username: frmEdit['username'].value ? frmEdit['username'].value : profileData.username,
        password: frmEdit['password'].value ? frmEdit['password'].value : profileData.password,
        bio: frmEdit['bio'].value ? frmEdit['bio'].value : profileData.bio
    }
    const url = 'http://localhost:3000/user/update'
    fetch(url, {
        method: 'PATCH',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(res=>console.log(res.message))
    .catch(err=>console.log(err))
    // console.log(data)
}