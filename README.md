# OpenSpark 记账

手机可用的本地记账工具（PWA）。数据保存在浏览器 `localStorage`，无需登录。

## 功能

- 快速记一笔：支出 / 收入（大数字键盘）
- 记住上次分类；首页可一键复用最近几笔
- 分类、备注、日期
- 按月查看结余、收入、支出，以及分类占比
- 编辑 / 删除流水
- 导出 / 导入 JSON、CSV 备份
- 可安装到手机主屏，支持离线打开

## 手机怎么用

1. 合并本 PR 后，在仓库 **Settings → Pages** 开启 GitHub Pages（Source 选 `main` / root）。
2. 用手机浏览器打开 Pages 地址，例如：
   `https://francischi-ark.github.io/OpenSpark/`
3. 在浏览器菜单里选「添加到主屏幕」，即可像 App 一样使用。

本地预览：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。
