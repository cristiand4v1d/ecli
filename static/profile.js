document.addEventListener("DOMContentLoaded", function () {
    const profileContainer = document.getElementById("user-profile");
    const userInterestsList = document.getElementById("interest-list");
    const InterestsList = document.getElementById("interest-all");

    let token = localStorage.getItem('token')

    if (token) {
        token = token.replace(/^"(.*)"$/, '$1');;
        fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: {
                'Authorization': `${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                
                const profileInfo = `
          <h2>Perfil de Usuario</h2>
          <p>Nombre: ${data.nombre}</p>
          <p>Email: ${data.genero}</p>
          <!-- Agregar más campos según la estructura de los datos -->
        `;

                profileContainer.innerHTML = profileInfo;

                const interestsList = data.intereses.map(interest => `<li>${interest}</li>`).join('');
                userInterestsList.innerHTML = interestsList;
            })
            .catch(error => {
                console.error('Error:', error);
            });

        fetch('http://localhost:3000/intereses', {
            method: 'GET',
        })
            .then(response => response.json())
            .then(interests => {

                //debugger
                const interestsList = interests.map(interest => `<option>${interest.nombre}</option>`).join('');
                InterestsList.innerHTML = interestsList;
            })
            .catch(error => {
                console.error('Error:', error);
            });

    } else {
        window.location.href = 'index.html';
    }
});
