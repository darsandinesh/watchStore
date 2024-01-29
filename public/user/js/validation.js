const name_error = document.getElementById('usernameError')

        function validateName(){
            const username = document.getElementById('nameValidation').value
            if(username.length == 0){
                name_error.innerHTML = 'username is required'
            }
        }