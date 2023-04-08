const http = require('http');
const mongoose = require('mongoose');

const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model.js');

const PORT = process.env.PORT || 8000;

const MONGO_URL = 'mongodb+srv://nasa-api:FARfOHy5c80YgUuu@nasacluster.imejyrt.mongodb.net/nasa?retryWrites=true&w=majority';

const server = http.createServer(app);
mongoose.connection.once('open',()=>{
    console.log("Ready");
});
mongoose.connection.on('error',(err)=>{
    console.error (err)
});
async function startServer() {
    await mongoose.connect(MONGO_URL);
      
    await loadPlanetsData();
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`)
    });
};

startServer();
