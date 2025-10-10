import FormConfig from "../models/formConfig.model";

// Example Controller Logic
export const getFormConfig = async (req, res) => {
    try {
        const { identifier } = req.params;
        const config = await FormConfig.findOne({ formIdentifier: identifier });
        if (!config) {
            // Optional: Create a default config if one doesn't exist
            const defaultConfig = new FormConfig({ formIdentifier: identifier });
            await defaultConfig.save();
            return res.status(200).json({ success: true, config: defaultConfig });
        }
        res.status(200).json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Example Controller Logic
export const updateFormConfig = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updatedConfig = await FormConfig.findOneAndUpdate(
            { formIdentifier: identifier },
            req.body, // The entire formConfig object from your React state
            { new: true, upsert: true, runValidators: true } // upsert:true creates it if it doesn't exist
        );
        res.status(200).json({ success: true, message: 'Configuration saved!', config: updatedConfig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};