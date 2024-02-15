const dbConnection = require("../utils/db");
const { v4: UUID } = require("uuid");

const findOneBySocialId = async (socialId, provider) => {
  const query = `SELECT * FROM socialLogin s
                  inner join users u on s.user_id = u.user_id
                  WHERE provider = '${provider}' AND provider_id = '${socialId}';`;
  const userInfo = await doQuery(query);

  return userInfo;
};

const createKakaoUser = async (userInfo) => {
  const createUserQuery = `INSERT INTO users (email, name, password) VALUES ('${
    userInfo.kakaoEmail
  }', '${userInfo.kakaoNickname}', '${UUID()}');`;

  const newUser = await doQuery(createUserQuery);

  const createSocialUserQuery = `INSERT INTO socialLogin (provider_id, provider, access_token, profile_url, user_id) 
  VALUES ('${userInfo.kakaoId}', '${userInfo.provider}', '${userInfo.accessToken}', '${userInfo.kakaoProfileImage}', ${newUser.insertId});`;

  const newKakaoUser = await doQuery(createSocialUserQuery);

  const addSocialIdQuery = `UPDATE users SET social_login_id = ${newKakaoUser.insertId} WHERE user_id = ${newUser.insertId};`;
  await doQuery(addSocialIdQuery);

  return Promise.resolve("회원가입이 완료되었습니다.");
};

const createNaverUser = async (userInfo) => {
  const createUserQuery = `INSERT INTO users (email, name, password, gender) VALUES ('${
    userInfo.naverEmail
  }', '${userInfo.naverNickname}', '${UUID()}', '${userInfo.naverGender}');`;

  const newUser = await doQuery(createUserQuery);

  const createSocialUserQuery = `INSERT INTO socialLogin (provider_id, provider, access_token, refresh_token, profile_url, user_id) 
  VALUES ('${userInfo.naverId}', '${userInfo.provider}', '${userInfo.accessToken}', '${userInfo.refreshToken}', '${userInfo.naverProfileImage}', ${newUser.insertId});`;

  const newNaverUser = await doQuery(createSocialUserQuery);

  const addSocialIdQuery = `UPDATE users SET social_login_id = ${newNaverUser.insertId} WHERE user_id = ${newUser.insertId};`;
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

module.exports = {
  findOneBySocialId,
  createKakaoUser,
  createNaverUser,
};
