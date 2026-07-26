const adminMiddleware = (req, res, next) => {
  if (req.userTipo !== 'adm') {
    return res.status(403).json({
      mensagem: 'Você precisa ser administrador para fazer isso!',
    });
  }

  next();
};

module.exports = adminMiddleware;
