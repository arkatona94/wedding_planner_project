"""
Scraper for Wedding Florists.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
    VendorData(
        name="Oberer's Flowers",
        category="florist",
        address="West Chester",
        city="West Chester",
        state="OH",
        zip_code="45069",
        phone="(513) 777-1211",
        website="https://oberers.com",
        price_range="$$",
        rating=4.6,
        reviews_count=300,
        tags=["Fresh", "Centerpieces"],
        source="Local",
        distance_miles=8.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="florist",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-florists",
        tk_slug="wedding-florists",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "florist")
