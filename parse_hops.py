import re
import json

def parse_hops(ocr_text):
    # Split text into pages (based on the common footer or headers)
    # Each hop seems to have its own page starting with its name in ALL CAPS.
    # However, some names are brands.
    
    # List of hop names to look for
    hop_names = [
        "ADMIRAL", "AHTANUM", "AMARILLO", "ARAMIS", "AURORA", "AZACCA", "BITTER GOLD", "BOADICEA",
        "BOBEK", "BOUCLIER", "BRAMLING CROSS", "BRAVO", "BREWER’S GOLD", "BROOKLYN", "BULLION",
        "CASCADE", "CASHMERE", "CELEIA", "CENTENNIAL", "CHALLENGER", "CHELAN", "CHINOOK", "CITRA",
        "CLUSTER", "COLUMBIA", "COLUMBUS", "COMET", "CRYSTAL", "DANA", "DR. RUDI", "EAST KENT GOLDING",
        "EKUANOT", "EL DORADO", "ELLA", "ENDEAVOUR", "ENIGMA", "EPIC", "EROICA", "FALCONER’S FLIGHT",
        "FIRST GOLD", "FUGGLE", "GALAXY", "GALENA", "GLACIER", "GOLDING", "GREEN BULLET", "HALLERTAU",
        "HALLERTAU BLANC", "HELGA", "HERALD", "HERKULES", "HERSBRUCKER", "HORIZON", "HUELL MELON",
        "IDAHO 7", "INDEPENDENCE", "JARRYLO", "KAZBEK", "KOHATU", "LIBERTY", "LORAL", "MAGNUM",
        "MANDARINA BAVARIA", "MERKUR", "MILLENNIUM", "MITTELFRÜH", "MOSAIC", "MOTUEKA", "MT. HOOD",
        "MT. RAINIER", "NELSON SAUVIN", "NEWPORT", "NORTHDOWN", "NORTHERN BREWER", "NUGGET", "OLYMPIC",
        "OPAL", "ORION", "PACIFIC CREST", "PACIFIC GEM", "PACIFIC JADE", "PACIFICA", "PAHTO", "PALISADE",
        "PEKKO", "PERLE", "PHOENIX", "PILGRIM", "PILOT", "PIONEER", "POLARIS", "PREMIANT",
        "PRIDE OF RINGWOOD", "PROGRESS", "RAKAU", "RIWAKA", "SAAZ", "SABRO", "SANTIAM", "SAPHIR",
        "SAVINJSKI GOLDING", "SELECT", "SIMCOE", "SLÁDEK", "SMARAGD", "SORACHI ACE", "SOUTHERN CROSS",
        "SOVEREIGN", "SPALT", "STERLING", "STICKLEBRACT", "STRISSELSPALT", "SUMMER", "SUMMIT",
        "SUPER PRIDE", "SUSSEX", "SYLVA", "TAHOMA", "TARGET", "TAURUS", "TETTNANG", "TOMAHAWK",
        "TOPAZ", "TRADITION", "TRIPLEPEARL", "TRISKEL", "ULTRA", "VANGUARD", "VIC SECRET", "WAI-ITI",
        "WAIMEA", "WAKATU", "WARRIOR", "WHITBREAD GOLDING", "WILLAMETTE", "YAKIMA GOLD", "ZEUS", "ZYTHOS"
    ]

    results = []
    
    # The OCR text has "==Start of OCR for page X==" markers.
    pages = re.split(r'==Start of OCR for page \d+==', ocr_text)
    
    for page in pages:
        if not page.strip():
            continue
            
        # Try to find which hop this page belongs to
        name = None
        for hn in hop_names:
            if hn in page.split('\n')[0:10]: # Check first few lines
                name = hn
                break
        
        if not name:
            # Special case for "AHTANUM® BRAND" etc.
            first_lines = " ".join(page.split('\n')[0:5]).upper()
            for hn in hop_names:
                if hn in first_lines:
                    name = hn
                    break
        
        if not name:
            continue

        hop_data = {"name": name.title().replace('’', "'")}
        
        # Alpha Acids (37 - 45% CO-HUMULONE) ... 13% 16%
        # Beta Acids ... 4% 6%
        # Total Oil ... 1 1.7mL/100g
        
        cohum_match = re.search(r'ALPHA ACIDS \((\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*%\s*CO-HUMULONE\)', page)
        if cohum_match:
            low, high = float(cohum_match.group(1)), float(cohum_match.group(2))
            hop_data["coHumulone"] = {"range": [low, high], "avg": round((low + high) / 2, 2)}
        
        # Look for the Alpha/Beta/Oil values which are often listed together later
        # Example:
        # ALPHA ACIDS ...
        # BETA ACIDS
        # TOTAL OIL
        # ...
        # 13% 16%
        # 4% 6%
        # 1 1.7mL/100g
        
        alpha_val_match = re.search(r'(\d+\.?\d*)\s*%\s*(\d+\.?\d*)\s*%', page)
        if alpha_val_match:
            low, high = float(alpha_val_match.group(1)), float(alpha_val_match.group(2))
            hop_data["alphaAcid"] = {"range": [low, high], "avg": round((low + high) / 2, 2)}
            
            # Find the next pair for Beta
            remaining_text = page[alpha_val_match.end():]
            beta_val_match = re.search(r'(\d+\.?\d*)\s*%\s*(\d+\.?\d*)\s*%', remaining_text)
            if beta_val_match:
                low, high = float(beta_val_match.group(1)), float(beta_val_match.group(2))
                hop_data["betaAcid"] = {"range": [low, high], "avg": round((low + high) / 2, 2)}
                remaining_text = remaining_text[beta_val_match.end():]
            
            oil_val_match = re.search(r'(\d+\.?\d*)\s+(\d+\.?\d*)\s*mL/100g', remaining_text)
            if oil_val_match:
                low, high = float(oil_val_match.group(1)), float(oil_val_match.group(2))
                hop_data["totalOils"] = {"range": [low, high], "avg": round((low + high) / 2, 2)}

        # Oil breakdown
        oil_breakdown = {}
        oil_components = [
            ("myrcene", "MYRCENE"),
            ("humulene", "HUMULENE"),
            ("caryophyllene", "CARYOPHYLLENE"),
            ("farnesene", "FARNESENE"),
            ("bPinene", "B-PINENE"),
            ("linalool", "LINALOOL"),
            ("geraniol", "GERANIOL"),
            ("selinene", "SELINENE")
        ]
        
        for key, label in oil_components:
            # Pattern: LABEL (whitespace) X - Y% OF TOTAL OIL
            pattern = rf'{label}\s+(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*%\s*OF TOTAL OIL'
            m = re.search(pattern, page)
            if m:
                low, high = float(m.group(1)), float(m.group(2))
                oil_breakdown[key] = {"range": [low, high], "avg": round((low + high) / 2, 2)}
            else:
                # Try single value
                pattern = rf'{label}\s+(\d+\.?\d*)\s*%\s*OF TOTAL OIL'
                m = re.search(pattern, page)
                if m:
                    val = float(m.group(1))
                    oil_breakdown[key] = {"range": [val, val], "avg": val}
                else:
                    # Try <X%
                    pattern = rf'{label}\s+<(\d+\.?\d*)\s*%\s*OF TOTAL OIL'
                    m = re.search(pattern, page)
                    if m:
                        val = float(m.group(1))
                        oil_breakdown[key] = {"range": [0, val], "avg": val/2}

        if oil_breakdown:
            hop_data["oilBreakdown"] = oil_breakdown

        # Aroma Profile
        aroma_profile_match = re.search(r'AROMA PROFILE\s+(.*?)\s+(?:COUNTRY|BEER STYLES|BREWING VALUES)', page, re.DOTALL)
        if aroma_profile_match:
            tags = [t.strip().lower().replace(' ', '_') for t in aroma_profile_match.group(1).split('•')]
            hop_data["tags"] = tags

        # Description
        desc_match = re.search(r'BREWING VALUES\s+(.*?)\s+ACID/OIL', page, re.DOTALL)
        if desc_match:
            hop_data["flavorProfile"] = desc_match.group(1).strip().replace('\n', ' ')

        results.append(hop_data)
    
    return results

if __name__ == "__main__":
    import sys
    # Read from file or stdin
    content = sys.stdin.read()
    parsed = parse_hops(content)
    print(json.dumps(parsed, indent=2))
