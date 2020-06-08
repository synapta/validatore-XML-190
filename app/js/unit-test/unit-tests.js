var test = require('./data.js');
var fun = require('../lib/test-functions.js');
var assert = require('assert');


for (var key in test.data) {
    if (test.data.hasOwnProperty(key)) {
        let tests = test.data[key];
        describe(`Test ${key}()`, function() {
            for (let i = 0; i < tests.length; i++) {
                let title = 'Test ' + i;
                describe(title, function() {
                    it(tests[i].description + ': "' +  tests[i].inputData + '"', function() {
                        assert.deepEqual(fun[key](tests[i].inputData), tests[i].expectedOutput);
                    });
                });
            }
        });
    }
}
