chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  sendResponse({
    windowObject: window,
  });
});
