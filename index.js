document.addEventListener('DOMContentLoaded', () => {
  const qualityButtons = document.querySelectorAll('.quality-options a');

  // 저장된 화질 설정을 불러와서 UI에 표시합니다.
  chrome.storage.local.get(['youtubeQuality'], (result) => {
    const savedQuality = result.youtubeQuality || 'auto';
    qualityButtons.forEach(button => {
      if (button.getAttribute('data-quality') === savedQuality) {
        button.classList.add('selected');
      }
    });
  });

  qualityButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const selectedQuality = button.getAttribute('data-quality');
        console.log("클릭")
      // storage에 선택된 화질을 저장합니다.
      await chrome.storage.local.set({ youtubeQuality: selectedQuality });

      // UI 업데이트: 모든 버튼에서 'selected' 클래스를 제거하고
      // 클릭된 버튼에만 'selected' 클래스를 추가합니다.
      qualityButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');

      // 현재 활성 탭에 스크립트를 주입하여 화질을 변경합니다.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab.url && tab.url.includes("youtube.com/watch")) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
          });
        }
      });
    });
  });
});
