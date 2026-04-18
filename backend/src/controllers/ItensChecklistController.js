const { pool } = require("../config/db");

// GET /itens-checklist - Listar todos os itens
exports.getItens = async (req, res) => {
  try {
    const [itens] = await pool.query("SELECT * FROM itens_checklist");
    res.status(200).json(itens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /itens-checklist/:id - Buscar um item específico
exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [item] = await pool.query("SELECT * FROM itens_checklist WHERE id = ?", [id]);
    if (item.length === 0) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    res.status(200).json(item[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /itens-checklist/modelo/:modeloId - Listar itens de um modelo
exports.getItensPorModelo = async (req, res) => {
  try {
    const { modeloId } = req.params;
    const [itens] = await pool.query(
      "SELECT * FROM itens_checklist WHERE modelo_id = ? ORDER BY ordem",
      [modeloId]
    );
    res.status(200).json(itens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /itens-checklist - Criar novo item
exports.createItem = async (req, res) => {
  try {
    const { modelo_id, descricao, ordem, obrigatorio } = req.body;
    if (!modelo_id || !descricao) {
      return res.status(400).json({ error: "modelo_id e descricao são obrigatórios" });
    }
    const [result] = await pool.query(
      "INSERT INTO itens_checklist (modelo_id, descricao, ordem, obrigatorio) VALUES (?, ?, ?, ?)",
      [modelo_id, descricao, ordem || 0, obrigatorio || false]
    );
    res.status(201).json({ 
      id: result.insertId, 
      modelo_id, 
      descricao, 
      ordem: ordem || 0, 
      obrigatorio: obrigatorio || false 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /itens-checklist/:id - Atualizar um item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, ordem, obrigatorio } = req.body;
    const updates = [];
    const values = [];

    if (descricao !== undefined) {
      updates.push("descricao = ?");
      values.push(descricao);
    }
    if (ordem !== undefined) {
      updates.push("ordem = ?");
      values.push(ordem);
    }
    if (obrigatorio !== undefined) {
      updates.push("obrigatorio = ?");
      values.push(obrigatorio);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(id);
    const query = `UPDATE itens_checklist SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    res.status(200).json({ message: "Item atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /itens-checklist/:id - Deletar um item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM itens_checklist WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    res.status(200).json({ message: "Item deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
