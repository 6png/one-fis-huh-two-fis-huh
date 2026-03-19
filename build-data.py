import csv, json, urllib.request, os

BASE_URL = "https://docs.google.com/spreadsheets/d/1t7fswBc7EbRvUU6i8UY98DRCS5Mqscl_HSus2fmPZXo/export?format=csv&gid="
SHEETS = {
    "fish": "1896773022",
    "bug": "1105578399",
    "bird": "880015541"
}

def build_all():
    for category, gid in SHEETS.items():
        res = urllib.request.urlopen(BASE_URL + gid)
        lines = [line.decode('utf-8') for line in res.readlines()]
        reader = list(csv.reader(lines))
        data = []

        for row in reader[1:]:
            if not row or not row[0]: continue

            #common cols
            item = {
                "name": row[0],
                "lvl": int(row[1]) if row[1].isdigit() else 0,
                "weather": row[2],
                "times": {"dawn": row[3], "morning": row[4], 
                          "afternoon": row[5], "dusk": row[6]},
                "location": row[7]
            }

            #unique cols
            if category == "fish":
                PASS # type: ignore
            elif category == "bug":
                PASS # type: ignore
            elif category == "bird":
                PASS # type: ignore

            data.append(item)


        os.makedirs("./assets/data", exist_ok=True)
        with open(f"./assets/data/{category}.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Baking complete: {category}.json")

if __name__ == "__main__":
    build_all()