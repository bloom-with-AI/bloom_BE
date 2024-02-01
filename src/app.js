const express = require("express");
const cors = require("cors");

const port = 8080;
const app = express();

app.use(cors());

// //db연결
// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("데이터베이스 연결 성공");
//   })
//   .catch((err) => {
//     console.error(err);
//   });

//main page 연결 테스트용
app.get("/", (req, res) => {
  return res.send("Hello");
});

const userRouter = require("./api/routes/user");
app.use("/login", [userRouter]);

// app.use("/user", [userRouter]);

const searchRouter = require("./api/routes/search");
app.use("/search", [searchRouter]);

app.listen(port, () => {
  console.log(`${port}서버에 연결되었습니다.`);
});
