const mongoose = require('mongoose');

// Test MongoDB connection
async function testMongoConnection() {
  try {
    console.log('🔄 Đang kết nối MongoDB...');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/chatbox', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Kết nối MongoDB thành công!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
    console.log('🚪 Port:', mongoose.connection.port);

    // Test basic operations
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      '📁 Collections:',
      collections.map((c) => c.name),
    );

    // Close connection
    await mongoose.connection.close();
    console.log('🔒 Đã đóng kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
}

testMongoConnection();
