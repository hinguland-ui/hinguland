import Faq from '../models/Faq.js';

export const getFaqs = async (req, res) => {
  try {
    const filter = {};
    if (req.path.includes('public')) {
      filter.status = 'active';
    }
    const faqs = await Faq.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, category, status } = req.body;
    const faq = new Faq({ question, answer, category, status: status || 'active' });
    const createdFaq = await faq.save();
    res.status(201).json({ success: true, data: createdFaq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { question, answer, category, status } = req.body;
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.category = category || faq.category;
    faq.status = status || faq.status;

    const updatedFaq = await faq.save();
    res.json({ success: true, data: updatedFaq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await Faq.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'FAQ removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


