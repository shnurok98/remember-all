const User = require('../models/user');

module.exports = (req, res, next) => {
	const uid = req.session.uid;
	// console.log('Middle uid:', uid);
	// console.log(req.headers);
	if (!uid) return next();
	User.get(uid, (err, user) => {
		if (err) return next(err);
		req.user = res.locals.user = user;
		next();
	});
};