var expect = require( 'chai' ).expect;
var myLambda = require( '../index' );
describe( 'myLambda', function() {
    [
        {
            "type": "TOKEN",
            "authorizationToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyb2hpdEBzbWFydHZvaWNlLmNvbS5hdSIsImlhdCI6MTUwMTcxOTk3NTY5OSwiZXhwIjoxNTAxNzIzNTc1Njk5fQ.fnPJm2iWBEn2B0wAxeg7dN5VD-iKtylpKdpH4JmkF34",
            "methodArn": "***********************************"
        }

    ].forEach( function( validEvent ) {

        it( `successful invocation: event=${validEvent}`, function( done ) {
            myLambda.handler( validEvent,{},(err, result) => {
                try {
                    expect(err).to.not.exist;
                    expect(result).to.exist;
                    expect(result.policyDocument.Statement[0].Effect).to.equal('Allow');
                    done();
                }
                catch( error ) {
                    done( error );
                }
            });
        });
    });
    [
        {
            "type": "TOKEN",
            "authorizationToken": "",
            "methodArn": "***********************************"
        },
        {
            "type": "TOKEN",
            "authorizationToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyb2hpdEBzbWFydHZvaWNlLmNvbS5hdSIsImlhdCI6MTUwMTcxOTk3NTY5OSwiZXhwIjoxNTAxNzIzNTc1Njk5fQ.fnPJm2iWBEn2B0wAxeg7dN5VD-iKtylpKdpH4JmkF3",
            "methodArn": "***********************************" 
        }

    ].forEach(function (element) {
        it( `fail: when token is invalid: event=${element}`, function( done ) {
            myLambda.handler(element, {}, (err,result) => {
                try {
                    expect(err).to.exist;
                    expect(result).to.not.exist;
                    done();
                }
                catch( error ) {
                    done( eror );
                }
            });
        });
    });
    [
        {
            "type": "TOKEN",
            "authorizationToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyb2hpdEBzbWFydHZvaWNlLmNvbS5hdSIsImlhdCI6MTUwMTY1NTA0MTg3MiwiZXhwIjoxNTAxNjU4NjQxODcyfQ.8pBASvGs4sHPRJBwhJJ3CKdC_nTKiyO9z_ezMp1rbmI",
            "methodArn": "***********************************"
        }
    ].forEach( function(invalidEvent) {
        it( `fail: when token is expired: event=${invalidEvent}`, function( done ) {
            myLambda.handler(invalidEvent, {}, (err,result) => {
                try {
                    expect(err).to.not.exist;
                    expect(result).to.exist;
                    expect(result.policyDocument.Statement[0].Effect).to.equal('Deny');
                    done();
                }
                catch( error ) {
                    done( eror );
                }
            });
        });
    });

});