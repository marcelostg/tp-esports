from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

DB_FILE = os.path.join(os.path.dirname(__file__), 'tpesports.db')

# EMAIL CONFIGURATION (GMAIL)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
EMAIL_USER = "teamplasticvlr@gmail.com" 
EMAIL_PASS = "lgxd mmdu rfye slxc"

def crear_base_de_datos():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            uid TEXT PRIMARY KEY,
            correo TEXT NOT NULL,
            usuario TEXT,
            nickname TEXT,
            fecha_nacimiento TEXT,
            rango TEXT,
            rol_principal TEXT,
            rol_secundario TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# PROFILE API ROUTES

@app.route('/api/perfil', methods=['POST', 'OPTIONS'])
def guardar_perfil():
    # Handle browser preflight request (CORS Preflight)
    if request.method == 'OPTIONS':
        return jsonify({"mensaje": "ok"}), 200
        
    datos = request.json
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO users 
            (uid, correo, usuario, nickname, fecha_nacimiento, rango, rol_principal, rol_secundario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datos.get('uid'), datos.get('correo'), datos.get('usuario'),
            datos.get('nickname'), datos.get('fecha_nacimiento'),
            datos.get('rango'), datos.get('rol_principal'), datos.get('rol_secundario')
        ))
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Perfil actualizado correctamente"}), 200
    except Exception as e:
        print(f"Error en el servidor: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/perfil/<uid>', methods=['GET'])
def obtener_perfil(uid):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE uid = ?", (uid,))
        usuario = cursor.fetchone()
        conn.close()

        if usuario:
            return jsonify({
                "uid": usuario[0],
                "correo": usuario[1],
                "usuario": usuario[2],
                "nickname": usuario[3],
                "fecha_nacimiento": usuario[4],
                "rango": usuario[5],
                "rol_principal": usuario[6],
                "rol_secundario": usuario[7]
            }), 200
        return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# CONTACT API ROUTE

@app.route('/api/contacto', methods=['POST', 'OPTIONS'])
def enviar_contacto():
    if request.method == 'OPTIONS':
        return jsonify({"mensaje": "ok"}), 200
        
    datos = request.json
    nombre = datos.get('nombre')
    correo_cliente = datos.get('email')
    mensaje_cliente = datos.get('mensaje')

    try:
        # Configure the email message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = EMAIL_USER 
        msg['Subject'] = f"Nuevo contacto de {nombre} - TP Esports"

        cuerpo = f"Nombre: {nombre}\nCorreo: {correo_cliente}\n\nMensaje:\n{mensaje_cliente}"
        msg.attach(MIMEText(cuerpo, 'plain'))

        # Send via Gmail
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, EMAIL_USER, msg.as_string())

        return jsonify({"mensaje": "Correo enviado con éxito"}), 200
    except Exception as e:
        print(f"Error enviando correo: {e}")
        return jsonify({"error": "No se pudo enviar el correo"}), 500

# SERVER STARTUP

crear_base_de_datos()

if __name__ == '__main__':
    app.run(debug=True, port=5000)