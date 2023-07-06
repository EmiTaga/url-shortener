let express = require('express');
let router = express.Router();
let path = require('path');
let expressSession = require('express-session');
const { conn, saveURL, getAllURLs, getLongUrl } = require('../database');
const app = express();
//let username_gl;
app.get('/login', function(req, res) {
	// Render login template
    res.render('login'); 
});

// http://localhost:5000/login/login
app.post('/login', function(req, res, next) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	let userid = req.params.userid;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		conn.query('SELECT * FROM users WHERE username = ?  AND password = ? ', [username, password,userid], function(error, results) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				req.params.userid = userid;
				// Redirect to home page
				res.redirect('/',{"users":username},(200))
			
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});
// router.get('/login', function(req, res, next) {
// 	let.sql('SELECT userid FROM mcnpay.users WHERE username = username');
// 	db.query(sql, function (err, data, fields) {
// 	if (err) throw err;
// 	res.render('')
// 	console.log(userid,username)
//   })
//   });
// http://localhost:5000/home
// app.get('/', function(req, res, next) {
// 	// If the user is loggedin
// 	if (req.session.loggedin) {
// 		// Output username
// 		res.send('Welcome back, ' + req.session.username + '!');
// 	} else {
// 		// Not logged in
// 		res.send('Please login to view this page!');
// 	}
// 	res.end();
// });

module.exports = app;