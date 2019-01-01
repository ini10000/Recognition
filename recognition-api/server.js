const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'ini',
    password : '',
    database : 'recognition'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send(database.users)
})

app.post('/signin', (req, res) => { 
	db.select('email', 'hash').from('login')
		.where('email', "=", req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', "=", req.body.email)
					.then(user => {
						res.json(user[0])
					})
				.catch(err => res.status(400).json('Unable to get user'))
			} else {
				res.status(400).json('Wrong Credentials')
			}
		})
	.catch(err => res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	// bcrypt.hash(password, null, null, function(err, hash) {
 //    	console.log(hash)
	// });
		
		.catch(err => res.status(400).json("Unablr to register"))
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	db.select('*').from('users').where({id})
	.then(user => {
		console.log(user)
		if(user.length){
			res.json(user[0])
		} else {
			res.status(400).json('Not found')
		}
	})
	.catch(err => res.status(400).json('User not found!'))
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	  .increment('entries', 1)
	  .returning('entries')
	  .then(entries => {
	  	res.json(entries[0])
	  })
	  	.catch(err => res.status(400).json('Unable to get entries'))

})


// // Load hash from your password DB.

app.listen(3000, () => {
	console.log('App is alright!!!');
})
   