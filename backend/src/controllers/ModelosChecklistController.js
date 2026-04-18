const { pool } = require("../config/db");

// GET /modelos-checklist - Listar todos os modelos
exports.getModelos = async (req, res) => {
  try {
    const [modelos] = await pool.query("SELECT * FROM modelos_checklist");
    res.status(200).json(modelos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /modelos-checklist/:id - Buscar um modelo específico
exports.getModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const [modelo] = await pool.query("SELECT * FROM modelos_checklist WHERE id = ?", [id]);
    if (modelo.length === 0) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }
    res.status(200).json(modelo[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /modelos-checklist - Criar novo modelo
exports.createModelo = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }
    const [result] = await pool.query(
      "INSERT INTO modelos_checklist (nome, descricao) VALUES (?, ?)",
      [nome, descricao || null]
    );
    res.status(201).json({ id: result.insertId, nome, descricao });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /modelos-checklist/:id - Atualizar um modelo
exports.updateModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push("descricao = ?");
      values.push(descricao);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(id);
    const query = `UPDATE modelos_checklist SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }

    res.status(200).json({ message: "Modelo atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /modelos-checklist/:id - Deletar um modelo
exports.deleteModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM modelos_checklist WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }

    res.status(200).json({ message: "Modelo deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
