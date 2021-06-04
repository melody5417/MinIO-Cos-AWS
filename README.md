# MinIO-Cos-AWS

# 背景

最近项目在做私有化交付，涉及到了 cos 和 minIO 两种存储方案，这里做下总结。

先介绍下在做项目的大致情况，分为**私有化**和**公有云**两个版本。其中私有化版本存储方案采用 **minIO**，公有云版本存储方案为 **cos**。为了 cover 这两套存储方案，同时避免引入多分支开发，调研了兼容方案——**AWS（Amazon Web Services）**。无论是 minIO 还是 cos 都遵循了 AWS 协议，这样就可以一套代码同时兼容 minIO 和 cos 了。

# 大纲

* 分别介绍 minIO， cos 和 AWS。
* 实现 minIO 和 cos 的 demo
* 基于 AWS 接入 minIO 和 cos 的 demo。
* 基于安全和前后端分离考虑，实现多个文件上传的 demo。

