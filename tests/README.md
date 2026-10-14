# 对抗性执行测试与边界

运行：`python3 tests/run_regression.py --out dist/regression.json`。

15 个场景使用真实仓库文件作为约束，并结合 Decimal、SQLite 内存数据库、数据变换、SHA256、命令授权模拟。**测试通过不等于 15 次完整 Agent 实际运行**；未执行真实第三方、生产部署、真人签收或 MySQL 版本兼容验证。报表以命令实际生成的 JSON 为准，禁止预先把结果全部写成“通过”。

本夹具仅用于验证 Skill 边界与仓库同步；示例 Issue URL、Owner、构建 SHA 均为模拟，不是客户实际数据。
