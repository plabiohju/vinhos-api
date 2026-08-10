import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

/* ============================
   CADASTRAR VINHO
============================ */
app.post("/vinhos", async (req, res) => {
  try {
    const {
      nome,
      pais,
      uva,
      tamanho,
      quantidade,
      data,
      observacao
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vinhos
      (nome, pais, uva, tamanho, quantidade, data, observacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        nome,
        pais,
        uva,
        tamanho,
        quantidade,
        data,
        observacao
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Erro ao cadastrar vinho:", error);
    res.status(500).json({
      erro: "Erro ao cadastrar vinho"
    });
  }
});


/* ============================
   LISTAR TODOS OS VINHOS
============================ */
app.get("/vinhos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vinhos ORDER BY nome"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Erro ao listar vinhos:", error);
    res.status(500).json({
      erro: "Erro ao listar vinhos"
    });
  }
});


/* ============================
   BUSCA AVANÇADA
============================ */
app.get("/vinhos/busca", async (req, res) => {
  try {
    const {
      nome = "",
      pais = "",
      uva = "",
      tamanho = "",
      quantidade = "",
      data = "",
      observacao = ""
    } = req.query;

    const r = await pool.query(
      `SELECT * FROM vinhos
       WHERE nome ILIKE $1
         AND pais ILIKE $2
         AND uva ILIKE $3
         AND CAST(tamanho AS TEXT) ILIKE $4
         AND CAST(quantidade AS TEXT) ILIKE $5
         AND CAST(data AS TEXT) ILIKE $6
         AND observacao ILIKE $7
       ORDER BY id`,
      [
        `%${nome}%`,
        `%${pais}%`,
        `%${uva}%`,
        `%${tamanho}%`,
        `%${quantidade}%`,
        `%${data}%`,
        `%${observacao}%`
      ]
    );

    res.json(r.rows);

  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({
      erro: "Erro ao buscar vinhos"
    });
  }
});


/* ============================
   VINHOS ZERADOS
============================ */
app.get("/vinhos/zerados", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vinhos WHERE quantidade = 0"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Erro ao buscar vinhos zerados:", error);
    res.status(500).json({
      erro: "Erro ao buscar vinhos zerados"
    });
  }
});


/* ============================
   EDITAR VINHO
============================ */
app.put("/vinhos/:id", async (req, res) => {
  try {
    const {
      nome,
      pais,
      uva,
      tamanho,
      quantidade,
      data,
      observacao
    } = req.body;

    const result = await pool.query(
      `UPDATE vinhos SET
        nome = COALESCE($1, nome),
        pais = COALESCE($2, pais),
        uva = COALESCE($3, uva),
        tamanho = COALESCE($4, tamanho),
        quantidade = COALESCE($5, quantidade),
        data = COALESCE($6, data),
        observacao = COALESCE($7, observacao)
       WHERE id = $8
       RETURNING *`,
      [
        nome,
        pais,
        uva,
        tamanho,
        quantidade,
        data,
        observacao,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Vinho não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Erro ao editar vinho:", error);
    res.status(500).json({
      erro: "Erro ao editar vinho"
    });
  }
});


/* ============================
   EXCLUIR VINHO
============================ */
app.delete("/vinhos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM vinhos WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Vinho não encontrado"
      });
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro ao excluir vinho:", error);
    res.status(500).json({
      erro: "Erro ao excluir vinho"
    });
  }
});


/* ============================
   INICIAR SERVIDOR
============================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});