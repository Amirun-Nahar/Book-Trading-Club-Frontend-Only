import mongoose from 'mongoose';
import 'dotenv/config';
export const connectDB = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) return; // already connected
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚠️  MONGODB_URI not found in environment variables');
      console.log('⚠️  Please create a .env file with MONGODB_URI=mongodb+srv://...');
      console.log('⚠️  Server will start but favorites functionality will not work');
      return;
    }
    
    await mongoose.connect(mongoUri);
    console.log('MONGODB CONNECTED SUCCESSFULLY ✅');
  } catch (error) {
    console.log('ERROR CONNECTING TO MONGODB', error);
    console.log('⚠️  Server will start but favorites functionality will not work');
    // Don't throw error to allow server to start without MongoDB
  }
};  
