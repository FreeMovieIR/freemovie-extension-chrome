// استخراج عنوان صفحه
chrome.runtime.sendMessage({
  type: "getTitle",
  title: document.title
});