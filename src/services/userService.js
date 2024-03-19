const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const User = require("../models/User");

// YAML 파일 로드 및 파싱
const yamlFilePath = path.join(__dirname, "..", "application.yml");
let config;

try {
  const configFile = fs.readFileSync(yamlFilePath, "utf8");
  config = yaml.load(configFile);
} catch (error) {
  console.error("Error reading YAML file:", error);
}

//카카오 인가 코드로 로그인 진행
const kakaoLogin = async (code, res) => {
  try {
    //인가 코드로 엑세스 토큰 요청
    const requestData = {
      grant_type: "authorization_code",
      client_id: config.kakao.client_id,
      redirect_uri: config.kakao.redirect_url,
      code: code,
      client_secret: config.kakao.client_secret,
    };

    const params = new URLSearchParams(requestData).toString();

    const requestUrl = `https://kauth.kakao.com/oauth/token?${params}`;

    const accessTokenRes = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = await accessTokenRes.json();

    //액세스토큰으로 카카오에 유저 정보 요청
    const kakaoUserInfoReqUrl = "https://kapi.kakao.com/v2/user/me";

    //액세스 토큰으로 유저 정보 요청
    //prettier-ignore
    const kakaoMemberInfoRes = await fetch(kakaoUserInfoReqUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const kakaoMemberInfo = await kakaoMemberInfoRes.json();

    const kakaoId = kakaoMemberInfo.id;
    const kakaoNickname = kakaoMemberInfo.properties.nickname;
    const kakaoProfileImage = kakaoMemberInfo.properties.profile_image;
    const kakaoThumbnail = kakaoMemberInfo.properties.thumbnail_image;
    const kakaoEmail = kakaoMemberInfo.kakao_account.email;

    const userInfo = {
      kakaoId: kakaoId,
      kakaoNickname: kakaoNickname,
      kakaoEmail: kakaoEmail,
      kakaoProfileImage: kakaoProfileImage,
      kakaoThumbnail: kakaoThumbnail,
      accessToken: accessToken.access_token,
      refreshToken: accessToken.refresh_token,
    };

    const kakaoUser = await User.findOneByKakaoId(kakaoId);

    if (kakaoUser.length === 0) {
      await User.createKakaoUser(userInfo);

      const newKakaoUser = await User.findOneByKakaoId(kakaoId);

      return {
        loginSuccess: true,
        kakaoUser: {
          userId: newKakaoUser[0].user_id,
          profile: newKakaoUser[0].profile_url,
          nickName: newKakaoUser[0].name,
        },
      };
    } else {
      return {
        loginSuccess: true,
        kakaoUser: {
          userId: kakaoUser[0].user_id,
          profile: kakaoUser[0].profile_url,
          nickName: kakaoUser[0].name,
        },
      };
    }
  } catch (err) {
    console.error("카카오 로그인 error:", err);

    return res.json({
      loginSuccess: false,
      message: "카카오 로그인 중 오류가 발생했습니다.",
    });
  }
};

module.exports = {
  kakaoLogin,
};
