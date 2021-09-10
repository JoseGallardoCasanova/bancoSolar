const {Pool} = require("pg");

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

let agregarUsuario = (pool, nuevoUsuario) => {
    pool.connect(async (error_conexion, client) => {
        const SQLQuery = {
          rowMode: "array",
          text: "insert into usuarios (nombre, balance) values ($1, $2) RETURNING *;",
          values: nuevoUsuario,
        };
        try {
          const res = await client.query(SQLQuery);
          console.log("Ultimo registro agregado: ", res.rows);
        } catch (error) {
          console.log(error.code);
        }
      });
}

const consultaUsuario = async () => {
    try {
      const result = await pool.query("SELECT * FROM usuarios");  
      return result.rows;  
    } catch (error) {  
      console.log(error.code);
      return error;  
    } 
  }

  const editarUsuario = (pool, editar) => {
    pool.connect(async (error_conexion, client) => {
      const SQLQuery = {
        rowMode: "array",
        text: `UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *;`,
        values: editar,
      };
      try {
        const res = await client.query(SQLQuery);
        console.log("Registro Editado: ", res.rows);
        return(res.rows)
      } catch (error) {
        console.log(error.code);
      }
      pool.end()
    });
  }

  let eliminarUsuario = async (pool, id) => {
    pool.connect(async (error_conexion, client) => {
        try {
            const res = await client.query(`delete from usuarios where id = ${id}`);
            console.log("Usuario Eliminado: ", res.rows);
            return(res.rows)
          } catch (error) {
            console.log(error.code);
          }
    });
    pool.end()
  }

  let transferencia = (pool, nuevaTransferencia) => {
    pool.connect(async (error_conexion, client) => {
      try {
        await client.query("BEGIN")
        const sumaSaldo = `UPDATE usuarios set balance = balance + ${nuevaTransferencia[2]} where nombre = '${nuevaTransferencia[1]}';`;
        await client.query(sumaSaldo);
        const restaSaldo = `UPDATE usuarios set balance = balance - ${nuevaTransferencia[2]} where nombre = '${nuevaTransferencia[0]}';`;
        await client.query(restaSaldo);
        const transfer = `insert into transferencias (emisor, receptor, monto, fecha) values ((select id from usuarios where nombre = '${nuevaTransferencia[0]}'), (select id from usuarios where nombre = '${nuevaTransferencia[1]}'), ${nuevaTransferencia[2]}, now());`;
        await client.query(transfer);
        await client.query("COMMIT")
      } catch (error) {
        console.log(error.code);
        await client.query("ROLLBACK")

      }
      });
  }

  const consultaTransferencia = async () => {
    try {
      const consulta = {
        rowMode: "array",
        text: `SELECT (select nombre from usuarios where id = emisor) as emisor, (select nombre from usuarios where id = receptor) as receptor, monto, fecha FROM transferencias;`,
      };
      await client.query(consulta);
    } catch (error) {  
      console.log(error.code);
      return error;  
    } 
  }

module.exports = {agregarUsuario, consultaUsuario, editarUsuario, eliminarUsuario, transferencia, consultaTransferencia}
