var createError = require("http-errors");
var express = require("express");
var path = require("path");
var pug = require("pug");
const mongoose = require("mongoose");
var ArticleSchema = require("./user_model.js");
require("dotenv").config();

const port = 5000;

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

var Sentiment = require("sentiment");
var sentiment = new Sentiment();

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

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

("/:coin", async function (req, res, next) {
  console.log(req.params.coin);

  if (coinsToQuery.includes(req.params.coin)) {
    var articlesFromDatabase = await ArticleSchema.find({
      querystring: req.params.coin,
    })
      .limit()
      .exec();
    //console.log(articlesFromDatabase);

    //sentiment
    var avarageArray = [];
    var articlearray = [];

    articleCount = 0;

    articlesFromDatabase.forEach(function (article) {
      articleCount = articleCount + 1;

      var title = article.title;
      var desc = article.desc;
      var content = article.content;
      var link = article.url;
      var createdAt = article.createdAt;

      var result = sentiment.analyze(article.content);
      //console.dir(result.score);

      avarageArray.push(result.score);

      articlearray.push({
        score: result.score,
        title: article.title,
        desc: article.desc,
        content: article.content,
        url: article.url,
        publishedAt: article.publishedAt,
      });
    });

    //console.log(articlearray)
    var sortedarray = articlearray.sort((a, b) => {
      return a.score - b.score;
    });
    ////console.log(sortedarray[0], sortedarray[sortedarray.length -1])

    const firstnegative = sortedarray[0];
    const secondnegative = sortedarray[1];
    const thirdnegative = sortedarray[2];

    const firstpostitive = sortedarray[sortedarray.length - 1];
    const secondpostitive = sortedarray[sortedarray.length - 2];
    const thirdpostitive = sortedarray[sortedarray.length - 3];

    var sortedarray = articlearray.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    timestampArray = [];
    scorearray = [];
    titlearray = [];
    sortedarray.forEach((element) => {
      console.log(element.publishedAt);
      timestampArray.push(element.publishedAt);
      console.log(element.score);
      scorearray.push(element.score);
      titlearray.push(element.title);
    });

    console.log(timestampArray.reverse());
    console.log(scorearray.reverse());
    //console.log(sortedarray)
    /*
    avarageArray.sort(function(a, b) {
      return a - b;
    });
    console.log(avarageArray);

    const firstNegative = avarageArray[0];
    console.log("firstpos "+firstPositive);
    */
    const arrAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    console.log("avg" + arrAvg(avarageArray));

    res.render("coin", {
      coinname: req.params.coin,
      articlesData: articlesFromDatabase,
      avg: arrAvg(avarageArray),
      countOfArticles: articleCount,
      firstpostitive: firstpostitive,
      secondpostitive: secondpostitive,
      thirdpostitive: thirdpostitive,

      firstnegative: firstnegative,
      secondnegative: secondnegative,
      thirdnegative: thirdnegative,

      coinsToQuery: coinsToQuery.sort(),

      timestampArray: JSON.stringify(timestampArray.reverse()),
      scoreArray: JSON.stringify(scorearray.reverse()),
      titlearray: JSON.stringify(titlearray.reverse()),

      twitterurl:
        "https://twitter.com/intent/tweet?button_hashtag=" +
        req.params.coin +
        "&ref_src=twsrc%5Etfw",
    });
  } else {
    res.send("coin not found");
  }
});

app.post("/search/", async function (req, res, next) {
  //console.log(req.body.userinput);
  res.redirect("/" + req.body.userinput);
});

("/", async function (req, res, next) {
  res.redirect("/news/article");
});

app.get("/news/article", async function (req, res, next) {
  res.render("news", { coinsToQuery: coinsToQuery.sort() });
});


app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at http://localhost:${port}`);
});
