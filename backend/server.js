const express = require('express');
const cors = require('cors');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());


app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('API do Emporio TSX está funcionando!');
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
