

# CS50x Final Project: TP Esports

#### Video Demo: https://youtu.be/dcZd3QxrcAY
#### Description:

## 1. Introduction and Motivation

The **TP Esports** project is the final result of a learning process that began with the fundamentals of C in the first weeks of CS50 and concluded with the creation of a full-stack web application. The core idea was born from a personal and community need: the world of competitive electronic sports (esports) often lacks platforms that go beyond just providing news. Players need a place to build a technical and visually appealing competitive identity.

This platform is not just a static website; it is a hybrid **Single Page Application (SPA)**. Its purpose is to centralize the user experience, allowing them to register, interact with dynamic news, and manage a detailed profile of their skills. The biggest challenge was integrating technologies not covered in depth during the course, such as Firebase, and connecting them with what I learned in the Python, SQL, and Flask modules.

## 2. Project Architecture

To build a tool that felt modern and fast, I decided to divide the system into three main layers: Frontend, Authentication, and Data Backend.

### A. Frontend: User Experience (HTML, CSS, and JS)
Instead of using complex frameworks, I chose Vanilla JavaScript. This was a conscious decision to consolidate the DOM manipulation knowledge learned in the final weeks of CS50.

* **Responsive Design:** I used **CSS Grid and Flexbox** to create a "Gaming-first" layout. The design is fully responsive (**Mobile First**), ensuring that a player can check news or their profile from a smartphone with the same comfort as on a PC.

* **Dynamic Features:** I implemented a manual "Dark Mode" system. It does not just change colors; it uses CSS variables and JavaScript to save the user's preference while they navigate. The homepage slider was also built from scratch, using logic in JS to handle opacity and transitions without external libraries.

### B. User Management: Firebase
One of the most important learning experiences outside of the standard CS50 curriculum was the implementation of **Firebase**.

* **Authentication:** I used Firebase Auth to manage registration and login. This allowed me to offer two entry paths: the traditional email and password method, and **OAuth integration with Google**. Implementing this required a deep understanding of JavaScript **Promises** and token management to ensure that only logged-in users could access specific functions of the dashboard.

* **Hosting:** The web application is hosted on Firebase Hosting, which ensures fast loading times thanks to its global content delivery network.

### C. Custom Backend: Python and Flask

Although Firebase can handle data, I decided to create a **Flask** backend to apply the Python concepts learned in the course. This API acts as the "brain" that stores competitive information.

* **Data Structure:** I used **SQLite** for the database. I created a users table that stores the unique ID from Firebase along with specific competitive data: rank (Platinum, Diamond, etc.), primary and secondary game roles, and nicknames.

* **API Logic:** The Flask server uses specific routes to receive data via `POST` and deliver it via `GET`. This required me to solve **CORS** (Cross-Origin Resource Sharing) issues, a concept I learned to allow my frontend to talk to my Python server securely.

## 3. Challenges and Solutions

The development process had several difficult moments. The most significant challenge was keeping the data synchronized between the external authentication (Firebase) and my local database (Flask).

* **The Registration Flow:** When a user signs up with Google, Firebase creates the account instantly, but my Python database doesn't know about them yet. I designed a logic in JavaScript that, after a successful login, checks if the user exists in my Flask API. If not, the frontend sends a signal to the backend to create a new entry with default values. This ensures that the user's competitive profile is always ready.

* **Emailing with SMTP:** I also wanted a functional contact form. Instead of using paid services, I implemented a solution in Python using the `smtplib` library. I configured an **SMTP server** with Gmail so that messages reach the team's inbox directly. This involved using environment variables to protect my credentials, a key security practice.

## 4. Detailed Features

* **Competitive Dashboard:** Once logged in, the user can edit their rank and game roles. This data is dynamic; when the user saves changes, JavaScript updates the interface without reloading the page, creating a smooth experience.

* **News System:** The main page features news cards using a grid that adapts to any screen. On mobile, images stack on top of the text, while on desktop, they alternate to create an organized visual flow.

* **Route Guards**: I implemented security checks in JS. If someone tries to manually access the profile page without being logged in, the script detects the missing Firebase token and redirects them to the login screen immediately.

## 5. Final Reflection

This project is the result of an intense journey through all the lessons of CS50x. From memory management in C to the complexity of a web application, it represents my growth as a programmer. **TP Esports** proves that with a solid foundation in algorithms and data structures, it is possible to learn new tools like Firebase and Flask to build real solutions. The project meets all the requirements, but more importantly, it shows my ability to solve problems by combining different languages into one working system.