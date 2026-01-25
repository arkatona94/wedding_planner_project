"""
Scraper for Wedding Catering.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
    VendorData(
        name="Vonderhaar's Catering",
        category="catering",
        address="19 W Pleasant St",
        city="Reading",
        state="OH",
        zip_code="45215",
        phone="(513) 554-1969",
        website="https://vonderhaars.com",
        price_range="$$",
        rating=4.8,
        reviews_count=120,
        tags=["Buffet", "Plated"],
        source="Local",
        distance_miles=12.0
    ),
    VendorData(
        name="Funky's Catering Events",
        category="catering",
        address="1761 Tennessee Ave",
        city="Cincinnati",
        state="OH",
        zip_code="45229",
        phone="(513) 841-9999",
        website="https://funkyscatering.com",
        price_range="$$$$",
        rating=4.9,
        reviews_count=90,
        tags=["Luxury", "Full Service"],
        source="Local",
        distance_miles=20.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="catering",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-catering",
        tk_slug="wedding-catering",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "catering")
