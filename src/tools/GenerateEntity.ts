import * as fs from 'fs';
import * as path from 'path';
import { toSchema } from '../decorators';

class GenerateEntitys {

  private DefinesPath: string;

  constructor(filePath){
    this.DefinesPath = filePath;
  }

  /**
   *根据目录递归查找目录下面的文件
   * @param dict string 目录
   * @return fileList array[string]
   */
  getFiles = dict => {
    let fileList = [];
    const findPathFunc = (basePath) => {
      const files = fs.readdirSync(basePath);
      files.forEach((file) => {
        const filePath = `${basePath}/${file}`;
        // js 文件
        if (fs.statSync(filePath).isFile()) {
          if (file.endsWith('.ts')) {
            fileList.push(filePath);
          }
        } else {
          findPathFunc(filePath);
        }
      })
    };
    findPathFunc(dict);
    return fileList;
  }

  loadDefinition = (define) => {
    console.log(toSchema(define));
  }

  loadDefinitions = async () => {
    for (const file of this.getFiles(this.DefinesPath)) {
      const define = await import(file);
      if(!define || !define.default){
        return ;
      }
      this.loadDefinition(define.default);
    }
  }
}

new GenerateEntitys(
  path.resolve(__dirname, '../definitions')
).loadDefinitions();