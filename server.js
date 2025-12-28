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
app.get("/vinhos/busca", async (req, res) => {
  const { pais, uva } = req.query;

  const result = await pool.query(
    "SELECT * FROM vinhos WHERE pais ILIKE $1 AND uva ILIKE $2",
    [`%${pais || ""}%`, `%${uva || ""}%`]
  );

  res.json(result.rows);
});

/* ZERADOS */
app.get("/vinhos/zerados", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM vinhos WHERE quantidade = 0"
  );
  res.json(result.rows);
});

app.listen(3000, () =>
  console.log("API rodando em http://localhost:3000")
);
