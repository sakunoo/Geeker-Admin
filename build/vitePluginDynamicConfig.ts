import type { Plugin, HtmlTagDescriptor, ResolvedConfig } from "vite"
import path from "path"
import { writeFileSync } from "fs"
interface IVITE_ENV {
  [propName: string]: any
}
interface IOptions {
  src: string
  scriptName: string
  injectName: string
  mergeEnv?: (srouceEnv: ResolvedConfig, targetEnv: IVITE_ENV) => Promise<IVITE_ENV> | undefined
}
const defaultOptions: IOptions = {
  src: "src",
  scriptName: "config.js",
  injectName: "__APP_CONFIG__"
}
export default function (options: IOptions = defaultOptions): Plugin {
  const VITE_ENV: IVITE_ENV = {}
  const config = {} as ResolvedConfig
  return {
    name: "vite-plus-fork-env",
    apply: "build",
    async configResolved(resolvedConfig: ResolvedConfig) {
      Object.assign(config, resolvedConfig)
      const envPrefix = Array.isArray(resolvedConfig.envPrefix) ? resolvedConfig.envPrefix : [resolvedConfig.envPrefix || "VITE_"]

      for (const [name, value] of Object.entries(resolvedConfig?.env)) {
        if (envPrefix.some(prefix => name.startsWith(prefix))) {
          VITE_ENV[name] = value
        }
      }

      if (options.mergeEnv) {
        const targetEnv = await options.mergeEnv(resolvedConfig, VITE_ENV)
        Object.assign(VITE_ENV, targetEnv)
      }
    },

    transform(code, filePath) {
      filePath = path.normalize(filePath)
      const srcDir = path.resolve(config.root, options.src).replace(/\\/g, "\\\\")
      const reg = new RegExp(`${srcDir}[/\\\\].*\\.([jt]sx?$)|(vue$)`, "ig")

      if (reg.test(filePath)) {
        for (const [name] of Object.entries(VITE_ENV)) {
          code = code.replace(new RegExp(`import.meta.env.${name}`, "g"), `${options.injectName}.${name}`)
        }
      }
      return code
    },
    transformIndexHtml(): HtmlTagDescriptor[] {
      // 5分钟更新一次缓存
      const cacheKey = Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60 * 1000)
      const content = `window.${options.injectName} = ${JSON.stringify(VITE_ENV, null, "    ")}`
      const outDir = path.resolve(config.build.outDir)
      const filePath = path.resolve(outDir, options.scriptName)
      writeFileSync(filePath, content, "utf-8")

      return [
        {
          tag: "script",
          attrs: {
            src: `${options.scriptName}?v=${cacheKey}`,
            crossorigin: "",
            type: "module"
          },
          injectTo: "head-prepend"
        }
      ]
    }
  }
}
