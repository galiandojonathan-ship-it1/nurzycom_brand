// Cloudflare Pages middleware for the course site (project bynurzy-study).
// The project's own address (bynurzy-study.pages.dev and its preview subdomains) forwards to study.bynurzy.com,
// which is the only address behind Cloudflare Access (login by email). Every other request passes through unchanged.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith(".pages.dev") && url.hostname.includes("bynurzy-study")) {
    return Response.redirect("https://study.bynurzy.com" + url.pathname + url.search, 301);
  }
  return context.next();
}
