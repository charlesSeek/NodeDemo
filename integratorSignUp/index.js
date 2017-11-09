const Installers_Details = require('./models/Installers_Details');
const jwt = require('jwt-simple');
const Jwt_Config = require('./config/jwt_secret_config');
const validator = require('validator');
const _ = require('lodash');
const async = require('async');
var bcrypt = require('bcrypt-nodejs');

function tokenForUser(email) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: email, iat: timestamp,exp:Math.round(Date.now()+60*60*1000)}, Jwt_Config.secret);
}

function isExistedIntegrator(email){
	return new Promise((resolve,reject)=>{
		Installers_Details.get(email,function(err,installer){
			if (err){
				const error = {
					status:500,
					message:err.toString()
				}
				console.log('error message:',JSON.stringify(error));
				return reject(error);
			}
			if (installer){
				const error = {
					status:500,
					message:'installer has existed'
				}
				console.log('error message:',JSON.stringify(error));
				return reject(error);
			}
			return resolve(null);
		})
	})
}

function checkAndUpdateInvitationKey(invitationKey){
	return new Promise((resolve,reject)=>{
		Installers_Details.get('administrator@sasys.com.au',function(err,installer){
			if (err){
				const error = {
					status:500,
					message:err
				}
				console.log('error message:',JSON.stringify(error));
				return reject(error)
			}
			if (!installer){
				const error = {
					status:404,
					message:'the administrator does not exist'
				}
				return reject(error);
			}
			const keys = installer.get().tokens;
			const index = keys.findIndex((key)=>{
				return key === invitationKey;
			})
			if (index === -1){
				const error = {
					status: 404,
					message:'the invitation key does not exist'
				}
				console.log('error message:',JSON.stringify(error));
				return reject(error)
			}
			keys.splice(index,1);
			installer.set({tokens:keys});
			installer.update(function(err){
				if (err){
					console.log('error message:',err);
					const error = {
						status:500,
						message:err
					}
					console.log('error message:',JSON.stringify(error));
					return reject(error);
				}
				return resolve(null)
			})
		})
	})
}

function storeNewIntegrator(email,password,customers,accountType){
	return new Promise((resolve,reject)=>{
		const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
		let newInstaller = {}
		if (accountType){
			newInstaller = {
				email:email,
				password:hashedPassword,
				customers:customers,
				accountType:accountType
			}
		}else {
			newInstaller = {
				email:email,
				password:hashedPassword,
				customers:customers
			}
		}
		Installers_Details.create(newInstaller,function(err,installer){
			if (err){
				const error = {
					status:500,
					message:err
				}
				return reject(error);
			}
			const accessToken = tokenForUser(email);
			return resolve(accessToken);
		})
	})
}

exports.handler = (event, context, callback) => {
	const email = event.body.email||'';
	const password = event.body.password||'';
	const invitationKey = event.body.invitationKey||'';
	const customers = [];
	const accountType = event.body.accountType||'';
	if (!email || !password || !invitationKey){
		const error = {
			status:400,
			message:'email, password or invitation key can not be empty'
		}
		console.log('error message:',JSON.stringify(error))
		return callback(JSON.stringify(error))
	}
	if  (typeof email != 'string' || typeof password != 'string' || typeof invitationKey!='string'){
		const error = {
			status:400,
			message:'username, password or invation key  is not a string'
		}
		console.log('error message:',JSON.stringify(error))
		return callback(JSON.stringify(error))
	}
	if (!validator.isEmail(email)){
		const error = {
			status:400,
			message:'username is not valid email'
		}
		console.log('error message:',JSON.stringify(error))
		return callback(JSON.stringify(error))
	}
	isExistedIntegrator(email)
	.then((data)=>{
		return checkAndUpdateInvitationKey(invitationKey)
	})
	.then((data)=>{
		return storeNewIntegrator(email,password,customers,accountType)
	})
	.then((data)=>{
		return callback({success:true,jwtToken:data})
	})
	.catch((err)=>{
		console.log('error message:',JSON.stringify(err));
		return callback(JSON.stringify(err));
	})
}