
var sequelize = require('../models/config');
var Sequelize = require('sequelize');
var tbl_user = require('../models/tbl_user')
var tbl_organization = require('../models/tbl_organization')

var userModel = tbl_user(sequelize, Sequelize)
module.exports['tbl_user'] = userModel

var organizationModel = tbl_organization(sequelize, Sequelize)
module.exports['tbl_organization'] = organizationModel

//Define relationship for all
userModel.hasMany(organizationModel,{foreignKey: 'user_id'})
organizationModel.belongsTo(userModel,{foreignKey: 'user_id'})

// productModel.hasMany(productRatingsModel,{foreignKey: 'product_id'})
// productRatingsModel.belongsTo(productModel,{foreignKey: 'product_id'})