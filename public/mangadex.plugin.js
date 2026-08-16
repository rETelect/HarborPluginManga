const BASE = "https://api.mangadex.org";

async function getJson(path) {
  const res = await harbor.http(BASE + path, { responseType: "text" });
  if (!res.ok) throw new Error("http " + res.status + " for " + path);
  return JSON.parse(res.body);
}

function getCoverUrl(item) {
  const coverRel = item.relationships?.find(r => r.type === 'cover_art');
  if (coverRel && coverRel.attributes) {
    return `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes.fileName}`;
  }
  return "";
}

function getTitle(item) {
  return item.attributes?.title?.en || Object.values(item.attributes?.title || {})[0] || "Unknown";
}

const plugin = {
  id: "mangadex-source",
  name: "MangaDex",

  async popular(offset, tagId) {
    // 48 items per page
    const query = tagId ? `&includedTags[]=${tagId}` : "";
    const data = await getJson(`/manga?limit=48&offset=${offset || 0}&includes[]=cover_art&order[followedCount]=desc` + query);
    
    if (!data || !data.data) return [];
    
    return data.data.map(item => ({
      id: item.id,
      title: getTitle(item),
      cover: getCoverUrl(item),
    }));
  },

  async search(query, offset, tagId) {
    const tagQuery = tagId ? `&includedTags[]=${tagId}` : "";
    const data = await getJson(`/manga?limit=48&offset=${offset || 0}&title=${encodeURIComponent(query)}&includes[]=cover_art` + tagQuery);
    
    if (!data || !data.data) return [];

    return data.data.map(item => ({
      id: item.id,
      title: getTitle(item),
      cover: getCoverUrl(item),
    }));
  },

  async detail(id) {
    const data = await getJson(`/manga/${id}?includes[]=cover_art&includes[]=author`);
    if (!data || !data.data) return null;
    
    const item = data.data;
    const authorRel = item.relationships?.find(r => r.type === 'author');
    
    return {
      id: item.id,
      title: getTitle(item),
      altTitle: item.attributes?.altTitles?.[0]?.en || "",
      cover: getCoverUrl(item),
      description: item.attributes?.description?.en || "",
      status: item.attributes?.status || "ongoing",
      author: authorRel?.attributes?.name || "Unknown",
    };
  },

  async chapters(id) {
    // Note: To keep things simple, we fetch English chapters up to 500.
    // In a production plugin, you'd handle pagination for > 500 chapters.
    const data = await getJson(`/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=500`);
    if (!data || !data.data) return [];

    return data.data.map(ch => ({
      id: ch.id,
      chapter: ch.attributes?.chapter || null,
      title: ch.attributes?.title || `Chapter ${ch.attributes?.chapter}`,
      volume: ch.attributes?.volume || null,
      pages: ch.attributes?.pages || 0,
      language: "en",
      publishAt: ch.attributes?.publishAt || undefined,
    }))
    .filter(ch => ch.pages > 0);
  },

  async pageUrls(chapterId) {
    const data = await getJson(`/at-home/server/${chapterId}`);
    if (!data || !data.chapter || !data.chapter.data) return [];

    const baseUrl = data.baseUrl;
    const hash = data.chapter.hash;
    
    return data.chapter.data.map(filename => `${baseUrl}/data/${hash}/${filename}`);
  }
};

return plugin;
