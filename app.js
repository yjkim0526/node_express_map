const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

require("dotenv").config();
app.set("port", process.env.PORT || 80);
API_KEY = process.env.API_KEY; // 환경 변수에서 API 키를 읽기
//console.log(process.env.PORT);

app.use(cors());
app.use(express.static("public"));

// API 요청을 처리하는 라우터 설정
app.get("/api/kakaomap", async (req, res) => {
  const yearVal = req.query.yearVal;
  const guGunVal = req.query.guGunVal;
  console.log(">> api/kakaomap : " + guGunVal + ", " + yearVal);

  const apiUrl = `https://apis.data.go.kr/B552061/frequentzoneBicycle/getRestFrequentzoneBicycle?ServiceKey=${API_KEY}&searchYearCd=${yearVal}&siDo=27&guGun=${guGunVal}&type=json&numOfRows=10&pageNo=1`;

  console.log(">> apiUrl : " + apiUrl);

  try {
    const response = await axios.get(apiUrl);
    console.log("axios.get ... : success ");
    res.json(response.data);
  } catch (error) {
    console.log("axios.get ... : API 요청 실패 : ", error);
    res.status(500).json({ error: "API 요청 실패" });
  }
});

app.get("/", (req, res) => {
  //res.send("Hello World!");
  res.render("index");
});

app.listen(app.get("port"), () => {
  console.log(`서버 실행 port : ${app.get("port")}`);
});
