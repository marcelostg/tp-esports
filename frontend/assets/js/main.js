// Import functions from the web (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,   
    onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAa9Z0jtmkqN4YCBQvRJs3EDZdJaPUKtQc",
    authDomain: "tp-esports-session.firebaseapp.com",
    projectId: "tp-esports-session",
    storageBucket: "tp-esports-session.firebasestorage.app",
    messagingSenderId: "388825523554",
    appId: "1:388825523554:web:55f55c53c255c4ad09b83b",
    measurementId: "G-BXRZ2K7SZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const API_URL = "https://marcelostg.pythonanywhere.com/api/perfil"; // PYTHONANYWHERE URL

provider.setCustomParameters({
    prompt: 'select_account'
});

// GENERIC FUNCTION TO LOAD COMPONENTS
async function cargarComponente(id, ruta) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(ruta);
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log(`${id} cargado exitosamente`);
    } catch (error) {
        console.error(`Error cargando el componente ${id}:`, error);
    }
}
// USER PROFILE MANAGEMENT FUNCTION
async function gestionarPerfilUsuario(user) {
    const pathActual = window.location.pathname;
    const enPerfil = pathActual.includes("perfil.html");
    const enLogin = pathActual.includes("login.html");

    // Always fill the email field if we are on the profile page
    if (enPerfil) {
        const pCorreo = document.getElementById('p-correo');
        if (pCorreo && user.email) {
            pCorreo.value = user.email;
            console.log("Correo de Firebase asignado al input.");
        }
    }

    try {
        console.log("Verificando datos en el servidor...");
        const response = await fetch(`${API_URL}/${user.uid}`);
        
        if (response.status === 404) {
            // User does not exist in the Python database
            console.log("Usuario nuevo detectado.");
            if (!enPerfil) window.location.href = "/pages/perfil.html";
        } 
        else if (response.ok) {
            // User exists, we receive their data
            const datos = await response.json();
            console.log("Datos recibidos:", datos);

            // If nickname is missing and not on profile page, force redirect
            if (!datos.nickname && !enPerfil) {
                window.location.href = "/pages/perfil.html";
                return;
            }

            // If profile is complete and on login page, send to home
            if (datos.nickname && enLogin) {
                window.location.href = "/index.html";
                return;
            }

            // If ALREADY on the profile page, fill the fields
            if (enPerfil) {
                console.log("Rellenando campos de perfil...");
                const fields = {
                    'p-nickname': datos.nickname,
                    'p-fecha-nac': datos.fecha_nacimiento,
                    'p-rango': datos.rango,
                    'p-rol-1': datos.rol_principal,
                    'p-rol-2': datos.rol_secundario,
                    'p-correo': user.email
                };

                console.log("el email tiene este valor: ", user.email);

                for (const [id, value] of Object.entries(fields)) {
                    const el = document.getElementById(id);
                    if (el) el.value = value || "";
                }
            }
        }
    } catch (error) {
        console.error("Error en la conexión con PythonAnywhere:", error);
    }
}

// SESSION STATE MANAGEMENT (Works on Index and Login)
onAuthStateChanged(auth, (user) => {
    // Use the existing interval to wait for the header fetch to finish
    const checkHeader = setInterval(() => {
        // Look for the container created in header.html
        const authContainer = document.getElementById('auth-header-container');
        
        if (authContainer) {
            clearInterval(checkHeader); 

            if (user) {
                
                // Manage redirection and data filling at once
                gestionarPerfilUsuario(user);

                const displayName = user.displayName || user.email.split('@')[0];

                // Add the name with a link to perfil.html
                authContainer.innerHTML = `
                    <div class="user-logged-info">
                        <a href="/pages/perfil.html" class="user-link-profile">
                            <span class="user-name">${displayName}</span>
                        </a>
                        <button id="btn-logout" class="btn-logout-style">Cerrar Sesión</button>
                    </div>
                `;

                // Logout Event
                document.getElementById('btn-logout').addEventListener('click', async () => {
                    try {
                        await signOut(auth);
                        window.location.href = "/index.html";
                    } catch (error) {
                        console.error("Error al cerrar sesión", error);
                    }
                });

            } else {
                // No active session (Original Login button)
                authContainer.innerHTML = `
                    <a href="/pages/login.html" class="btn-session" title="Crear / Acceder a tu cuenta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                            <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
                        </svg>
                    </a>
                `;
            }
        }
    }, 100); // Check every 100ms if the header has loaded
});


