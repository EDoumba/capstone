const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ','');
    if(!token) return res.status(401).json({ message:'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes:{exclude:['password']}, include:['preferences'] });
    if(!user) return res.status(401).json({ message:'Token is not valid.' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message:'Token is not valid.' });
  }
};

const adminAuth = async (req,res,next) => {
  try {
    if(req.user.user_type !== 'admin') return res.status(403).json({ message:'Access denied. Admin only.' });
    next();
  } catch { res.status(403).json({ message:'Access denied. Admin only.' }); }
};

const vetAuth = async (req,res,next) => {
  try {
    if(req.user.user_type !== 'vet' && req.user.user_type !== 'admin') return res.status(403).json({ message:'Access denied. Veterinarians only.' });
    next();
  } catch { res.status(403).json({ message:'Access denied. Veterinarians only.' }); }
};

module.exports = { auth, adminAuth, vetAuth };
