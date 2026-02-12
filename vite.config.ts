import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 特殊处理包含中文或特殊字符的路径
          if (assetInfo.name) {
            // 对于图片资源，尽量保持原始文件名
            if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(assetInfo.name)) {
              return 'assets/[name].[ext]'
            }
            // 其他资源添加hash
            return 'assets/[name].[hash].[ext]'
          }
          return 'assets/[name].[hash][extname]'
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  // 添加资源处理配置
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  resolve: {
    // 配置路径别名处理特殊字符
    alias: {
      // 可以在这里添加特定的路径映射
    }
  }
})