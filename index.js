const PORT = 3000;

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
require('dotenv').config();

/*------------------------------------
/   スクレイピングに関する記述
------------------------------------*/
//WEBスクレイパーを作成
const URL = "https://search.rakuten.co.jp/search/mall/メガネ";    //スクレイピングしたいページ(今回は楽天のメガネを検索したページ)
const data = [];

axios(URL)
    .then((res) => {
        const htmlParser = res.data; //リクエストしたUTLのHTMLが格納される
        // console.log(htmlParser);

        const $ = cheerio.load(htmlParser); // cheerioの慣例で$に代入する

        $(".searchresultitem", htmlParser).each(function () {   //スクレイピング先ページのパターンを見つけて、セレクターを指定して、取得した結果をdata配列に格納する
            const title = $(this).find("h2").text();
            const price = $(this).find(".price--OX_YW").text();
            data.push({ title, price });
        })
        // console.log(data);
    })
    .catch(error => console.log(error));


/*------------------------------------
//  スプレッドシートの情報取得
//  参考：https://www.1ft-seabass.jp/memo/2020/05/08/npm-googleapis-google-sheet-await-async/
//  Google 公式の npm googleapis
//  https://www.npmjs.com/package/googleapis
------------------------------------*/

let {google} = require('googleapis');
 
// JSON Web Token(JWT)の設定
let jwtClient = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets',
   'https://www.googleapis.com/auth/drive']
);
 
const sheet =process.env.SPREADSHEET_ID;
 
// スプレッドシートのセルの指定
let cells = 'A1:C1';
 
// スプレッドシートAPIはv4を使う
let sheets = google.sheets('v4');
 
async function getSheetRequest(){
 
  // JSON Web Token(JWT) の認証
  let resultJwtClient;
  try {
    resultJwtClient = await jwtClient.authorize();
    // console.log(resultJwtClient);
  } catch (error) {
    console.log("Auth Error: " + error);
  }
 
  // シートを読み込む
  let responseGetSheet;
  try {
    responseGetSheet = await sheets.spreadsheets.values.get({
      auth: jwtClient,
      spreadsheetId: sheet,
      range: cells
    });
    console.log(responseGetSheet.data.values);
  } catch (error) {
    console.log('The API returned an error: ' + error);
  }
}
 
// スプレッドシートを読み込む
getSheetRequest();

/*------------------------------------
/   スプレッドシートのインサート
------------------------------------*/




/*------------------------------------
/   サーバーの起動
------------------------------------*/
app.listen(PORT, console.log("Serverが起動しました"));


app.get("/", async (req, res) => {
    // メインの処理を呼び出す
    res.send(data);
});