const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.json());

//Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Sweeted BACK END !');
});

//Demarrer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is executing at PORT: ${PORT}`);
});
