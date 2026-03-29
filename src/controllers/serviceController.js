import Service from '../models/Service.js';

// Simple cache for services
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};
const setCached = (key, data) => cache.set(key, { data, timestamp: Date.now() });
const invalidateCache = () => cache.clear();

// @desc    Get all services
// @route   GET /api/services
export const getServices = async (req, res) => {
  try {
    const cached = getCached('services');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    const services = await Service.find({}).lean();
    setCached('services', services);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all services (Admin)
// @route   GET /api/admin/services
export const getAdminServices = async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a service (Admin)
// @route   POST /api/admin/services
export const createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    const savedService = await service.save();
    invalidateCache();
    res.status(201).json({ success: true, data: savedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a service (Admin)
// @route   PUT /api/admin/services/:id
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    Object.assign(service, req.body);
    const updatedService = await service.save();
    invalidateCache();
    res.json({ success: true, data: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service (Admin)
// @route   DELETE /api/admin/services/:id
export const deleteService = async (req, res) => {
  try {
    const result = await Service.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    invalidateCache();
    res.json({ success: true, data: { message: 'Service removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
