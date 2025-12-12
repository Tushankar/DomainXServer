import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  icon: String
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox']
  },
  label: { type: String, required: true },
  placeholder: String,
  required: { type: Boolean, default: false },
  gridCol: { 
    type: String, 
    enum: ['full', 'half'],
    default: 'full'
  },
  options: [optionSchema]
}, { _id: false });

const stepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  backgroundImage: String,
  fields: [fieldSchema],
  buttonText: { type: String, default: 'Continue' }
}, { _id: false });

const brandingSchema = new mongoose.Schema({
  logo: { type: String, default: ' Domainsxchange' },
  primaryColor: { type: String, default: '#3b82f6' },
  buttonColor: { type: String, default: '#9ca3af' }
}, { _id: false });

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, default: 'globe' }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  title: { type: String, default: 'Contact Us' },
  subtitle: { type: String, default: 'Contact the support team at Asme.' },
  email: {
    address: { type: String, default: 'mail@example.com' },
    note: { type: String, default: 'We respond to all emails within 24 hours.' }
  },
  office: {
    address: { type: String, default: 'Office # 100, 101 Second Floor\nKohinoor 1, Faisalabad, Pakistan' },
    note: { type: String, default: 'Drop by our office for a chat.' }
  },
  phone: {
    numbers: { type: [String], default: ['+92 300 1234567', '+92 321 9876543'] },
    note: { type: String, default: "We're available Mon-Fri, 9am-5pm." }
  },
  social: {
    title: { type: String, default: 'Find us online' },
    links: [socialLinkSchema]
  }
}, { _id: false });

const formConfigSchema = new mongoose.Schema({
  steps: {
    type: [stepSchema],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one step is required'
    }
  },
  branding: {
    type: brandingSchema,
    default: () => ({})
  },
  contact: {
    type: contactSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, {
  timestamps: true
});

// Ensure only one active configuration exists
formConfigSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('FormConfig').updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { isActive: false }
    );
  }
  next();
});

const FormConfig = mongoose.model('FormConfig', formConfigSchema);

export default FormConfig;
