import Brand from '../models/Brand.js';

// @desc    Get all brands
// @route   GET /api/brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ status: 'active' });
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all brands (Admin)
// @route   GET /api/admin/brands
export const getAdminBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a brand (Admin)
// @route   POST /api/admin/brands
export const createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    const savedBrand = await brand.save();
    res.status(201).json({ success: true, data: savedBrand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a brand (Admin)
// @route   PUT /api/admin/brands/:id
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    Object.assign(brand, req.body);
    const updatedBrand = await brand.save();
    res.json({ success: true, data: updatedBrand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a brand (Admin)
// @route   DELETE /api/admin/brands/:id
export const deleteBrand = async (req, res) => {
  try {
    const result = await Brand.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, data: { message: 'Brand removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
