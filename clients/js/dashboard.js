const id = sessionStorage.getItem('id')
const token = sessionStorage.getItem('token')
const frmEdit = document.querySelector('#frm-edit')
const gallery = document.querySelectorAll('.img-gallery')

const name = document.querySelector('#name')
const surname = document.querySelector('#surname')
const email = document.querySelector('#email')
const bio = document.querySelector('#bio')

const upload = document.querySelector('#upload')

var profileData = null;
var aryImages = []
console.log(Array.isArray(aryImages))

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
            console.log(profileData)
        })
}

function render(data) {
    document.title += `Welcome\t  ${data.username}`
    name.innerHTML += data.name
    surname.innerHTML += data.surname
    email.innerHTML += data.email
    bio.innerHTML += data.bio
    gallery[0].src = data.pic1
    gallery[1].src = data.pic2
    gallery[2].src = data.pic3
    gallery[3].src = data.pic4
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
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(res=>console.log(res))
    .catch(err=>console.log(err))
}

upload.addEventListener('change', validateInput)
//Uploading Images
function validateInput(e){
    const images = e.target.files
    if(images.length > 5) return

    for(let i = 0; i < images.length; i++){
        if(!images[i].type.match('image/.')){
            return
        }else{
            // TODO
            const reader = new FileReader()
            reader.addEventListener('load', (e)=>{
                //Should get from server
                aryImages.push(e.target.result)
            })
            reader.readAsDataURL(e.target.files[i])
        }
    }
    // TODO
    // Send Images to server
    saveImages(aryImages)    
}

function saveImages(images){
    const data = {
        id: id,
        pic1: images[0],
        pic2: images[1],
        pic3: images[2],
        pic4: images[3]
    }

    const url = 'http://localhost:3000/user/upload'
    fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(res=>console.log(res))
    .catch(err=>console.error(err))
}