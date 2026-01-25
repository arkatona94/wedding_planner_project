"""
Scraper for Wedding Cakes.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
    VendorData(
        name="A Spoon Fulla Sugar",
        category="cake",
        address="11916 Montgomery Rd",
        city="Cincinnati",
        state="OH",
        zip_code="45249",
        phone="(513) 683-0444",
        website="",
        price_range="$$",
        rating=4.8,
        reviews_count=85,
        tags=["Custom Cakes", "Dessert Bar"],
        source="Local",
        distance_miles=16.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="cake",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-cakes",
        tk_slug="wedding-cakes",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "cake")
