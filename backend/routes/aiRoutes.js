const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkSymptoms, summarize, chat } = require('../controllers/aiController');

router.use(protect);

router.post('/symptom-checker', checkSymptoms);
router.post('/summarize-report', summarize);
router.post('/chatbot', chat);

module.exports = router;
