const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

var routes = require('./controllers/index'); 
var constant = require('./assets/constant'); 
const passport      = require('passport');
const pe            = require('parse-error');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const path = require('path')
var User = require('./models/sequelizeModule').tbl_user
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
const Sequelize = require('sequelize')

const Op = Sequelize.Op;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';

let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  let user = getUser({ id: jwt_payload.id });

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

// use the strategy
passport.use(strategy);

//Passport

const getUser = async obj => {
  return await User.findOne({
    where:[{
      [Op.or]:{
        email : {
          [Op.eq] : obj.email
        }
      }
    }],
  });
};


const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, x_api_key, user_id, token"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(passport.initialize());

//Started Log on consol
if (Const_isDebug) {
    app.use(morgan('dev'))
}else{
    app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 }}));
}


app.use(helmet())
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes)
app.set('port', process.env.PORT || 4065);
// console.log(__dirname+'/uploads/original/')
app.use(express.static(__dirname+'/uploads/original/'));

app.use('/pdf', express.static(__dirname + '/uploads/pdf'));
app.use('/users', express.static(__dirname + '/uploads/original'));
app.use('/products', express.static(__dirname + '/uploads/products'));
app.use('/productimages', express.static(__dirname + '/uploads/product_images'));

// app.use(express.static(dir));
// app.use(express.static('uploads'))
// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    res.status(404).json({ success: 0, data: {}, message: 'Api Not Found' })
    return;
 });
 
 
 // production error handler
 // no stacktrace leaked to user
 app.use(function (err, req, res, next) {
   console.log(err)
   res.status(500).json({ success: 0, data: {}, message: err.message })
    return;
 });


 
app.listen(app.get('port'), () => console.log('running on port ' + app.get('port')))

module.exports = app