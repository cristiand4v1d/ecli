/* const apiUrl = "http://localhost:3000" */
const apiUrl = "https://ecli.onrender.com"

document.addEventListener("DOMContentLoaded", function () {
    mostrarSpinner();
    const profileContainer = document.getElementById("user-profile");
    const musicaSelect = document.getElementById("field1");
    const literaturaSelect = document.getElementById("field2");
    const logoutButton = document.getElementById("logout-button");
    const updateButton = document.getElementById("update-button");
    const dropdown1 = document.getElementById("dropdown1");
    const dropdown2 = document.getElementById("dropdown2");
    const alertContainer = document.querySelector(".alert-container");
    let selected
    let musica_selected
    let literatura_selected
    let selectedValueDropdown1
    let selectedValueDropdown2


    musicaSelect.addEventListener("change", handleSelectChange);
    literaturaSelect.addEventListener("change", handleSelectChangeLectura);
    let token = localStorage.getItem('token')
    if (!token) {
        window.location.href = 'index.html';
    }
    // Agregar evento de clic al botón de Cerrar Sesión
    logoutButton.addEventListener("click", function () {
        // Eliminar el token de localStorage
        localStorage.removeItem("token");
        // Redireccionar a la página de inicio de sesión
        window.location.href = "index.html";
    });

    function handleSelectChange(event) {
        musica_selected = Array.from(this.selectedOptions).map(x => x.value ?? x.text)
    }

    function handleSelectChangeLectura(event) {
        literatura_selected = Array.from(this.selectedOptions).map(x => x.value ?? x.text)
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
                if (data?.message == 'Token no válido') {
                    localStorage.removeItem("token");
                    // Redireccionar a la página de inicio de sesión
                    window.location.href = "index.html";
                }
                ocultarSpinner();
                const profileInfo = `
                <section class="block">
            <div class="block__main">
              <div class="block__header">
                <h2>${data.nombre}, ${data.edad}</h2>
              </div>
              <div class="block__content">
                <span>
                ${data.genero}, Medellín
                </span>
              </div>
            </div>
          </section>
          
        `;

                profileContainer.innerHTML = profileInfo;
                musica_selected = data?.intereses?.musica;
                literatura_selected = data?.intereses?.literatura;

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

                        const musica = interests.musica
                        const literatura = interests.literatura

                        if (musica_selected && musica) {
                            //debugger
                            musicaSelect.innerHTML =
                                /* interests.map(t => '<option value="' + t.nombre + '">' + t.nombre + '</option>'); */
                                musica.map(
                                    t =>
                                        `<option value="${t.nombre}" ${musica_selected.includes(t.nombre) ? "selected" : ""
                                        }>${t.nombre}</option>`
                                ).join("");
                            musicaSelect.loadOptions();
                        } else if (musica) {
                            musicaSelect.innerHTML =
                                musica.map(t => '<option value="' + t.nombre + '">' + t.nombre + '</option>');

                            musicaSelect.loadOptions();
                        }
                        if (literatura_selected && literatura) {
                            //debugger
                            literaturaSelect.innerHTML =
                                /* interests.map(t => '<option value="' + t.nombre + '">' + t.nombre + '</option>'); */
                                literatura.map(
                                    t =>
                                        `<option value="${t.nombre}" ${literatura_selected.includes(t.nombre) ? "selected" : ""
                                        }>${t.nombre}</option>`
                                ).join("");
                            literaturaSelect.loadOptions();
                        } else if (literatura) {
                            literaturaSelect.innerHTML =
                                literatura.map(t => '<option value="' + t.nombre + '">' + t.nombre + '</option>');

                            literaturaSelect.loadOptions();
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
            mostrarSpinner();
            const data = {
                edad_max: selectedValueDropdown2,
                edad_min: selectedValueDropdown1,
                intereses: { musica: musica_selected, literatura: literatura_selected }
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
                    ocultarSpinner();
                    showAlert("info", data.message);
                    console.log(data); // Mensaje de respuesta del API
                })
                .catch(error => {
                    ocultarSpinner();
                    showAlert("danger", error);
                    console.error('Error:', error);
                });
        })


    } else {
        window.location.href = 'index.html';
    }

    function showAlert(type, message) {
        /* const profileInfo = `<div class="alert alert-primary" role="alert">
        A simple primary alert—check it out!
      </div>
      `;

        alertContainer.innerHTML = profileInfo; */
        const alert = document.createElement("div");
        alert.classList.add("alert", `alert-${type}`, "alert-dismissible", "fade", "show");
        alert.setAttribute("role", "alert");
        alert.innerHTML = `
           ${message}
         `;

        alertContainer.appendChild(alert);

        // Cierra la alerta automáticamente después de 5 segundos
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Mostrar el spinner cuando se realiza una solicitud al servidor
    function mostrarSpinner() {
       
        document.getElementById("spinnerContainer").style.display = "flex";
    }

    // Ocultar el spinner cuando se recibe la respuesta del servidor
    function ocultarSpinner() {
        document.getElementById("spinnerContainer").style.display = "none";
    }

});


