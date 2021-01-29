const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

//saltRounds : salt가 몇글자인지를 나타냄

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //스페이스바를 없애주는 역할을 한다
    unique: 1, //중복불가
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    //권한설정
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    //토큰 유효기간
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  //password가 변환될때만 암호화 진행
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    //비밀번호 변경이 아닐때 바로 넘기기 위한함수
    next();
  }
  //비밀번호 암호화 시킴
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword = ex)134567 =>db에 있는 암호화 되는 비밀번호
  // $2b$10$bc2rlCCBF1bXxoz9UJd95uq9OpGni.Rod2n6bhovybNYm.0AoqXCu 이를 복호화 해서 사용할 수는 없다
  //그래서 입력된 비밀번호와 db에있는 비밀번호와 동일한지 확인한다

  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err); //동일하지 않으면 콜백에 에러 반환
    cb(null, isMatch); // 그렇지 않으면 null값 반환
  });
};

userSchema.methods.generateToken = function (cb) {
  //jsonwebtoken을 이용해서 token 생성
  var user = this;

  var token = jwt.sign(user._id.toHexString(), "secretToken");

  // user._id + 'secretToken' = token
  // ->
  // 'secretToken' -> user._id
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  // user._id + " " = token
  //가져온 토큰을 decode한다
  jwt.verify(token, "secretToken", function (err, decode) {
    //유저 아이디를 이용해서 유저를 찾고
    //클라이언트에서 가져온 토큰과 데이터베이스에 보관된 토큰이
    //일치하는지 확인한다

    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User }; // 파일 내보내기
