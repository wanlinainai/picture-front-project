<template>
  <div id="spaceDetailPage">
    <!--    空间的基本信息-->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} （私有空间）</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_self"
          >+ 创建图片
        </a-button>

        <a-button :icon="h(EditOutlined)" @click="doBatchEdit"
        >批量编辑
        </a-button>

        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
            :size="42"
          ></a-progress>
        </a-tooltip>
      </a-space>
    </a-flex>
    <PictureSearchForm :on-search="onSearch"/>
    <a-form>
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <ColorPicker format="hex" @pureColorChange="onColorChange"/>
    </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px"></div>
    <!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading" show-op :on-reload="fetchData"/>
    <!--    分页-->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    ></a-pagination>
    <BatchEditPictureModal ref="batchEditPictureModalRef" :spaceId="id" :pictureList="dataList" :onSuccess="onBatchEditPictureSuccess"/>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { getSpaceByIdUsingGet } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { listPictureVoByPageUsingPost, searchPictureByColorUsingPost } from '@/api/pictureController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import "vue3-colorpicker/style.css"
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined } from '@ant-design/icons-vue'

interface Props {
  id: string | number
}

const arrow = ref<string>('show')
const mergedArrow = computed(() => {
  switch (arrow.value) {
    case 'show':
      return true
    case 'hide':
      return false
    case 'center':
    default:
      return { pointAtCenter: true }
  }
})

const props = defineProps<Props>()
const space = ref<API.SpaceVO>({})

// -------------- 获取空间详情 -----------------
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败:' + res.data.message)
    }
  } catch (error) {
    message.error('获取空间详情失败:' + error.message)
  }
}

onMounted(() => {
  fetchSpaceDetail()
})

// -------------- 获取图片列表 ---------------
const dataList = ref([])
let total = ref(0)
const loading = ref(true)
// 搜索条件
let searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams.value,
    spaceId: props.id,
  }

  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    console.log('获取到的图片数据是:', res.data.data.records)
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1
  }
  fetchData()
}

// 切换颜色事件
const onColorChange = async (color: string) => {
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id
  })

  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data;
    total.value = data.length;
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchData()
})

// 批量编辑操作
const batchEditPictureModalRef = ref()
// 批量编辑成功之后，刷新数据
const onBatchEditPictureSuccess = () => {
  fetchData()
}
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}
</script>

<style>
#spaceDetailPage {
  margin-bottom: 16px;
}
</style>
