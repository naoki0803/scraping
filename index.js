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

const data = [];

// async function getScraping() {

//     const URL = "https://search.rakuten.co.jp/search/mall/メガネ";    //スクレイピングしたいページ(今回は楽天のメガネを検索したページ)


//     axios(URL)
//     .then((res) => {
//         const htmlParser = res.data; //リクエストしたUTLのHTMLが格納される
//         // console.log(htmlParser);

//         const $ = cheerio.load(htmlParser); // cheerioの慣例で$に代入する

//         $(".searchresultitem", htmlParser).each(function () {   //スクレイピング先ページのパターンを見つけて、セレクターを指定して、取得した結果をdata配列に格納する
//             const title = $(this).find("h2").text();
//             const price = $(this).find(".price--OX_YW").text();
//             data.push({ title, price });
//         })
//         return data;
//         // console.log(data);
//     })
//     .catch(error => console.log("スクレイピングのエラーだよ", error));
// }



async function getScraping() {
    const URL = "https://search.rakuten.co.jp/search/mall/メガネ";
    try {
        const res = await axios(URL);
        const htmlParser = res.data;
        const $ = cheerio.load(htmlParser);
        const scrapedData = [];

        $(".searchresultitem", htmlParser).each(function () {
            const title = $(this).find("h2").text();
            const price = $(this).find(".price--OX_YW").text();
            scrapedData.push({ title, price });
        });

        return scrapedData; // スクレイピング結果を返す
    } catch (error) {
        console.log("スクレイピングのエラーだよ", error);
        throw error;
    }
}


/*------------------------------------
//  スプレッドシートの情報取得
//  参考：https://www.1ft-seabass.jp/memo/2020/05/08/npm-googleapis-google-sheet-await-async/
//  Google 公式の npm googleapis
//  https://www.npmjs.com/package/googleapis
------------------------------------*/

let { google } = require('googleapis');

// JSON Web Token(JWT)の設定
let jwtClient = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive']
);

const sheet = process.env.SPREADSHEET_ID;

// スプレッドシートAPIはv4を使う
let sheets = google.sheets('v4');


// Sheet情報の取得
async function getSheetRequest() {

    // スプレッドシートのセルの指定
    let cells = 'A:C';
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
        // console.log(responseGetSheet.data.values); // Sheetの情報をconsoleに表示
    } catch (error) {
        console.log('The API returned an error: ' + error);
    }
}

// スプレッドシートを読み込む
getSheetRequest();

/*------------------------------------
/   スプレッドシートのインサート
参考サイト：https://qiita.com/castaneai/items/a53d0b89bca5b84654be
------------------------------------*/
async function insertSheetRequest() {

    try {
        const scrapedData = await getScraping(); // awaitで、getScrapingの完了を待つ
        console.log(scrapedData[0].title, scrapedData[0].price); // スクレイプしたデータをログに出力できます
    
        // スプレッドシートのセルの指定
        let cells = 'A1';
        // JSON Web Token(JWT) の認証
        let resultJwtClient;
        try {
            resultJwtClient = await jwtClient.authorize();
            // console.log(resultJwtClient);
        } catch (error) {
            console.log("Auth Error: " + error);
        }
        // シートのインサート
        try {
            responseGetSheet = await sheets.spreadsheets.values.append({
                auth: jwtClient,
                spreadsheetId: sheet,
                range: cells,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [
                        ["1", scrapedData[0].title, scrapedData[0].price]
                    ],
                },
            });
            console.log("insert 成功");
            
        } catch (error) {
            console.log('The API returned an error: ' + error, "失敗");
        }
    } catch (error) {
        console.log('スクレイピンエラー:', error);
    }
}

// スプレッドシートを読み込む
insertSheetRequest();


/*------------------------------------
/   サーバーの起動
------------------------------------*/
app.listen(PORT, console.log("Serverが起動しました"));


app.get("/", async (req, res) => {
    // メインの処理を呼び出す
    res.send(data);
});

