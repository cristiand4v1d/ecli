const apiUrl = "http://localhost:3000"
/* const apiUrl = "https://ecli.onrender.com" */

document.addEventListener("DOMContentLoaded", function () {
    const profileContainer = document.getElementById("user-profile");
    const sel1 = document.getElementById("field1");
    const logoutButton = document.getElementById("logout-button");
    const updateButton = document.getElementById("update-button");
    const dropdown1 = document.getElementById("dropdown1");
    const dropdown2 = document.getElementById("dropdown2");
    const alertContainer = document.querySelector(".alert-container");
    let selected
    let intereses_selected
    let selectedValueDropdown1
    let selectedValueDropdown2

    

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
        console.log("lemus")
        document.getElementById("spinnerContainer").style.display = "flex";
    }

    // Ocultar el spinner cuando se recibe la respuesta del servidor
    function ocultarSpinner() {
        document.getElementById("spinnerContainer").style.display = "none";
    }
})