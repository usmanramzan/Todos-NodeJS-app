const _ = require('lodash');
const express = require('express');
const Sequelize = require('sequelize');
const BodyParser = require('body-parser');


const PORT = process.env.PORT || 8080;

const DB_TYPE = process.env.DB_TYPE || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const DB_NAME = process.env.DB_NAME || 'casb';
const DB_USER = process.env.DB_NAME || 'postgres';
const DB_PASS = process.env.DB_NAME || 'pakistan';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_TYPE,

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

const app = express();

function respondOk(res, body) {
    res.status(200).json(body);
}

function respondError(res, err) {
    res.status(500).json({
        error: err,
    });
}


// middleware

app.use(BodyParser.json());

// routes
app.get('/schema', (req, res) => {
    sequelize.query(`select *
    from information_schema.tables
    where table_schema not in ('pg_catalog', 'information_schema')
    and table_schema not like 'pg_toast%'`)
        .then(function(data){
            respondOk(res, data);
        }, function(err){
            respondError(res, err)
        })
    
});



app.listen(PORT, function() {
	console.log(`test server listening on port ${ PORT }`);
});
