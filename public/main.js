const frmSel = document.querySelector("#frm");
const currentYear = new Date().getFullYear();
console.log(">> currentYear : ", currentYear);

var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(35.884066137238, 128.660705628812), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  };

// 지도를 생성한다.
var map = new kakao.maps.Map(mapContainer, mapOption);

// 마커 클러스터러를 생성합니다
var clusterer = new kakao.maps.MarkerClusterer({
  map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
  averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
  minLevel: 10, // 클러스터 할 최소 지도 레벨
});
var markers = [];
// 인포윈도우에 표출될 내용으로 HTML 문자열이나 document
var infowindow = new kakao.maps.InfoWindow({
  content: "",
});

// 현재 년도 ~ -7년까지 연도 생성
for (let i = currentYear; i > currentYear - 7; i--) {
  const addOpt = document.createElement("option");
  addOpt.value = i;
  addOpt.text = i;
  document.querySelector("#year").appendChild(addOpt);
}

var yearVal = "";
var guGunVal = "";

// 검색 버튼 클릭시 구군.년도 해당 데이터 fetch 해서 지도 그리기기
function selectedControl() {
  const year = frmSel.querySelector("#year");
  yearVal = year.options[year.selectedIndex].value;
  console.log("yearVal : " + yearVal);
  const guGun = frmSel.querySelector("#gugun");
  guGunVal = guGun.options[guGun.selectedIndex].value;
  console.log("guGunVal : " + guGunVal);

  if (guGunVal === "구군선택" || guGunVal === "") {
    alert("구군을 선택하세요.");
    return;
  }

  if (yearVal === "년도선택" || yearVal === "") {
    alert("년도를 선택하세요.");
    return;
  }

  // 데이타 fetch
  getKakaoMap(guGunVal, yearVal);
}

// api get
async function getKakaoMap(guGunVal, yearVal) {
  console.log("getKakaoMap guGunVal : " + guGunVal + " yearVal :" + yearVal);

  const baseURL = window.location.origin.includes("localhost")
    ? "http://localhost:4000"
    : "https://vercel.app";

  console.log(">> baseURL : " + baseURL);
  const url = new URL(`${baseURL}/api/kakaomap`);

  // 검색어를 쿼리 파라미터로 추가
  const params = new URLSearchParams();
  params.append("yearVal", yearVal);
  params.append("guGunVal", guGunVal);
  url.search = params.toString();

  const response = await fetch(url);
  const data = await response.json();
  //console.log("data : ", data);

  data_len = data.items.item.length;
  console.log("data_len : ", data_len);
  document.querySelector("#map_cnt").innerText =
    ">> 검색결과 : " + data_len + "건";

  if (data_len === 0) {
    //alert("해당 지역의 자료가 존재하지 않습니다.");
    document.querySelector("#map_list").innerHTML = "";
    // 클러스터러에 마커들을 삭제제합니다
    clusterer.clear();
    console.log("clusterer.clear() ");
    infowindow.close();
    console.log("infowindow.close() ");

    return;
  }

  // 지도옆에 데이터 리스트 표기
  const locations = [];
  var targetStr = "";
  for (let i = 0; i < data.items.item.length; i++) {
    item = data.items.item[i];
    locations.push([item.spot_nm, item.la_crd, item.lo_crd]);

    orgDiv = `<li class="py-2 px-2 divide-slate-300 text-sm" value="${item.la_crd},${item.lo_crd}" onclick="setCenter(${item.la_crd}, ${item.lo_crd});">${item.spot_nm}</li>`;
    targetStr = targetStr + orgDiv;
  }
  document.querySelector("#map_list").innerHTML = targetStr;

  // 지도에 보여주기기
  mapView(locations);
}

function mapView(mapData) {
  console.log(">> mapView :", mapData);
  // 마커가 표시될 위치입니다

  //var markers = [];
  for (var i = 0; i < mapData.length; i++) {
    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(mapData[i][1], mapData[i][2]), // 지도의 중심좌표
      map: map,
    });

    // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document
    var infowindow = new kakao.maps.InfoWindow({
      content: mapData[i][0],
    });

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "mouseover",
      makeOverListener(map, marker, infowindow)
    );

    kakao.maps.event.addListener(
      marker,
      "mouseout",
      makeOutListener(infowindow)
    );

    // 마커 위에 인포윈도우를 표시합니다. 두번째 파라미터인 marker를 넣어주지 않으면 지도 위에 표시됩니다
    // infowindow.open(map, marker);
    markers.push(marker);
  }

  // 클러스터러에 마커들을 추가합니다
  clusterer.addMarkers(markers);
}

function setCenter(setX, setY) {
  console.log(">> setCenter : ", setX, setY);
  // 이동할 위도 경도 위치를 생성합니다
  var moveLatLon = new kakao.maps.LatLng(setX, setY);

  // 지도 중심을 이동 시킵니다
  map.setCenter(moveLatLon);
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
function makeOverListener(map, marker, infowindow) {
  return function () {
    infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}
