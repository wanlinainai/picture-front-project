<template>
  <a-modal v-model:visible="visible" title="批量编辑图片" :footer="false" @cancel="closeModal">
   <a-typography-paragraph type="secondary">只对当前页面的图片生效</a-typography-paragraph>
    <!--表单项-->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="formData.category"
          style="min-width: 180px"
          :options="categoryOptions"
          placeholder="请输入分类"
          allow-clear
        >
        </a-auto-complete>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="formData.tags"
          style="min-width: 180px"
          :options="tagOptions"
          mode="tags"
          placeholder="请输入标签"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item label="命名规则" name="nameRule">
        <a-input v-model:value="formData.nameRule" placeholder="请输入命名规则，输入{序号}可动态生成"/>
      </a-form-item>
      <a-form-item>
        <a-row justify="center">
          <a-col span="24" style="text-align: center;">
            <a-button type="primary" html-type="submit">提交</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { editPictureByBatchUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

const formData = reactive({
  category: '',
  tags: [],
  nameRule: ''
})
// 定义是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}
// 关闭弹窗
const closeModal = () => {
  visible.value = false
}
/**
 * 定义组件属性类型
 */
interface Props {
  pictureList: API.PictureVO[],
  spaceId: number,
  onSuccess: () => void
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
})

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接收的格式
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

// 暴露函数给父组件
defineExpose({
  openModal
})

onMounted(() => {
  getTagCategoryOptions()
})

// 提交表单时处理
const handleSubmit = async (values: any) => {
  if (!props.pictureList) {
    return
  }
  const res = await editPictureByBatchUsingPost({
    pictureIdList: props.pictureList.map((picture) => picture.id),
    spaceId: props.spaceId,
    ...values
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    closeModal()
    props.onSuccess()
  } else {
    message.error('操作失败:' + res.data.message)
  }
}
</script>

<style>

</style>
