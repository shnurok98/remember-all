const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const user = require('./middleware/user');
const register = require('./routes/register');
const session = require('express-session');
const login = require('./routes/login');

const index = require('./routes/index');
const dictionaries = require('./routes/dictionaries');
const dictPub = require('./routes/dict-pub');
const cards = require('./routes/cards');

const config = require('./config');

const app = express();

const allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'https://ra.tmweb.ru');
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
};

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use((req, res, next) => {
	if (req.method == 'OPTIONS'){
		res.end('GET, PUT, POST, DELETE');
	}else{
		next();
	}
});

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  name: 'sessId',
  cookie: {
  		domain: config.domain,
  		httpOnly: true,
  		expires: config.ttlCookies
  }
}));

app.use(user);

app.post('/api/register', register.submit);
app.post('/api/login', login.submit);
app.get('/api/logout', login.logout);
app.get('/api/users/:name', login.getId);
app.get('/api/users/filter/:id', login.getInfo);

app.use('/api/', index);
app.use('/api/dictionaries', dictPub);
app.use('/api/dictionaries', dictionaries);
app.use('/api/cards', cards);



app.listen(3000, () => {
	console.log('Сервер работает на 3000 порту');
});