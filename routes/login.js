const User = require('../models/user');
const config = require('../config');

exports.submit = (req, res, next) => {
	const data = req.body.user;
	console.log('User logged:', req.body.user.name);
	// console.log('Session:', req.session);
	User.authenticate(data.name, data.pass, (err, user) => {
		if (err) return next(err);
		if (user) {
			req.session.uid = user.id;
			req.session.name = user.name;
			// res.setHeader('Set-Cookie', `user_name=${user.name}`);
			// res.setHeader('Set-Cookie', `user_id=${user.id}`);
			res.cookie('user_id', user.id, {domain: config.domain, expires: config.ttlCookies});
			res.cookie('user_name', user.name, {domain: config.domain, expires: config.ttlCookies});
			// req.cookies GET 
			res.send({ message: 'Success login!', name: req.session.name, uid: req.session.uid });
			// res.redirect('/successlogin');
		}else{
			res.send({ message: 'Sorry! invalid credentials.' });
			// res.error('Sorry! invalid credentials. ');
			// res.redirect('back');
		}
	});
};

exports.getId = (req, res) => {
	const name = req.params.name;
	User.getId(name, (err, id) => {
		if (err) return next(err);
		if (id){
			res.send({id: id});
		}else{
			res.send({message: 'User not found'});
		}
	});
};

exports.getInfo = (req, res) => {
	const id = +req.params.id;
	User.get(id, (err, user) => {
		if (err) return next(err);
		if (user){
			if (req.session.uid == user.id){
				res.send({
					id: user.id,
					name: user.name,
					email: user.email
				});
			}else{
				res.send(user);
			}
		}else{
			res.send({message: 'User not found'});
		}
	});
};

exports.logout = (req, res) => {
	req.session.destroy((err) => {
		if (err) throw err;
		res.clearCookie('user_name', {domain: config.domain, expires: config.ttlCookies});
		res.clearCookie('user_id', {domain: config.domain, expires: config.ttlCookies});
		// res.cookie('user_id', '', {maxAge: 1000});
		// res.cookie('user_name', '', {maxAge: 1000});
		res.send({ message: 'Success logout!' });
		// res.redirect('/successlogout');
	});
};