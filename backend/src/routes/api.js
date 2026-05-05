const express = require("express");
const router = express.Router();

const ObrasController = require("../controllers/ObrasController");
const ModelosChecklistController = require("../controllers/ModelosChecklistController");
const ItensChecklistController = require("../controllers/ItensChecklistController");
const InspecoesController = require("../controllers/InspecoesController");
const RespostasInspecaoController = require("../controllers/RespostasInspecaoController");

// =====================
// Rotas de Obras
// =====================
router.get("/obras", ObrasController.getObras);
router.get("/obras/:id", ObrasController.getObra);
router.post("/obras", ObrasController.createObra);
router.put("/obras/:id", ObrasController.updateObra);
router.delete("/obras/:id", ObrasController.deleteObra);

// =====================
// Rotas de Modelos de Checklist
// =====================
router.get("/modelos-checklist", ModelosChecklistController.getModelos);
router.get("/modelos-checklist/:id", ModelosChecklistController.getModelo);
router.post("/modelos-checklist", ModelosChecklistController.createModelo);
router.put("/modelos-checklist/:id", ModelosChecklistController.updateModelo);
router.delete("/modelos-checklist/:id", ModelosChecklistController.deleteModelo);

// =====================
// Rotas de Itens de Checklist
// =====================
router.get("/itens-checklist", ItensChecklistController.getItens);
router.get("/itens-checklist/modelo/:modeloId", ItensChecklistController.getItensPorModelo);
router.get("/itens-checklist/:id", ItensChecklistController.getItem);
router.post("/itens-checklist", ItensChecklistController.createItem);
router.put("/itens-checklist/:id", ItensChecklistController.updateItem);
router.delete("/itens-checklist/:id", ItensChecklistController.deleteItem);

// =====================
// Rotas de Inspeções
// =====================
router.get("/inspecoes", InspecoesController.getInspecoes);
router.get("/inspecoes/obra/:obraId", InspecoesController.getInspecoesPorObra);
router.get("/inspecoes/:id", InspecoesController.getInspecao);
router.post("/inspecoes", InspecoesController.createInspecao);
router.put("/inspecoes/:id", InspecoesController.updateInspecao);
router.delete("/inspecoes/:id", InspecoesController.deleteInspecao);

// =====================
// Rotas de Respostas de Inspeção
// =====================
router.get("/respostas-inspecao", RespostasInspecaoController.getRespostas);
router.get("/respostas-inspecao/inspecao/:inspecaoId", RespostasInspecaoController.getRespostasPorInspecao);
router.get("/respostas-inspecao/:id", RespostasInspecaoController.getResposta);
router.post("/respostas-inspecao", RespostasInspecaoController.createResposta);
router.put("/respostas-inspecao/:id", RespostasInspecaoController.updateResposta);
router.delete("/respostas-inspecao/:id", RespostasInspecaoController.deleteResposta);

module.exports = router;
