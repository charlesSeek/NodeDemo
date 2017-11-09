var expect = require( 'chai' ).expect;
var myLambda = require( '../index' );
describe( 'myLambda', function() {
    this.timeout(5000);
    let integrators = [
        {
            "body":{
                "email":"",
                "password":"SmartVoice345",
                "invitationKey":"test"
            }
        },
        {
            "body":{
                "email":"test@smartvoice.com.au",
                "password":"",
                "invitationKey":"test"
            }
        },
        {
            "body":{
                "email":"test@smartvoice.com.au",
                "password":"SmartVoice345",
                "invitationKey":""
            }
        }
    ]
    integrators.forEach(function(integrator){
        it ('get error: when email, password or invitation key is empty',function(done){
            myLambda.handler(integrator,{},(err,result)=>{
                try {
                    expect(err).to.exist;
                    expect(result).to.not.exist;
                    expect(JSON.parse(err).message).equal('email, password or invitation key can not be empty')
                    done();
                }
                catch( error ) {
                    done( error );
                }
            })
        })
    })
    integrators = [
        {
            "body":{
                "email":1111,
                "password":"SmartVoice345",
                "invitationKey":"test"
            }
        },
        {
            "body":{
                "email":"test@smartvoice.com.au",
                "password":1111,
                "invitationKey":"test"
            }
        },
        {
            "body":{
                "email":"test@smartvoice.com.au",
                "password":"SmartVoice345",
                "invitationKey":1111
            }
        }
    ]
    integrators.forEach(function(integrator){
        it ('get error: when email, password or invitation key is not a string',function(done){
            myLambda.handler(integrator,{},(err,result)=>{
                try {
                    expect(err).to.exist;
                    expect(result).to.not.exist;
                    expect(JSON.parse(err).message).equal('username, password or invation key  is not a string')
                    done();
                }
                catch( error ) {
                    done( error );
                }
            })
        })
    })
    it( 'ger error: when email is not a valid eamil address', function( done ) {
        const  userData = {
            "body":{
                "email":"smartvoice.com.au",
                "password":"SmartVoice345",
                "invitationKey":"test"
            }
        }
        myLambda.handler(userData, {}, (err,result) => {
            try {
                expect(err).to.exist;
                expect(result).to.not.exist;
                expect(JSON.parse(err).message).equal("username is not valid email")
                done();
            }
            catch( error ) {
                done( error );
            }
        });
    });
    it( 'ger error: when email exists', function( done ) {
        const  userData = {
            "body":{
                "email":"rohit@smartvoice.com.au",
                "password":"SmartVoice345",
                "invitationKey":"test"
            }
        }
        myLambda.handler(userData, {}, (err,result) => {
            try {
                expect(err).to.exist;
                expect(result).to.not.exist;
                expect(JSON.parse(err).message).equal("installer has existed")
                done();
            }
            catch( error ) {
                done( error );
            }
        });
    });
    it( 'ger error: when token does not exist', function( done ) {
        const  userData = {
            "body":{
                "email":"test123@smartvoice.com.au",
                "password":"SmartVoice345",
                "invitationKey":"abc"
            }
        }
        myLambda.handler(userData, {}, (err,result) => {
            try {
                expect(err).to.exist;
                expect(result).to.not.exist;
                expect(JSON.parse(err).message).equal("the invitation key does not exist")
                done();
            }
            catch( error ) {
                done( error );
            }
        });
    });
    it('successfully get token', function( done ) {
        const userData = {
            "body":{
                "email":"test123@smartvoice.com.au",
                "password":"SmartVoice345",
                "invitationKey":"test"
            }
        }
        myLambda.handler( userData,{},(err, result) => {
            try {
                expect(err).to.not.exist;
                expect(result).to.exist;
                expect(result.success).to.be.true;
                expect(result.jwtToken).to.exist;
                done();
            }
            catch( error ) {
                done( error );
            }
        });
    });
});