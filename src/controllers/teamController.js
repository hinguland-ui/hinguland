import TeamMember from '../models/TeamMember.js';

export const getTeamMembers = async (req, res) => {
  try {
    const filter = {};
    if (req.originalUrl.includes('public')) {
      filter.status = 'active';
    }
    const members = await TeamMember.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeamMember = async (req, res) => {
  try {
    const { name, position, linkedin, twitter, instagram, status, image_url, order } = req.body;
    let image = {};
    
    if (req.file) {
      image = { url: req.file.path, public_id: req.file.filename };
    } else if (image_url) {
      image = { url: image_url, public_id: '' };
    }

    const member = new TeamMember({ 
      name, 
      position, 
      socialLinks: { linkedin, twitter, instagram }, 
      status: status || 'active',
      order: order || 0,
      image 
    });
    const createdMember = await member.save();
    res.status(201).json({ success: true, data: createdMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { name, position, linkedin, twitter, instagram, status, image_url, order } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Team member not found' });

    member.name = name || member.name;
    member.position = position || member.position;
    member.status = status || member.status;
    member.order = order !== undefined ? order : member.order;
    member.socialLinks = {
      linkedin: linkedin !== undefined ? linkedin : member.socialLinks.linkedin,
      twitter: twitter !== undefined ? twitter : member.socialLinks.twitter,
      instagram: instagram !== undefined ? instagram : member.socialLinks.instagram,
    };

    if (req.file) {
      member.image = { url: req.file.path, public_id: req.file.filename };
    } else if (image_url) {
      member.image = { url: image_url, public_id: '' };
    }

    const updatedMember = await member.save();
    res.json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    await TeamMember.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: { message: 'Team member removed' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
