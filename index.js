var createError = require('http-errors');
var express = require('express');
var path = require('path');
var pug = require('pug');
const mongoose = require('mongoose');
var ArticleSchema = require('./user_model.js');
require('dotenv').config()

const port = 5000;

const uri = process.env.MONGOURI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB Connected")
})
.catch(err => console.log(err))

var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var coinsToQuery = ['bitcoin','dogecoin','monero','ethereum','Tether','Cardano'
  ,'Binance','Ripple','Solana','Polkadot','Avalanche','Uniswap','Litecoin'
  ,'Algorand','Filecoin']

  
app.get('/:coin', async function(req, res, next) {
  console.log(req.params.coin)

  var coinsToQuery = ['bitcoin','dogecoin','monero','ethereum','Tether','Cardano'
  ,'Binance','Ripple','Solana','Polkadot','Avalanche','Uniswap','Litecoin'
  ,'Algorand','Filecoin']

  if(coinsToQuery.includes(req.params.coin)){

    var articlesFromDatabase = await ArticleSchema.find({ querystring: req.params.coin }).limit().exec();
    //console.log(articlesFromDatabase);

    //sentiment
    var avarageArray = [];
    var articlearray = [];

    articleCount = 0 ;

    articlesFromDatabase.forEach(function(article) {
      articleCount = articleCount +1;

      var title = article.title;
      var desc = article.desc;
      var content = article.content;
      var link = article.url;
      var createdAt = article.createdAt;

      var result = sentiment.analyze(article.content);
      //console.dir(result.score); 

      avarageArray.push(result.score)

      
      articlearray.push({
        score: result.score,
        title: article.title,
        desc: article.desc,
        content: article.content,
        url:  article.url,
        publishedAt: article.publishedAt,
      } )

      
      

      
  });

  //console.log(articlearray)
  var sortedarray = articlearray.sort((a, b) => {
    return a.score - b.score;
  });
  ////console.log(sortedarray[0], sortedarray[sortedarray.length -1])

  const firstnegative = sortedarray[0];
  const secondnegative = sortedarray[1];
  const thirdnegative = sortedarray[2];

  const firstpostitive = sortedarray[sortedarray.length -1];
  const secondpostitive = sortedarray[sortedarray.length -2];
  const thirdpostitive = sortedarray[sortedarray.length -3];

  var sortedarray = articlearray.sort(function(a,b){
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  timestampArray = []
  scorearray = []
  titlearray = []
  sortedarray.forEach(element => {
    console.log(element.publishedAt);
    timestampArray.push(element.publishedAt)
    console.log(element.score);
    scorearray.push(element.score)
    titlearray.push(element.title)
  });

  console.log(timestampArray.reverse())
  console.log(scorearray.reverse())
  //console.log(sortedarray)
  /*
  avarageArray.sort(function(a, b) {
    return a - b;
  });
  console.log(avarageArray);

  const firstNegative = avarageArray[0];
  console.log("firstpos "+firstPositive);
*/
  const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

    console.log("avg" +  arrAvg(avarageArray) );

    res.render('coin',{  coinname: req.params.coin, articlesData: articlesFromDatabase, avg: arrAvg(avarageArray), countOfArticles: articleCount,
      firstpostitive: firstpostitive,
       secondpostitive: secondpostitive,
        thirdpostitive: thirdpostitive ,

         firstnegative: firstnegative,
          secondnegative: secondnegative,
           thirdnegative: thirdnegative,

           coinsToQuery: coinsToQuery.sort(), 

           timestampArray: JSON.stringify(timestampArray.reverse()),
           scoreArray: JSON.stringify(scorearray.reverse()),
           titlearray: JSON.stringify(titlearray.reverse()),

           twitterurl: "https://twitter.com/intent/tweet?button_hashtag=" + req.params.coin + "&ref_src=twsrc%5Etfw",

          
          } );


  } else {
    res.send('coin not found' );
  };
});

app.post('/search/', async function(req, res, next) {
  //console.log(req.body.userinput);
  
  res.redirect('/'+ req.body.userinput);
});


app.get('/', async function(req, res, next) {
  res.redirect('/news/article');
});

app.get('/news/article', async function(req, res, next) {
  res.render('news', {coinsToQuery: coinsToQuery.sort()});
});

/*
app.get('/', async function(req, res, next) {
  var dataa = await dbBench.find({}).exec(); //find all entrys
  res.render('index',{ data: JSON.stringify(dataa) } );
});

app.get('/add', async function(req, res, next) {
  var dataa = await dbBench.find({}).exec(); //find all entrys

  res.render('add', { data: JSON.stringify(dataa) } );
});

app.post('/add', async function(req, res, next) {
  console.log(req.body.lat);
  console.log(req.body.long);
  console.log(req.body.beschreibung);
  console.log(req.body.nickname);

  if(req.body.nickname == ""){
    req.body.nickname = "unknown";
  }
  dbBench.create({
    lat: req.body.lat,
    long: req.body.long,
    beschreibung: req.body.beschreibung,
    nickname: req.body.nickname,
  }); console.log("Successful creation of new entry");

  res.render('thanks');
});


app.get('/leaderboard', async function(req, res, next) {
  var all = await dbBench.aggregate([
    { $group: { _id: "$nickname", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
  console.log(all);
  
  res.render('leaderboard', { tabledata: all } );
});


app.get('/fullscreenmap', async function(req, res, next) {
  var dataa = await dbBench.find({}).exec(); //find all entrys
  
  res.render('fullscreenmap',  { data: JSON.stringify(dataa) } );
});
*/

app.listen(process.env.PORT || 5000, () => {
    console.log(`App listening at http://localhost:${port}`)
})