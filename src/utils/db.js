const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// YAML 파일 로드 및 파싱
const yamlFilePath = path.join(__dirname, "..", "application.yml");
let config;

try {
  const configFile = fs.readFileSync(yamlFilePath, "utf8");
  config = yaml.load(configFile);
} catch (error) {
  console.error("Error reading YAML file:", error);
}

const dbConnection = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = dbConnection;
