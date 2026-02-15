#!/usr/bin/env python3
"""
Generate ICNS file for macOS from PNG
Simplified version - creates a basic ICNS structure
"""
import struct
import os

def create_icns(png_files, output_file):
    """Create macOS ICNS file from PNG images"""
    # ICNS header
    icns_data = b'icns'
    
    # Icon types and their sizes
    icon_types = {
        16: b'icp4',
        32: b'icp5',
        48: b'icp6',
        128: b'ic07',
        256: b'ic08',
        512: b'ic09',
        1024: b'ic10'
    }
    
    entries = []
    total_size = 8  # Header size
    
    for png_file in png_files:
        with open(png_file, 'rb') as f:
            data = f.read()
            
        # Get size from PNG
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            width = struct.unpack('>I', data[16:20])[0]
            
            # Find closest icon type
            icon_type = icon_types.get(width, b'ic09')  # Default to 512px
            
            # Entry: type (4) + length (4) + data
            entry_size = 8 + len(data)
            entry = icon_type + struct.pack('>I', entry_size) + data
            entries.append(entry)
            total_size += entry_size
    
    # Write ICNS file
    with open(output_file, 'wb') as f:
        f.write(b'icns')
        f.write(struct.pack('>I', total_size))
        for entry in entries:
            f.write(entry)

# Create ICNS from our PNGs
icon_dir = 'src-tauri/icons'
png_files = [
    f'{icon_dir}/32x32.png',
    f'{icon_dir}/128x128.png',
    f'{icon_dir}/128x128@2x.png',
    f'{icon_dir}/icon.png'
]

create_icns(png_files, f'{icon_dir}/icon.icns')
print(f'Created {icon_dir}/icon.icns')
