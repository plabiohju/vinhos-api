import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// CADASTRAR VINHO
// =====================================================

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

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Erro ao cadastrar:", error);

        res.status(500).json({
            erro: "Erro ao cadastrar vinho",
            detalhes: error.message
        });
    }
});


// =====================================================
// LISTAR TODOS OS VINHOS
// =====================================================

app.get("/vinhos", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM vinhos
             ORDER BY nome`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Erro ao listar:", error);

        res.status(500).json({
            erro: "Erro ao listar vinhos",
            detalhes: error.message
        });
    }
});


// =====================================================
// BUSCA AVANÇADA
// =====================================================

app.get("/vinhos/busca", async (req, res) => {
    try {

        const nome = req.query.nome || "";
        const pais = req.query.pais || "";
        const uva = req.query.uva || "";
        const tamanho = req.query.tamanho || "";
        const quantidade = req.query.quantidade || "";
        const data = req.query.data || "";
        const observacao = req.query.observacao || "";

        const result = await pool.query(
            `SELECT *
             FROM vinhos
             WHERE nome ILIKE $1
             AND pais ILIKE $2
             AND uva ILIKE $3
             AND CAST(tamanho AS TEXT) ILIKE $4
             AND CAST(quantidade AS TEXT) ILIKE $5
             AND CAST(data AS TEXT) ILIKE $6
             AND observacao ILIKE $7
             ORDER BY nome`,
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

        res.json(result.rows);

    } catch (error) {

        console.error("Erro na busca:", error);

        res.status(500).json({
            erro: "Erro ao buscar vinhos",
            detalhes: error.message
        });
    }
});


// =====================================================
// VINHOS ZERADOS
// =====================================================

app.get("/vinhos/zerados", async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT *
             FROM vinhos
             WHERE quantidade = 0
             ORDER BY nome`
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Erro ao buscar zerados:", error);

        res.status(500).json({
            erro: "Erro ao buscar vinhos zerados",
            detalhes: error.message
        });
    }
});


// =====================================================
// EDITAR VINHO
// =====================================================

app.put("/vinhos/:id", async (req, res) => {
    try {

        const { id } = req.params;

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
            `UPDATE vinhos
             SET
                nome = COALESCE(NULLIF($1, ''), nome),
                pais = COALESCE(NULLIF($2, ''), pais),
                uva = COALESCE(NULLIF($3, ''), uva),
                tamanho = COALESCE(NULLIF($4, ''), tamanho),
                quantidade = COALESCE($5, quantidade),
                data = COALESCE(NULLIF($6, ''), data),
                observacao = COALESCE(NULLIF($7, ''), observacao)
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
                id
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                erro: "Vinho não encontrado"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error("Erro ao editar:", error);

        res.status(500).json({
            erro: "Erro ao editar vinho",
            detalhes: error.message
        });
    }
});


// =====================================================
// EXCLUIR VINHO
// =====================================================

app.delete("/vinhos/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM vinhos
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                erro: "Vinho não encontrado"
            });
        }

        res.json({
            mensagem: "Vinho excluído com sucesso"
        });

    } catch (error) {

        console.error("Erro ao excluir:", error);

        res.status(500).json({
            erro: "Erro ao excluir vinho",
            detalhes: error.message
        });
    }
});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});