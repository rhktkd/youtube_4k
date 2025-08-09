// 설정 메뉴를 열고 화질을 변경하는 함수
const setYouTubeQuality = async (qualityLabel) => {
  try {
    // 설정 버튼이 나타날 때까지 기다립니다.
    const settingsButton = await waitForElement('.ytp-settings-button');
    if (!settingsButton) {
      console.error('설정 버튼을 찾을 수 없습니다.');
      return;
    }

    // 설정 메뉴를 엽니다.
    settingsButton.click();

    // '품질' 메뉴 항목이 나타날 때까지 기다립니다.
    const qualityButton = await waitForElement('.ytp-menuitem-label', (element) => element.textContent.includes('품질'));
    if (!qualityButton) {
      console.error('품질 메뉴를 찾을 수 없습니다.');
      settingsButton.click(); // 메뉴 닫기
      return;
    }

    qualityButton.click(); // 품질 메뉴를 엽니다.

    // 화질 옵션 목록이 나타날 때까지 기다립니다.
    const qualityOptions = await waitForElements('.ytp-quality-menu .ytp-menuitem');
    if (qualityOptions.length === 0) {
      console.error('화질 옵션 목록을 찾을 수 없습니다.');
      settingsButton.click(); // 메뉴 닫기
      return;
    }

    // 원하는 화질 옵션을 찾습니다.
    const qualityOption = Array.from(qualityOptions).find(item => {
      const itemText = item.textContent.toLowerCase();
      return itemText.includes(qualityLabel.toLowerCase()) || (qualityLabel === 'highres' && itemText.includes('원본'));
    });

    if (qualityOption) {
      qualityOption.click(); // 원하는 화질을 클릭합니다.
      console.log(`YouTube 화질이 ${qualityLabel}로 설정되었습니다.`);
    } else {
      console.warn(`${qualityLabel} 화질을 찾을 수 없습니다. 가능한 최고 화질로 설정합니다.`);
      // 원하는 화질이 없는 경우, 가장 높은 화질을 클릭합니다.
      qualityOptions[0].click();
    }
    
    settingsButton.click(); // 메뉴 닫기
  } catch (error) {
    console.error('화질 설정 중 오류가 발생했습니다:', error);
  }
};

// 특정 DOM 요소가 나타날 때까지 기다리는 헬퍼 함수
const waitForElement = (selector, condition = () => true, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element && condition(element)) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`요소 '${selector}'를 찾지 못했습니다.`));
      } else {
        setTimeout(checkElement, 200);
      }
    };
    checkElement();
  });
};

const waitForElements = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkElements = () => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        resolve(elements);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`요소 '${selector}'를 찾지 못했습니다.`));
      } else {
        setTimeout(checkElements, 200);
      }
    };
    checkElements();
  });
};


// 백그라운드 스크립트로부터 화질 정보를 요청하고, 응답이 오면 화질 설정 함수를 실행합니다.
chrome.runtime.sendMessage({ action: "getQuality" }, (response) => {
  if (response && response.quality) {
    setYouTubeQuality(response.quality);
  }
});
