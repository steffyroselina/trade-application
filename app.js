//require modules

const express = require('express')
const morgan = require('morgan')
const tradeRoutes = require('./routes/trade');
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const offerRoutes = require('./routes/offer');
const methodOverride = require('method-override');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');

//create app 
const app = express();

//configure app
let port = 3000
let host = 'localhost'
app.set('view engine' , 'ejs')


//connect to database
mongoose.connect('mongodb://localhost:27017/trades', 
                {useNewUrlParser : true , useunifiedTopology : true})
.then(() => {
    //start the server 
    app.listen(port, host, ()=>{
        console.log('Server is running on port ', port);
    })
})
.catch(err => console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));
app.use(express.json())
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(session({
    secret : 'cnjvisdkorivjdsksdc',
    resave : false,
    saveUninitialized : false,
    cookie : {maxAge : 60*60*1000},
    store : new MongoStore({mongoUrl : 'mongodb://localhost:27017/trades' })
}));

app.use(flash());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.user = req.session.user || null ;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
})

//set up routes

app.use('/', mainRoutes);

app.use('/trades/offers', offerRoutes);

app.use('/trades', tradeRoutes);

app.use('/users', userRoutes);

//error handlers
app.use((req, res, next) => {
    let err = new Error('Server cannot locate resource at ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err,req, res, next) => {
    if(!err.status){
        console.log(err.message);
        err.status = 500;
        err.message = "Internal server error";

    }
    res.status(err.status);
    res.render('error', {error : err});
});

