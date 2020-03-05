function notify(text){
    browser.notifications.create({
      "type": "basic",
      "iconUrl": browser.extension.getURL("z.png"),
      "title": "zinfo",
      "message": text
    })
  }
  
  function fail(text) {
    notify(text)
  }
  
  function parseBizIdFromText(text) {
    /*
      pull out 24 alpha numeric biz id from text blob
  
      starts with a number
      23 alpha-num possibilities after that
    */
   const regex = /\d[a-zA-Z0-9]{23}/gm;
   let m;
  
   while ((m = regex.exec(text)) !== null) {
       // This is necessary to avoid infinite loops with zero-width matches
       if (m.index === regex.lastIndex) {
           regex.lastIndex++;
       }
       if (m.length < 1) {
         notify(`error! found no text matching bid format`)
       }
       
       return m[0]
   }
   return null
  }
  
  function parseAndGo() {
    navigator.clipboard.readText().then(function(text) {
      const bid = parseBizIdFromText(text)
      if (bid == null){
        fail("found no bid on clipboard")
        return
      } 
  
      var creating = browser.tabs.create({url: `https://my.zenreach.com/overview/?business=${bid}`});
      creating.then(onCreated, onError)
  
  
    }, function() {
      fail('failed to read clipboard text')
    });
  }
  
  function onCreated(tab) {
    console.log(`Created new tab: ${tab.id}`)
  }
  
  function onError(error) {
    console.log(`Error: ${error}`);
    fail(error)
  }

chrome.browserAction.onClicked.addListener(function() {
    parseAndGo();
});
