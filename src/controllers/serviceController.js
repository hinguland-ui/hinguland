import Service from '../models/Service.js';

// @desc    Get all services
// @route   GET /api/services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all services (Admin)
// @route   GET /api/admin/services
export const getAdminServices = async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
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
    res.json({ success: true, data: { message: 'Service removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
