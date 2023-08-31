const apiUrl = "http://localhost:3000"
/* const apiUrl = "https://ecli.onrender.com" */

document.addEventListener("DOMContentLoaded", function () {
    const profileContainer = document.getElementById("user-profile");
    const sel1 = document.getElementById("field1");
    const logoutButton = document.getElementById("logout-button");
    const updateButton = document.getElementById("update-button");
    const dropdown1 = document.getElementById("dropdown1");
    const dropdown2 = document.getElementById("dropdown2");
    let selected
    let intereses_selected
    let selectedValueDropdown1
    let selectedValueDropdown2


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
    }

    // Agregar evento de cambio al dropdown1
    dropdown1.addEventListener("change", function () {
        selectedValueDropdown1 = dropdown1.value;
        updateDropdown2Options();
    });

    // Agregar evento de cambio al dropdown2
    dropdown2.addEventListener("change", function () {
        selectedValueDropdown2 = dropdown2.value;
    });

    // Generar opciones para dropdown1
    for (let i = 18; i <= 100; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        dropdown1.appendChild(option);
    }

    // Actualizar opciones para dropdown2 en función de dropdown1
    function updateDropdown2Options() {
        dropdown2.innerHTML = "";
        const minAge = parseInt(dropdown1.value) + 1;
        for (let i = minAge; i <= 100; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            dropdown2.appendChild(option);
        }
    }

    // Agregar evento de cambio al dropdown1
    dropdown1.addEventListener("change", updateDropdown2Options);

    // Generar opciones iniciales para dropdown2
    updateDropdown2Options();



    if (token) {
        token = token.replace(/^"(.*)"$/, '$1');;
        fetch(`${apiUrl}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`
            }
        })
            .then(response => response.json())
            .then(data => {

                const profileInfo = `
                <section class="block">
            <div class="block__main">
              <div class="block__header">
                <h2>${data.nombre}</h2>
              </div>
              <div class="block__content">
                <span>
                ${data.genero}, Mellín
                </span>
              </div>
            </div>
          </section>
          
        `;

                profileContainer.innerHTML = profileInfo;
                selected = data.intereses

                // Establecer valores por defecto
                dropdown1.value = data.edad_min; // Valor por defecto para dropdown1
                selectedValueDropdown1 = dropdown1.value;
                dropdown2.value = data.edad_max; // Valor por defecto para dropdown2
                selectedValueDropdown2 = dropdown2.value;

                fetch(`${apiUrl}/intereses`, {
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
                        } else if (interests) {
                            sel1.innerHTML =
                                interests.map(t => '<option value="' + t.nombre + '">' + t.nombre + '</option>');

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
                edad_max: selectedValueDropdown2,
                edad_min: selectedValueDropdown1,
                intereses: intereses_selected
            };
            console.log("lemus", data)
            fetch(`${apiUrl}/actualizar-ususario`, {
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


