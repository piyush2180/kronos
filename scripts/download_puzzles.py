import os
import urllib.request
import zstandard as zstd
import csv
import io
import json

# Target ranges
RANGES = {
    '800_1000': (800, 999),
    '1000_1200': (1000, 1199),
    '1200_1400': (1200, 1399),
    '1400_1600': (1400, 1599),
    '1600_1800': (1600, 1799),
    '1800_plus': (1800, 9999)
}

# Number of puzzles to collect per band
LIMIT_PER_BAND = 800

def download_and_filter():
    url = 'https://database.lichess.org/lichess_db_puzzle.csv.zst'
    print(f"Streaming and decompressing from {url}...")

    # Initialize collections
    collected = {key: [] for key in RANGES.keys()}
    counts = {key: 0 for key in RANGES.keys()}

    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            dctx = zstd.ZstdDecompressor()
            with dctx.stream_reader(response) as reader:
                text_stream = io.TextIOWrapper(reader, encoding='utf-8')
                csv_reader = csv.reader(text_stream)
                
                processed_rows = 0
                for row in csv_reader:
                    if len(row) < 8:
                        continue
                    
                    try:
                        rating = int(row[3])
                    except ValueError:
                        continue # Skip header row or malformed row
                    
                    processed_rows += 1
                    if processed_rows % 50000 == 0:
                        print(f"Processed {processed_rows} rows. Progress: {counts}")
                    
                    # Find correct range
                    target_band = None
                    for band, (low, high) in RANGES.items():
                        if low <= rating <= high:
                            target_band = band
                            break
                    
                    if target_band and len(collected[target_band]) < LIMIT_PER_BAND:
                        puzzle_id = row[0]
                        fen = row[1]
                        moves = row[2].split(' ')
                        themes = row[7].split(' ')
                        opening = row[9] if len(row) > 9 else ''

                        # Determine side to move based on starting FEN active color
                        # Since FEN is before first move, active color is that player's.
                        # The first move is played by opponent.
                        # Therefore, player's side to move is the OPPOSITE of FEN's active color.
                        fen_parts = fen.split(' ')
                        fen_active = fen_parts[1] if len(fen_parts) > 1 else 'w'
                        side_to_move = 'white' if fen_active == 'b' else 'black'

                        puzzle = {
                            'id': puzzle_id,
                            'fen': fen,
                            'solution': moves,
                            'rating': rating,
                            'themes': themes,
                            'opening': opening,
                            'sideToMove': side_to_move
                        }
                        collected[target_band].append(puzzle)
                        counts[target_band] += 1

                    # Stop if all bands are full
                    if all(len(collected[band]) >= LIMIT_PER_BAND for band in RANGES.keys()):
                        print("All rating bands filled successfully!")
                        break

    except Exception as e:
        print(f"Error during download or processing: {e}")

    # Combine all collected puzzles into a single flat array
    all_puzzles = []
    for band, items in collected.items():
        all_puzzles.extend(items)

    print(f"Total puzzles collected: {len(all_puzzles)}")

    # Write to a temporary file
    os.makedirs('scripts', exist_ok=True)
    out_path = 'scripts/puzzles_raw.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_puzzles, f, indent=2)
    print(f"Saved raw puzzles to {out_path}")

if __name__ == '__main__':
    download_and_filter()
