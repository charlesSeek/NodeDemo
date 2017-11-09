var dynogels = require('dynogels');
var Joi = require('joi');
var util = require('util');

var AWS = dynogels.AWS;
dynogels.AWS.config.loadFromPath('./config/aws_sdk_config.json');


var Installers_Details = dynogels.define('Installers_Details', {
  hashKey: 'email',
  timestamps : true,
  schema: {
    email: Joi.string().email(),
    customers: Joi.array(),
    password: Joi.string(),
    resetPasswordToken: Joi.string().allow(null),
    resetPasswordExpires: Joi.string().allow(null),
    companyName: Joi.string(),
    companyEmail: Joi.string().email(),
    address: Joi.string(),
    phoneNumber: Joi.number(),
    contactName: Joi.string(),
    abn: Joi.string(),
    freeControlSystemSlots: Joi.number().min(0).default(1),
    accountType : Joi.string(),
    tokens:Joi.array(),
    invitation_code:Joi.array()
  }
});

Installers_Details.config({
  tableName: 'Installers_Details'
});

Installers_Details.decrementControlSystemSlots = function(email, cb) {
  Installers_Details.get(email, function(err, installer_details) {
    if (err) {
      return cb(err);
    }
    var freeControlSystemSlots = installer_details.get('freeControlSystemSlots');
    var decrementedSlots = freeControlSystemSlots - 1;
    if(decrementedSlots < 0) {
      return cb(new Error('You have reached the Control system slot limit'));
    }
    installer_details.set({
      freeControlSystemSlots: decrementedSlots
    });
    installer_details.update(function(err) {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  });
}
module.exports = Installers_Details;