import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FUNCTION_URL = "https://xcjelqmifskowxxdtqrh.supabase.co/functions/v1/wedding-api-key"


def fetch_keys():
    try:
        print(f"Fetching keys from: {FUNCTION_URL}...")
        headers = {"Authorization": f"Bearer {SERVICE_ROLE_KEY}"}
        response = requests.get(FUNCTION_URL, headers=headers, timeout=15)

        if response.status_code == 200:
            print("Successfully retrieved keys.")
            data = response.json()
            print(json.dumps(data, indent=2))

            with open(".tmp_keys.json", "w") as f:
                json.dump(data, f)
        else:
            print(f"Error fetching keys: {response.status_code} {response.text}")

    except Exception as e:
        print(f"Exception during fetch: {e}")


if __name__ == "__main__":
    fetch_keys()
