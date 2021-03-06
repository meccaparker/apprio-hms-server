////////////////////////////////////////////////////////////////
// Server initialization
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
// Imports
////////////////////////////////////////////////////////////////

var moment = require('moment');
var querystring = require('querystring');
var outlook = require('node-outlook');
var express = require("express") 
var fs = require('fs')
var path = require('path')
var colors = require('colors')
var bodyParser = require('body-parser')

var db = require('./db')
var config = require('./.config.js')
var auth = require('./auth.js')
  
////////////////////////////////////////////////////////////////
// Server object
////////////////////////////////////////////////////////////////

// Define HTTP routes through the app object's methods
var Server = function() {
	var self = this

	self.setupVariables = function () {
		self.port = process.env.PORT || config.port
	}

	// Initialize App
	self.initializeServer = function() {
		console.log("Initializing server...")
        self.app = express()
        self.app.set("secret", config.secret)
		self.createRoutes()
        self.setupVariables()
        self.start()
	}
	// Allow server to start listening
	self.start = function() {
		self.app.listen(self.port, function() {
			console.log("SUCCESS:".green, "Listening on port " + self.port)
		})
	}

	// Establish server routes
	self.createRoutes = function() {
        require('./auth.js')(self.app)
        fs.readdirSync('./routes').forEach(function (file){
          // Search for the files containing routes and add them
          if (path.basename(file).includes(".js")) {
                require('./routes/'+ file)(self.app)
            }
        })
        self.app.use(bodyParser.json())
        self.app.use(function(req, res, next) {
            res.set('Access-Control-Allow-Origin', '*')
            res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
            res.set("Access-Control-Allow-Headers", "X-Requested-With", "Content-Type", "Authorization")
            next();
        })
    }
}
// Test database connection and start server
db.testConnection(function(err) {
    server = new Server()
    console.log("%s", Date(Date.now()))
    console.log("Attempting to connect to database...")
    if (err) {
        console.log('DB ERROR:'.red, "Unable to connect to database. Server will have limited functionality.")
        console.log(err)
        server.initializeServer()
    }
    else {
        console.log("Database connection established.")
        server.initializeServer()
    }
})

