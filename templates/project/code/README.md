# 现有工程
应由项目实际既有 code/fld/ 前端原型及 code/guiwu_ruoyi/ 若依后端源码提供；这里不分发客户业务源码。


## 单机 Docker 初次部署配置

如需使用单机Docker部署包，先从 `templates/project/code/deploy/single-node-docker/` 获取《初次部署配置.md》作为初始化参考；若当前项目 `code/deploy/single-node-docker/初次部署配置.md` 已存在，则以**现有项目文件**为准，不覆盖。该文件仅为配置模板，不包含可以直接部署的全部Docker Compose/SSH/SQL文件。首次部署先按项目环境逐份预填与确认，再由用户授权执行，不启动尚无jar/dist的业务应用。
