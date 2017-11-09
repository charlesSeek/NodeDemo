const Installers_Details = require('./models/Installers_Details');
const jwt = require('jwt-simple');
const Jwt_Config = require('./config/jwt_secret_config');

/**
 * lambda function for API gateway custom authorizer
 * @param  {Object}   event    event object for lambda function 
 * @param  {[}   context  
 * @param  {Function} callback callback function for lambada function
 * 
 */
exports.handler = (event, context, callback) => {
	console.log('input event:',JSON.stringify(event));
	console.log('input context:',JSON.stringify(context));
	const jwtToken = event.authorizationToken||'';
	if (!jwtToken){
		const error = {
			status:401,
			message:'No access token'
		}
		console.log('error:',JSON.stringify(error));
		return callback('unauthorized');
	}
	let decoded = {};
	try {
		decoded = jwt.decode(jwtToken,Jwt_Config.secret);
	}catch(err){
		const error = {
			status:401,
			message:'Access token decod failed'
		}
		console.log('error:',JSON.stringify(error));
		return callback('unauthorized');
	}
	const sub = decoded.sub||'';
	const expired = decoded.exp||0;
	if (expired < Date.now()){
		const error = {
			status:403,
			message:'Access token is expired'
		}
		console.log('error:',JSON.stringify(error))
		const policy = genPolicy('Deny',event.methodArn);
		const principalId = sub;
		const response = {
			principalId:principalId,
			policyDocument:policy
		}
		return callback(null,response);
	}
	Installers_Details.get(sub,function(err,installer){
		if (err){
			const error = {
				status:500,
				message:"DynamoDB error"
			}
			console.log('error:',JSON.stringify(error));
			return callback(JSON.stringify(error))
		}
		if (!installer){
			const error = {
				status:401,
				message:'Integrator not be found'
			}
			console.log('error:',JSON.stringify(error));
			return callback('unauthorized');
		}
		const policy = genPolicy('Allow',event.methodArn);
		const principalId = sub;
		const response = {
			principalId:principalId,
			policyDocument:policy
		}
		return callback(null,response);
	})

}


/**
 * generate a AWS IAM policy
 * @param  {String} effect   Allow|Deny
 * @param  {String} resource lambada function Arn
 * @return {[type]}          policy object
 */
function genPolicy(effect,resource){
	const policy = {};
	policy.Version = "2012-10-17";
	policy.Statement = [];
	const stmt = {};
	stmt.Action = 'execute-api:Invoke';
	stmt.Effect = effect;
	stmt.Resource = resource;
	policy.Statement.push(stmt);
	return policy;
}
