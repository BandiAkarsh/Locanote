#!/usr/bin/env python3
"""
Generate ICO file for Windows from PNG
"""
import struct
import os

def create_ico(png_files, output_file):
    """Create Windows ICO file from PNG images"""
    images = []
    
    for png_file in png_files:
        with open(png_file, 'rb') as f:
            data = f.read()
            # Get dimensions from PNG
            if data[:8] == b'\x89PNG\r\n\x1a\n':
                width = data[16:20]
                height = data[20:24]
                w = struct.unpack('>I', width)[0]
                h = struct.unpack('>I', height)[0]
                images.append((w, h, data))
    
    if not images:
        return
    
    # ICO header
    ico_header = struct.pack('<HHH', 0, 1, len(images))  # Reserved, Type (1=icon), Count
    
    # Calculate offsets
    offset = 6 + len(images) * 16  # Header + directory entries
    entries = b''
    data_block = b''
    
    for width, height, img_data in images:
        # Directory entry
        w = width if width < 256 else 0
        h = height if height < 256 else 0
        entry = struct.pack('<BBBBHHII', 
            w, h,  # Width, Height
            0,     # Color palette
            0,     # Reserved
            1,     # Color planes
            32,    # Bits per pixel
            len(img_data),  # Size
            offset  # Offset
        )
        entries += entry
        data_block += img_data
        offset += len(img_data)
    
    # Write ICO file
    with open(output_file, 'wb') as f:
        f.write(ico_header)
        f.write(entries)
        f.write(data_block)

# Create ICO from our PNGs
icon_dir = 'src-tauri/icons'
png_files = [
    f'{icon_dir}/32x32.png',
    f'{icon_dir}/128x128.png',
    f'{icon_dir}/128x128@2x.png',
    f'{icon_dir}/icon.png'
]

create_ico(png_files, f'{icon_dir}/icon.ico')
print(f'Created {icon_dir}/icon.ico')
