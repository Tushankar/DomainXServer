import FormConfig from '../models/FormConfig.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get active form configuration
export const getFormConfig = async (req, res) => {
  try {
    let config = await FormConfig.findOne({ isActive: true });
    
    // If no config exists, create default one
    if (!config) {
      config = await FormConfig.create({
        steps: [
          {
            id: 'step1',
            title: 'Talk to our data analytics experts',
            backgroundImage: '',
            fields: [
              {
                id: 'firstName',
                type: 'text',
                label: 'First name',
                placeholder: 'Enter your first name',
                required: true,
                gridCol: 'half'
              },
              {
                id: 'lastName',
                type: 'text',
                label: 'Last name',
                placeholder: 'Enter your last name',
                required: true,
                gridCol: 'half'
              },
              {
                id: 'email',
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email address',
                required: true,
                gridCol: 'full'
              }
            ],
            buttonText: 'Continue'
          }
        ],
        branding: {
          logo: ' Domainsxchange',
          primaryColor: '#3b82f6',
          buttonColor: '#9ca3af'
        },
        contact: {
          title: 'Contact Us',
          subtitle: 'Contact the support team at Asme.',
          email: {
            address: 'mail@example.com',
            note: 'We respond to all emails within 24 hours.'
          },
          office: {
            address: 'Office # 100, 101 Second Floor\nKohinoor 1, Faisalabad, Pakistan',
            note: 'Drop by our office for a chat.'
          },
          phone: {
            numbers: ['+92 300 1234567', '+92 321 9876543'],
            note: "We're available Mon-Fri, 9am-5pm."
          },
          social: {
            title: 'Find us online',
            links: [
              { platform: 'GitHub', url: 'https://github.com', icon: 'github' },
              { platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
              { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
              { platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram' }
            ]
          }
        },
        isActive: true
      });
    }

    res.status(200).json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form configuration',
      error: error.message
    });
  }
};

// Save/Update form configuration
export const saveFormConfig = async (req, res) => {
  try {
    const { steps, branding, contact } = req.body;

    // Validate required fields
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one step is required'
      });
    }

    // Find active config or create new one
    let config = await FormConfig.findOne({ isActive: true });
    
    if (config) {
      // Update existing config
      config.steps = steps;
      config.branding = branding || config.branding;
      config.contact = contact || config.contact;
      config.lastModifiedBy = req.admin?._id; // From auth middleware
      await config.save();
    } else {
      // Create new config
      config = await FormConfig.create({
        steps,
        branding,
        contact,
        isActive: true,
        lastModifiedBy: req.admin?._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Form configuration saved successfully',
      config: config
    });
  } catch (error) {
    console.error('Error saving form config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save form configuration',
      error: error.message
    });
  }
};

// Upload background image
export const uploadBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const stepIndex = req.body.stepIndex;
    
    // Construct the URL path for the uploaded image
    const imageUrl = `/uploads/backgrounds/${req.file.filename}`;

    // Optionally, update the database if stepIndex is provided
    if (stepIndex !== undefined) {
      const config = await FormConfig.findOne({ isActive: true });
      
      if (config && config.steps[stepIndex]) {
        // Delete old background image if exists
        if (config.steps[stepIndex].backgroundImage) {
          const oldImagePath = path.join(__dirname, '..', 'public', config.steps[stepIndex].backgroundImage);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.log('Old image not found or already deleted');
          }
        }

        config.steps[stepIndex].backgroundImage = imageUrl;
        await config.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Background image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload background image',
      error: error.message
    });
  }
};

// Delete background image
export const deleteBackground = async (req, res) => {
  try {
    const { stepIndex } = req.params;
    
    const config = await FormConfig.findOne({ isActive: true });
    
    if (!config || !config.steps[stepIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      });
    }

    // Delete the image file
    if (config.steps[stepIndex].backgroundImage) {
      const imagePath = path.join(__dirname, '..', 'public', config.steps[stepIndex].backgroundImage);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Image file not found or already deleted');
      }
    }

    config.steps[stepIndex].backgroundImage = '';
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Background image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting background:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete background image',
      error: error.message
    });
  }
};

// Get form config history (optional)
export const getConfigHistory = async (req, res) => {
  try {
    const configs = await FormConfig.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('lastModifiedBy', 'email');

    res.status(200).json({
      success: true,
      configs: configs
    });
  } catch (error) {
    console.error('Error fetching config history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration history',
      error: error.message
    });
  }
};
