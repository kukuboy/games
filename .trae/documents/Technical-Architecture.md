# 游戏集合平台 - 技术架构文档

## 1. 架构设计

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      客户端浏览器                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js 应用层                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │  页面组件  │ │ 游戏组件  │ │  UI组件   │           │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘           │   │
│  │       │            │            │                │   │
│  │  ┌────┴────────────┴────────────┴────┐          │   │
│  │  │           Context 状态管理层          │          │   │
│  │  │  ┌─────────┐  ┌─────────┐         │          │   │
│  │  │  │用户Context│  │游戏Context│         │          │   │
│  │  │  └────┬────┘  └────┬────┘         │          │   │
│  │  └───────┼────────────┼──────────────┘          │   │
│  │          │            │                           │   │
│  │  ┌───────┴────────────┴───────┐                  │   │
│  │  │       localStorage          │                  │   │
│  │  │  • 用户认证信息              │                  │   │
│  │  │  • 游戏分数记录              │                  │   │
│  │  │  • 排行榜数据                │                  │   │
│  │  └─────────────────────────────┘                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术栈概览

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | Next.js 14 (App Router) | SSR/CSR混合，支持静态生成 |
| UI库 | Tailwind CSS | 原子化CSS，快速响应式开发 |
| 动画 | Framer Motion | React动画库，流畅过渡效果 |
| 图标 | Lucide React | 现代化图标库 |
| 状态管理 | React Context + Hooks | 轻量级，无需额外依赖 |
| 数据存储 | localStorage | 客户端本地存储 |
| 语言 | TypeScript | 类型安全，提高代码质量 |

## 2. 技术选型详细说明

### 2.1 前端框架

**Next.js 14 + App Router**
- 使用App Router实现文件系统路由
- 支持SSR提升首屏加载性能
- API Routes处理简单后端逻辑（如有需要）
- 良好的SEO支持

### 2.2 样式方案

**Tailwind CSS**
- 原子化CSS，快速构建响应式布局
- 支持深色模式
- 按需生成CSS，体积小
- 便于维护和扩展

### 2.3 状态管理

**React Context API**
- `AuthContext`: 用户认证状态
- `GameContext`: 游戏状态和分数
- `LeaderboardContext`: 排行榜数据

### 2.4 数据持久化

**localStorage**
- 无需后端服务器
- 数据存储在用户浏览器
- 支持JSON序列化
- 容量限制约5MB

## 3. 路由定义

### 3.1 页面路由

| 路由路径 | 页面名称 | 功能描述 |
|----------|----------|----------|
| `/` | 首页 | 游戏展示、快速入口、排行榜预览 |
| `/game/tetris` | 俄罗斯方块 | 俄罗斯方块游戏页面 |
| `/game/snake` | 贪吃蛇 | 贪吃蛇游戏页面 |
| `/game/breakout` | 打砖块 | 打砖块游戏页面 |
| `/game/memory` | 记忆翻牌 | 记忆翻牌游戏页面 |
| `/leaderboard` | 排行榜 | 各游戏Top 10排名 |
| `/profile` | 个人中心 | 用户信息、历史记录 |
| `/login` | 登录 | 用户登录表单 |
| `/register` | 注册 | 用户注册表单 |

### 3.2 布局路由

```
app/
├── layout.tsx          # 根布局（导航栏、Footer）
├── page.tsx            # 首页
├── game/
│   ├── tetris/
│   │   └── page.tsx
│   ├── snake/
│   │   └── page.tsx
│   ├── breakout/
│   │   └── page.tsx
│   └── memory/
│       └── page.tsx
├── leaderboard/
│   └── page.tsx
├── profile/
│   └── page.tsx
├── login/
│   └── page.tsx
└── register/
    └── page.tsx
```

## 4. 数据模型定义

### 4.1 用户数据模型

```typescript
interface User {
  id: string;           // 唯一标识符
  email: string;        // 邮箱地址
  nickname: string;     // 昵称
  password: string;     // 密码（加密存储）
  createdAt: number;    // 注册时间戳
}

// localStorage key: 'gamecenter_user'
```

### 4.2 游戏分数模型

```typescript
interface GameScore {
  id: string;                    // 记录唯一ID
  userId: string;                // 用户ID（游客为'anonymous'）
  gameId: GameType;              // 游戏类型
  score: number;                // 本次得分
  timestamp: number;             // 记录时间戳
  duration?: number;             // 游戏时长（可选）
}

// 游戏类型枚举
type GameType = 'tetris' | 'snake' | 'breakout' | 'memory';

// localStorage key: 'gamecenter_scores'
```

### 4.3 排行榜模型

```typescript
interface LeaderboardEntry {
  rank: number;                  // 排名
  nickname: string;              // 玩家昵称
  score: number;                 // 分数
  timestamp: number;             // 更新时间
}

interface Leaderboard {
  gameId: GameType;              // 游戏类型
  entries: LeaderboardEntry[];   // 排行榜条目（最多100条）
  lastUpdated: number;           // 最后更新时间
}

// localStorage key: 'gamecenter_leaderboard_{gameId}'
```

### 4.4 认证令牌模型

```typescript
interface AuthToken {
  userId: string;                // 用户ID
  email: string;                 // 用户邮箱
  nickname: string;              // 昵称
  expiresAt: number;             // 过期时间
}

// localStorage key: 'gamecenter_token'
```

## 5. 核心功能实现

