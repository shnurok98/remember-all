const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const connection = require('../db');

// public
router.get('/popular', async (req, res) => {
	try{
		let rows = connection.manyOrNone(`
		SELECT * FROM dictionaries ORDER BY added;
		`);
		res.send(await rows);
	}catch(err){
		console.log(err);
	}
});

// public
router.get('/:id', async (req, res) => {
	try{
		let rows = connection.oneOrNone(`
		SELECT * FROM dictionaries WHERE id = $1;
		`, [+req.params.id]);
		res.send(await rows);
	}catch(err){
		console.log(err);
	}
});
// public
router.get('/user/:user_id', async (req, res) => {
	try{
		let rows = connection.manyOrNone(`
		SELECT * FROM dictionaries WHERE user_id = $1 ORDER BY id DESC;
		`, [+req.params.user_id]);
		res.send(await rows);
	}catch(err){
		console.log(err);
	}
});

// public
router.post('/getCards/:dict_id', async (req, res) => {
	try{
		let rows = connection.manyOrNone(`
		SELECT 
			words.id, 
			cards.word_id,
			cards.dict_id,
			cards.id,
			words.russian,
			words.english,
			cards.correct,
			cards.wrong
		FROM
			cards, words
		WHERE
			cards.dict_id = $1 AND words.id = cards.word_id;
		`, [
			+req.params.dict_id
		]);
		res.send(await rows);
	}catch(err){
		console.log('getCards, POST: ');
		console.log(err);
	}
});

module.exports = router;