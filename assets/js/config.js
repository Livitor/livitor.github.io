/**
 * GlazePress 运行时配置
 * 由构建脚本从 blog.config.js 自动生成
 * 请勿手动修改此文件
 */
window.GLASEPRESS_CONFIG = {
  "site": {
    "title": "GlazePress",
    "description": "基于 Vue 3 的现代化静态博客，采用 Glassmorphism 设计",
    "baseUrl": ""
  },
  "features": {
    "darkMode": true,
    "toc": true,
    "search": {
      "provider": "local"
    },
    "comments": {
      "provider": "giscus",
      "repo": ""
    },
    "pwa": false,
    "math": false,
    "mermaid": false,
    "readingTime": true,
    "lightbox": true,
    "share": true,
    "rss": true
  },
  "theme": {
    "primary": "#6366f1",
    "glassOpacity": {
      "light": 0.7,
      "dark": 0.6
    }
  },
  "nav": [
    {
      "label": "首页",
      "url": "/"
    },
    {
      "label": "归档",
      "url": "/archive/"
    },
    {
      "label": "分类",
      "url": "/categories/"
    },
    {
      "label": "标签",
      "url": "/tags/"
    },
    {
      "label": "友链",
      "url": "/friends/"
    },
    {
      "label": "关于",
      "url": "/about/"
    }
  ],
  "author": {
    "name": "GlazePress Author",
    "avatar": "./assets/images/avatar.jpg",
    "bio": "热爱技术，追求极致。专注于前端架构与性能优化。",
    "social": {
      "github": "https://github.com/Livitor",
      "gitee": "https://gitee.com/livitor",
      "bilibili": "https://space.bilibili.com/454802241?spm_id_from=333.1007.0.0",
      "email": "mailto:2162431295@qq.com"
    }
  }
};