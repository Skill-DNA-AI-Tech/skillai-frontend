interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Try serving the static asset first
    const response = await env.ASSETS.fetch(request);

    // If 404 and it's a SPA navigation route (no file extension), return index.html
    if (response.status === 404 && !url.pathname.includes('.')) {
      const indexUrl = new URL('/', request.url);
      return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
    }

    return response;
  }
};
