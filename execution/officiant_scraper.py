"""
Scraper for Wedding Officiants.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
     VendorData(
        name="Beautiful Memories Wedding Officiant",
        category="officiant",
        address="",
        city="Middletown",
        state="OH",
        zip_code="45044",
        phone="",
        website="",
        price_range="$",
        rating=5.0,
        reviews_count=20,
        tags=["Non-denominational", "Custom Vows"],
        source="Local",
        distance_miles=10.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="officiant",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-officiants",
        tk_slug="wedding-officiants",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "officiant")
