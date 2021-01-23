'use strict';
var express = require('express')
var router = express.Router()
module.exports = router;
const bcrypt = require('bcrypt');


var User = require('../models/sequelizeModule').tbl_user
var Organization = require('../models/sequelizeModule').tbl_organization
const getTotalCountUser = require('../common/commonFunction').getTotalCountUser
const deleteUserFun = require('../common/commonFunction').deleteUserFun
const createOrganization = require('../common/commonFunction').createOrganization
const createUser = require('../common/commonFunction').createUser
const getUser = require('../common/commonFunction').getUser
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi');

//this function is for delete user now we are doing soft delete
router.put('/deleteUser',async function (req,res,next){
  try {
    const schema = Joi.object({
      user_id: Joi.number().required(),
    })
    const value = await schema.validateAsync({
      user_id:req.body.user_id
    })
    try {
      let {user_id} = req.body
      let userData = await User.findOne({
        where:{
          id : {
            [Op.eq]:user_id
          }
        }
      })
      if(!userData){
        res.status(201).json({
          message:'User not found',
          data:{},
          status:0
        })
      }
      try {
        
        try {
          let updDetails = await deleteUserFun({user_id:user_id})
          if(updDetails){
            res.status(200).json({
              message:'user deleted succsessfully.',
              data:{},
              status:1
            }) 
            return
          }else{
            res.status(201).json({
              message:'something wrong.',
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
      } catch (error) {
        res.status(201).json({
          message:error.message,
          data:{},
          status:0
        })
      }
    }catch(error){
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
})

//this function is for update user inforamation
router.put('/updateUser',async function (req,res,next){
  try {
    const schema = Joi.object({
      user_id: Joi.number().required(),
      first_name : Joi.string().required(),
			last_name: Joi.string().required(),
			organization_name:Joi.string().required()
    })
    const value = await schema.validateAsync({
      user_id:req.body.user_id,
      first_name : req.body.first_name,
      last_name : req.body.last_name,
      organization_name : req.body.organization_name,
    })
    try {
      let {user_id,first_name,last_name,organization_name} = req.body
      let userData = await User.findOne({
        where:{
          id : {
            [Op.eq]:user_id
          }
        }
      })
      if(!userData){
        res.status(201).json({
          message:'User not found',
          data:{},
          status:0
        })
      }
      try {
        
        try {
          let updDetails = await User.update(
            {
							first_name:first_name,
							last_name:last_name
            },
            {
              where: {
                id: {
                  [Op.eq] : user_id
                }
              }}
          )
          if(updDetails){
						let updDetails = await Organization.update(
							{
								name:organization_name,
							},
							{
								where: {
									user_id: {
										[Op.eq] : user_id
									}
								}}
						)
            res.status(200).json({
              message:'user updated succsessfully.',
              data:{},
              status:1
            }) 
            return
          }else{
            res.status(201).json({
              message:'something wrong.',
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
      } catch (error) {
        res.status(201).json({
          message:error.message,
          data:{},
          status:0
        })
      }
    }catch(error){
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
})

//this function is for add new user
router.post('/addNewUser',async function(req, res, next) {
    try {
      const schema = Joi.object({
        first_name:Joi.string().required(),
        last_name:Joi.string().required(),
        password: Joi.string().required(),
				email: Joi.string().required(),
				organization_name:Joi.string().required(),
      })
      try {
				console.log(req.body)
        const value = await schema.validateAsync(
          {
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            password:req.body.password,
            email:req.body.email,
            organization_name:req.body.organization_name,
          }
        );
        
        const {  password } = req.body;
        if (password) {
					try {
            let user = await getUser({ email:req.body.email });
            if (user) {
              res.status(201).json({
                message:'user already exists',
                data:{},
                status:0
              })
              return
						}
						let first_name = req.body.first_name
            let last_name = req.body.last_name
            let email = req.body.email
						let password = req.body.password
						let organization_name = req.body.organization_name
            try {
              
              let user = await createUser({ 
                first_name: first_name,
                last_name: last_name,
                email: email,
                password:password,
							});
							console.log("user creation",user.id)
              let organizationUpdate = await createOrganization({ 
								name:organization_name,
								user_id:user.id
							});
              res.status(200).send({
                message:'User created successfully.',
                data:{},
                status:1
              })
            } catch (error) {
              res.status(201).json({
                message:error.message,
                data:{},
                status:0
              })
            }
					}catch(error){
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
  }catch (error) {
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})

//This function is for get user data with pagination call and sorting searching funtionality 
router.get('/getUserData', async function(req, res, next) {
  try {
    try {
				const { pageNumber,limit,searchName,sortByName,sortByEmail } = req.query;
				let nameWhereClause = [
					{
						is_deleted : {
							[Op.eq]:"no"
					},
					is_varified : {
						[Op.eq]:"yes"
					},
					is_active : {
						[Op.eq]:"yes"
						}
					}
				]
				let totalCount = await getTotalCountUser()
				let offset = 0
				let orderClause = [['id','DESC']]
				if(pageNumber != '0' && pageNumber != null && pageNumber != undefined){
					offset = ((parseInt(pageNumber)) * limit)
				}
				if(sortByName != '' && sortByName != null && sortByName != undefined){
					orderClause.push(
						[`first_name`,sortByName]
					)
				}
				if(sortByEmail != '' && sortByEmail != null && sortByEmail != undefined){
					orderClause.push(
						[`email`,sortByName]
					)
				}
				if(searchName != '' && searchName != null && searchName != undefined){
					nameWhereClause.push(
						{
							[Op.or]:[
								{

									first_name:{
										[Op.like]:`%${searchName}%`
									}},
									{
									'$`tbl_organizations`.`name`$':{
		
										[Op.like]:`%${searchName}%`
									}
								}
								]
							
						},
					)
				}else{
					nameWhereClause.push(
						{
							is_deleted : {
									[Op.eq]:"no"
							},
							is_varified : {
								[Op.eq]:"yes"
							},
							is_active : {
								[Op.eq]:"yes"
								},
							
						},
					)
				}

      	let userData = await User.findAll({
				attributes:['first_name','last_name','id'],
				include:[
          {
						model:Organization,
						attributes:['id','name'],
          }
        ],
        where: {
					[Op.and]:nameWhereClause
        },
				limit:parseInt(limit),
				offset:parseInt(offset),
				subQuery:false,
				order:orderClause,
				
			});
      if (!userData) {
        res.status(200).json({
          message:'No such user found',
          data:{},
          status:0
        })
        return
      }
      res.status(200).json({
        message:'user found',
				data:{userData,totalCount},
        status:1
      })
    }catch(error){
      res.status(201).json({
        message:error.message,
        data:{},
        status:0
      })
    }
  }catch(error){
    res.status(201).json({
      message:error.message,
      data:{},
      status:0
    })
  }
})
