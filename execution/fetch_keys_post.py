import requests
import json

FUNCTION_URL = "https://xcjelqmifskowxxdtqrh.supabase.co/functions/v1/wedding-api-key"


def fetch_keys():
    try:
        print(f"Fetching keys from: {FUNCTION_URL} via POST...")
        response = requests.post(FUNCTION_URL, timeout=15)

        if response.status_code == 200:
            print("Successfully retrieved keys.")
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"Error fetching keys (POST): {response.status_code} {response.text}")

    except Exception as e:
        print(f"Exception during fetch: {e}")


if __name__ == "__main__":
    fetch_keys()
