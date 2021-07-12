import re, requests

base = "http://localhost:5000"

queue = ["http://localhost:5000"]
scanned = set(queue)

scancount = 0

for url in queue:
    res = requests.get(url)
    if res.status_code == 200:
        if "localhost" not in url:
            continue
        scancount += 1
        for link in re.findall("""href=["'](.*?)["']""", res.text):
            if not link.startswith("http"):
                link = base + link
            if link not in scanned:
                queue.append(link)
                scanned.add(link)
    else:
        print("\033[91m" + url + " returned status code " + str(res.status_code) + "\033[0m")

print("scanned", scancount)
