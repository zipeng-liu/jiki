const db = require('./fake-wiki-db');
const bodyParser = require('body-parser');

const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  const articleDatabase = db.article_getRandoms(5);
  let articleList = [];

  for (let i = 0; i < articleDatabase.length; i++) {
    let articleName = articleDatabase[i].code_name;
    articleList.push(articleName);
  }

  res.render('index', { articleList });
});


app.get('/article/:articlename', (req, res) => {
  const key = req.params.articlename;
  const data = db.article_getByEncodedName(key);

  if (!data) {
    res.send("Article not foud.");
  } else {
    const contentWords = data.contents.split(" ");
    const externalLinks = [];
    const wikilinks = [];
    const nonexists = [];

    contentWords.forEach((word) => {
      if (db.isExternalLink(word)) {
        externalLinks.push(word);
      } else if (db.isWikilink(word)) {
        wikilinks.push(word);
      } else if (db.isWikilinkAndNotExist(word)){
        nonexists.push(word);
      }
    });

    res.render('article', {
      articleCodeName: data.code_name,
      articleName: data.name,
      articleContents: data.contents,
      externalLinks: externalLinks,
      wikilinks: wikilinks,
      nonexists: nonexists
    });
  }
});


app.get('/article/:articlename/edit', (req, res) => {
  const key = req.params.articlename;
  const data = db.article_getByEncodedName(key);

  if (!data) {
    res.send("Article not found.");
  } else {
    res.render('edit', {
      articleCodeName: data.code_name,
      articleName: data.name,
      articleContents: data.contents
    });
  }
});


app.get('/article/:articlename/delete', (req, res) => {
  const key = req.params.articlename;
  const data = db.article_getByEncodedName(key);

  if (!data) {
    res.send("Article not found.");
  } else {
    res.render('delete', {
      articleCodeName: data.code_name,
      articleName: data.name,
      articleContents: data.contents
    });
  }
});


app.post('/article/:articlename/delete', (req, res) => {
  const key = req.params.articlename;
  const data = db.article_getByEncodedName(key);

  if (!data) {
    res.send("Article not found.");
  } else {
    db.article_deleteByEncodedName(data.code_name);

    const articleDatabase = db.article_getRandoms(5);
    let articleList = [];
    for (let i = 0; i < articleDatabase.length; i++) {
      let articleName = articleDatabase[i].code_name;
      articleList.push(articleName);
    }
    //res.render('index', { articleList });
    res.redirect('/');
  }
});


app.post('/article/:articlename/edit', (req, res) => {
  const key = req.params.articlename;
  const data = db.article_getByEncodedName(key);

  let title = req.body.title;
  const newContent = req.body.content;

  if (title !== data.name) {
    res.send('Do not change article title.');
  } else {
    if (!data) {
      res.send("Article not found.");
    } else {
      const updatedData = db.article_editByEncodedName(data.code_name, newContent);

      const contentWords = updatedData.contents.split(" ");
      const externalLinks = [];
      const wikilinks = [];
      const nonexists = [];

      contentWords.forEach((word) => {
        if (db.isExternalLink(word)) {
          externalLinks.push(word);
        } else if (db.isWikilink(word)) {
          wikilinks.push(word);
        } else if (db.isWikilinkAndNotExist(word)){
          nonexists.push(word);
        }
      });

      // res.render('article', {
      //   articleCodeName: updatedData.code_name,
      //   articleName: updatedData.name,
      //   articleContents: updatedData.contents,
      //   externalLinks: externalLinks,
      //   wikilinks: wikilinks,
      //   nonexists: nonexists
      // });
      res.redirect(`/article/${key}`);
    }
  }
});


app.get('/newarticle', (req, res) => {
  res.render('newarticle');
});


app.post('/newarticle', (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  if (!title || !content) {
    res.send('Both title and content are required.');
    return;
  } else if (!db.isValidTitle(title)) {
    res.send('Invalid characters in the article title.');
  } else if (db.isTitleExists(title)) {
    res.send('Article title already exists. Please enter a new title.');
  } else if (!db.isValidContent(content)) {
    res.send('Invalid characters in the article content.');
  } else {
    const newData = db.article_create(title, content);

    const contentWords = content.split(" ");
    const externalLinks = [];
    const wikilinks = [];
    const nonexists = [];

    contentWords.forEach((word) => {
      if (db.isExternalLink(word)) {
        externalLinks.push(word);
      } else if (db.isWikilink(word)) {
        wikilinks.push(word);
      } else if (db.isWikilinkAndNotExist(word)){
        nonexists.push(word);
      }
    });

    // res.render('article', {
    //   articleCodeName: newData.code_name,
    //   articleName: newData.name,
    //   articleContents: newData.contents,
    //   externalLinks: externalLinks,
    //   wikilinks: wikilinks,
    //   nonexists: nonexists
    // });
    res.redirect(`/article/${title}`);
  }
});


app.get('/searcharticle', (req, res) => {
  const searchTerm = req.query.searchterm;

  if (!searchTerm) {
    res.send("Search term is empty.")
  } else {
    const searchTerms = searchTerm.split(" ");
    const matchingArticles = db.article_searchByTerms(searchTerms);

    res.render('searcharticle', { searchTerms: searchTerms, matchingArticles: matchingArticles });
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

