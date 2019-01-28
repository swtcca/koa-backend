module.exports = {
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "1432",
  database: "test",
  entities: [__dirname + "/src/entity/*{.js,.ts}"],
  synchronize: true
}
