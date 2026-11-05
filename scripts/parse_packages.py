from bs4 import BeautifulSoup
import re
import json

with open("scripts/destinations_page.html") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

packages = []
# Find all columns containing an Explore Trip Details button or a package heading
cols = soup.find_all("div", class_=lambda c: c and "fl-col" in c)

for col in cols:
    btn = col.find("a", class_=lambda c: c and "fl-button" in c)
    heading = col.find(re.compile(r"^h[1-6]$"))
    img = col.find("img")
    
    if btn and heading:
        title = heading.get_text(strip=True)
        link = btn.get("href", "")
        img_src = ""
        if img:
            img_src = img.get("data-lazy-src") or img.get("data-src") or img.get("src") or ""
        
        # Clean title
        title = re.sub(r"\s+", " ", title).strip()
        
        # Check if already added
        if not any(p["link"] == link for p in packages):
            packages.append({
                "title": title,
                "link": link,
                "image": img_src
            })

print(f"Successfully extracted {len(packages)} destination package links:")
with open("scripts/packages_list.json", "w") as f:
    json.dump(packages, f, indent=2)

for p in packages:
    print(f"{p['title']} -> https://spiritadventures.in{p['link']} | img: {p['image']}")
