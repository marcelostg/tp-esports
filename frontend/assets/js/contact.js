document.addEventListener('DOMContentLoaded', () => {
    const formContacto = document.getElementById('form-contacto');
    const mensajeEstado = document.getElementById('mensaje-estado');

    formContacto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button to prevent multiple clicks
        const btn = formContacto.querySelector('button');
        btn.disabled = true;
        btn.innerText = "ENVIANDO...";

        const datos = {
            nombre: document.getElementById('c-nombre').value,
            email: document.getElementById('c-email').value,
            mensaje: document.getElementById('c-mensaje').value
        };

        try {
            const url = "https://marcelostg.pythonanywhere.com/api/contact"; 
            
            const respuesta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                mensajeEstado.style.color = "#2B92AA";
                mensajeEstado.innerText = "¡Mensaje enviado con éxito!";
                formContacto.reset();
            } else {
                throw new Error(resultado.error || "Error al enviar");
            }
        } catch (error) {
            mensajeEstado.style.color = "#AF3817";
            mensajeEstado.innerText = "Error: No se pudo enviar el mensaje.";
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.innerText = "ENVIAR MENSAJE";
        }
    });
});