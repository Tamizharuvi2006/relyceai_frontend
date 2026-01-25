import { webSearch } from '../utils/api';

class WebSearchService {
  // FastAPI REST API - web search
  static async search(query) {
    try {
      const result = await webSearch(query);
      return result;
    } catch (error) {
      console.error('WebSearchService.search error:', error);
      return { error: error.message };
    }
  }

  static formatSearchResults(data, query) {
    if (data.error) {
      return data.error;
    }
    
    if (data.formatted_results) {
      return data.formatted_results;
    }
    
    const results = data.raw_results || data.results;
    if (results?.length > 0) {
      return `I found ${results.length} web search results for "${query.trim()}":\n\n` +
        results.map((r, i) => `**${i + 1}. ${r.title}**\n${r.body}\n[View Source](${r.href})`).join('\n\n');
    }
    
    return `I couldn't find any web search results for "${query.trim()}".`;
  }
}

export default WebSearchService;