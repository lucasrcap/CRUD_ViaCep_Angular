const sql = require('mssql/msnodesqlv8');

const config = {
    server: '(localdb)\\MSSQLLocalDB', 
    database: 'ClientesDB',
    options: {
        trustedConnection: true,
        trustServerCertificate: true 
    },
    driver: 'msnodesqlv8'
};

module.exports = config;