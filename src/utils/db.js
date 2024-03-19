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

const connection = mysql.createConnection({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.databaseName,
});

connection.connect((err) => {
  if (err) {
    console.log("db is not connected");
    return;
  }
  console.log("db is connected successfully");
});

module.exports = connection;
