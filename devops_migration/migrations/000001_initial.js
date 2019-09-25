module.exports = {
    up: function(squelize, DataTypes) {
        return squelize.transaction(function(t){
            const rawSql = `
            create table if not exists "SequelizeMeta"
            (
              name varchar not null
                constraint "SequelizeMeta_pkey"
                primary key
            );
            
            create table if not exists todos
            (
              id serial
                constraint todos_pk
                  primary key,
              title varchar,
              status boolean default false
            );

            INSERT INTO todos (title, status) VALUES ('HOD', false);
            INSERT INTO todos (title, status) VALUES ('Jenkins', false);
            INSERT INTO todos (title, status) VALUES ('Ansible', false);
            INSERT INTO todos (title, status) VALUES ('Puppet', false);
            INSERT INTO todos (title, status) VALUES ('Chef', false);
            INSERT INTO todos (title, status) VALUES ('Nagios', false);
            
            `;
            return Promise.all([
                squelize.query(rawSql, {transaction:t}),
            ])
        })
        .then(function(){
            console.log('Transaction has been commitedd')
        })
        .catch(function(e){
            console.log(e)
            throw new Error('Error in transaction 000001_initial')
        })
        
    },

    down: function(squelize, DataTypes) {
        return squelize.transaction(function(t){
            return Promise.resolve()
        })
        .then(function(){
            console.log('Transaction has been commitedd')
        })
        .catch(function(){
            throw new Error('Error in transaction 000001_initial')
        })
    }
};
