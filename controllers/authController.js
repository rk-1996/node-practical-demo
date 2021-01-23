'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;

const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';

var User = require('../models/sequelizeModule').tbl_user
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');


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

//login route
router.post('/login', async function(req, res, next) {
  try {
    const schema = Joi.object({
      email:Joi.string().required(),
      password: Joi.string()
          .required(),
    })
    try {
      const value = await schema.validateAsync({email:req.body.email,password:req.body.password});
      console.log(req.body)
      const { email, password } = req.body;
      if (email && password) {
        try {
          let user = await getUser({ email: email });
          if (!user) {
            res.status(201).json({
              message:'No such user found',
              data:{},
              status:0
            })
            return
          }
          const compare = await bcrypt.compare(password, user.password);
          if (compare) {
            let payload = { id: user.id };
            let token = jwt.sign(payload, jwtOptions.secretOrKey);
            const userData = {
              email:user.email,
              user_id:user.id,
              token:token
            }
            res.status(200).json({
              message:"Login successfully.",
              data:{userData},
              status:1
            })
          } else {
            res.status(201).json({
              message:"User email or password is incorrect.",
              data:{},
              status:0
            })
          }
        } catch (error) {
          res.status(201).json({
            message:error.message,
            data:{},
            status:0
          })
        }
      }
    } catch (error) {
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  } catch (error) {
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
});

