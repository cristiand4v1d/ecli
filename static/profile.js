document.addEventListener("DOMContentLoaded", function() {
    const profileContainer = document.getElementById("profile-container");
  
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
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } else {
      window.location.href = 'index.html';
    }
  });
  