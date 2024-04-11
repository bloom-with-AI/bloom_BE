const fetch = require("node-fetch");
require("dotenv").config();
const User = require("../models/User");

//카카오 인가 코드로 로그인 진행
const kakaoLogin = async (code, res) => {
  try {
    //인가 코드로 엑세스 토큰 요청
    const requestData = {
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: process.env.KAKAO_REDIRECT_URL,
      code: code,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
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

    const userInfo = {
      kakaoId: kakaoMemberInfo.id,
      kakaoNickname: kakaoMemberInfo.properties.nickname,
      kakaoEmail: kakaoMemberInfo.kakao_account.email,
      kakaoProfileImage: kakaoMemberInfo.properties.profile_image,
      kakaoGender:
        kakaoMemberInfo.kakao_account.gender === "female" ? "F" : "M",
      accessToken: accessToken.access_token,
      refreshToken: accessToken.refresh_token,
      provider: "kakao",
    };

    const kakaoUser = await User.findOneBySocialId(userInfo.kakaoId, "kakao");

    if (kakaoUser.length === 0) {
      await User.createKakaoUser(userInfo);

      const newKakaoUser = await User.findOneBySocialId(
        userInfo.kakaoId,
        "kakao"
      );

      return {
        loginSuccess: true,
        kakaoUser: {
          userId: newKakaoUser[0].user_id,
          profile: newKakaoUser[0].profile_url,
          nickName: newKakaoUser[0].name,
        },
      };
    } else {
      const updateData = {
        profileUrl: userInfo.kakaoProfileImage,
        accessToken: userInfo.accessToken,
        refreshToken: userInfo.refreshToken,
      };

      await User.updateBySocialId(kakaoUser[0].social_login_id, updateData);

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
      client_id: process.env.NAVER_LOGIN_CLIENT_ID,
      client_secret: process.env.NAVER_LOGIN_CLIENT_SECRET,
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

    const userInfo = {
      naverId: naverMemberInfo.response.id,
      naverNickname: naverMemberInfo.response.nickname,
      naverProfileImage: naverMemberInfo.response.profile_image,
      naverEmail: naverMemberInfo.response.email,
      naverGender: naverMemberInfo.response.gender,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      provider: "naver",
    };

    const naverUser = await User.findOneBySocialId(userInfo.naverId, "naver");

    if (naverUser.length === 0) {
      await User.createNaverUser(userInfo);

      const newNaverUser = await User.findOneBySocialId(
        userInfo.naverId,
        "naver"
      );

      return {
        loginSuccess: true,
        naverUser: {
          userId: newNaverUser[0].user_id,
          profile: newNaverUser[0].profile_url,
          nickName: newNaverUser[0].name,
        },
      };
    } else {
      const updateData = {
        profileUrl: userInfo.naverProfileImage,
        accessToken: userInfo.accessToken,
        refreshToken: userInfo.refreshToken,
      };

      await User.updateBySocialId(naverUser[0].social_login_id, updateData);

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
  }
};

//해당 유저가 kakao 유저인지 naver 유저인지 확인 후 해당하는 로그아웃 프로세스를 진행.
const userLogout = async (userId, res) => {
  try {
    const logoutUser = await User.findOneByUserId(userId);

    if (logoutUser[0].provider === "naver") {
      await naverLogout(logoutUser[0].access_token);

      await User.deleteTokenByUserId(logoutUser[0].user_id);
    } else {
      console.log("이곳은 카카오 로그아웃 진행 코드가 들어갈 예정입니다.");
    }
  } catch (err) {
    console.log(err);

    throw err;
  }
};

const naverLogout = async (accessToken) => {
  try {
    const requestData = {
      grant_type: "delete",
      client_id: process.env.NAVER_LOGIN_CLIENT_ID,
      client_secret: process.env.NAVER_LOGIN_CLIENT_SECRET,
      access_token: accessToken,
      service_provider: "NAVER",
    };

    const params = new URLSearchParams(requestData).toString();

    const requestUrl = `https://nid.naver.com/oauth2.0/token?${params}`;

    //엑세스토큰 네이버에서 삭제처리
    await fetch(requestUrl, {
      method: "POST",
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  kakaoLogin,
  naverLogin,
  userLogout,
};
