import Project from '../models/Project.js';

// Simple in-memory cache for public APIs
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// @route   GET /api/projects/public
export const getPublicProjects = async (req, res) => {
  try {
    const { category } = req.query;
    const cacheKey = `projects_${category || 'all'}`;
    
    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    
    const filter = category && category !== 'all' ? { category } : {};
    // Use lean() for faster read-only queries and select only needed fields
    const projects = await Project.find(filter)
      .select('name slug description category status main_image gallery_images is_on_home')
      .sort({ createdAt: -1 })
      .lean();
    
    // Cache the results
    setCached(cacheKey, projects);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min browser cache
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all unique project categories
// @route   GET /api/projects/categories
export const getProjectCategories = async (req, res) => {
  try {
    const cacheKey = 'project_categories';
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    
    const categories = await Project.distinct('category');
    // Filter out null/undefined/empty/whitespace and sort
    const filteredCategories = categories.filter(c => c && typeof c === 'string' && c.trim()).sort();
    
    setCached(cacheKey, filteredCategories);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: filteredCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single public project by slug
// @route   GET /api/projects/public/:slug
export const getPublicProject = async (req, res) => {
  try {
    const cacheKey = `project_${req.params.slug}`;
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    
    const project = await Project.findOne({ slug: req.params.slug }).lean();
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    setCached(cacheKey, project);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get home public projects
// @route   GET /api/projects/public/home
export const getHomeProjects = async (req, res) => {
  try {
    const cacheKey = 'home_projects';
    const cached = getCached(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: cached });
    }
    
    const projects = await Project.find({ is_on_home: true })
      .select('name slug description category status main_image is_on_home')
      .lean();
    
    setCached(cacheKey, projects);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all projects (Admin)
// @route   GET /api/admin/projects
export const getAdminProjects = async (req, res) => {
  try {
    // Use lean() for faster queries, select only needed fields
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cache invalidation helper
const invalidateProjectCache = () => {
  // Clear all project-related caches
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.startsWith('projects_') || key.startsWith('project_') || key === 'home_projects' || key === 'project_categories') {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
};

// @desc    Create a project (Admin)
// @route   POST /api/admin/projects
export const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    // Invalidate cache after creation
    invalidateProjectCache();
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
    // Invalidate cache after update
    invalidateProjectCache();
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
    // Invalidate cache after deletion
    invalidateProjectCache();
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
