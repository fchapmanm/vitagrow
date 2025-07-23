const mongoose = require('mongoose');
async function main() {
  try {
    await mongoose.connect('mongodb+srv://fchapmane3:laneway123*@cluster0.zulzlfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err);
  }
}

main();
