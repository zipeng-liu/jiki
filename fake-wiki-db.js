let pages = {
  'init': {
    code_name: 'init',
    name: 'init',
    contents: 'This is a simple initial page to prove that pages work',
  },
  'dog': {
    code_name: 'dog',
    name: 'dog',
    contents: 'A dog is a domesticated mammal, Canis lupus familiaris, known for its diverse breeds and roles as a loyal companion to humans, often valued for its intelligence, loyalty, and versatility in tasks such as assistance, protection, and companionship.',
  },
  'cat': {
    code_name: 'cat',
    name: 'cat',
    contents: 'A cat is a small domesticated carnivorous mammal, Felis catus, known for its various breeds, independent behavior, and its popularity as a household pet, valued for companionship and often characterized by its agility, grooming habits, and distinctive meowing vocalizations.',
  }
}


function debug_db() {
  // This function might be useful to call from index.js for debugging, idk
  console.log(JSON.stringify(pages, null, 2))
}


function article_getByEncodedName(code_name) {
  return pages[code_name] || pages[encodeURIComponent(code_name)]
}

function article_create(name, contents) {
  if (pages[name]) {
    throw new Error("page already exists")
  }
  let code_name = encodeURIComponent(name);
  pages[code_name] = {
    code_name,
    name,
    contents,
  }
  return pages[code_name];
}

function article_deleteByEncodedName(code_name) {
  if (pages[code_name]) {
    delete pages[code_name];
  } else {
    throw new Error("page does not exist")
  }
}


function article_editByEncodedName(code_name, contents) {
  if (pages[code_name]) {
    pages[code_name].contents = contents;
    return pages[code_name]
  } else {
    throw new Error("page does not exist")
  }
}

function article_searchByTerms(searchterms) {
  let results = Object.values(pages);
  let occurrences = {}; 

  for (let term of searchterms) {
    if (term.length > 0) {
      results.forEach((article) => {
        if (article.contents.includes(term)) {
          occurrences[article.code_name] = (occurrences[article.code_name] || 0) + 1;
        }
      });
    }
  }

  results.forEach((article) => {
    article.occurrences = occurrences[article.code_name] || 0;
  });

  return results.filter(article => article.occurrences > 0); 
}

function article_getRandoms(n) {
  let results_index_set = new Set();
  let pages_array = Object.values(pages);
  while (results_index_set.size < Math.min(n, pages_array.length)) {
    results_index_set.add(Math.floor(Math.random() * pages_array.length));
  }
  return Array.from(results_index_set).map(i => pages_array[i])
}

function isValidTitle(input) {
  if (input.trim() === '') {
    return false;
  }
  const validPattern = /^[!@$%()_+\-=\[\]{};':"\\|,.<>\/?a-zA-Z0-9\s']+$/;
  return validPattern.test(input);
}

function isValidContent(input) {
  return input.trim() !== '';
}

function isTitleExists(title) {
  for (const key of Object.keys(pages)) {
    if (pages[key].name === title) {
      return true;
    }
  }
  return false;
}

function isExternalLink(codeName) {
  const externalLinkRegex = /^(https?:\/\/)/i;
  return externalLinkRegex.test(codeName);
}

function getAllCodeNames() {
  return Object.keys(pages).map(pageKey => pages[pageKey].code_name);
}

function isWikilink(codeName) {
  const wikilinkRegex = /^[A-Z][a-z]*[A-Z]+[a-zA-Z]*$/; 
  const allCodeNames = getAllCodeNames();
  return wikilinkRegex.test(codeName) && allCodeNames.includes(codeName);
}

function isWikilinkAndNotExist(codeName) {
  const wikilinkRegex = /^[A-Z][a-z]*[A-Z]+[a-zA-Z]*$/; 
  return wikilinkRegex.test(codeName);
}

module.exports = {
  article_getByEncodedName,
  article_create,
  article_deleteByEncodedName,
  article_editByEncodedName,
  article_searchByTerms,
  article_getRandoms,
  debug_db,
  isValidTitle,
  isValidContent,
  isTitleExists,
  isExternalLink,
  isWikilink,
  isWikilinkAndNotExist
}