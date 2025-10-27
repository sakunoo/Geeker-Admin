import { defineStore } from "pinia"
import piniaPersistConfig from "@/stores/helper/persist"
import type { ColumnProps } from "@/components/ProTable/interface"

interface TabColsState {
  tabCols: TabCols[]
}
interface TabCols {
  tabName: string
  cols: ColumnProps[]
}

export const useTableColsStore = defineStore("migo-table-cols", {
  state: (): TabColsState => ({
    tabCols: []
  }),
  actions: {
    /**
     * 初始化表格列配置
     * 从缓存中恢复列的显示状态,如果是首次访问则保存当前状态
     * @param key 表格标识符
     * @param cols 表格列配置数组
     */
    initCols(key: string, cols: ColumnProps[]) {
      console.log("[tabCols] initCols 调用:", { key, colsLength: cols.length })

      if (!key || key === "all") {
        // 'all' 标识不处理
        console.warn('[tabCols] 跳过初始化: key 为空或为 "all"')
        return
      }

      // 查找已保存的表格配置
      const tabCol = this.tabCols.find((item: TabCols) => item.tabName === key)
      console.log("[tabCols] 查找缓存结果:", { found: !!tabCol, currentTabCols: this.tabCols })

      if (tabCol) {
        // 恢复已保存的列显示状态到传入的 cols
        cols.forEach(col => {
          const savedCol = tabCol.cols.find((item: ColumnProps) => item.prop === col.prop)
          if (savedCol) {
            // 恢复保存的显示状态
            col.isShow = savedCol.isShow
          }
          // 如果是新增的列,保持其默认的 isShow 状态
        })

        // 同步更新缓存:添加新列或移除已删除的列
        tabCol.cols = cols.map(col => ({
          prop: col.prop!,
          isShow: col.isShow
        }))

        console.log("[tabCols] 更新现有配置完成")
        return
      }

      // 首次访问,保存初始配置
      const colSettingArr = cols.map((item: ColumnProps) => ({
        prop: item.prop!,
        isShow: item.isShow
      }))

      this.tabCols.push({
        tabName: key,
        cols: colSettingArr
      })

      console.log("[tabCols] 首次初始化完成,当前 state:", this.$state)
    },

    /**
     * 设置单个列的显示状态
     * @param key 表格标识符
     * @param prop 列属性名
     * @param isShow 是否显示
     */
    setCol(key: string, prop: string, isShow: boolean) {
      console.log("[tabCols] setCol 调用:", { key, prop, isShow })

      if (!key || key === "all") {
        // 'all' 标识不处理
        console.warn('[tabCols] 跳过设置: key 为空或为 "all"')
        return
      }

      // 查找对应的表格配置
      const tabCol = this.tabCols.find((item: TabCols) => item.tabName === key)
      if (!tabCol) {
        return
      }

      // 查找或创建列配置
      const col = tabCol.cols.find((item: ColumnProps) => item.prop === prop)
      if (!col) {
        // 新列,添加到配置中
        tabCol.cols.push({
          prop: prop,
          isShow: isShow
        })
        console.log("[tabCols] 添加新列配置")
      } else {
        // 更新现有列的显示状态
        col.isShow = isShow
        console.log("[tabCols] 更新列显示状态")
      }

      console.log("[tabCols] setCol 完成,当前 state:", this.$state)
    }
  },
  persist: piniaPersistConfig("migo-table-cols")
})
