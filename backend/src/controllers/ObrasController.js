const { pool } = require("../config/db");

// GET /obras - Listar todas as obras
exports.getObras = async (req, res) => {
  try {
    const [obras] = await pool.query("SELECT * FROM obras");
    res.status(200).json(obras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /obras/:id - Buscar uma obra específica
exports.getObra = async (req, res) => {
  try {
    const { id } = req.params;
    const [obra] = await pool.query("SELECT * FROM obras WHERE id = ?", [id]);
    if (obra.length === 0) {
      return res.status(404).json({ error: "Obra não encontrada" });
    }
    res.status(200).json(obra[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /obras - Criar nova obra
exports.createObra = async (req, res) => {
  try {
    const { nome, endereco, status } = req.body;
    if (!nome || !endereco) {
      return res.status(400).json({ error: "Nome e endereço são obrigatórios" });
    }
    const [result] = await pool.query(
      "INSERT INTO obras (nome, endereco, status) VALUES (?, ?, ?)",
      [nome, endereco, status || "planejamento"]
    );
    res.status(201).json({ id: result.insertId, nome, endereco, status: status || "planejamento" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /obras/:id - Atualizar uma obra
exports.updateObra = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, status } = req.body;
    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      values.push(nome);
    }
    if (endereco !== undefined) {
      updates.push("endereco = ?");
      values.push(endereco);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    values.push(id);
    const query = `UPDATE obras SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Obra não encontrada" });
    }

    res.status(200).json({ message: "Obra atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /obras/:id - Deletar uma obra
exports.deleteObra = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM obras WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Obra não encontrada" });
    }

    res.status(200).json({ message: "Obra deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
