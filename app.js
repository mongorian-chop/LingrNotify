chrome.tabs.create({
    url: "options.html"
});
function start(){
  if (webkitNotifications) {
    lingr = new Lingr();
    lingr.start();
  } else {
    chrome.tabs.create({url: 'error.html'});
  }
}