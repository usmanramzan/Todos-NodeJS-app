const path = require('path');
const child_process = require('child_process');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const Umzug = require('umzug');

const DB_TYPE = process.env.DB_TYPE || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const DB_NAME = process.env.DB_NAME || 'todos';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASS || 'a10';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_TYPE,
  dialectOptions: {
    multipleStatements: true
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
        sequelize: sequelize,
    },

    // see: https://github.com/sequelize/umzug/issues/17
    migrations: {
        params: [
            sequelize, // queryInterface
            sequelize.constructor, // DataTypes
            function() {
                throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
            }
        ],
        path: './migrations',
        pattern: /\.js$/
    },

    logging: function() {
        console.log.apply(null, arguments);
    },
});

function logUmzugEvent(eventName) {
    return function(name, migration) {
        console.log(`${ name } ${ eventName }`);
    }
}
umzug.on('migrating', logUmzugEvent('migrating'));
umzug.on('migrated',  logUmzugEvent('migrated'));
umzug.on('reverting', logUmzugEvent('reverting'));
umzug.on('reverted',  logUmzugEvent('reverted'));

function cmdStatus() {
    let result = {};

    return umzug.executed()
      .then(executed => {
        result.executed = executed.filter(function(fileObj){
            return fileObj.file != '000000_base.js'
        });
        return umzug.pending();
    }).then(pending => {
        result.pending = pending.filter(function(fileObj){
            return fileObj.file != '000000_base.js'
        })
        return result;
    }).then(({ executed, pending }) => {

        executed = executed.map(m => {
            m.name = path.basename(m.file, '.js');
            return m;
        });
        pending = pending.map(m => {
            m.name = path.basename(m.file, '.js');
            return m;
        });

        const current = executed.length > 0 ? executed[executed.length - 1].file : '<NO_MIGRATIONS>';
        const status = {
            current: current,
            executed: executed.map(m => m.file),
            pending: pending.map(m => m.file),
        }

        console.log(JSON.stringify(status, null, 2))

        return { executed, pending };
    })
}

function cmdMigrate() {
    return umzug.up({from: '000000_base'});
}

function cmdMigrateNext() {
    return cmdStatus()
        .then(({ executed, pending }) => {
            console.log('pending.....', pending)
            if (pending.length === 0) {
                return Promise.reject(new Error('No pending migrations'));
            }
            const next = pending[0].name;
            return umzug.up({ migrations: [next]});
        })
}


function up_one(name) {
    return cmdStatus()
        .then(({ executed, pending }) => {
            console.log('pending.....', pending)
            if (pending.length === 0) {
                return Promise.reject(new Error('No pending migrations'));
            }
            filtered = pending.filter(function(pending){
                return name == pending.name
            })
    
            if (filtered == 0){
                throw new Error("Could not match any migration name");
                return
            }
            const next = name;
            return umzug.up({ migrations: [next]});
        })
}

function down_one(name){
    return cmdStatus()
    .then(({ executed, pending }) => {
        if (executed.length === 0) {
            return Promise.reject(new Error('Already at initial state'));
        }
        console.log(executed)
        filtered = executed.filter(function(executed){
            return name == executed.name
        })

        console.log(filtered)

        if (filtered == 0){
            throw new Error("Could not match any migration name");
            return
        }

        const prev = name;
        return umzug.down({migrations:[prev]});
    })
}

function cmdReset() {
    return umzug.down({ to: 0 });
}

function cmdResetTo(name){
    return umzug.down({to:name})
}

function cmdResetPrev() {
    return cmdStatus()
        .then(({ executed, pending }) => {
            if (executed.length === 0) {
                return Promise.reject(new Error('Already at initial state'));
            }
            const prev = executed[executed.length - 1].name;
            return umzug.down({migrations:[prev]});
        })
}

function cmdHardReset() {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                console.log(`dropdb ${ DB_NAME }`);
                child_process.spawnSync(`dropdb ${ DB_NAME }`);
                console.log(`createdb ${ DB_NAME } --username ${ DB_USER }`);
                child_process.spawnSync(`createdb ${ DB_NAME } --username ${ DB_USER }`);
                resolve();
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    });
}

function cmdInitialize(){
    return umzug.up({ migrations: ['000000_base'] })

}

const cmd = process.argv[2].trim();
let executedCmd;

console.log(`${ cmd.toUpperCase() } BEGIN`);
switch(cmd) {
    case 'status':
        executedCmd = cmdStatus();
        break;

    case 'up':
    case 'migrate':
        executedCmd = cmdMigrate();
        break;

    case 'next':
    case 'migrate-next':
        executedCmd = cmdMigrateNext();
        break;

    case 'down':
    case 'reset':
        executedCmd = cmdReset();
        break;

    case 'prev':
    case 'reset-prev':
        executedCmd = cmdResetPrev();
        break;

    case 'up-name':
        name = process.argv[3].trim()
        executedCmd = up_one(name)
        break;
        
    case 'down-name':
        name = process.argv[3].trim()
        executedCmd = down_one(name)
        break;

    case 'down-to-name':
        name = process.argv[3].trim()
        executedCmd = cmdResetTo(name)
        break;

    case 'reset-hard':
        executedCmd = cmdHardReset();
        break;

    case 'init':
        executedCmd = cmdInitialize()
        break;

    default:
        console.log(`invalid cmd: ${ cmd }`);
        process.exit(1);
}

executedCmd
    .then((result) => {
        const doneStr = `${ cmd.toUpperCase() } DONE`;
        console.log(doneStr);
        console.log("=".repeat(doneStr.length));
    })
    .catch(err => {
        const errorStr = `${ cmd.toUpperCase() } ERROR`;
        console.log(errorStr);
        console.log("=".repeat(errorStr.length));
        console.log(err);
        console.log("=".repeat(errorStr.length));
	process.exit(1);
    })
    .then(() => {
        if (cmd !== 'status' && cmd !== 'reset-hard') {
            return cmdStatus()
        }
        return Promise.resolve();
    })
    .then(() => process.exit())
