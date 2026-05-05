const { pool } = require("../config/db");

// GET /respostas-inspecao - Listar todas as respostas
exports.getRespostas = async (req, res) => {
  try {
    const [respostas] = await pool.query("SELECT * FROM respostas_inspecao");
    res.status(200).json(respostas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /respostas-inspecao/:id - Buscar uma resposta específica
exports.getResposta = async (req, res) => {
  try {
    const { id } = req.params;
    const [resposta] = await pool.query("SELECT * FROM respostas_inspecao WHERE id = ?", [id]);
    if (resposta.length === 0) {
      return res.status(404).json({ error: "Resposta não encontrada" });
    }
    res.status(200).json(resposta[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /respostas-inspecao/inspecao/:inspecaoId - Listar respostas de uma inspeção
exports.getRespostasPorInspecao = async (req, res) => {
  try {
    const { inspecaoId } = req.params;
    const [respostas] = await pool.query(
      "SELECT * FROM respostas_inspecao WHERE inspecao_id = ?",
      [inspecaoId]
    );
    res.status(200).json(respostas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /respostas-inspecao - Criar nova resposta
exports.createResposta = async (req, res) => {
  try {
    const { inspecao_id, item_id, status, observacao } = req.body;
    if (!inspecao_id || !item_id || !status) {
      return res.status(400).json({ 
        error: "inspecao_id, item_id e status são obrigatórios" 
      });
    }
    const [result] = await pool.query(
      "INSERT INTO respostas_inspecao (inspecao_id, item_id, status, observacao) VALUES (?, ?, ?, ?)",
      [inspecao_id, item_id, status, observacao || null]
    );
    res.status(201).json({ 
      id: result.insertId, 
      inspecao_id, 
      item_id, 
      status, 
      observacao 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /respostas-inspecao/:id - Atualizar uma resposta
exports.updateResposta = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacao } = req.body;
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (observacao !== undefined) {
      updates.push("observacao = ?");
      values.push(observacao);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(id);
    const query = `UPDATE respostas_inspecao SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Resposta não encontrada" });
    }

    res.status(200).json({ message: "Resposta atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /respostas-inspecao/:id - Deletar uma resposta
exports.deleteResposta = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM respostas_inspecao WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Resposta não encontrada" });
    }

    res.status(200).json({ message: "Resposta deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