### 5.1 认证系统实现

**注册流程**:
1. 用户填写邮箱、密码、昵称
2. 验证邮箱格式和密码强度
3. 检查邮箱是否已注册
4. 生成用户ID，密码加密存储
5. 创建AuthToken，自动登录

**登录流程**:
1. 用户输入邮箱、密码
2. 验证凭证
3. 生成AuthToken存储到localStorage
4. 更新全局认证状态

**状态管理**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;
}
```

### 5.2 游戏系统实现

**游戏组件结构**:
```
GameCanvas/
├── GameHeader          # 游戏标题、分数、时间
├── Canvas             # 游戏画布（HTML5 Canvas）
├── GameControls        # 开始/暂停/重新开始
├── MobileControls      # 移动端触控按钮
└── GameOverModal       # 游戏结束弹窗
```

**游戏引擎**:
- 使用requestAnimationFrame实现游戏循环
- Canvas 2D API绑制游戏画面
- 碰撞检测使用AABB算法
- 状态机管理游戏状态

### 5.3 分数系统实现

**分数保存逻辑**:
```typescript
const saveScore = (gameId: GameType, score: number) => {
  const isLoggedIn = checkAuth();
  const scoreRecord: GameScore = {
    id: generateId(),
    userId: isLoggedIn ? currentUser.id : 'anonymous',
    gameId,
    score,
    timestamp: Date.now()
  };
  
  // 保存到localStorage
  const scores = getScores();
  scores.push(scoreRecord);
  localStorage.setItem('gamecenter_scores', JSON.stringify(scores));
  
  // 如果登录，更新排行榜
  if (isLoggedIn) {
    updateLeaderboard(gameId, score);
  }
};
```

**排行榜生成逻辑**:
```typescript
const generateLeaderboard = (gameId: GameType): Leaderboard => {
  const scores = getScores()
    .filter(s => s.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  
  return {
    gameId,
    entries: scores.map((s, i) => ({
      rank: i + 1,
      nickname: s.userId === 'anonymous' ? '游客' : getUser(s.userId).nickname,
      score: s.score,
      timestamp: s.timestamp
    })),
    lastUpdated: Date.now()
  };
};
```

## 6. 组件库结构

### 6.1 布局组件

| 组件 | 路径 | 说明 |
|------|------|------|
| Navbar | components/layout/Navbar.tsx | 顶部导航栏 |
| Footer | components/layout/Footer.tsx | 底部版权信息 |
| Container | components/layout/Container.tsx | 内容容器 |

### 6.2 UI组件

| 组件 | 路径 | 说明 |
|------|------|------|
| Button | components/ui/Button.tsx | 霓虹风格按钮 |
| Card | components/ui/Card.tsx | 游戏卡片 |
| Input | components/ui/Input.tsx | 表单输入框 |
| Modal | components/ui/Modal.tsx | 模态弹窗 |
| Tab | components/ui/Tab.tsx | 标签页切换 |

### 6.3 游戏组件

| 组件 | 路径 | 说明 |
|------|------|------|
| GameWrapper | components/games/GameWrapper.tsx | 游戏页面包装器 |
| ScoreDisplay | components/games/ScoreDisplay.tsx | 分数显示组件 |
| GameControls | components/games/GameControls.tsx | 游戏控制按钮 |
| MobileJoystick | components/games/MobileJoystick.tsx | 移动端虚拟摇杆 |

## 7. 性能优化策略

### 7.1 首屏加载优化
- 使用Next.js静态生成首页
- 路由懒加载游戏页面
- 图片资源优化

### 7.2 游戏性能优化
- Canvas离屏缓冲
- 对象池复用
- requestAnimationFrame节流
- 移动端降低渲染分辨率

### 7.3 存储优化
- 定期清理过期数据
- 排行榜只保留Top 100
- 历史记录保留最近50条

## 8. 目录结构

```
game-center/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── globals.css         # 全局样式
│   ├── game/
│   │   ├── tetris/page.tsx
│   │   ├── snake/page.tsx
│   │   ├── breakout/page.tsx
│   │   └── memory/page.tsx
│   ├── leaderboard/page.tsx
│   ├── profile/page.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── components/              # React组件
│   ├── layout/
│   ├── ui/
│   ├── games/
│   └── auth/
├── contexts/               # React Context
│   ├── AuthContext.tsx
│   ├── GameContext.tsx
│   └── LeaderboardContext.tsx
├── hooks/                  # 自定义Hooks
│   ├── useAuth.ts
│   ├── useGame.ts
│   └── useLocalStorage.ts
├── lib/                    # 工具函数
│   ├── storage.ts
│   ├── auth.ts
│   └── utils.ts
├── types/                  # TypeScript类型
│   └── index.ts
├── public/                # 静态资源
│   └── games/
└── package.json
```

## 9. 开发规范

### 9.1 代码规范
- 使用TypeScript strict模式
- 组件使用函数式组件
- 样式优先使用Tailwind CSS
- 游戏逻辑与UI分离

### 9.2 命名规范
- 组件: PascalCase (GameCard.tsx)
- 函数: camelCase (saveScore)
- 常量: UPPER_SNAKE_CASE (GAME_CONFIG)
- 类型: PascalCase (GameScore)

### 9.3 Git提交规范
- feat: 新功能
- fix: 修复bug
- style: 样式调整
- refactor: 重构
- docs: 文档更新
