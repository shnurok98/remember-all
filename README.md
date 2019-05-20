# Remember All

## Изучай английский язык быстро и эффективно

Пример файла config.js:
```js
let config = {};

config.connectionString = {
	host: 'localhost',
	port: 5432,
	database: 'db',
	user: 'user',
	password: '12345'
};

config.sessionSecret = 'secret';
config.ttlCookies = new Date(Date.now() + 3600000 * 24 * 7 * 5);
config.domain = '.tmweb.ru';

module.exports = config;
```