require('dotenv').config();
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app=express();
const PORT = process.env.PORT || 5000;



//connect to database
require('./server/config/db')();
app.use(express.static('public'));
//middleware
app.use(expressLayout);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('layout','./layouts/main');
app.set('view engine','ejs');
app.use(cookieParser());
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen (PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})