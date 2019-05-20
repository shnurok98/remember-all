const User = require('../models/user');

exports.submit = (req, res, next) => {
	const data = req.body.user;
	User.getByName(data.name, (err, user) => {
		if(err) return next(err);

		if (user) {
			res.send({ message: 'Username already taken!' });
			// res.error('Username already taken!');
			// res.redirect('back');
		}else{
			User.getByEmail(data.email, (err, email) => {
				if (err) return next(err);

				if(email){
					res.send({ message: 'Пользователь с данным email уже существует' });
				}else{
					user = new User({
						name: data.name,
						pass: data.pass,
						email: data.email
					});
					user.save((err) => {
						if(err) return next(err);
						req.session.uid = user.id;
						res.send({ message: 'Success registration!' });
						// res.redirect('/successRegistration');
					});
				}
			});
		}
	});
};