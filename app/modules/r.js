'use strict';

const cp = require('child_process');
const config = require('../../config.json');

let refreshDb = function (callback) {
    const command = config.RLocation + ' main.R' +
                    ' ' + __dirname + '/../../r/ --vanilla';
                    
    console.log(command);
    cp.exec(command,
            { 
                cwd: __dirname + '/../../r/',
                maxBuffer: 2 * 1024 * 1024 ,
                timeout: 1000 * 60 * 5
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err.stack);
                    console.log('Error code: ' + err.code);
                }
                
                console.log('stdout: ' + stdout);
            }
    );
}

module.exports = {
    refreshDb: refreshDb
}