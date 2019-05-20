const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const connection = require('../db');
const User = require('../models/user');

router.use(function(req, res, next){
	// req.user - full info from middleware
	if (req.session.name === undefined) {
		return res.send({ message: 'It is secret route' });
	}else{
		// console.log(`User logged on cards${req.url}`);
		// console.log('User here: "'+ req.session.name + '" with uid: ' + req.session.uid);
		next();
	}
});

function insertWord(ru, eng){
	return new Promise((resolve, reject) => {
		let row1 = connection.one(`
			INSERT INTO words (
				russian,
				english
			) VALUES (
				$1, $2
			) RETURNING id;
			`, [
				ru,
				eng
			]);
		// let result = JSON.parse(row1);
		if(row1 !== undefined){
			resolve(row1);
		}else{
			reject('FUCK');
		}
	});
}

function insertCard(word_id, dict_id){
	return new Promise((resolve, reject) => {
		let rows = connection.one(`
		INSERT INTO cards (
			word_id, 
			dict_id
		) VALUES (
		$1, $2
		) RETURNING dict_id;
		`, [
			+word_id, 
			+dict_id
		]);
		
		if(rows !== undefined){
			resolve(rows);
		}else{
			reject('FUCK');
		}
	});
}

// private
router.put('/edit/:id', (req, res) => {
	User.isOwner(+req.session.uid, +req.body.dict_id, (err, tf) => {
		if (err) return next(err);
		if (tf){
			connection.oneOrNone(`SELECT parent_id FROM dictionaries WHERE id = $1`, [+req.body.dict_id])
			.then((rows) => {
				if (rows.parent_id == undefined || rows.parent_id == null){ 
					connection.none(`
						UPDATE words SET 
							russian = $1, 
							english = $2
						WHERE id = $3;
					`, [
						req.body.russian, 
						req.body.english, 
						+req.body.word_id
					])
					.catch((err) => {
						console.log(err);
						res.send({message: 'Error update words'});
					});

					connection.none(`
						UPDATE cards SET 
							correct = 0,
							wrong = 0 
						WHERE id = $1;
					`, [+req.params.id])
					.catch((err) => {
						console.log(err);
						res.send({message: 'Error update cards'});
					});
				}else{
					connection.one(`INSERT INTO words (russian, english) VALUES ($1, $2) RETURNING id;`, [req.body.russian, req.body.english])
					.then((rows) => {
						connection.none(`
							UPDATE cards SET 
								correct = 0,
								wrong = 0,
								word_id = $2 
							WHERE id = $1;
						`, [+req.params.id, +rows.id]);
					})
					.catch((err) => {console.log(err)});
				}
			})
			res.sendStatus(200);
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});

// private
router.post('/create', (req, res) => {
	User.isOwner(+req.session.uid, +req.body.dict_id, (err, tf) => {
		if (err) return next(err);
		if (tf){
			insertWord(req.body.russian, req.body.english)
			.then(kek => {
				insertCard(kek.id, req.body.dict_id);
			})
			.then(() => {res.sendStatus(200)})
			.catch(err => console.log('WARNING', err));
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});

// private
router.post('/stat/:card_id', (req, res) => {
	User.isOwner(+req.session.uid, +req.body.dict_id, (err, tf) => {
		if (err) return next(err);
		if (tf) {
			connection.none(`UPDATE cards SET correct = $1, wrong = $2 WHERE id = $3;`, 
			[+req.body.correct, +req.body.wrong, +req.params.card_id])
			.then(() => {res.sendStatus(200)})
			.catch((err) => {console.log(err)});
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});

// private 
router.delete('/:id', (req, res) => {
	User.isOwner(+req.session.uid, +req.body.dict_id, (err, tf) => {
		if (err) return next(err);
		if (tf){
			connection.none(`
			DELETE FROM cards WHERE cards.id = $1 AND cards.dict_id = $2;
			`, [+req.params.id, +req.body.dict_id])
			.then(() => {res.sendStatus(200)})
			.catch((err) => {
				// res.send({message: ''});
				console.log(err);
			});
		}else{
			res.send({message: 'Permission denied'});
		}
	});
});

module.exports = router;