// FORM AND COMPONENTS LOGIC
document.addEventListener('DOMContentLoaded', () => {

    // Load the Header (this will automatically trigger onAuthStateChanged)
    cargarComponente('header-placeholder', '/components/header.html');
    // Load the Footer (only injects HTML)
    cargarComponente('footer-placeholder', '/components/footer.html');
    
    // ========================================================
    // ================PROFILE FORM LOGIC BLOCK================
    // ========================================================
    const formPerfil = document.getElementById('form-perfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get the user currently logged into Firebase
            const user = auth.currentUser; 
            if (!user) {
                alert("Debes iniciar sesión primero.");
                return;
            }

            // Collect data from perfil.html inputs
            const datosJugador = {
                uid: user.uid,
                correo: user.email,
                usuario: user.displayName || user.email.split('@')[0],
                nickname: document.getElementById('p-nickname').value,
                fecha_nacimiento: document.getElementById('p-fecha-nac').value,
                rango: document.getElementById('p-rango').value,
                rol_principal: document.getElementById('p-rol-1').value,
                rol_secundario: document.getElementById('p-rol-2').value
            };

            try {
                const response = await fetch("https://marcelostg.pythonanywhere.com/api/perfil", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosJugador)
                });

                if (response.ok) {
                    alert("¡Perfil guardado correctamente!");
                    window.location.href = "/index.html";
                } else {
                    alert("Error al guardar los datos en el servidor.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("No se pudo conectar con el servidor de Python.");
            }
        });
    }

    // ========================================================
    // =============LOGIN/REGISTER FORM BLOCK==================
    // ========================================================

    // Select elements only if they exist on the current page (login.html)
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tabLogin && tabRegister) {
        const switchTab = (type) => {
            [tabLogin, tabRegister].forEach(btn => btn.classList.remove('active'));
            [formLogin, formRegister].forEach(content => content.classList.remove('active'));

            if (type === 'login') {
                tabLogin.classList.add('active');
                formLogin.classList.add('active');
            } else {
                tabRegister.classList.add('active');
                formRegister.classList.add('active');
            }
        };

        tabLogin.addEventListener('click', () => switchTab('login'));
        tabRegister.addEventListener('click', () => switchTab('register'));
    }

    // Google Logic
    const btnGoogle = document.querySelector('.btn-google');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            try {
                await signInWithPopup(auth, provider);
                window.location.href = "/index.html";
            } catch (error) {
                alert("Error al conectar con Google.");
            }
        });
    }

    // Manual Registration Logic
    if (formRegister) {
        formRegister.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const pass = document.getElementById('reg-password').value;
            try {
                await createUserWithEmailAndPassword(auth, email, pass);
                alert("Cuenta creada exitosamente.");
                window.location.href = "/index.html";
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }

    // Manual Login Logic
    if (formLogin) {
        formLogin.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                window.location.href = "/index.html";
            } catch (error) {
                alert("Correo o contraseña incorrectos.");
            }
        });
    }
    
    // Banner Slider Logic
    const sliderItems = document.querySelectorAll('.slider-container a.slider-link');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    const sliderDotsContainer = document.querySelector('.slider-dots');

    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;

    function showSlide(index) {
        if (sliderItems.length === 0) return;
        
        sliderItems.forEach((item, i) => {
            item.classList.remove('active');
            if (sliderDotsContainer && sliderDotsContainer.children[i]) {
                sliderDotsContainer.children[i].classList.remove('active');
            }
        });

        sliderItems[index].classList.add('active');
        if (sliderDotsContainer && sliderDotsContainer.children[index]) {
            sliderDotsContainer.children[index].classList.add('active');
        }
        currentSlide = index;   
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % sliderItems.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + sliderItems.length) % sliderItems.length;
        showSlide(currentSlide);
    }

    // New function to handle manual clicks without jumping
    function handleManualControl(action) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        stopSlider(); // Stop auto-play

        if (action === 'next') nextSlide();
        else if (action === 'prev') prevSlide();
        else if (typeof action === 'number') showSlide(action);

        // Restart slider after action
        startSlider();

        // 0.8s lockout to match CSS transition and prevent "double jump"
        setTimeout(() => { isTransitioning = false; }, 800);
    }

    function startSlider() {
        // Safety check to ensure two timers don't exist at once
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); 
    }

    function stopSlider() {
        clearInterval(slideInterval);
        slideInterval = null; // Clear the reference
    }

    // Create navigation dots
    if (sliderDotsContainer && sliderItems.length > 0) {
        sliderItems.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('slider-dot');
            dot.addEventListener('click', () => handleManualControl(i));
            sliderDotsContainer.appendChild(dot);
        });
    }

    // Event Listeners with the new control function
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleManualControl('prev');
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleManualControl('next')
        });
    }

    // Start the slider
    if (sliderItems.length > 0) {
        showSlide(currentSlide);
        startSlider();

        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopSlider);
            sliderContainer.addEventListener('mouseleave', startSlider);
        }
    } 
    // ========================================================
    // =============DARK / LIGHT MODE LOGIC====================
    // ========================================================

    // Apply saved theme immediately (prevents flickering)
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    // Wait for the button to appear in the DOM
    const checkDarkModeBtn = setInterval(() => {
        const btnDarkMode = document.querySelector('.btn-darkmode');

        if (btnDarkMode) {
            clearInterval(checkDarkModeBtn); // Found it, stop searching

            btnDarkMode.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');

                // save preference
                if (document.body.classList.contains('light-mode')) {
                    localStorage.setItem('theme', 'light');
                } else {
                    localStorage.setItem('theme', 'dark');
                }
                console.log("Tema cambiado");
            });
        }
    }, 100); // Check every 100ms just like the auth-header

});