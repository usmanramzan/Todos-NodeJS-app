let fs = require('fs')

module.exports = {
    up: function(squelize, DataTypes) {
        return squelize.transaction(function(t){
            let data = fs.readFileSync(`init.sql`)
            const rawSql = data.toString()
            const queries = rawSql.split(';')
            return Promise.all(queries.map(function(q){
                return squelize.query(q, {transaction:t})
            }))
        })
        .then(function(){
            console.log('Transaction has been commited')
        })
        .catch(function(e){
            console.log(e)
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
            throw new Error('Error in transaction 000000_base')
            
        })
        
    }
};
