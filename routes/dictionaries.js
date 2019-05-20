const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const connection = require('../db');
const User = require('../models/user');


router.use(function(req, res, next){
	// req.user - full info from middleware
	if (req.session.name === undefined) {
		// console.log(`User not logged on dictionaries/${req.url}`);
		// console.log('Cookies:', req.cookies);
		// console.log('Session:', req.session);
		// console.log('RES.HEADERS', res.headers);
		return res.send({ message: 'It is secret route' });
	}else{
		console.log(`User logged on dictionaries${req.url}`);
		console.log('User here: "'+ req.session.name + '" with uid: ' + req.session.uid);
		next();
	}
});

// private
router.put('/setFav/:dict_id', (req, res) => {
	User.isOwner(+req.session.uid, +req.params.dict_id, (err, tf) => {
		if (err) return next(err);
		if (tf){
			connection.none(`
			UPDATE dictionaries SET 
				favorite = $1
			WHERE id = $2;
			`, [
				req.body.favorite, 
				+req.params.dict_id
			])
			.then(() => {res.sendStatus(200)})
			.catch((err) => {
				console.log(err);
			});
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});

// private
// user_id
router.post('/copyDict/:dict_id', (req, res) => {
	if (req.session.uid == req.body.user_id){
		connection.oneOrNone(`SELECT parent_id FROM dictionaries WHERE id = $1`, [+req.params.dict_id])
		.then((rows) => {
			if (rows.parent_id != undefined || rows.parent_id != null){ 
				res.send({message: 'Копировать данный словарь нельзя'});
			}else{
				connection.one(`
				INSERT INTO dictionaries (   
					categories, 
					created_by, 
					name,
					count,
					added
				) SELECT    
					categories, 
					created_by, 
					name,
					count,
					added 
				FROM dictionaries WHERE id = $1 RETURNING id, added;
				`, [+req.params.dict_id])
				.then((rows) => {
					connection.none(`UPDATE dictionaries SET added = $1 WHERE id = $2`, [++rows.added, +req.params.dict_id])
					.catch((err) => {console.log(err)});
					connection.one(`
						UPDATE dictionaries SET user_id = $1, edited_by = $2, added = 0, favorite = 'f', parent_id = $3 WHERE id = $4 RETURNING id;
					`, [+req.session.uid, req.session.name, +req.params.dict_id, +rows.id])
					.then((rows) => {
						// res.sendStatus(200)
						connection.none(`
							INSERT INTO cards (word_id) SELECT word_id FROM cards WHERE dict_id = $1;
							UPDATE cards SET dict_id = $2 WHERE dict_id IS NULL;
						`, [+req.params.dict_id, +rows.id])
						.then(() => {res.sendStatus(200)})
						.catch((err) => {console.log(err)});
					})
					.catch((err) => {console.log(err)});
				})
				.catch((err) => {console.log(err)});
			}
		})
		.catch((err) => {console.log(err)});
	}else{
		res.send({message: 'Fake user'});
	}
});

// private
router.post('/create', (req, res) => {
	if (req.session.uid == req.body.user_id){
		connection.one(`
		INSERT INTO dictionaries (
			user_id, 
			created_by,
			name,
			count
		) VALUES (
		$1, $2, $3, $4
		) RETURNING id;
		`, [
			+req.body.user_id,
			req.session.name,
			req.body.name,
			+req.body.count
		])
		.then((rows) => {
			res.send(rows);
		})
		.catch((err) => {
			console.log(err);
		});
	}else{
		res.send({message: 'Fake user'});
	};
});

// private
router.put('/:id', (req, res) => {
	User.isOwner(+req.session.uid, +req.params.id, (err, tf) => {
		if (err) return next(err);
		if (tf){
			connection.none(`
			UPDATE dictionaries SET 
				user_id = $1, 
				edited_by = $2, 
				added = $3, 
				date_created = $4, 
				favorite = $5, 
				categories = $6, 
				created_by = $7, 
				parent_id = $8,
				name = $9,
				count = $10
			WHERE id = $11;
			`, [
				+req.body.user_id, 
				req.body.edited_by, 
				+req.body.added, 
				req.body.date_created, 
				req.body.favorite, 
				req.body.categories, 
				req.body.created_by, 
				+req.body.parent_id,
				req.body.name,
				+req.body.count,
				+req.params.id
			])
			.then(() => {res.sendStatus(200)})
			.catch((err) => {console.log(err)});
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});
// private
router.delete('/:id', (req, res) => {
	User.isOwner(+req.session.uid, +req.params.id, (err, tf) => {
		if (err) return next(err);
		if (tf){
			connection.none(`
			DELETE FROM dictionaries WHERE id = $1;
			DELETE FROM cards WHERE dict_id = $1;
			`, [+req.params.id])
			.then(() => {res.sendStatus(200)})
			.catch((err) => {
				console.log(err);
			});
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});

module.exports = router;