"""Lists each song of the whole YouTube playlists in public/music/playlist.txt.

Run during the site's build (GitHub Actions), where YouTube can be reached. For
each line that links a whole playlist ("Name | https://youtube.com/playlist?list=..."),
it asks yt-dlp for the playlist's videos (titles and ids only; nothing is
downloaded) and writes them in its place as ordinary "Title | link" lines, so the
room lists every song. The file in the repository isn't changed; only the copy
the build publishes. If a playlist can't be read, its line stays as it was and
the room plays it as one row instead. A single song listed without a name gets
its YouTube title. Songs in a playlist that YouTube won't play
outside its own site (or that are gone) are left out.
"""
import json
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "public" / "music" / "playlist.txt"
LIST = re.compile(r"[?&]list=([\w-]{12,})")
# "1% Battery Girl - Phoenix EP | Zenless Zone Zero 3.3 OST" -> "1% Battery Girl - Phoenix EP"
TAIL = re.compile(r"\s*[|｜]\s*(Zenless Zone Zero|Neverness to Everness|NTE)\b.*$", re.I)


def plays_here(vid):
    """Whether YouTube lets this video play in other sites' players (the room's).

    YouTube's oEmbed answers 401 when the owner has turned off embedding and 404
    when the video is gone; those are left out. Anything else (a network hiccup)
    counts as playable, so a song is never dropped by mistake.
    """
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(f"https://www.youtube.com/watch?v={vid}")
    try:
        urllib.request.urlopen(url, timeout=20).close()
        return True
    except urllib.error.HTTPError as e:
        return e.code not in (401, 403, 404)
    except Exception:  # noqa: BLE001
        return True


def title_of(vid):
    """A video's YouTube title (via oEmbed), or "" if it can't be read."""
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(f"https://www.youtube.com/watch?v={vid}")
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            d = json.load(r)
        print(f"Video {vid}: \"{d.get('title', '')}\" by {d.get('author_name', '?')}")
        return d.get("title", "")
    except Exception:  # noqa: BLE001
        return ""


def songs_of(list_id):
    out = subprocess.run(
        ["yt-dlp", "--flat-playlist", "--dump-single-json", "--no-warnings",
         f"https://www.youtube.com/playlist?list={list_id}"],
        capture_output=True, text=True, timeout=180,
    )
    if out.returncode:
        raise RuntimeError(out.stderr.strip()[-300:])
    data = json.loads(out.stdout)
    print(f'Playlist {list_id}: "{data.get("title", "")}" by {data.get("uploader") or data.get("channel") or "?"}')
    entries = data.get("entries") or []
    songs = []
    for e in entries:
        vid, title = e.get("id"), (e.get("title") or "").strip()
        # Skip videos YouTube marks private or deleted.
        if not vid or len(vid) != 11 or title in ("[Private video]", "[Deleted video]"):
            continue
        title = TAIL.sub("", title).replace("|", "/").strip() or title
        # Songs that only play on YouTube itself are left out of the room.
        if not plays_here(vid):
            print(f"  left out (doesn't play outside YouTube): {title}")
            continue
        songs.append(f"{title} | https://youtu.be/{vid}")
    return songs


def main():
    lines = FILE.read_text(encoding="utf-8").splitlines()
    out, changed = [], 0
    for line in lines:
        t = line.strip()
        m = LIST.search(t)
        is_video = re.search(r"[?&]v=|youtu\.be/", t)
        # A single video given without a name: fill in its YouTube title.
        if t and not t.startswith(("#", "[")) and "|" not in t and is_video:
            vm = re.search(r"(?:youtu\.be/|[?&]v=)([\w-]{11})", t)
            name = title_of(vm.group(1)) if vm else ""
            name = TAIL.sub("", name).replace("|", "/").strip()
            out.append(f"{name} | {t}" if name else line)
            continue
        if not t or t.startswith("#") or t.startswith("[") or not m or is_video:
            out.append(line)
            continue
        try:
            songs = songs_of(m.group(1))
        except Exception as e:  # noqa: BLE001 - keep the build going
            print(f"Couldn't read playlist {m.group(1)}: {e}", file=sys.stderr)
            out.append(line)
            continue
        if not songs:
            out.append(line)
            continue
        print(f"Playlist {m.group(1)}: {len(songs)} songs")
        out.append(f"# From the YouTube playlist {m.group(1)}:")
        out.extend(songs)
        changed += 1
    FILE.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"Listed the songs of {changed} playlist(s).")


if __name__ == "__main__":
    main()
