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

const scrapedData = [];

async function getScraping() {
    const URL = "https://search.rakuten.co.jp/search/mall/メガネ";
    try {
        const res = await axios(URL);
        const htmlParser = res.data;
        const $ = cheerio.load(htmlParser);

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
        await getScraping(); // awaitで、getScrapingの完了を待つ
        console.log("スクレイプ完了 スクレイプ数：" +scrapedData.length);
        console.log();
        // console.log(scrapedData[0].title, scrapedData[0].price); // スクレイプしたデータをログに出力も可能

        // JSON Web Token(JWT) の認証
        let resultJwtClient;
        try {
            resultJwtClient = await jwtClient.authorize();
            // console.log(resultJwtClient);
        } catch (error) {
            console.log("Auth Error: " + error);
        }
        
        // シートのインサート
        for (let i = 0; i < scrapedData.length; i++) {
            const rowData = [
                i + 1, // 行番号
                scrapedData[i].title, // タイトル
                scrapedData[i].price, // 価格
            ];
            try {
                await sheets.spreadsheets.values.append({
                    auth: jwtClient,
                    spreadsheetId: sheet,
                    range: 'A1',// スプレッドシートの書き込み開始セルの指定
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',    //USER_ENTEREDとINSERT_ROWSでシート内の一番最後の空白行にインサートができる
                    resource: {
                        values: [rowData],
                    },
                });
            } catch (error) {
                console.log('Row ' + (i) + ' のインサートにエラーが発生しました: ' + error);
            }
        }    
        console.log( scrapedData.length + '行のインサート成功');                       
    } catch (error) {
        console.log('インサート失敗:', error);
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
    res.send(scrapedData);
});

