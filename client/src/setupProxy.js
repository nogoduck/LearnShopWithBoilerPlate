// const { createProxyMiddleware } = require("http-proxy-middleware");

//주석 처리 된것들은 proxy-middleware 버전이 1.x.x 이상일때 사용가능하다 현재 코드는 이하 버전에 맞춰 적용되어 있다

const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    proxy({
      target: "http://localhost:5000",
      changeOrigin: true,
    })
  );
};
// module.exports = function (app) {
//   app.use(
//     "/api",
//     createProxyMiddleware({
//       target: "http://localhost:5000",
//       changeOrigin: true,
//     })
//   );
// };
