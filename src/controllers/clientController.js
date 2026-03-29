import Client from '../models/Client.js';

// Simple cache for clients
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};
const setCached = (key, data) => cache.set(key, { data, timestamp: Date.now() });
const invalidateCache = () => cache.clear();

// @desc    Get all clients
// @route   GET /api/clients
export const getClients = async (req, res) => {
  try {
    const cached = getCached('active_clients');
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    const clients = await Client.find({ status: 'active' }).lean();
    setCached('active_clients', clients);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all clients (Admin)
// @route   GET /api/admin/clients
export const getAdminClients = async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a client (Admin)
// @route   POST /api/admin/clients
export const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    invalidateCache();
    res.status(201).json({ success: true, data: savedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a client (Admin)
// @route   PUT /api/admin/clients/:id
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    Object.assign(client, req.body);
    const updatedClient = await client.save();
    invalidateCache();
    res.json({ success: true, data: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a client (Admin)
// @route   DELETE /api/admin/clients/:id
export const deleteClient = async (req, res) => {
  try {
    const result = await Client.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Client not found' });
    invalidateCache();
    res.json({ success: true, data: { message: 'Client removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
