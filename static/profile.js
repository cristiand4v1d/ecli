document.addEventListener("DOMContentLoaded", function () {
    const profileContainer = document.getElementById("user-profile");
    const userInterestsList = document.getElementById("interest-list");
    const sel1 = document.getElementById("field1");
    let selected

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
                selected = data.intereses
                const interestsList = selected.map(interest => `<li>${interest}</li>`).join('');
                userInterestsList.innerHTML = interestsList;
                fetch('http://localhost:3000/intereses', {
                    method: 'GET',
                })
                    .then(response => response.json())
                    .then(interests => {

                        //debugger
                        /* const interestsList = interests.map(interest => `<option>${interest.nombre}</option>`).join('');
                        InterestsList.innerHTML = interestsList; */
                        if (selected && interests) {
                            //debugger
                            sel1.innerHTML =
                                /* interests.map(t => '<option value="' + t.nombre + '">' + t.nombre + '</option>'); */
                                interests.map(
                                    t =>
                                        `<option value="${t.nombre}" ${selected.includes(t.nombre) ? "selected" : ""
                                        }>${t.nombre}</option>`
                                ).join("");


                            sel1.loadOptions();
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            })
            .catch(error => {
                console.error('Error:', error);
            });



    } else {
        window.location.href = 'index.html';
    }
});
