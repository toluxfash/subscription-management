# 订阅管理系统文档结构

## 🏗 项目架构概览

### 技术栈
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**: Node.js + Express 5 + SQLite + better-sqlite3
- **状态管理**: Zustand
- **UI组件**: Radix UI + Lucide React
- **图表**: Recharts
- **部署**: Docker + Docker Compose

### 项目结构
```
subscription-management/
├── src/                    # 前端源码
│   ├── components/         # React组件
│   │   ├── ui/            # 基础UI组件
│   │   ├── charts/        # 图表组件
│   │   ├── dashboard/     # 仪表板组件
│   │   ├── subscription/  # 订阅管理组件
│   │   ├── layouts/       # 布局组件
│   │   └── imports/       # 导入功能组件
│   ├── pages/             # 页面组件
│   ├── store/             # Zustand状态管理
│   ├── services/          # API服务
│   ├── utils/             # 工具函数
│   ├── hooks/             # 自定义Hooks
│   ├── lib/               # 核心库函数
│   ├── config/            # 配置文件
│   └── types/             # TypeScript类型定义
├── server/                # 后端源码
│   ├── db/                # 数据库相关
│   ├── controllers/       # 控制器
│   ├── services/          # 业务服务
│   ├── routes/            # 路由定义
│   ├── middleware/        # 中间件
│   ├── utils/             # 工具函数
│   ├── config/            # 配置文件
│   └── scripts/           # 脚本文件
├── docs/                  # 核心文档
```
