/* eslint-disable import/no-anonymous-default-export */
import React, { useEffect } from "react";
// import Axios from "axios";
import { useDispatch } from "react-redux"; //리액트 훅
import { auth } from "../_actions/user_action";

export default function (SpecificComponent, option, adminRoute = null) {
  // adminRoust = null > 반환값이 아무것도 없으면 기본으로 null 값으로 해준다는 의미
  // option value
  // null => 아무나 출입 가능한 페이지
  // true => 로그인한 유저만 출입 가능한  페이지
  // false => 로그인한 유저는 출입 불가능한 페이지

  function AuthenticationCheck(props) {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(auth()).then((response) => {
        // 요청한 유저정보가 잘 왔는지 확인
        // console.log(response);

        //로그인 하지 않은 상태
        if (!response.payload.isAuth) {
          if (option) {
            props.history.push("/login");
          }
        } else {
          // 로그인이 된 상태
          if (adminRoute && !response.payload.isAdmin) {
            //어드민이 아닌데 어드민이 접근 가능한 페이지를 접속요청하는 상태
            props.history.push("/");
          } else {
            if (option === false) {
              props.history.push("/");
            }
          }
        }
      });

      // 리덕스를 사용하지 않으면 아래의 코드로 로그인정보를 간단히 넘길수 있다
      // Axios.get('/api/users/auth')
    }, [dispatch, props.history]);

    return <SpecificComponent />;
  }
  return AuthenticationCheck;
}
