# Harbor Manga Multisrc Repository 🚢📖

Welcome to the ultimate manga plugin repository for the Harbor app! 
This project is built with a **Multisrc Template Architecture**, which means we can generate hundreds of high-quality manga extensions using a single core template, drastically reducing maintenance!

## 🚀 How to Install Plugins

1. Open your **Harbor App**.
2. Navigate to the **Extensions** or **Plugins** section.
3. Look for **"Add a repository"** or **"Bring your own extensions"**.
4. Paste the URL of the repository:
   - For local testing: `http://localhost:7000/repo.json`
   - For GitHub Pages (Live): `https://rEtelect.github.io/HarborPluginManga/public/repo.json`
5. Click **Add**. You will now see a list of available manga sources (like MangaDex, Toonily, etc.).
6. Click **Install** on your favorite sources and enjoy reading!

---

## 🛠️ How to Add a New Website (For Developers)

Tired of maintaining separate scraper scripts for every site? We are too! 
That's why this project uses a **Generator Factory**. You don't need to write any scraping logic to add a new site, as long as it uses a supported template!

### 🎯 What sites to target?
Currently, our factory perfectly supports sites built with the **Madara WordPress Theme**. Madara is the most popular engine for Manga/Manhwa aggregators. (e.g., Toonily, MangaTx, etc.).

### 📝 Steps to add a site:
1. Clone this repository to your computer.
2. Open the file `scripts/build-plugins.js`.
3. Locate the `sites` array at the top of the file, and add your new site like this:
   ```javascript
   {
     id: "yoursite-source",
     name: "YourSiteName",
     version: "1.0.0",
     lang: "en",
     nsfw: false, // Set to true if the site contains mature content
     baseUrl: "https://yoursite.com",
     template: "madara.js"
   }
   ```
4. Open your terminal and run the factory command:
   ```bash
   npm run build:plugins
   ```
5. **BOOM!** 💥 The generator will instantly build the standalone plugin file in the `public/` directory and update the `repo.json` file automatically.
6. Commit your changes and push them to GitHub. The new plugin will instantly be available to all Harbor users around the world!

---

## 🏗️ Architecture

- `public/`: Contains the generated standalone plugins and the `repo.json` index. This folder is served to the Harbor app.
- `src/templates/`: Contains the core scraping logic (e.g., `madara.js`).
- `scripts/build-plugins.js`: The Node.js factory that merges templates with site configurations.

*Built with ❤️ for the Harbor Manga Community.*
