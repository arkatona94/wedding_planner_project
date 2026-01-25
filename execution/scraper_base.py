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
    # Note: URL structure varies by region, defaulting to general search or specific OH area for this project context
    # ideally we map zip to region slug, but for now we'll force a common OH search for demonstration
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
                    
                    # Try extract rating
                    rating = 0.0
                    reviews = 0
                    rating_elem = card.find(class_=re.compile(r'rating'))
                    if rating_elem:
                        txt = rating_elem.get_text()
                        match = re.search(r'(\d+\.?\d*)', txt)
                        if match: rating = float(match.group(1))
                    
                    results.append({
                        'name': name,
                        'rating': rating,
                        'source': 'WeddingWire'
                    })
                except: continue
    except Exception as e:
        print(f"  WW Error: {e}")
        
    return results

def scrape_theknot_base(zip_code: str, category_slug: str, category_name: str) -> List[Dict]:
    """Base scraper for The Knot."""
    results = []
    # Similar to WW, hardcoding region for the demo context (Hamilton, OH)
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
                    # Try to find rating (common patterns on The Knot)
                    try:
                        # Look for numeric rating text (e.g. "4.9")
                        rating_elem = card.find(class_=re.compile(r'rating|score|stars', re.I))
                        if rating_elem:
                            txt = rating_elem.get_text()
                            match = re.search(r'(\d+\.?\d*)', txt)
                            if match:
                                val = float(match.group(1))
                                if 0 <= val <= 5: 
                                    rating = val
                    except:
                        pass

                    results.append({
                        'name': name,
                        'rating': rating,
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
            tags=[],
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
            tags=[],
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
