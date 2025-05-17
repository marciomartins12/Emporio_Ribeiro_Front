const express = require('express');
const cors = require('cors');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const salesRoutes = require('./routes/sales');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());



app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'API do Empório Ribeiro funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
