# City Tracker（城市足迹记录器）

用一张中国地图，记录并可视化你去过的城市；数据默认保存在浏览器本地（`localStorage`），无需后端。

### 功能

- **地图可视化**：市级区划展示（ECharts 中国地图）
- **访问目的**：不同目的使用不同颜色（如：出差/旅行/徒步）
- **访问次数**：颜色深浅表示次数，次数越多颜色越深
- **增删改查**：添加城市访问记录、查看列表、编辑/删除
- **数据本地化**：默认仅保存在本机浏览器（可导入/导出由你扩展）

### 截图

- **TODO**：你可以把运行截图放到 `docs/`，再在这里引用（适合公开仓库展示）。

### 快速开始

> 需要 Node.js（建议 18+）。

#### 方式一：脚本启动（macOS / Linux）

```bash
./快速启动.sh
```

#### 方式二：手动启动

```bash
npm install
npm run dev
```

然后打开终端输出的本地地址（通常是 `http://localhost:5173`）。

### 构建与预览（生产模式）

```bash
npm run build
npm run preview
```

### 使用提示

- **城市名称要匹配地图**：例如 `北京市` 而不是 `北京`（需要与地图数据中的行政区名称一致）。
- **地图数据来源**：地图 geoJSON 可能需要从公网拉取；如果你所在网络无法访问相关域名，地图可能加载失败（详见 `启动指南.md`）。

### 数据与隐私

- **默认存储位置**：浏览器 `localStorage`（仅当前浏览器/当前设备）
- **不会自动上传**：本项目不包含后端与账号系统，不会把数据发到服务器
- **清理方式**：清除站点数据/浏览器缓存会导致数据丢失（如需备份建议自行实现导出）

### 项目结构

```text
src/
  components/        UI 组件（表单、列表、地图等）
  utils/             工具函数（颜色、映射、本地存储）
  types.ts           类型定义
  App.tsx            页面编排
  main.tsx           入口
```

### 开源与许可

- **License**：MIT（见 `LICENSE`）
- **贡献**：欢迎提 Issue / PR（见 `CONTRIBUTING.md`）

---

## English (Brief)

City Tracker is a small React + TypeScript + Vite app to record and visualize visited cities in China on an ECharts map. Data is stored locally in the browser by default (`localStorage`).

