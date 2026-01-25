"""
Scraper for Wedding Videography.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
     VendorData(
        name="Lifetime Films",
        category="videography",
        address="",
        city="Cincinnati",
        state="OH",
        zip_code="45202",
        phone="(513) 222-3333",
        website="",
        price_range="$$$",
        rating=4.8,
        reviews_count=40,
        tags=["Cinematic", "Drone"],
        source="Local",
        distance_miles=15.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="videography",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-videographers",
        tk_slug="wedding-videographers",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "videography")
