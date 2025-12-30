import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* CADASTRAR VINHO */
app.post("/vinhos", async (req, res) => {
  const { nome, pais, uva, tamanho, quantidade } = req.body;

  const result = await pool.query(
    "INSERT INTO vinhos (nome, pais, uva, tamanho, quantidade) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [nome, pais, uva, tamanho, quantidade]
  );

  res.json(result.rows[0]);
});

/* LISTAR TODOS */
app.get("/vinhos", async (req, res) => {
  const result = await pool.query("SELECT * FROM vinhos ORDER BY nome");
  res.json(result.rows);
});

/* BUSCAR */
/* BUSCA AVANÇADA */
app.get("/vinhos/busca", async (req, res) => {
  const {
    nome = "",
    pais = "",
    uva = "",
    tamanho = "",
    quantidade = ""
  } = req.query;

  const r = await pool.query(
    `SELECT * FROM vinhos
     WHERE nome ILIKE $1
       AND pais ILIKE $2
       AND uva ILIKE $3
       AND CAST(tamanho AS TEXT) ILIKE $4
       AND CAST(quantidade AS TEXT) ILIKE $5
     ORDER BY id`,
    [
      `%${nome}%`,
      `%${pais}%`,
      `%${uva}%`,
      `%${tamanho}%`,
      `%${quantidade}%`
    ]
  );

  res.json(r.rows);
});


/* ZERADOS */
app.get("/vinhos/zerados", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM vinhos WHERE quantidade = 0"
  );
  res.json(result.rows);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
/*editar*/
app.put("/vinhos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, pais, uva, tamanho, quantidade } = req.body;

  await pool.query(
    `
    UPDATE vinhos SET
      nome = COALESCE($1, nome),
      pais = COALESCE($2, pais),
      uva = COALESCE($3, uva),
      tamanho = COALESCE($4, tamanho),
      quantidade = COALESCE($5, quantidade),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    `,
    [nome, pais, uva, tamanho, quantidade, id]
  );

  res.sendStatus(200);
});

/*excluir*/
app.delete("/vinhos/:id", async (req, res) => {
  await pool.query("DELETE FROM vinhos WHERE id=$1", [req.params.id]);
  res.sendStatus(200);
});
