const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//import 해올때 "{}"의 유무는 가져올 모듈의 기본값이 정해져 있으면 없이 사용해도 되고 변수명도 마음대로 받아올 수 있다 그렇지않으면 사용해야한다
//ex) module.exports.default = ab
// => const a = require('ab');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");

const config = require("./config/key");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    //오류가 뜨는걸 예방하고자 쓰는코드 (?)
  })
  .then(() => console.log("MongoDB Connected...")) //몽고db가 연결되었을때
  .catch((err) => console.log(err)); // 실패했을 때

app.get("/", (req, res) => {
  res.send("5000포트 테스트입니다! No SQL");
});

app.get("/api/hello", (req, res) => {
  res.send("server/index.js에서의 응답입니다: 안녕하세요");
});

app.post("/api/users/register", (req, res) => {
  //Client에서 회원가입 때 입력한 정보를 가져오면
  //정보들을 db에 넣어준다

  // req 안에 있는 자료 예시
  // {
  //   id: hello
  //   pw : world
  // }
  // 이는 bodyparser가 있기에 가능하다
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

//문제 : /api/users/login 경로로 하면 postman의 전달된 값을 받을 수 없다 [해결안됌]
app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 찾는다
  //findOne : mongdb에서 제공하는 검색 매소드
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "입력된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인한다
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      //비밀번호도 맞다면 토큰을 생성한다
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //받아온 토큰을 저장할 장소를 지정한다
        //ex ) 쿠키, 로컬저장소, 세션
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

//auth는 미들웨어 역할을 한다
// app.get([a], [b], [c])
//[a]엔드포인트에서 요청(리퀘스트)를 받고
//[c]의 콜백 함수 전에 중간에서 무언가를 해주는 역할을
//하기 때문에 미들웨어라 불린다
app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 왔다는것은 미들웨어를 통과했다는 뜻이며
  //미들웨어를 통과하지 못할 시 함수를 탈출하게 되어있다
  //Authentication 이 True 라는 말도 된다

  res.status(200).json({
    _id: req.user._id, //auth.js에서 리퀘스트 했기때문에 이렇게 사용가능

    //role 1 어드민 / role2 다른 직책 => 정책이 맘대로 변겨이 가능함
    //현재는 role 0 : 일반유저, 그게 아니라면 관리자
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
