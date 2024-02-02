const dbConnection = require("../utils/db");
const { v4: UUID } = require("uuid");

const findOneByKakaoId = async (kakaoId) => {
  const query = `SELECT * FROM socialLogin s
                  inner join users u on s.user_id = u.user_id
                  WHERE provider = 'kakao' AND provider_id = ${kakaoId};`;
  const userInfo = await doQuery(query);

  return userInfo;
};

const createKakaoUser = async (userInfo) => {
  const createUserQuery = `INSERT INTO users (email, name, password) VALUES ('${
    userInfo.kakaoEmail
  }', '${userInfo.kakaoNickname}', '${UUID()}');`;

  const newUser = await doQuery(createUserQuery);

  const createSocialUserQuery = `INSERT INTO socialLogin (provider_id, provider, access_token, profile_url, user_id) 
  VALUES (${userInfo.kakaoId}, 'kakao', '${userInfo.accessToken}', '${userInfo.kakaoProfileImage}', ${newUser.insertId});`;

  const newKakaoUser = await doQuery(createSocialUserQuery);

  const addSocialIdQuery = `UPDATE users SET social_login_id = ${newKakaoUser.insertId} WHERE user_id = ${newUser.insertId};`;
  await doQuery(addSocialIdQuery);

  return Promise.resolve("회원가입이 완료되었습니다.");
};

const doQuery = (query) => {
  return new Promise((resolve, reject) => {
    dbConnection.query(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = { findOneByKakaoId, createKakaoUser };
