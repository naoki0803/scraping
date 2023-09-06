const PORT = 3000;

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

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
/   Google Spreadsheet
------------------------------------*/


// const { google } = require('googleapis');
// const sheets = google.sheets('v4');
// const auth = require('./spreadsheet-scraping-398114-0a3090339326.json'); // 認証情報のパスを指定


// const spreadsheetId = process.env.SPREADSHEET_ID; 
// const range = 'シート1'; // 書き込みたいシート名

// const dataToWrite = data;

// async function writeToGoogleSheets() {
//   const sheetsClient = await authorize(auth);
//   const sheetsAPI = sheets.spreadsheets.values;
  
//   const request = {
//     spreadsheetId,
//     range,
//     valueInputOption: 'RAW',
//     resource: {
//       values: dataToWrite,
//     },
//   };

//   await sheetsAPI.update(request);
//   console.log('データがGoogle Sheetsに書き込まれました。');
// }

// async function authorize(credentials) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const token = require('./path/to/your/token.json'); // トークンのパスを指定
//     oAuth2Client.setCredentials(token);
//     return oAuth2Client;
//   } catch (err) {
//     console.error('認証エラー:', err);
//     throw err;
//   }
// }

// writeToGoogleSheets();



// Google 公式の npm googleapis
// https://www.npmjs.com/package/googleapis
let {google} = require('googleapis');
 
// ダウンロードしたJSON の鍵ファイルの中身をコピーアンドペースト
const creds = {
  "type": "service_account",
  "project_id": "spreadsheet-scraping-398114",
  "private_key_id": "0a3090339326d6963049f2ae29627e5b968937d6",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyHB9q1UhwQxcj\n6VRTj1lIlWOzMX/uXY0HB7BOV4ihThTRHM+acOj4hulrjgWd87NhmO3eflj1Q1ZT\n64k850K+EJwsxrZYSCSSyRyiHy/vCFJe1cJKk32r6KCgdZJDyerf2HHXNeU7k4F0\nPFESLGofyY9Ta7bJgAo2AOk+O30QY2AKf4LVwMPkINoX5EjbMgUr1tOiOv5m4BHj\n7m9QqPqf0tJUkusoqHIfhQfoO26gIdIvzVkqNkM9gtpM4XaETITzlDkrnh8r83Wu\nrFTENNl6kTRIogBczQ2KOP/2zMz5+GFVufti1JHtlzsLaie8pa3eH9fW77TzZQqV\nuZOmtOO5AgMBAAECggEAJphsgHCGWXlYVtpVgSPzk4R3zdlgoQ0ZpdfXLyrNuzKZ\n1TSakht8iHpns3xboD4ydWg3x3p2mXNFjjrgiteMQXaE+Tj4Q4oijsJQ15rNfs09\nWDqW9yUd2vY2dH71uoXTRT14ccvGiFHu//qgEMGaH5hEXC3ftqttywUIhglLERUz\nIzG/yuhbkxuFopfwsLP4gvXL7lLYtYaedshfKh7PXXWqHVYxh9BB7co2R/585xT3\n14ZbYzp+4vW3+aRpJrwb4ziN7uRN+Y9uYbk80F3DpHi25LGRxX2Aqyix/T3HQjUD\n5HZdfbrpXCQBaoMt7mWNC7pFRKcGpSxeZ5j6so64TwKBgQDbZElHqQNS5h/prgIn\n+spXPzhkYzfzHA30JueLwY/HZ5brjAc1Z+mdj1F0n20WH3coyB0qaHzLm+spNR9H\ntOu3NIG7aJxf3U56E3mV51YiNNG2NNegWL88F8U0E7azaZQyxBPyJGgNQpdKO8Ab\nW9fJSQZitqtz4eZyHeisk7YQDwKBgQDP1Gf732nj1EMZozk3muktHB8d9FwxQgSd\n7xa8JQqXDaMsMYi/Pl2C2787h2EeD2jyx/Qyg3/6vv3SHERj6a7KyLxANkfPC+wE\nMWZhkONLXzsQoetWMw/AzAJfXG8vh3/cBJ/c6mDRS/MfexnwOo/WqT9COKRPjtAX\nRj7ymfEHtwKBgBwQ+E7ykDpKtkpuuFfk/X2r2Mr+5mlzbVWOpJB8cqhP2D7J6yIp\n6Pj/HKyOuKXb4KKW9yQ1ucFScQMUiKvjuUP2s6IF//tDlIaJd0R2E87McwecOvmI\nYO6PG+tNmlHZb9wOuX6Aqc8IddJJUootda2Kaga217g7bf+rU9jADMqBAoGBAKss\njQCcwIBPoXyKPWQZCRiIYvCvBQflEhxqgdUwxQoox05s9e5eFXLkPxtuo4S4uH3O\nRskcGdqSWEgn1ARewgJvVu2kR3y2mwvRDDwrs6muo91NH6H9qGnpHcMhRMpm1d6H\nSIwR1vBLl9FD+NctxK7O8zU9pceJHscsqkfyltz9AoGBAJu/v43PMJEgvx8kYHUQ\nWh4TxyoZB5uS7wFftoQnfZRjZGhDI2h6bvneE0jCwRSM20PrjK87saNdyutNntNi\ngBn3bD2KZX5WwAPb4qQISbcn+c2D0F7HlTRPeTvkGWAPeg/e3OCrHn16mzksomcT\nrqi9EpfzW4RkNgDXtZ4CnJdP\n-----END PRIVATE KEY-----\n",
  "client_email": "nodejs-spreadsheet@spreadsheet-scraping-398114.iam.gserviceaccount.com",
  "client_id": "105659320581993776279",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/nodejs-spreadsheet%40spreadsheet-scraping-398114.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};
 
// JSON Web Token(JWT)の設定
let jwtClient = new google.auth.JWT(
  creds.client_email,
  null,
  creds.private_key,
  ['https://www.googleapis.com/auth/spreadsheets',
   'https://www.googleapis.com/auth/drive']
);
 
 
const sheet = '1uriLTaZWMsTg9WfmJazgUPoEQLA4ebvaj6-Vx6dHAPU';
 
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
/   サーバーの起動
------------------------------------*/
app.listen(PORT, console.log("Serverが起動しました"));


app.get("/", async (req, res) => {
    // メインの処理を呼び出す
    res.send(data);
});