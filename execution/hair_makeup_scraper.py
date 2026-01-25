"""
Scraper for Wedding Hair & Makeup.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
    VendorData(
        name="Brideface",
        category="hair-makeup",
        address="Cincinnati",
        city="Cincinnati",
        state="OH",
        zip_code="45202",
        phone="",
        website="https://brideface.com",
        price_range="$$$",
        rating=4.9,
        reviews_count=180,
        tags=["Makeup Only", "Airbrush"],
        source="Local",
        distance_miles=20.0
    ),
    VendorData(
        name="REFeyeANCE Makeup & Hair",
        category="hair-makeup",
        address="Traveling",
        city="Cincinnati",
        state="OH",
        zip_code="45202",
        phone="",
        website="",
        price_range="$$",
        rating=4.8,
        reviews_count=300,
        tags=["Hair & Makeup", "Large Teams"],
        source="Local",
        distance_miles=20.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="hair-makeup",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-hair-makeup",
        tk_slug="wedding-hair-makeup",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "hair_makeup")
