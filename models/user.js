const connection = require('../db');
const bcrypt = require('bcrypt');

class User {
	constructor(obj){
		for(let key in obj){
			this[key] = obj[key];
		}
	}

	save(cb){
		if(this.id){
			this.update(cb);
		}else{
			this.hashPassword((err) => {
				if (err) return cb(err);
				let obj = {
					name: this.name, 
					pass: this.pass, 
					email: this.email, 
					salt: this.salt
				};
				connection.oneOrNone('INSERT INTO users (${this:name}) VALUES (${this:csv}) RETURNING id;', obj)
				.then((rows) => {
					if (rows === undefined) return cb(console.log(new Error('Не удалось создать пользователя')));
					this.id = rows.id;
					cb();
				})
				.catch((err) => {
					cb(err);
				});
				
			});
		}
	}

	update(cb){
		let obj = {
			id: this.id, 
			name: this.name, 
			pass: this.pass, 
			email: this.email, 
			salt: this.salt
		};
		connection.oneOrNone('UPDATE users SET name = $1, pass = $2, email = $3, salt = $4 WHERE id = $5 RETURNING id;', [obj.name, obj.pass, obj.email, obj.salt, obj.id])
		.then((rows) => {
			if (rows === undefined) return cb(console.log(new Error('Не удалось обновить данные пользователя')));
			cb();
		})
		.catch((err) => {
			cb(err);
		});
	
	}

	hashPassword(cb){
		bcrypt.genSalt(12, (err, salt) => {
			if(err) return cb(err);
			this.salt = salt;
			bcrypt.hash(this.pass, salt, (err, hash) => {
				if(err) return cb(err);
				this.pass = hash;
				cb();
			});
		});
	}

	static getByName(name, cb){
		User.getId(name, (err, id) => {
			if(err) return cb(err);
			User.get(id, cb);
		});
	}

	static getId(name, cb){
		connection.oneOrNone(`
			SELECT users.id FROM users WHERE name = $1;
		`, [name])
		.then((rows) => {
			if (rows === undefined) return cb();
			if (rows === null) return cb();
			cb(null, rows.id);
		})
		.catch((err) => {
			cb(err);
		});
		
	}

	static get(id, cb){
		connection.oneOrNone(`
			SELECT * FROM users WHERE id = $1;
		`, [id])
		.then((user) => {
			if (user === undefined) return cb();
			if (user === null) return cb();
			cb(null, new User(user));
		})
		.catch((err) => {
			cb(err);
		});
		
	}

	static authenticate(name, pass, cb){
		User.getByName(name, (err, user) => {
			if(err) return cb(err);
			if(!user) return cb();
			bcrypt.hash(pass, user.salt, (err, hash) => {
				if(err) return cb(err);
				if(hash == user.pass) return cb(null, user);
				cb();
			});
		});
	}

	static isOwner(uid, dict_id, cb){
		connection.oneOrNone(`
			SELECT 
				dictionaries.id, 
				dictionaries.user_id
			FROM 
				dictionaries 
			WHERE 
				dictionaries.id = $1;
		`, [dict_id])
		.then((res) => {
			if (res === undefined) return cb(new Error('Права на словарь не могут быть подтверждены'));
			if (res.user_id == uid){
				cb(null, true);
			}else{
				cb(null, false)
			};
		})
		.catch((err) => {
			console.log(err);
			cb(err);
		});
	}

	static getByEmail(email, cb){
		connection.oneOrNone(`
			SELECT users.email FROM users WHERE email = $1;
		`, [email])
		.then((res) => {
			if (res === undefined || res === null) return cb();
			cb(null, res.email);
		})
		.catch((err) => {
			console.log(err);
			cb(err);
		});
	}

	toJSON(){
		return {
			id: this.id,
			name: this.name
		};
	}
}

module.exports = User;