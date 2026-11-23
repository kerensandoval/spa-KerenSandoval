const express = require('express');
const mysql = require('mysql');
const app = express();

app.use("/css", express.static(__dirname + "/css"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/js", express.static(__dirname + "/js"));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DB = "spallin";
const config = { host: "127.0.0.1", user: "root", password: "" };

// 1) Conecta a MySQL, crea la base de datos y la tabla si no existen
const setup = mysql.createConnection(config);
setup.connect(function (err) {
    if (err) {
        console.log("No se pudo conectar a MySQL. Enciende MySQL en el panel de XAMPP.");
        console.log(err.message);
        process.exit(1);
    }
    setup.query("CREATE DATABASE IF NOT EXISTS " + DB + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", function (e1) {
        if (e1) { console.log(e1); process.exit(1); }
        setup.query("USE " + DB, function (e2) {
            if (e2) { console.log(e2); process.exit(1); }
            const tabla = "CREATE TABLE IF NOT EXISTS info (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "dni VARCHAR(15) NOT NULL," +
                "nombres VARCHAR(100) NOT NULL," +
                "correo VARCHAR(100) NOT NULL," +
                "celular VARCHAR(20) NOT NULL," +
                "fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            setup.query(tabla, function (e3) {
                if (e3) { console.log(e3); process.exit(1); }
                setup.end();
                console.log("Base de datos '" + DB + "' y tabla 'info' listas.");
                iniciarServidor();
            });
        });
    });
});

// 2) Levanta el servidor web
function iniciarServidor() {
    const conexion = mysql.createPool({ ...config, database: DB });

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.post("/validar", function (req, res) {
        const datos = req.body;
        console.log(datos);

        const registrar = "INSERT INTO info (dni, nombres, correo, celular) VALUES (?, ?, ?, ?)";
        conexion.query(registrar, [datos.dni, datos.nombres, datos.correo, datos.celular], function (error) {
            if (error) {
                console.log(error);
                return res.status(500).send("Error al guardar los datos: " + error.message);
            }
            console.log("datos almacenados corectamente");
            res.send("<script>alert('Datos enviados correctamente'); window.location='/';</script>");
        });
    });

    app.listen(3000, () => {
        console.log("Servidor creado corectamente");
        console.log("Abre http://localhost:3000");
    });
}
