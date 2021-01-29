import { combineReducers } from "redux";
import user from "./user_reducer";

//여러가지 리덕스들을 합치는 부분
const rootReducer = combineReducers({
  user,
});

export default rootReducer;
