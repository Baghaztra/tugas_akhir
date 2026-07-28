import re
import urllib.request

# ponytail: Instagram serves SSR to Googlebot but SPA shell to regular browsers
_IG_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def fetch_ig_thumbnail(url: str) -> str | None:
    """Fetch thumbnail image URL from an Instagram post via its embed page."""
    # Convert post URL to embed URL
    embed_url = re.sub(
        r'(instagram\.com/p/[^/]+)',
        r'\1/embed/',
        url.split("?")[0].rstrip("/"),
    )

    req = urllib.request.Request(embed_url, headers={
        "User-Agent": _IG_UA,
        "Accept": "text/html",
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="replace")

        # The embed page has the post image in an img with class containing "EmbeddedMediaImage"
        match = re.search(
            r'<img[^>]*class="[^"]*EmbeddedMediaImage[^"]*"[^>]*src="([^"]+)"',
            html,
        )
        if match:
            return match.group(1).replace("&amp;", "&")
    except Exception:
        pass
    return None
