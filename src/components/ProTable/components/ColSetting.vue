<template>
  <!-- 列设置 -->
  <el-drawer v-model="drawerVisible" title="列设置" size="450px">
    <div class="table-main">
      <el-table :data="colSetting" :border="true" row-key="prop" default-expand-all :tree-props="{ children: '_children' }">
        <el-table-column prop="label" align="center" label="列名" />
        <el-table-column v-slot="scope" prop="isShow" align="center" label="显示">
          <el-switch v-model="scope.row.isShow" @change="switchCol(scope.row)"></el-switch>
        </el-table-column>
        <el-table-column v-slot="scope" prop="sortable" align="center" label="排序">
          <el-switch v-model="scope.row.sortable"></el-switch>
        </el-table-column>
        <template #empty>
          <div class="table-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无可配置列</div>
          </div>
        </template>
      </el-table>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="ColSetting">
import { ref } from "vue"
import { ColumnProps } from "@/components/ProTable/interface"
import { useTableColsStore } from "@/stores/modules/tabCols"

defineProps<{ colSetting: ColumnProps[] }>()

const drawerVisible = ref<boolean>(false)
const colKey = ref<string>("all")

const openColSetting = (title: string) => {
  drawerVisible.value = true
  colKey.value = title
}
const colsStore = useTableColsStore()
//prop，isShow
const switchCol = (val: any) => {
  colsStore.setCol(colKey.value, val.prop, val.isShow)
}
defineExpose({
  openColSetting
})
</script>

<style scoped lang="scss">
.cursor-move {
  cursor: move;
}
</style>
