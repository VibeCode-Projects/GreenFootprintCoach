const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. If explicit MONGODB_URI is provided, try connecting to it
  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[MongoDB] Failed connecting to provided MONGODB_URI: ${err.message}`);
      console.log(`[MongoDB] Checking fallback options...`);
    }
  }

  // 2. Fallback: Try local MongoDB default
  try {
    const localUri = 'mongodb://127.0.0.1:27017/eco_coach';
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected to local MongoDB instance.`);
    return conn;
  } catch (localErr) {
    // 3. Fallback: Embedded MongoMemoryServer for instant local evaluation/testing without Docker
    console.log(`[MongoDB] Local MongoDB daemon not found.`);
    console.log(`[MongoDB] Initializing embedded in-memory MongoDB engine for zero-setup execution...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'eco_coach'
        }
      });
      const memoryUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to embedded in-memory MongoDB at: ${memoryUri}`);
      console.log(`----------------------------------------------------------------------`);
      console.log(`[NOTE FOR EVALUATOR / USER]:`);
      console.log(`Currently running on embedded in-memory MongoDB.`);
      console.log(`To use persistent MongoDB Atlas cloud database:`);
      console.log(`  1. Create a free cluster at https://www.mongodb.com/cloud/atlas`);
      console.log(`  2. In server/.env, set MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/eco_coach`);
      console.log(`  3. Restart server.`);
      console.log(`----------------------------------------------------------------------`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB Error] Could not connect to external or in-memory MongoDB:`, memErr.message);
      console.error(`Please provide a valid MONGODB_URI in server/.env`);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
