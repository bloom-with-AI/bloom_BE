const mysql = require("mysql2");
require("dotenv").config();

const dbConnection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (process.env.DATABASE_NAME !== undefined) {
  console.log("환경설정 변수가 성공적으로 읽히고 있습니다.");
} else {
  console.log("환경설정 변수가 정의되지 않았습니다.");
}

module.exports = dbConnection;
