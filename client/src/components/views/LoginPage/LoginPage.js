import React, { useState } from "react";
// import Axios from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../_actions/user_action";
import { withRouter } from "react-router-dom";
function LoginPage(props) {
  const dispatch = useDispatch();

  const [Email, setEmail] = useState(""); // 처음의 값 정의
  const [Password, setPassword] = useState("");

  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value);
  };

  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  };
  const onSubmitHandler = (event) => {
    event.preventDefault(); //  preventDefault 이벤트가 없으면 이 함수가 실행될때마다 페이지가 새로고침 된다 이를 방지하는 함수이다

    // 서버에 값을 보내기 전에 state에 저장된 값을 확인하고자 찍어봄
    // console.log("Email", Email);
    // console.log("Password", Password);

    let body = {
      email: Email,
      password: Password,
    };

    dispatch(loginUser(body)).then((response) => {
      if (response.payload.loginSuccess) {
        props.history.push("/");
      } else {
        alert("ERROR");
      }
    });

    //리엑트를 사용할땐 아래와 같이 body를 보내주면 되지만 리덕스를 사용하기 위해선 위와 같이 dispatch를 사용하여 보내주어야한다
    // Axios.post("/api/user/login", body).then((response) => {}); //서버로 보냄
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={onSubmitHandler}
      >
        <label>Email</label>
        <input type="email" value={Email} onChange={onEmailHandler} />
        <label>Password</label>
        <input type="password" value={Password} onChange={onPasswordHandler} />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default withRouter(LoginPage);
