const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "checkobra",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
  } finally {
    connection.release();
  }
}

async function ensureObrasTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS obras (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      endereco VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'ativa',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureModelosChecklistTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modelos_checklist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      descricao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureItensChecklistTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS itens_checklist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      modelo_id INT NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      ordem INT NOT NULL DEFAULT 0,
      obrigatorio TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_itens_modelo
        FOREIGN KEY (modelo_id)
        REFERENCES modelos_checklist (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureInspecoesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inspecoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      obra_id INT NOT NULL,
      modelo_id INT NOT NULL,
      data_inspecao DATE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pendente',
      observacoes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_inspecoes_obra
        FOREIGN KEY (obra_id)
        REFERENCES obras (id)
        ON DELETE CASCADE,
      CONSTRAINT fk_inspecoes_modelo
        FOREIGN KEY (modelo_id)
        REFERENCES modelos_checklist (id)
        ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureRespostasInspecaoTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS respostas_inspecao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      inspecao_id INT NOT NULL,
      item_id INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'nao_aplicavel',
      observacao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_respostas_inspecao
        FOREIGN KEY (inspecao_id)
        REFERENCES inspecoes (id)
        ON DELETE CASCADE,
      CONSTRAINT fk_respostas_item
        FOREIGN KEY (item_id)
        REFERENCES itens_checklist (id)
        ON DELETE CASCADE,
      CONSTRAINT uq_resposta_item_por_inspecao
        UNIQUE (inspecao_id, item_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

module.exports = {
  pool,
  testDatabaseConnection,
  ensureObrasTable,
  ensureModelosChecklistTable,
  ensureItensChecklistTable,
  ensureInspecoesTable,
  ensureRespostasInspecaoTable,
};
