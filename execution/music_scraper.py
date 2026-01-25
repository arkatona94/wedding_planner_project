"""
Scraper for Wedding Music (DJ/Bands).
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
     VendorData(
        name="Party Pleasers Services",
        category="music",
        address="Hamilton",
        city="Hamilton",
        state="OH",
        zip_code="45011",
        phone="(513) 336-6935",
        website="https://partypleasersservices.com",
        price_range="$$",
        rating=4.9,
        reviews_count=400,
        tags=["DJ", "Lighting", "Photo Booth"],
        source="Local",
        distance_miles=2.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="music",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-djs",
        tk_slug="wedding-djs",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "music")
