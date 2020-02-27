
function notify(text){
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("z.png"),
    "title": "zinfo",
    "message": text
  });
}
function showSuccess() {
  document.querySelector("#success").classList.remove("hidden");
  document.querySelector("#error").classList.add("hidden");
  setTimeout(function(){ resetStatus() }, 1500);

}

function showFailed() {
  document.querySelector("#success").classList.add("hidden");
  document.querySelector("#error").classList.remove("hidden");
  setTimeout(function(){ resetStatus() }, 1500);
}

function resetStatus(){
  document.querySelector("#success").classList.add("hidden");
  document.querySelector("#error").classList.add("hidden");
}

function fail(text) {
  notify(text)
  showFailed()
}

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

function callOnActiveTab(callback) {
  getCurrentWindowTabs().then((tabs) => {
    for (var tab of tabs) {
      if (tab.active) {
        callback(tab, tabs);
      }
    }
  });
}

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
    console.log(`plopped '${newClip}' on your clipboard`)
    showSuccess()
  }, function() {
    fail('failed to update clipboard')
  });
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

function parseBizIdFromURL(text) {
  /*
    pull out 24 alpha numeric biz id from url blob
    gonna look like  ...com/overview/?business=5df2faa1bf26c10001a54cb0

    starts with a number
    23 alpha-num possibilities after that
  */
  const regex = /business=(\d[a-zA-Z0-9]{23})/gm;
  let m;

  while ((m = regex.exec(text)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      
      // we should get back only 2 matches
      // 0: business=5df2faa1bf26c10001a54cb0
      // 1: 5df2faa1bf26c10001a54cb0
      if (m.length != 2) {
        fail(`error! couldn't parse ==> ${text}`)
      }
      
      return m[1]
  }
  return null
}

function copyHandler() {
  callOnActiveTab((tab) => {
    const bizID = parseBizIdFromURL(tab['url'])
    if (bizID == null) {
      fail("failed to find biz id in URL")
      return 
    }
    updateClipboard(bizID)
  });
}

function parseAndGo() {
  navigator.clipboard.readText().then(function(text) {
    const bid = parseBizIdFromText(text)
    if (bid == null){
      fail("found no bid on clipboard")
      return
    } 
    browser.tabs.create({url: `https://my.zenreach.com/overview/?business=${bid}`})
    showSuccess()

  }, function() {
    fail('failed to read clipboard text')
  });
}

// lmao this listens for ANY click event (within the pop)
document.addEventListener("click", (e) => {

  if (e.target.id === "copy") {
    copyHandler()
  }
  else if (e.target.id === "goto"){
    parseAndGo()
  }

  e.preventDefault();
});
