"""
Scraper for Wedding Rentals.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
     VendorData(
        name="Prime Time Party Rental",
        category="rentals",
        address="Dayton",
        city="Dayton/Cincy",
        state="OH",
        zip_code="45458",
        phone="(937) 296-9262",
        website="https://primetimepartyrental.com",
        price_range="$$",
        rating=4.5,
        reviews_count=50,
        tags=["Tents", "Linens", "Decor"],
        source="Local",
        distance_miles=25.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="rentals",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-rentals",
        tk_slug="wedding-rentals",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "rentals")
