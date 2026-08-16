class MadaraTemplate {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.version = config.version || "1.0.0";
    this.lang = config.lang || "en";
    this.nsfw = config.nsfw || false;
    this.baseUrl = config.baseUrl;
    this.icon = config.icon || (this.baseUrl + "/favicon.ico");
  }

  async _getHtml(path, method = "GET", body) {
    const opts = { responseType: "text", method };
    if (body) opts.body = body;
    const res = await harbor.http(this.baseUrl + path, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return harbor.parseHtml(res.body);
  }

  async popular(offset) {
    const page = Math.floor(offset / 20) + 1;
    let path = `/?m_orderby=views`;
    if (page > 1) path = `/page/${page}/?m_orderby=views`;
    
    const doc = await this._getHtml(path);
    return doc.querySelectorAll(".c-tabs-item__content, .page-item-detail").map(el => {
      const a = el.querySelector("h3 a, h4 a, .post-title a");
      const img = el.querySelector("img");
      if (!a) return null;
      
      const href = a.attr("href");
      // Extract manga ID from URL (e.g. https://site.com/manga/manga-name/)
      const match = href.match(/\/manga\/([^\/]+)\/?/);
      if (!match) return null;
      
      let cover = img ? (img.attr("data-src") || img.attr("src")) : "";
      if (cover && cover.startsWith("//")) cover = "https:" + cover;
      
      return {
        id: match[1],
        title: a.text().trim(),
        cover: cover
      };
    }).filter(Boolean);
  }

  async search(query, offset) {
    const doc = await this._getHtml(`/?s=${encodeURIComponent(query)}&post_type=wp-manga`);
    return doc.querySelectorAll(".c-tabs-item__content").map(el => {
      const a = el.querySelector("h3 a, h4 a, .post-title a");
      const img = el.querySelector("img");
      if (!a) return null;
      
      const href = a.attr("href");
      const match = href.match(/\/manga\/([^\/]+)\/?/);
      if (!match) return null;
      
      let cover = img ? (img.attr("data-src") || img.attr("src")) : "";
      if (cover && cover.startsWith("//")) cover = "https:" + cover;
      
      return {
        id: match[1],
        title: a.text().trim(),
        cover: cover
      };
    }).filter(Boolean);
  }

  async detail(id) {
    const doc = await this._getHtml(`/manga/${id}/`);
    const title = doc.querySelector(".post-title h1, .post-title h2")?.text()?.trim() || id;
    const img = doc.querySelector(".summary_image img");
    let cover = img ? (img.attr("data-src") || img.attr("src")) : "";
    if (cover && cover.startsWith("//")) cover = "https:" + cover;
    
    const desc = doc.querySelector(".summary__content, .manga-excerpt")?.text()?.trim();
    const author = doc.querySelector(".author-content")?.text()?.trim();
    const statusText = doc.querySelector(".post-status .summary-content")?.text()?.trim()?.toLowerCase();
    
    let status = 0; // ongoing
    if (statusText === "completed" || statusText === "completed") status = 1;
    
    return {
      id,
      title,
      cover,
      description: desc,
      author,
      status
    };
  }

  async chapters(id) {
    let doc;
    try {
      doc = await this._getHtml(`/manga/${id}/ajax/chapters/`, "POST");
    } catch (e) {
      doc = await this._getHtml(`/manga/${id}/`);
    }
    
    const chs = [];
    doc.querySelectorAll(".wp-manga-chapter").forEach(el => {
      const a = el.querySelector("a");
      if (!a) return;
      const href = a.attr("href");
      const match = href.match(/\/manga\/[^\/]+\/([^\/]+)\/?/);
      if (!match) return;
      
      chs.push({
        id: id + "|_|" + match[1], // Bundle mangaId and chapter slug
        title: a.text().trim(),
        chapter: chs.length + 1
      });
    });
    
    return chs.reverse();
  }

  async pageUrls(chapterId) {
    const parts = chapterId.split("|_|");
    const mangaId = parts[0];
    const slug = parts[1];
    
    const doc = await this._getHtml(`/manga/${mangaId}/${slug}/?style=list`);
    return doc.querySelectorAll(".page-break img, .reading-content img").map(img => {
      let src = img.attr("data-src") || img.attr("src");
      if (src && src.startsWith("//")) src = "https:" + src;
      return src ? src.trim() : null;
    }).filter(Boolean);
  }
}
