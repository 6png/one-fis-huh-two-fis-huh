import csv, json, urllib.request, os

BASE_URL = "https://docs.google.com/spreadsheets/d/1t7fswBc7EbRvUU6i8UY98DRCS5Mqscl_HSus2fmPZXo/export?format=csv&gid="
SHEETS = {
    "fish": "1896773022",
    "bug": "1105578399",
    "bird": "880015541"
}

def get_weather_dict(s):
    return {
        "sunny": "☀️" in s,
        "rainy": "💧" in s,
        "rainbow": "🌈" in s
    }

def build_all():
    for category, gid in SHEETS.items():
        res = urllib.request.urlopen(BASE_URL + gid)
        lines = [line.decode('utf-8') for line in res.readlines()]
        reader = list(csv.reader(lines))
        data = []

        for row in reader[1:]:
            if not row or not row[0]: continue

            item = {
                "name": row[0],
                "lvl": int(row[1]) if row[1].isdigit() else 0,
                "weather": get_weather_dict(row[2]),
                "times": {
                    "dawn": row[3].strip().upper() == "TRUE", 
                    "morning": row[4].strip().upper() == "TRUE", 
                    "afternoon": row[5].strip().upper() == "TRUE", 
                    "dusk": row[6].strip().upper() == "TRUE"
                },
                "location": row[7]
            }

            if category == "fish":
                item.update({
                    "shadow": row[8] if row[8] else None,
                    "price": {
                        "1*": int(row[9]) if row[9].isdigit() else 0,
                        "2*": int(row[10]) if row[10].isdigit() else 0,
                        "3*": int(row[11]) if row[11].isdigit() else 0,
                        "4*": int(row[12]) if row[12].isdigit() else 0,
                        "5*": int(row[13]) if row[13].isdigit() else 0
                    }
                })
            elif category == "bug":
                item.update({
                    "detailed_location": row[8] if row[8] else None,
                    "price": {
                        "1*": int(row[9]) if row[9].isdigit() else 0,
                        "2*": int(row[10]) if row[10].isdigit() else 0,
                        "3*": int(row[11]) if row[11].isdigit() else 0,
                        "4*": int(row[12]) if row[12].isdigit() else 0,
                        "5*": int(row[13]) if row[13].isdigit() else 0
                    }
                })
            elif category == "bird":
                item.update({
                    "detailed_location": row[8] if row[8] else None,
                    "stretch_weather": get_weather_dict(row[9]),
                    "stretch_times": {
                        "dawn": row[10].strip().upper() == "TRUE",
                        "morning": row[11].strip().upper() == "TRUE",
                        "afternoon": row[12].strip().upper() == "TRUE",
                        "dusk": row[13].strip().upper() == "TRUE"
                    },
                    "notes": row[14] if row[14] else None,
                    "price": {
                        "1*": int(row[15]) if row[15].isdigit() else 0,
                        "2*": int(row[16]) if row[16].isdigit() else 0,
                        "3*": int(row[17]) if row[17].isdigit() else 0,
                        "4*": int(row[18]) if row[18].isdigit() else 0,
                        "5*": int(row[19]) if row[19].isdigit() else 0
                    }
                })

            data.append(item)

        os.makedirs("./assets/data", exist_ok=True)
        with open(f"./assets/data/{category}.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"complete: {category}.json")

if __name__ == "__main__":
    build_all()