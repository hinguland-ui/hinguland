import Setting from '../models/Setting.js';

// Simple cache for settings
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};
const setCached = (key, data) => cache.set(key, { data, timestamp: Date.now() });
const invalidateSettingsCache = () => cache.clear();

export const getSettings = async (req, res) => {
  try {
    const cached = getCached('all_settings');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    const settings = await Setting.find({}).lean();
    setCached('all_settings', settings);
    res.setHeader('X-Cache', 'MISS');
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSettingsByGroup = async (req, res) => {
  try {
    const cacheKey = `settings_group_${req.params.group}`;
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    const settings = await Setting.find({ group: req.params.group }).lean();
    setCached(cacheKey, settings);
    res.setHeader('X-Cache', 'MISS');
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    const cached = getCached('public_settings');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    const settings = await Setting.find({ group: { $in: ['general', 'seo'] } }).lean();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    setCached('public_settings', settingsObj);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');
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
    invalidateSettingsCache();
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
      invalidateSettingsCache();
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
      invalidateSettingsCache();
      res.json({ success: true, data: { url: faviconUrl } });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


