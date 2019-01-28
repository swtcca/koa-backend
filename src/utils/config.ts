import * as path from 'path';

// swagger配置
export const swaggerConfig = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "接口文档系统"
  },
  // host: "localhost:3002",
  basePath: "",
  schemes: ["http"],
  paths: {},
  definitions: {}
}

// 环境区分
export const isDebug = process.env.NODE_ENV === 'development';

// 日志
export const log4jsConfig = {
  appenders: {
    cheese: isDebug ? {
      type: 'console'
    } : {
        type: 'dateFile',
        filename: 'logs/',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
  },
  categories: { default: { appenders: ['cheese'], level: isDebug ? 'info' : 'error' } }
}

// bodyParser相关
export const bodyParserConfig = {
  multipart: true, // 支持文件上传
  // encoding: 'gzip', // 启用这个会报错
  formidable: {
    uploadDir: path.join(__dirname, '../upload/'), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
  }
}