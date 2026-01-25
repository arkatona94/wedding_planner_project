"""
Scraper for Wedding Photography.
"""
from scraper_base import standardized_search, save_to_file, VendorData

SAMPLE_DATA = [
    VendorData(
        name="Images by Daniel Michael",
        category="photography",
        address="123 Main St",
        city="Cincinnati",
        state="OH",
        zip_code="45215",
        phone="(513) 759-6760",
        website="https://imagesbydanielmichael.com",
        price_range="$$$",
        rating=4.9,
        reviews_count=200,
        tags=["Artistic", "Documentary"],
        source="Local",
        distance_miles=15.0
    ),
    VendorData(
        name="Everlasting Sounds & Photography",
        category="photography",
        address="Montgomery Rd",
        city="Cincinnati",
        state="OH",
        zip_code="45242",
        phone="(513) 555-0199",
        website="",
        price_range="$$",
        rating=4.7,
        reviews_count=150,
        tags=["Traditional", "Video Bundle"],
        source="Local",
        distance_miles=18.0
    )
]

if __name__ == "__main__":
    data = standardized_search(
        category_key="photography",
        zip_code="45011",
        radius=50,
        ww_slug="wedding-photographers",
        tk_slug="wedding-photographers",
        sample_data=SAMPLE_DATA
    )
    save_to_file(data, "photography")
