#!/usr/bin/env python3
"""生成 tabBar 图标 — 简洁线条风格 81x81 PNG"""
import subprocess, sys
try:
    from PIL import Image, ImageDraw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
    from PIL import Image, ImageDraw

import os

OUT = "/Users/liuzeming/Documents/rebel tennis mini workbuddy/miniprogram/images/icons"
os.makedirs(OUT, exist_ok=True)
SIZE = 81
GRAY = (153, 153, 153, 255)
GREEN = (45, 90, 39, 255)

def mbti(color, path):
    img = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.ellipse([14, 10, 67, 63], outline=color, width=4)
    d.ellipse([30, 22, 51, 43], fill=color)
    d.rectangle([36, 47, 45, 57], fill=color)
    img.save(path)

def ranking(color, path):
    img = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.ellipse([18, 8, 63, 38], outline=color, width=4)
    d.arc([10, 12, 28, 30], 90, 270, fill=color, width=4)
    d.arc([53, 12, 71, 30], 270, 90, fill=color, width=4)
    d.rectangle([33, 30, 48, 52], fill=color)
    d.rectangle([26, 52, 55, 60], fill=color)
    d.rectangle([35, 60, 46, 70], fill=color)
    img.save(path)

def profile(color, path):
    img = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    d = ImageDraw.Draw(img)
    d.ellipse([27, 8, 54, 35], fill=color)
    d.pieslice([14, 35, 67, 80], 180, 360, fill=color)
    img.save(path)

for name, fn in [("mbti", mbti), ("ranking", ranking), ("profile", profile)]:
    fn(GRAY, f"{OUT}/{name}.png")
    fn(GREEN, f"{OUT}/{name}-active.png")

print("Icons generated successfully")
