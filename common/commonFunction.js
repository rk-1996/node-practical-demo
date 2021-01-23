var User = require('../models/sequelizeModule').tbl_user
var Organization = require('../models/sequelizeModule').tbl_organization
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const getTotalCountUser = async() => {
	return await User.count({
    where:[{
      is_deleted : {
				[Op.eq]:"no"
		},
		is_varified : {
			[Op.eq]:"yes"
		},
		is_active : {
			[Op.eq]:"yes"
			},
    }],
  });
}
const deleteUserFun = async obj => {
	let user_id = obj.user_id
	return await User.update(
		{
			is_deleted:"yes"
		},
		{
			where: {
				id: {
					[Op.eq] : user_id
				}
			}}
	)
}
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
  
  
  const createUser=async obj =>{
    let email= obj.email
    let first_name= obj.first_name
    let last_name= obj.last_name
      let password= obj.password
      
      const hash = await bcrypt.hash(password, 10);
    return await User.create({
          email: email,
          first_name:first_name,
          last_name:last_name,
          password:hash,
    });
  }
  
  const createOrganization = async obj => {
      let user_id= obj.user_id
    let name= obj.name
      return await Organization.create({
          user_id: user_id,
          name:name,
      });
  }

exports.getTotalCountUser = getTotalCountUser
exports.deleteUserFun = deleteUserFun
exports.createOrganization = createOrganization
exports.createUser = createUser
exports.getUser = getUser