// YouTube 페이지가 완전히 로드되었을 때 실행됩니다.
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // YouTube watch 페이지에서만 작동하도록 필터링합니다.
  if (details.url.includes("youtube.com/watch")) {
    const { youtubeQuality } = await chrome.storage.local.get(['youtubeQuality']);
    
    // 저장된 화질 설정이 있을 경우에만 content-script를 주입합니다.
    if (youtubeQuality) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content-script.js']
      });
    }
  }
});

// content-script에서 화질 정보를 사용할 수 있도록 메시지를 전달합니다.
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getQuality") {
    const { youtubeQuality } = await chrome.storage.local.get(['youtubeQuality']);
    sendResponse({ quality: youtubeQuality });
  }
});
