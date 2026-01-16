class WebSearchService {
  static async search(query) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/websearch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `query=${encodeURIComponent(query)}`
    });
    return await response.json();
  }

  static formatSearchResults(data, query) {
    if (data.formatted_results) {
      return data.formatted_results;
    }
    
    const results = data.raw_results || data.results;
    if (results?.length > 0) {
      return `I found ${results.length} web search results for "${query.trim()}":\n\n` +
        results.map((r, i) => `**${i + 1}. ${r.title}**\n${r.body}\n[View Source](${r.href})`).join('\n\n');
    }
    
    return data.error || `I couldn't find any web search results for "${query.trim()}".`;
  }
}

export default WebSearchService;