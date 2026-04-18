const { pool } = require("../config/db");

// GET /inspecoes - Listar todas as inspeções
exports.getInspecoes = async (req, res) => {
  try {
    const [inspecoes] = await pool.query("SELECT * FROM inspecoes");
    res.status(200).json(inspecoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /inspecoes/:id - Buscar uma inspeção específica
exports.getInspecao = async (req, res) => {
  try {
    const { id } = req.params;
    const [inspecao] = await pool.query("SELECT * FROM inspecoes WHERE id = ?", [id]);
    if (inspecao.length === 0) {
      return res.status(404).json({ error: "Inspeção não encontrada" });
    }
    res.status(200).json(inspecao[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /inspecoes/obra/:obraId - Listar inspeções de uma obra
exports.getInspecoesPorObra = async (req, res) => {
  try {
    const { obraId } = req.params;
    const [inspecoes] = await pool.query(
      "SELECT * FROM inspecoes WHERE obra_id = ? ORDER BY data_inspecao DESC",
      [obraId]
    );
    res.status(200).json(inspecoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /inspecoes - Criar nova inspeção
exports.createInspecao = async (req, res) => {
  try {
    const { obra_id, modelo_id, data_inspecao, status, observacoes } = req.body;
    if (!obra_id || !modelo_id || !data_inspecao) {
      return res.status(400).json({ 
        error: "obra_id, modelo_id e data_inspecao são obrigatórios" 
      });
    }
    const [result] = await pool.query(
      "INSERT INTO inspecoes (obra_id, modelo_id, data_inspecao, status, observacoes) VALUES (?, ?, ?, ?, ?)",
      [obra_id, modelo_id, data_inspecao, status || "em_progresso", observacoes || null]
    );
    res.status(201).json({ 
      id: result.insertId, 
      obra_id, 
      modelo_id, 
      data_inspecao, 
      status: status || "em_progresso", 
      observacoes 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /inspecoes/:id - Atualizar uma inspeção
exports.updateInspecao = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (observacoes !== undefined) {
      updates.push("observacoes = ?");
      values.push(observacoes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(id);
    const query = `UPDATE inspecoes SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Inspeção não encontrada" });
    }

    res.status(200).json({ message: "Inspeção atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /inspecoes/:id - Deletar uma inspeção
exports.deleteInspecao = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM inspecoes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Inspeção não encontrada" });
    }

    res.status(200).json({ message: "Inspeção deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
