module.exports = {
  development: {
    database: 'db-dev', 
    username: 'postgres', 
    password: 'postgres',
    host: 'localhost', 
    dialect: 'postgres'
  },
  test: {
    database: 'db-test', 
    username: 'postgres', 
    password: 'postgres',
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
    port: 8080
  }
}