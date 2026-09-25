const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to resolve MongoDB SRV records reliably on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // fallback silently if custom DNS setting is restricted
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('[SPOTFIX Database Error] MONGO_URI environment variable is missing! Please set MONGO_URI in your Render Environment Variables dashboard.');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[SPOTFIX Database] MongoDB connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[SPOTFIX Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
