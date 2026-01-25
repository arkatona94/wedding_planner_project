"""
Scraper for Wedding Transportation.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
    VendorData(
        name="A Savannah Nite Limousine",
        category="transportation",
        address="West Chester",
        city="West Chester",
        state="OH",
        zip_code="45069",
        phone="(513) 858-2677",
        website="",
        price_range="$$",
        rating=4.3,
        reviews_count=60,
        tags=["Limos", "Buses"],
        source="Local",
        distance_miles=8.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="transportation",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-limos",
        tk_slug="wedding-transporation",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "transportation")
