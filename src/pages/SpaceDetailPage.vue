<template>
  <div id="spaceDetailPage">
    <!--    空间的基本信息-->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} （私有空间）</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_self"
          >+ 创建图片
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
    <PictureSearchForm/>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getSpaceByIdUsingGet } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'

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
let searchParams = reactive<API.PictureQueryRequest>({
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
    ...searchParams,
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
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style>
#spaceDetailPage {
  margin-bottom: 16px;
}
</style>
