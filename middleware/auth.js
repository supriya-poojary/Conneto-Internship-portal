// Middleware to check if user is logged in
exports.isAuthenticated = async (req, res, next) => {
    if (req.session.user) {
        // Essential check: If user is a company, they MUST be approved
        if (req.session.user.role === 'company') {
            try {
                const User = require('../models/User'); // Lazy load to avoid circular dependency
                const user = await User.findById(req.session.user.id);
                if (!user || user.status !== 'Approved') {
                    return req.session.destroy(() => {
                         res.redirect('/auth/login?error=Access revoked. Your company registration is no longer in an approved state.');
                    });
                }
            } catch (err) {
                 return res.redirect('/auth/login?error=Session verification failed.');
            }
        }
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware to restrict to students only
exports.isStudent = (req, res, next) => {
    if (req.session.user?.role === 'student') return next();
    res.status(403).send('Access denied: Student credentials required.');
};

// Middleware to restrict to companies only
exports.isCompany = (req, res, next) => {
    if (req.session.user?.role === 'company') return next();
    res.status(403).send('Access denied: Company account required.');
};

// Middleware to restrict to specific roles
exports.isRole = (roles) => {
    return async (req, res, next) => {
        if (!req.session.user) return res.redirect('/auth/login');
        
        // If the route involves companies, check status
        if (req.session.user.role === 'company') {
             const User = require('../models/User');
             const user = await User.findById(req.session.user.id);
             if (!user || user.status !== 'Approved') {
                 return req.session.destroy(() => {
                      res.redirect('/auth/login?error=Verification failed.');
                 });
             }
        }

        if (roles.includes(req.session.user.role)) return next();
        res.status(403).send('Access denied: Insufficient portal permissions.');
    };
};
