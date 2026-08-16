const fs = require('fs');

// Mock Harbor's sandbox API
global.harbor = {
  http: async (url, options) => {
    try {
      const fetchOptions = {
        headers: options.headers || {}
      };
      
      const response = await fetch(url, fetchOptions);
      const text = await response.text();
      
      let body = text;
      if (options.responseType === 'json') {
        body = JSON.parse(text);
      }

      return {
        ok: response.ok,
        status: response.status,
        body: body
      };
    } catch (e) {
      throw new Error(`Failed to fetch ${url}: ${e.message}`);
    }
  }
};

async function testPlugin() {
  console.log('Loading plugin...');
  const pluginCode = fs.readFileSync('./public/mangadex.plugin.js', 'utf8');
  
  // Evaluate the plugin code. The plugin code returns the plugin object.
  const pluginFunction = new Function(pluginCode);
  const plugin = pluginFunction();
  
  console.log(`Loaded plugin: ${plugin.name} (${plugin.id})`);
  
  console.log('\n--- Testing popular() ---');
  const popular = await plugin.popular(0);
  console.log(`Found ${popular.length} popular manga.`);
  if (popular.length > 0) {
    let targetManga = null;
    let targetChapters = [];
    
    for (const manga of popular) {
      console.log(`Checking chapters for ${manga.title}...`);
      const chapters = await plugin.chapters(manga.id);
      if (chapters.length > 0) {
        targetManga = manga;
        targetChapters = chapters;
        break;
      }
    }

    if (targetManga) {
      console.log('Found manga with chapters:', targetManga.title);
      
      console.log('\n--- Testing detail() ---');
      const detail = await plugin.detail(targetManga.id);
      console.log('Details:', detail);
      
      console.log('\n--- Testing chapters() ---');
      console.log(`Found ${targetChapters.length} chapters.`);
      console.log('First chapter:', targetChapters[0]);
      
      console.log('\n--- Testing pageUrls() ---');
      const firstChapterId = targetChapters[0].id;
      const pages = await plugin.pageUrls(firstChapterId);
      console.log(`Found ${pages.length} pages.`);
      if (pages.length > 0) {
         console.log('First page URL:', pages[0]);
      }
    }
  }
}

testPlugin().catch(console.error);
