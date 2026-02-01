import requests
import json

FUNCTION_URL = "https://xcjelqmifskowxxdtqrh.supabase.co/functions/v1/wedding-api-key"


def fetch_keys():
    try:
        print(f"Fetching keys from: {FUNCTION_URL}...")
        # Note: If this function requires a JWT, it might fail without an Authorization header.
        # But assuming it's public for this setup phase.
        response = requests.get(FUNCTION_URL, timeout=15)

        if response.status_code == 200:
            print("Successfully retrieved keys.")
            data = response.json()
            print(json.dumps(data, indent=2))

            # Save to a temporary file for the orchestrator to read if needed
            with open(".tmp_keys.json", "w") as f:
                json.dump(data, f)
        else:
            print(f"Error fetching keys: {response.status_code} {response.text}")

    except Exception as e:
        print(f"Exception during fetch: {e}")


if __name__ == "__main__":
    fetch_keys()
