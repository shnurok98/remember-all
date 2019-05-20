const connection = require('./db');

// (async function createTable(){
// 	try{
// 		let res = connection.none(`
// 		CREATE TABLE users (
// 			id SERIAL PRIMARY KEY,
// 			login varchar(20),
// 			password varchar(20),
// 			email varchar(25)
// 		)`);
// 		console.log('query success');
// 	}catch(err){
// 		console.log(err);
// 	}
// })();

// (async function createTable(){
// 	try{
// 		let res = connection.none(`
// 		CREATE TABLE words (
// 			id SERIAL PRIMARY KEY,
// 			russian varchar(30),
// 			english varchar(30)
// 		)`);
// 		console.log('query success');
// 	}catch(err){
// 		console.log(err);
// 	}
// })();

// (async function createTable(){
// 	try{
// 		let res = connection.none(`
// 		CREATE TABLE cards (
// 			id SERIAL PRIMARY KEY,
// 			word_id int,
// 			dict_id int,
// 			correct int,
// 			wrong int,
// 			date_created varchar(50),
// 			last_show varchar(50)
// 		)`);
// 		console.log('query success');
// 	}catch(err){
// 		console.log(err);
// 	}
// })();

// (async function createTable(){
// 	try{
// 		let res = connection.none(`
// 		CREATE TABLE dictionaries (
// 			id SERIAL PRIMARY KEY,
// 			user_id int,
// 			edited_by varchar(20),
// 			added int,
// 			date_created varchar(50),
// 			favorite boolean,
// 			categories varchar(100),
// 			created_by varchar(20),
// 			parent_id int,
// 			name varchar(25),
// 			count int
// 		)`);
// 		console.log('query success');
// 	}catch(err){
// 		console.log(err);
// 	}
// })();

// (async function test(){
// 	try{
// 		let res = connection.one(`SELECT COUNT(dict_id) FROM cards WHERE dict_id = 1;`);
// 		let answ = await res;
// 		console.log(answ);
// 	}catch(err){
// 		console.log(err);
// 	}
// })();

// (async function createTable(){
// 	try{
// 		let res = connection.none(`
// 		CREATE TABLE users (
// 			id SERIAL PRIMARY KEY,
// 			name varchar(20),
// 			pass varchar(150),
// 			email varchar(25),
// 			salt varchar(150)
// 		)`);
// 		console.log('query success');
// 	}catch(err){
// 		console.log(err);
// 	}
// })();

