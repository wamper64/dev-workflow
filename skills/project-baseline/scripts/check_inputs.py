#!/usr/bin/env python3
"""只读检查必须的项目输入；可选目录不缺即阻塞。"""
from pathlib import Path
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    args = parser.parse_args()
    root = Path(args.root)
    required = [root / "docs/input/需求资料", root / "code/fld", root / "code/guiwu_ruoyi"]
    missing = [str(p) for p in required if not p.exists()]
    for path in required:
        print(("MISSING" if str(path) in missing else "OK") + " " + str(path))
    if missing:
        print("缺失必要输入，请先完善准备工作：", ", ".join(missing))
        raise SystemExit(1)
    print("必要目录已存在；此检查不代表PRD内容完整或工程已可运行。")

if __name__ == "__main__":
    main()
