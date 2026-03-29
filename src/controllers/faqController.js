import Faq from '../models/Faq.js';

// Simple cache for FAQs
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};
const setCached = (key, data) => cache.set(key, { data, timestamp: Date.now() });
const invalidateCache = () => cache.clear();

export const getFaqs = async (req, res) => {
  try {
    const isPublic = req.path.includes('public');
    const cacheKey = isPublic ? 'public_faqs' : 'all_faqs';
    
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    
    const filter = isPublic ? { status: 'active' } : {};
    const faqs = await Faq.find(filter).sort({ createdAt: -1 }).lean();
    
    setCached(cacheKey, faqs);
    res.setHeader('X-Cache', 'MISS');
    if (isPublic) res.setHeader('Cache-Control', 'public, max-age=300');
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
    invalidateCache();
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
    invalidateCache();
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
    invalidateCache();
    res.json({ success: true, data: { message: 'FAQ removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


