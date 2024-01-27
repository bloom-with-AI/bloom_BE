const express = require("express");
const app = express();
const port = 8080;

app.listen(port, () => {
  console.log(`${port}서버에 연결되었습니다.`);
});

app.get("/", (req, res) => {
  return res.send("Hello");
});
