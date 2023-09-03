const PORT = 3000;

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

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
    }).catch(error => console.log(error));

app.listen(PORT, console.log("Serverが起動しました"));


app.get("/", async (req, res) => {
    // メインの処理を呼び出す
    res.send(data);
});