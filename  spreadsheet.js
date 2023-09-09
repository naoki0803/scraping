console.log(data);


const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
require('dotenv').config();


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
let cells = 'A2:C5';
 
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
      range: cells,
    });
    console.log(responseGetSheet.data.values);
  } catch (error) {
    console.log('The API returned an error: ' + error);
  }

  // console.log(responseGetSheet)

}
 
// スプレッドシートを読み込む
getSheetRequest();


