#!/usr/bin/env python3
"""只读检查通用项目输入，不依赖报价案例的固定子目录名。"""
from pathlib import Path
import argparse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    args = parser.parse_args()
    root = Path(args.root)
    required = [root / "docs/input/需求资料", root / "code"]
    optional = [
        root / "docs/input/工程资料",
        root / "docs/input/环境资料",
        root / "docs/input/对接资料",
    ]
    missing = []
    for path in required:
        ok = path.is_dir()
        print(("OK" if ok else "MISSING") + " " + str(path))
        if not ok:
            missing.append(str(path))
    for path in optional:
        print(("OPTIONAL" if path.is_dir() else "OPTIONAL-MISSING") + " " + str(path))
    if missing:
        print("缺失必要输入目录：", ", ".join(missing))
        raise SystemExit(1)
    print("输入目录存在；仍需读取真实文件并确认PRD、原型、代码及工程约束，不能仅凭目录视为已准备完成。")


if __name__ == "__main__":
    main()
