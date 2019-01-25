export const swaggerConfig = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "接口文档系统"
  },
  host: "localhost:3002",
  basePath: "",
  schemes: ["http"],
  paths: {},
  definitions: {}
}

export const isDebug = process.env.NODE_ENV === 'development';

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