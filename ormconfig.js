module.exports = [
  {
    name: 'development',
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "1432",
    database: "test",
    synchronize: true
  },
  {
    name: 'production',
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "14321",
    database: "test",
    synchronize: false
  }
]