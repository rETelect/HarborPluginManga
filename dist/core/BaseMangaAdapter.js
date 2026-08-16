"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMangaAdapter = void 0;
class BaseMangaAdapter {
    sourceName;
    constructor(sourceName) {
        this.sourceName = sourceName;
    }
    /**
     * Get the display name of this source
     */
    getSourceName() {
        return this.sourceName;
    }
}
exports.BaseMangaAdapter = BaseMangaAdapter;
