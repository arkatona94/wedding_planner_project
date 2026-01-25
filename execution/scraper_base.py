"""
Shared logic for wedding vendor scrapers.
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class VendorData:
    """Standard vendor data structure."""
    name: str
    category: str
    address: str
    city: str
    state: str
    zip_code: str
    phone: str
    website: str
    price_range: str
    rating: float
    reviews_count: int
    tags: List[str]
    source: str
    distance_miles: float
    notes: str = ""

def get_coordinates_from_zip(zip_code: str) -> Optional[tuple]:
    """Get latitude/longitude from zip code using free API."""
    try:
        response = requests.get(f"https://api.zippopotam.us/us/{zip_code}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            lat = float(data['places'][0]['latitude'])
            lng = float(data['places'][0]['longitude'])
            return (lat, lng)
    except Exception as e:
        print(f"Error getting coordinates: {e}")
    return None

def scrape_weddingwire_base(zip_code: str, category_slug: str, category_name: str) -> List[Dict]:
    """Base scraper for WeddingWire."""
    results = []
    base_url = "https://www.weddingwire.com"
    search_url = f"{base_url}/{category_slug}/ohio/hamilton--oh"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }

    try:
        print(f"  Searching WeddingWire ({category_name})...")
        response = requests.get(search_url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            cards = soup.find_all('div', class_=re.compile(r'vendor-card|storefrontCard'))
            
            for card in cards[:15]:
                try:
                    name_elem = card.find(['h2', 'h3', 'a'], class_=re.compile(r'title|name'))
                    if not name_elem: continue
                    name = name_elem.get_text(strip=True)
                    
                    # Extract Rating
                    rating = 0.0
                    rating_elem = card.find(class_=re.compile(r'rating'))
                    if rating_elem:
                        txt = rating_elem.get_text()
                        match = re.search(r'(\d+\.?\d*)', txt)
                        if match: rating = float(match.group(1))
                    
                    # Extract Tags/Highlights
                    tags = []
                    
                    # 1. Look for price range
                    price_elem = card.find(class_=re.compile(r'price-range|cost'))
                    if price_elem: tags.append(price_elem.get_text(strip=True))
                    
                    # 2. Look for capacity/guest count
                    capacity_elem = card.find(text=re.compile(r'Guests|Capacity'))
                    if capacity_elem:
                        tags.append(capacity_elem.strip())

                    # 3. Look for styles/types (often in badges or subtitles)
                    badges = card.find_all(class_=re.compile(r'badge|pill|sub-title'))
                    for b in badges:
                        t = b.get_text(strip=True)
                        if t and len(t) < 30 and t not in tags:
                            tags.append(t)
                            
                    results.append({
                        'name': name,
                        'rating': rating,
                        'tags': tags,
                        'source': 'WeddingWire'
                    })
                except: continue
    except Exception as e:
        print(f"  WW Error: {e}")
        
    return results

def scrape_theknot_base(zip_code: str, category_slug: str, category_name: str) -> List[Dict]:
    """Base scraper for The Knot."""
    results = []
    search_url = f"https://www.theknot.com/marketplace/{category_slug}-hamilton-oh"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }

    try:
        print(f"  Searching The Knot ({category_name})...")
        response = requests.get(search_url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            cards = soup.find_all('div', class_=re.compile(r'vendor|listing|card'))
            
            for card in cards[:15]:
                try:
                    name_elem = card.find(['h2', 'h3', 'a'])
                    if not name_elem: continue
                    name = name_elem.get_text(strip=True)
                    if len(name) < 3: continue
                    
                    rating = 0.0
                    try:
                        rating_elem = card.find(class_=re.compile(r'rating|score|stars', re.I))
                        if rating_elem:
                            txt = rating_elem.get_text()
                            match = re.search(r'(\d+\.?\d*)', txt)
                            if match:
                                val = float(match.group(1))
                                if 0 <= val <= 5: rating = val
                    except: pass

                    # Extract Tags
                    tags = []
                    # The Knot often puts category/style info in a paragraph or small text block below the name
                    info_elems = card.find_all(['div', 'span', 'p'], class_=re.compile(r'subtitle|category|detail|accent'))
                    for elem in info_elems:
                        text = elem.get_text(strip=True)
                        # Filter for relevant short descriptors
                        if 3 < len(text) < 40 and '$' not in text:
                            # Split by common delimiters
                            parts = re.split(r'[,|•]', text)
                            for p in parts:
                                clean_p = p.strip()
                                if clean_p and clean_p not in tags and not clean_p.isdigit():
                                    tags.append(clean_p)
                                    
                    # Look for Price
                    price_elem = card.find(text=re.compile(r'\$\$'))
                    if price_elem: tags.append(price_elem.strip())

                    results.append({
                        'name': name,
                        'rating': rating,
                        'tags': tags,
                        'source': 'The Knot'
                    })
                except: continue
    except Exception as e:
        print(f"  TK Error: {e}")
        
    return results

def standardized_search(
    category_key: str,
    zip_code: str,
    radius: int,
    ww_slug: str,
    tk_slug: str,
    sample_data: List[VendorData]
) -> Dict:
    """Main execution flow for all scrapers."""
    print(f"\n{'='*60}")
    print(f"{category_key.upper()} SEARCH")
    print(f"Location: {zip_code}, Radius: {radius}m")
    print(f"{'='*60}\n")
    
    all_vendors = []
    
    # 1. Load Samples
    print(f"Loading local database for {category_key}...")
    all_vendors.extend(sample_data)
    print(f"  Found {len(sample_data)} curated results")

    # 2. Web Scrape
    scraped_ww = scrape_weddingwire_base(zip_code, ww_slug, category_key)
    for res in scraped_ww:
        v = VendorData(
            name=res['name'],
            category=category_key,
            address="", # details usually require deeper scrape
            city="Hamilton Area",
            state="OH",
            zip_code=zip_code,
            phone="",
            website="",
            price_range="Unknown",
            rating=res.get('rating', 0.0),
            reviews_count=0,
            tags=res.get('tags', []),
            source="WeddingWire",
            distance_miles=0.0
        )
        all_vendors.append(v)
        
    scraped_tk = scrape_theknot_base(zip_code, tk_slug, category_key)
    for res in scraped_tk:
        v = VendorData(
            name=res['name'],
            category=category_key,
            address="",
            city="Hamilton Area",
            state="OH",
            zip_code=zip_code,
            phone="",
            website="",
            price_range="Unknown",
            rating=res.get('rating', 0.0),
            reviews_count=0,
            tags=res.get('tags', []),
            source="The Knot",
            distance_miles=0.0
        )
        all_vendors.append(v)
    
    # Deduplicate
    seen = set()
    unique = []
    for v in all_vendors:
        k = v.name.lower().strip()
        if k not in seen:
            seen.add(k)
            unique.append(asdict(v))
            
    return {
        'category': category_key,
        'updated_at': datetime.now().isoformat(),
        'count': len(unique),
        'results': unique
    }

def save_to_file(data: Dict, filename_base: str):
    """Save to JSON in the src/data directory directly."""
    # Ensure src/data exists
    import os
    os.makedirs('src/data', exist_ok=True)
    
    path = f"src/data/{filename_base}.json"
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Saved {len(data['results'])} results to {path}")
