import requests as r

url = "http://wa3lm.dev.spsejecna.net/incident/select.php"
url2 = "http://wa3lm.dev.spsejecna.net/incident/api.php"

payload = {
    "select": ["id", "reporter_name", "category", "created_at"],
    "where": {},
    "orderBy": {"column": "created_at", "direction": "DESC"},
    "limit": 20,
    "offset": 0,
}

payload2 = {
    "reporterName": "Jan Novák",
    "reporterEmail": "jan.novak@example.com",
    "category": "Požár",
    "location": "Sklad č. 4",
    "description": "Na místě je cítit kouř a viditelné jiskry.",
    "gps": "50.087, 14.421",
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA",
}

res = r.post(url, json=payload)
print(res.status_code)
print(res.json())




def getdata():
    url2 = "http://wa3lm.dev.spsejecna.net/incident/api.php"

    payload2 = {
    "select": ["id", "reporter_name", "category", "created_at"],
    "where": {},
    "orderBy": {"column": "created_at", "direction": "DESC"},
    "limit": 1,
    "offset": 0,
}
    res2 = r.post(url, json=payload2)
    print(res2.status_code)
    response = res2.json()
    print()
    print()
    print()
    print()
    for row in response["data"]:
        print(row)
    print()    
    print()    
    print()    
    print()    
    
    
def insertData():
    pass




if __name__ == "__main__":
    getdata()