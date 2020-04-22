// MENGIMPORT LIBRARY
const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const session = require('express-session')

const app = express()

// MEMBUAT PORT
const port = 3000

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

const secretKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))


// MEMBUAT KONEKSI KE DATABASE
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'pkk'
})

const isAuthorized = (request, result, next) => {
    // cek apakah user sudah mengirim header 'x-api-key'
    if(typeof(request.headers['x-api-key']) == 'undifined'){
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }

    //get token dari headers
    let token = request.headers['x-api-key']

    // melakukan verifikasi token yang dikirim user
    jwt.verify(token, secretKey, (err, decoded)=>{
        if(err){
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })

    // lanjut ke next request
    next()
}

// LOGIN
//Login ADMIN ada di database
app.post('/login/admin', function(request, response) {
    let data = request.body
	var username = data.username;
	var password = data.password;
	if (username && password) {
        db.query('SELECT * FROM admin WHERE username= ? AND password = ?', [username, password], 
        function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = data.username;
				response.redirect('/login/admin');
			} else {
				response.send('Username dan/atau Password salah!');
			}			
			response.end();
		});
	} else {
		response.send('Masukkan Username and Password!');
		response.end();
	}
})

app.get('/login/admin', function(request, results) {
	if (request.session.loggedin) {
        let data = request.body
        let token = jwt.sign(data.username + '|' + data.password, secretKey)

        results.json({
            success: true,
            message: 'Login success, welcome back Admin!',
            token: token
        })
	} else {
        results.json({
            success: false,
            message:'Mohon login terlebih dahulu!'
        })
        }
	
	results.end();
})

//LOGIN DAN REGISTER USERS
app.post('/users/register', (req, res) => {
    let dataInput = {
    username : req.body.username,
    password : req.body.password,
    nama : req.body.nama,
    alamat : req.body.alamat,
    telepon : req.body.telepon
  }
  
    db.query('INSERT INTO users SET ?', dataInput, (err, rows, fields) => {
      if (err) throw err;
      res.json({
        status: 200,
        response: "OK",
        message: "data user created",
        result: rows
      });
    });
  });

app.post('/login/users', function(request, response) {
	var username = request.body.username
	var password = request.body.password
	if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], 
        function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true
				request.session.username = username
				response.redirect('/home')
			} else {
				response.send('Username dan/atau Password salah!')
			}			
			response.end()
		})
	} else {
		response.send('Masukkan Username and Password!')
		response.end()
	}
})

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Selamat Datang , ' + request.session.username + '!')
	} else {
		response.send('Mohon login terlebih dahulu!')
	}
	response.end()
})

//LOGIN dan Register PERACIK
app.post('/peracik/register', (req, res) => {
    let dataInput = {
    username : req.body.username,
    password : req.body.password,
    nama : req.body.nama,
    alamat : req.body.alamat,
    telepon : req.body.telepon
  }
  
    db.query('INSERT INTO peracik SET ?', dataInput, (err, rows, fields) => {
      if (err) throw err;
      res.json({
        status: 200,
        response: "OK",
        message: "data peracik created",
        result: rows
      });
    });
  });

app.post('/login/peracik', function(request, response) {
	var username = request.body.username
	var password = request.body.password
	if (username && password) {
        db.query('SELECT * FROM peracik WHERE username = ? AND password = ?', [username, password], 
        function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true
				request.session.username = username
				response.redirect('/homep')
			} else {
				response.send('Username dan/atau Password salah!')
			}			
			response.end()
		})
	} else {
		response.send('Masukkan Username and Password!')
		response.end()
	}
})

app.get('/homep', function(request, response) {
	if (request.session.loggedin) {
		response.send('Selamat Datang Peracik , ' + request.session.username + '!')
	} else {
		response.send('Mohon login terlebih dahulu!')
	}
	response.end()
})

// RUN APP
app.listen(port,()=>{
    console.log('App running on port ' + port);
    
})