const tmdbApiKey = '1dc4cbf81f0accf4fa108820d551dafc';
const omdbApiKeys = [
  "38fa39d5", "2cf34c7d", "4db35f85", "19fd83b3", "f813515", 
  "e0d383f4", "1fd8990", "eeaf3f71", "429e213", "acb8a66c", 
  "bed966a1", "1647add2", "d70c765a", "b2e27888", "c9ba574d", 
  "49d844b8", "20e03380", "ff93b209", "e8a4dfb2", "da31c86a", 
  "ef89db2e"
];
let currentOmdbKeyIndex = 0;

function getNextOmdbKey() {
  const key = omdbApiKeys[currentOmdbKeyIndex];
  currentOmdbKeyIndex = (currentOmdbKeyIndex + 1) % omdbApiKeys.length;
  return key;
}

async function searchMovieOrSeries(title) {
  try {
    // جستجو در TMDb
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&language=fa-IR&query=${encodeURIComponent(title)}`;
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) throw new Error('خطا در جستجو');
    const searchData = await searchResponse.json();
    const result = searchData.results[0];
    if (!result) throw new Error('نتیجه‌ای یافت نشد');

    const isMovie = result.media_type === 'movie';
    const id = result.id;
    const year = result.release_date || result.first_air_date ? (result.release_date || result.first_air_date).split('-')[0] : 'unknown';

    // دریافت IMDB ID
    const externalIdsUrl = `https://api.themoviedb.org/3/${isMovie ? 'movie' : 'tv'}/${id}/external_ids?api_key=${tmdbApiKey}`;
    const externalIdsResponse = await fetch(externalIdsUrl);
    const externalIdsData = await externalIdsResponse.json();
    const imdbId = externalIdsData.imdb_id || '';

    // تولید لینک‌های دانلود
    let downloadLinks = [];
    if (isMovie && imdbId) {
      const imdbShort = imdbId.replace('tt', '');
      downloadLinks = [
        `https://berlin.saymyname.website/Movies/${year}/${imdbShort}`,
        `https://tokyo.saymyname.website/Movies/${year}/${imdbShort}`,
        `https://nairobi.saymyname.website/Movies/${year}/${imdbShort}`
      ];
    } else if (!isMovie && imdbId) {
      const detailsUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${tmdbApiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      const numberOfSeasons = detailsData.number_of_seasons || 1;

      for (let season = 1; season <= numberOfSeasons; season++) {
        for (let quality = 1; quality <= 4; quality++) {
          downloadLinks.push(`https://subtitle.saymyname.website/DL/filmgir/?i=${imdbId}&f=${season}&q=${quality}`);
        }
      }
    }

    return {
      title: result.title || result.name,
      type: isMovie ? 'فیلم' : 'سریال',
      links: downloadLinks
    };
  } catch (error) {
    console.error('خطا:', error);
    return { title, type: 'نامشخص', links: [], error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTitle') {
    searchMovieOrSeries(message.title).then(result => {
      chrome.storage.local.set({ downloadInfo: result }, () => {
        chrome.action.openPopup();
      });
    });
  }
});