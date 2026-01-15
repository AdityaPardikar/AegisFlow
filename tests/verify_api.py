import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("Testing /health...")
    try:
        res = httpx.get(f"{BASE_URL}/health")
        print(f"Status: {res.status_code}, Body: {res.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

def test_analyze_fraud():
    print("\nTesting /api/v1/analyze (FRAUD Case)...")
    payload = {
        "amount": 600.0, 
        "oldbalanceOrg": 1000.0,
        "newbalanceOrig": 400.0,
        "oldbalanceDest": 0.0,
        "newbalanceDest": 0.0,
        "type": "PAYMENT",
        "transaction_time": "2024-01-15T12:00:00"
    }
    
    token = get_token()
    if not token:
        print("Skipping Analyze test due to Auth failure.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        res = httpx.post(f"{BASE_URL}/api/v1/analyze/", json=payload, headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            print(json.dumps(res.json(), indent=2))
        else:
            print(res.text)
    except Exception as e:
        print(f"Analyze failed: {e}")

def get_token():
    print("\nGetting Admin Token...")
    try:
        payload = {
            "username": "admin@aegisflow.com",
            "password": "admin123"
        }
        res = httpx.post(f"{BASE_URL}/api/v1/login/access-token", data=payload)
        if res.status_code == 200:
            token = res.json()["access_token"]
            print("Token acquired.")
            return token
        else:
            print(f"Login failed: {res.status_code} {res.text}")
            return None
    except Exception as e:
        print(f"Login failed: {e}")
        return None

if __name__ == "__main__":
    time.sleep(1)
    test_health()
    test_analyze_fraud()
