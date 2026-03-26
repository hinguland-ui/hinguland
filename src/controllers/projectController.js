import Project from '../models/Project.js';

// @route   GET /api/projects/public
export const getPublicProjects = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category } : {};
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all unique project categories
// @route   GET /api/projects/categories
export const getProjectCategories = async (req, res) => {
  try {
    const categories = await Project.distinct('category');
    // Filter out null/undefined/empty/whitespace and sort
    const filteredCategories = categories.filter(c => c && typeof c === 'string' && c.trim()).sort();
    res.json({ success: true, data: filteredCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single public project by slug
// @route   GET /api/projects/public/:slug
export const getPublicProject = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get home public projects
// @route   GET /api/projects/public/home
export const getHomeProjects = async (req, res) => {
  try {
    const projects = await Project.find({ is_on_home: true });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects (Admin)
// @route   GET /api/admin/projects
export const getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a project (Admin)
// @route   POST /api/admin/projects
export const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json({ success: true, data: savedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a project (Admin)
// @route   PUT /api/admin/projects/:id
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    Object.assign(project, req.body);
    const updatedProject = await project.save();
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a project (Admin)
// @route   DELETE /api/admin/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const result = await Project.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: { message: 'Project removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload project asset (Admin Compatibility)
// @route   POST /api/admin/projects/upload
export const uploadProjectAsset = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    // Frontend expects { success: true, url: '...' } based on ProjectModal.tsx
    res.json({ success: true, url: req.file.path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
