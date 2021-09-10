const {Pool} = require("pg");
const axios = require('axios');
const fs = require("fs");
const http = require("http");
const url = require("url")

const {agregarUsuario, consultaUsuario, editarUsuario, eliminarUsuario, transferencia, consultaTransferencia} = require("./funciones")

const config = {
    user: "postgres",
    host: "localhost",
    password: "7u8i9o0p",
    database: "bancosolar",
    port: 5432,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
  };

  const pool = new Pool(config);
  
  http.
createServer((req, res) => {

    if (req.url == "/" && req.method == "GET") {
        res.setHeader("Content-Type", "text/html");
        res.end(fs.readFileSync("index.html", "utf8"));
    }

    if (req.url.startsWith("/usuario") && req.method == "POST") {
        let body;
        req.on("data", (payload) => {
            body = JSON.parse(payload);
        });
        req.on("end", () => {
           nuevoUsuario = [
                 body.nombre,
                 body.balance,
        ];
            console.log(nuevoUsuario)
            agregarUsuario(pool, nuevoUsuario)
            res.end();
        }); 
    }

    if (req.url.startsWith("/usuario") && req.method == "GET") {
        consultaUsuario().then((resultado) => {
            res.end(JSON.stringify(resultado))
        }).catch(err => console.error(err))
        }

    if (req.url.startsWith("/usuario?id=") && req.method == "PUT") {
        let body;
        req.on("data", (payload) => {
            body = JSON.parse(payload);
        });
        req.on("end", () => {
           editar = [
                 body.id,
                 body.name,
                 body.balance,
        ];
            console.log(editar)
            editarUsuario(pool, editar)
            res.end();
        });
    }

    if (req.url.startsWith("/usuario?id=") && req.method == "DELETE") {
        const { id } = url.parse(req.url, true).query;
        eliminarUsuario(pool, id)
        res.end();
        }

if (req.url.startsWith("/transferencia") && req.method == "POST") {
    let body;
    req.on("data", (payload) => {
        body = JSON.parse(payload);
    });

    req.on("end", () => {
        nuevaTransferencia = [
                body.emisor,
                body.receptor,
                body.monto,
    ];
        console.log(nuevaTransferencia)
        transferencia(pool, nuevaTransferencia)
        res.end();
    }); 
}

if (req.url.startsWith("/transferencias") && req.method == "GET") {
    consultaTransferencia().then((resultado) => {
        res.end(JSON.stringify(resultado))
    }).catch(err => console.error(err))
    }

}).listen(3000, console.log("Servidor Activo"))