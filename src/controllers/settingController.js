import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSettingsByGroup = async (req, res) => {
  try {
    const settings = await Setting.find({ group: req.params.group });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.find({ group: { $in: ['general', 'seo'] } });
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    // Expecting array of { key, value }
    const settingsData = req.body;
    for (const setting of settingsData) {
      await Setting.findOneAndUpdate(
        { key: setting.key },
        { value: setting.value, group: setting.group || 'general' },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true, data: { message: 'Settings updated' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (req.file) {
      const logoUrl = req.file.path;
      await Setting.findOneAndUpdate({ key: 'site_logo' }, { value: logoUrl, group: 'general' }, { upsert: true });
      res.json({ success: true, data: { url: logoUrl } });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadFavicon = async (req, res) => {
  try {
    if (req.file) {
      const faviconUrl = req.file.path;
      await Setting.findOneAndUpdate({ key: 'site_favicon' }, { value: faviconUrl, group: 'general' }, { upsert: true });
      res.json({ success: true, data: { url: faviconUrl } });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


