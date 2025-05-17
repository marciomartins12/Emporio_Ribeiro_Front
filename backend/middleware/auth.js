const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    // Para algumas rotas, podemos permitir acesso sem autenticação
    req.user = null;
    return next();
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
