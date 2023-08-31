document.addEventListener("DOMContentLoaded", function () {
    const profileContainer = document.getElementById("user-profile");
    const sel1 = document.getElementById("field1");
    const logoutButton = document.getElementById("logout-button");
    const updateButton = document.getElementById("update-button");
    let selected
    let intereses_selected

    sel1.addEventListener("change", handleSelectChange);
    let token = localStorage.getItem('token')
    // Agregar evento de clic al botón de Cerrar Sesión
    logoutButton.addEventListener("click", function () {
        // Eliminar el token de localStorage
        localStorage.removeItem("token");
        // Redireccionar a la página de inicio de sesión
        window.location.href = "index.html";
    });

    function handleSelectChange(event) {
        intereses_selected = Array.from(this.selectedOptions).map(x => x.value ?? x.text)

        // Hacer algo con los valores seleccionados
        console.log("Valores seleccionados:", intereses_selected);
    }
    /* function seleccionados(datos) {
        console.log("lemus2", datos)
        //intereses_selected = 
    } */

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

            /* Actualizar intereses */
        updateButton.addEventListener("click", function () {
            const data = {
                intereses: intereses_selected
            };
            console.log("lemus", data)
            fetch('http://localhost:3000/actualizar-ususario', {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Mensaje de respuesta del API
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })


    } else {
        window.location.href = 'index.html';
    }
});


