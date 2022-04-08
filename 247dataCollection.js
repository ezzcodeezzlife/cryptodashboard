const cron = require("node-cron");
var request = require("request");
var ArticleSchema = require("./user_model.js");
var mongoose = require("mongoose");
var schedule = require("node-schedule");
var english = /^[A-Za-z0-9]*$/;
var LanguageDetect = require("languagedetect");
var lngDetector = new LanguageDetect();
require("dotenv").config();

var coinsToQuery = [
  "bitcoin",
  "dogecoin",
  "monero",
  "ethereum",
  "Tether",
  "Cardano",
  "Binance",
  "Ripple",
  "Solana",
  "Polkadot",
  "Avalanche",
  "Uniswap",
  "Litecoin",
  "Algorand",
  "Filecoin",
];

const uri = process.env.MONGOURI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

cron.schedule("0 */12 * * *", function () {
  console.log("running CRON Job 0 */12 * * *"); // run every 12 hours

  coinsToQuery.forEach(function (query) {
    request(
      "https://newsapi.org/v2/everything?q=" +
        query +
        "&from=2021-10-05&sortBy=publishedAt&apiKey=99e0a262cfe44dc4a105d5c2c1137fcb",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          JSON.parse(body).articles.forEach(function (obj) {
            var title = obj.title;

            try {
              if (
                title.includes(query) ||
                obj.content.includes(query) ||
                obj.description.includes(query)
              ) {
                if (lngDetector.detect(obj.description, 2)[0][0] == "english") {
                  ArticleSchema.create({
                    querystring: query,
                    title: obj.title,
                    desc: obj.description,
                    publishedAt: obj.publishedAt,
                    content: obj.content,
                    url: obj.url,
                  });
                  console.log("Successful creation of new entry");
                }
              } else {
                //console.log("query not in title - discard");
              }
              //console.log(title);
            } catch (e) {
              console.log(e);
            }
          });
        } else {
          console.log(response.statusCode);
        }
      }
    );
  });
});
