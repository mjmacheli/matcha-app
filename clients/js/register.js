const formData = document.querySelector('form')
const url = 'http://localhost:3000/user/register'
const response = document.querySelector('#response')

formData.addEventListener('submit', getFormData)

function getFormData(e) {
    e.preventDefault()
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name: formData['name'].value, 
            surname: formData['surname'].value, 
            email: formData['email'].value,
            username: formData['username'].value,
            password: formData['password'].value
         })
    })
        .then(res => res.json())
        .then(res => {
            if(res.message === 'Registered'){
                response.textContent = res.message
                setTimeout(window.location = `./login.html?username=${formData['username'].value}`,2000)
            }else{
                response.textContent = res.message
            }
        })
    // console.log(formData['surname'].value)
}                                                                                                 