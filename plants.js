const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://fchapmane3:laneway123*@cluster0.zulzlfv.mongodb.net/vitagrowdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar:', err));

const plantSchema = new mongoose.Schema({
  name: String,
  humidity: Number
});

const Plant = mongoose.model('Plant', plantSchema);

async function run() {
  const newPlant = new Plant({ name: 'Tomate', humidity: 80 });
  await newPlant.save();
  console.log('🌱 Planta insertada:', newPlant);

  const plants = await Plant.find();
  console.log('📋 Plantas actuales en la DB:');
  plants.forEach(p => console.log(`- ${p.name} (${p.humidity}%)`));

  mongoose.connection.close();
}

run();
