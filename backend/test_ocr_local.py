import requests
import time
import sys
import os

# Create a dummy image if not exists
def create_dummy_image():
    from PIL import Image, ImageDraw, ImageFont
    img = Image.new('RGB', (800, 1200), color = (255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((100,100), "Hello World Manga Test", fill=(0,0,0))
    img.save('test_image.png')
    return 'test_image.png'

def test_ocr():
    print("🚀 Testing OCR API...")
    url = "http://localhost:8000/api/ocr/detect"
    
    img_path = 'test_image.png'
    if not os.path.exists(img_path):
        create_dummy_image()
        
    files = {'file': open(img_path, 'rb')}
    data = {
        'language': 'jpn',
        'target_language': 'vie',
        'use_cotrans': 'false' # Force local pipeline to see logs
    }
    
    try:
        print(f"📡 Sending request to {url}...")
        res = requests.post(url, files=files, data=data)
        
        if res.status_code != 200:
            print(f"❌ Error: {res.status_code} - {res.text}")
            return
            
        json_data = res.json()
        job_id = json_data['job_id']
        print(f"✅ Job started! ID: {job_id}")
        
        # Poll status
        status_url = f"http://localhost:8000/api/ocr/status/{job_id}"
        
        while True:
            r = requests.get(status_url)
            status = r.json()
            print(f"⏳ Status: {status['status']} | Progress: {status['progress']}% | Msg: {status['message']}")
            
            if status['status'] in ['completed', 'failed']:
                break
            time.sleep(1)
            
        print("Done!")
        if status['status'] == 'completed':
            print(f"🎉 Result: {len(status['result']['regions'])} regions found")
        else:
            print(f"❌ Job Failed: {status.get('error')}")

    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    test_ocr()
