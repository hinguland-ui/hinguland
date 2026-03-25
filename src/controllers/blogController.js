import Blog from '../models/Blog.js';

// @desc    Get all blogs (Admin)
// @route   GET /api/admin/blogs
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all public blogs
// @route   GET /api/blogs/public
export const getPublicBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'public' }).sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by slug with Next/Prev
// @route   GET /api/blogs/public/:slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'public' });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Find Prev (Older)
    const prev = await Blog.findOne({ 
      createdAt: { $lt: blog.createdAt }, 
      status: 'public' 
    })
    .sort({ createdAt: -1 })
    .select('title slug thumbnail');

    // Find Next (Newer)
    const next = await Blog.findOne({ 
      createdAt: { $gt: blog.createdAt }, 
      status: 'public' 
    })
    .sort({ createdAt: 1 })
    .select('title slug thumbnail');

    res.json({ 
      success: true, 
      data: {
        ...blog._doc,
        prev,
        next
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new blog
// @route   POST /api/admin/blogs
export const createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const createdBlog = await blog.save();
    res.status(201).json({ success: true, data: createdBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/admin/blogs/:id
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/admin/blogs/:id
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'Blog removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload blog asset (Image)
export const uploadBlogAsset = async (req, res) => {
  try {
    if (req.file) {
      res.json({ success: true, data: { url: req.file.path } });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
