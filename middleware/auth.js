// Middleware to check if user is logged in
exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/auth/login');
};

// Middleware to restrict to students only
exports.isStudent = (req, res, next) => {
    if (req.session.user?.role === 'student') return next();
    res.status(403).send('Access denied. Students only.');
};

// Middleware to restrict to companies only
exports.isCompany = (req, res, next) => {
    if (req.session.user?.role === 'company') return next();
    res.status(403).send('Access denied. Companies only.');
};
// Middleware to restrict to specific roles
exports.isRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) return res.redirect('/auth/login');
        if (roles.includes(req.session.user.role)) return next();
        res.status(403).send('Access denied. Insufficient permissions.');
    };
};
