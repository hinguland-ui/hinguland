import Page from '../models/Page.js';

export const getPages = async (req, res) => {
  try {
    const pages = await Page.find({});
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicPages = async (req, res) => {
  try {
    const pages = await Page.find({ status: 'published' });
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPage = async (req, res) => {
  try {
    const page = new Page(req.body);
    const createdPage = await page.save();
    res.status(201).json({ success: true, data: createdPage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    await Page.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'Page removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


