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
      provider: "kakao",
    };

    const kakaoUser = await User.findOneBySocialId(kakaoId, "kakao");

    if (kakaoUser.length === 0) {
      await User.createKakaoUser(userInfo);

      const newKakaoUser = await User.findOneBySocialId(kakaoId, "kakao");

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

//네이버 인가코드로 로그인 진행
const naverLogin = async (code, state, res) => {
  try {
    const requestData = {
      grant_type: "authorization_code",
      client_id: config.naver.login.client_id,
      client_secret: config.naver.login.client_secret,
      code: code,
      state: state,
    };

    const params = new URLSearchParams(requestData).toString();

    const requestUrl = `https://nid.naver.com/oauth2.0/token?${params}`;

    //인가코드로 토큰 발급 요청
    const accessTokenRes = await fetch(requestUrl, {
      method: "POST",
    });

    const token = await accessTokenRes.json();

    //액세스토큰으로 네이버에 유저 정보 요청
    const naverUserInfoReqUrl = "https://openapi.naver.com/v1/nid/me";

    //prettier-ignore
    const naverMemberInfoRes = await fetch(naverUserInfoReqUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.access_token}`,
      },
    });

    const naverMemberInfo = await naverMemberInfoRes.json();

    const naverId = naverMemberInfo.response.id;
    const naverNickname = naverMemberInfo.response.nickname;
    const naverProfileImage = naverMemberInfo.response.profile_image;
    const naverEmail = naverMemberInfo.response.email;
    const naverGender = naverMemberInfo.response.gender;

    const userInfo = {
      naverId: naverId,
      naverNickname: naverNickname,
      naverProfileImage: naverProfileImage,
      naverEmail: naverEmail,
      naverGender: naverGender,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      provider: "naver",
    };

    const naverUser = await User.findOneBySocialId(naverId, "naver");

    if (naverUser.length === 0) {
      await User.createNaverUser(userInfo);

      const newNaverUser = await User.findOneBySocialId(naverId, "naver");

      return {
        loginSuccess: true,
        naverUser: {
          userId: newNaverUser[0].user_id,
          profile: newNaverUser[0].profile_url,
          nickName: newNaverUser[0].name,
        },
      };
    } else {
      return {
        loginSuccess: true,
        naverUser: {
          userId: naverUser[0].user_id,
          profile: naverUser[0].profile_url,
          nickName: naverUser[0].name,
        },
      };
    }
  } catch (err) {
    console.error("네이버 로그인 error:", err);

    return res.json({
      loginSuccess: false,
      message: "네이버 로그인 중 오류가 발생했습니다.",
    });
  }
};

module.exports = {
  kakaoLogin,
  naverLogin,
};
