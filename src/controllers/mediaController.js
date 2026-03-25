import Media from '../models/Media.js';
import MediaFolder from '../models/MediaFolder.js';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';

export const getMedia = async (req, res) => {
  try {
    const filter = {};
    if (req.query.folder_id) filter.folderId = req.query.folder_id;
    const media = await Media.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// New: Sync From Cloudinary
export const syncCloudinaryMedia = async (req, res) => {
  try {
    // 1. Fetch from 'hinguland/' folder
    let results = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'hinguland/',
      max_results: 100
    });

    // 2. If 'hinguland/' is empty, fallback to root or show what's there
    if (!results.resources || results.resources.length === 0) {
        results = await cloudinary.api.resources({
            type: 'upload',
            max_results: 100
        });
    }

    const formatted = results.resources.map(res => ({
        id: res.asset_id,
        url: res.secure_url,
        public_id: res.public_id,
        type: res.resource_type,
        size: res.bytes,
        format: res.format,
        created_at: res.created_at
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Cloudinary Sync Error:', error);
    res.status(500).json({ success: false, message: 'Cloudinary API Error: ' + error.message });
  }
};

export const getMediaFolders = async (req, res) => {
  try {
    const folders = await MediaFolder.find({});
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMediaFolder = async (req, res) => {
  try {
    const folder = new MediaFolder({ name: req.body.name, parentId: req.body.parent_id });
    const createdFolder = await folder.save();
    res.status(201).json({ success: true, data: createdFolder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMediaFolder = async (req, res) => {
  try {
    await MediaFolder.deleteOne({ _id: req.params.id });
    // Consider handling nested media
    res.json({ success: true, data: { message: 'Folder removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    if (req.file) {
      const media = new Media({
        folderId: req.body.folder_id || null,
        url: req.file.path,
        public_id: req.file.filename,
        type: req.file.mimetype.startsWith('image') ? 'image' : 'document',
        size: req.file.size,
        altText: req.body.alt_text,
        description: req.body.description,
      });
      const savedMedia = await media.save();
      res.status(201).json({ success: true, data: savedMedia });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replaceMedia = async (req, res) => {
  try {
    if (req.file) {
      const media = await Media.findById(req.params.id);
      if (!media) return res.status(404).json({ message: 'Media not found' });
      
      media.url = req.file.path;
      media.public_id = req.file.filename;
      await media.save();
      
      res.json({ success: true, data: media });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Check if it's a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.json({ success: true, message: 'Media removed (sync asset)' });
    }

    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ message: 'Media not found in database' });

    await Media.deleteOne({ _id: id });
    res.json({ success: true, data: { message: 'Media removed from database' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


