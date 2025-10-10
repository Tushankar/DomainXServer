import mongoose from "mongoose";

/**
 * =================================================================
 * Sub-Schemas for Form Builder
 * Using sub-schemas helps organize the complex nested structure
 * of the form configuration. {_id: false} is used because these
 * are embedded documents, not separate collections.
 * =================================================================
 */

// Schema for the options within a 'radio' or 'select' field
const OptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
}, { _id: false });

// Schema for a single field within a form step
const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox']
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  gridCol: {
    type: String,
    enum: ['full', 'half'],
    default: 'full'
  },
  options: [OptionSchema], // Array of Option sub-documents
}, { _id: false });

// Schema for a single step in the multi-step form
const StepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  backgroundImage: { type: String }, // This will store the URL to the uploaded image
  fields: [FieldSchema],         // Array of Field sub-documents
  buttonText: { type: String, default: 'Continue' },
}, { _id: false });

// Schema for branding settings
const BrandingSchema = new mongoose.Schema({
  logo: { type: String, default: 'domainX' },
  primaryColor: { type: String, default: '#3b82f6' },
  buttonColor: { type: String, default: '#9ca3af' },
}, { _id: false });

// Schema for social media links in the contact section
const SocialLinkSchema = new mongoose.Schema({
    platform: { type: String },
    url: { type: String },
    icon: { type: String } // You might want to remove this if icons are handled on the frontend
}, { _id: false });


// Schema for the entire contact section
const ContactSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  email: {
    address: { type: String },
    note: { type: String }
  },
  office: {
    address: { type: String },
    note: { type: String }
  },
  phone: {
    numbers: [String],
    note: { type: String }
  },
  social: {
    title: { type: String },
    links: [SocialLinkSchema]
  }
}, { _id: false });


/**
 * =================================================================
 * Main FormConfig Schema
 * This is the primary model that brings all the sub-schemas
 * together into a single, comprehensive document that perfectly
 * matches the state of your FormCMS component.
 * =================================================================
 */
const formConfigSchema = new mongoose.Schema(
  {
    // A unique identifier for the form. This is crucial if you ever
    // want to have more than one form on your site (e.g., 'contact-form', 'survey-form').
    formIdentifier: {
      type: String,
      required: true,
      unique: true,
      default: 'main-contact-form'
    },
    steps: [StepSchema],
    branding: BrandingSchema,
    contact: ContactSchema,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Create and export the model
const FormConfig = mongoose.model("FormConfig", formConfigSchema);

export default FormConfig;