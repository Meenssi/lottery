//Open Call Express
const express = require('express')
const bodyParser = require('body-parser')

const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//View
app.set('view engine','ejs')
//Connect public folder
app.use(express.static('public'))

//MySQL Connect phpMyAdmin
const pool = mysql.createPool({
    connectionLimit : 10,
    connectionTimeout : 20,
    host : 'localhost', 
    user : 'root',
    password : '',
    database : 'nodejs_lottery' 
})

var obj = {} //Global Variables


app.get('',(req, res) => {
 
    pool.getConnection((err, connection) => {  
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId)
         
        connection.query('SELECT * FROM lottery', (err, rows) => { 
            connection.release();
            if(!err){ 
                obj = { lottery: rows, Error : err}
                res.render('index', obj)
            } else {
                console.log(err)
            }
         }) 
    })
})

app.get('/addinfo', (req, res) => {
    res.render('addinfo')
})

app.post('/addinfo',(req,res) => {
    pool.getConnection((err,connection) => {
        if(err) throw err
        const params = req.body

            //Check
            pool.getConnection((err, connection2) => {
                connection2.query(`SELECT COUNT(id) AS count FROM lottery WHERE id = ${params.id}`, (err, rows) => {
                    if(!rows[0].count){
                        connection.query('INSERT INTO lottery SET ?', params, 
                        (err,rows) => {
                            connection.release()
                            if(!err){
                                obj = {Error : err, mesg : `Success adding data ${params.name}`}
                                res.render('addinfo', obj)
                            } else {
                                console.log(err)
                            }
                        })
                    } else {                        
                        obj = {Error : err, mesg : `Cannot adding data ${params.name}`}
                        res.render('addinfo', obj)
                    }
                })
            })
    }) 
})

app.get('/:draw',(req, res) => {
 
    pool.getConnection((err, connection) => {  
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId) 
 
        connection.query('SELECT * FROM lottery WHERE `draw` = ?', req.params.draw, (err, rows) => { 
            connection.release();
            if(!err){ 
                obj = {lottery : rows, Error : err}
                res.render('index', obj)
            } else {
                console.log(err)
            }
         }) 
    })
})


app.listen(port, () => 
    console.log("listen on port : ?", port)
    )