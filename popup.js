document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('downloadInfo', (data) => {
    const info = data.downloadInfo || {};
    document.getElementById('title').textContent = `${info.title || 'عنوان نامشخص'} (${info.type || 'نامشخص'})`;
    
    const linksContainer = document.getElementById('links');
    if (info.error) {
      linksContainer.innerHTML = `<p class="error">خطا: ${info.error}</p>`;
    } else if (info.links && info.links.length > 0) {
      info.links.forEach((link, index) => {
        const a = document.createElement('a');
        a.href = link;
        a.textContent = `لینک دانلود ${index + 1}`;
        a.target = '_blank';
        linksContainer.appendChild(a);
      });
    } else {
      linksContainer.innerHTML = '<p>لینکی یافت نشد.</p>';
    }
  });
});