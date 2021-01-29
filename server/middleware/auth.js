const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 웹 페이지 간에 인증처리를 하는 부분
  let token = req.cookies.x_auth;

  //클라리언트 쿠키에서 토큰을 가져온다
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true }); // 유저가 없으니 클라이언트에 에러를 전송하는 것이다

    // 유저가 있으면 V
    //토큰과 유저를 req에 넣어주는 이유는
    // index.js 에서도  req를 받을때 사용 할 수 있기 때문이다
    req.token = token;
    req.user = user;
    next();
    //next를 사용하는 이유는 현재 위치가 미들웨어 이기때문에
    //위에 코드를 실행 후 다음 동작을 진행하기 위함이다
  });

  // 토큰을 복호화 한 후 유저를 찾는다.

  //유저가 있으면 인증

  // 그렇지 않으면 인증 ㅇ
};

module.exports = { auth };
