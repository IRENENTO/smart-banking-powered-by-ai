const { chatWithAI } = require('../services/openai.service');

exports.chat = async (req, res) => {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ msg: 'A message is required.' });
    }

    const result = await chatWithAI(message, history || []);
    return res.json(result);
};
