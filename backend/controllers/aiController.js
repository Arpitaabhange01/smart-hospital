const { symptomChecker, summarizeReport, chatbot } = require('../utils/aiService');

exports.checkSymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Symptoms are required' });
    }
    const result = await symptomChecker(symptoms);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.summarize = async (req, res, next) => {
  try {
    const { reportText } = req.body;
    if (!reportText) {
      return res.status(400).json({ success: false, message: 'Report text is required' });
    }
    const result = await summarizeReport(reportText);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const result = await chatbot(message);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
