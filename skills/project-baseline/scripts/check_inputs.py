#!/usr/bin/env python3
"""项目资料路径预检：仅确认文件存在，绝不代表已经读取或获批。"""
from pathlib import Path
import argparse

def main():
    parser = argparse.ArgumentParser(description="仅路径预检，不能作为 S03 放行证据")
    parser.add_argument("--root", default=".")
    parser.add_argument("--input-dir", default=None, help="相对项目根目录；默认自动尝试 docs/input 和 doc/input")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    candidates = [root / args.input_dir] if args.input_dir else [root / "docs/input", root / "doc/input"]
    input_dir = next((d for d in candidates if d.is_dir()), candidates[0])
    required = [input_dir / "需求资料", root / "code"]
    failed = False
    print(f"PATH_ONLY_INPUT_DIR {input_dir}")
    for f in required:
        ok = f.is_dir() and any(x.is_file() for x in f.rglob("*"))
        print(("PRESENT_WITH_FILES" if ok else "MISSING_OR_EMPTY"), f)
        failed |= not ok
    for name in ("工程资料", "环境资料", "对接资料"):
        p = input_dir / name
        print(("OPTIONAL" if p.is_dir() else "OPTIONAL_MISSING"), p)
    print("声明：仅路径/非空预检，不读取PRD或核验审批状态；必须继续人工/AI确认输入真实内容和 approved 状态。")
    if failed: raise SystemExit(1)

if __name__ == "__main__":
    main()