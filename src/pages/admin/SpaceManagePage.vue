<template>
  <div id="pictureManagePage">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear></a-input>
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select v-model:value="searchParams.spaceLevel" :options="SPACE_LEVEL_OPTIONS" placeholder="请输入空间级别"
          style="min-width: 180px" allow-clear />
      </a-form-item>
      <a-form-item label="用户 id" name="userId">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="text-align: right;">
      <a-button type="primary" href="/add_space" target="_self" style=" text-align: right;"> + 创建空间</a-button>
    </div>
    <div style="margin-bottom: 16px"></div>

    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange">
      <template #bodyCell="{ column, record }">
        <!-- 空间级别 -->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <a-tag>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
        </template>

        <!-- 使用情况 -->
        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="link" :href="`/add_space?id=${record.id}`" target="_self">编辑</a-button>
          </a-space>
          <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { listSpaceByPageUsingPost } from '@/api/spaceController'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { formatSize } from '@/utils'


const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName'
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel'
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo'
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createTime'
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime'
  },
  {
    title: "操作",
    key: 'action'
  }
]

// 数据
let dataList = ref([])
let total = ref(0)

// 搜索条件
let searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共${total}条`
  }
})

// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    console.log('获取到的图片数据是:', res.data.data.records)
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 搜索
const doSearch = async () => {
  searchParams.current = 1
  await fetchData()
}

// 翻页事件
const doTableChange = async (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  await fetchData()
}

onMounted(() => {
  fetchData()
})

// 删除事件
const doDelete = async (id: number) => {

}
</script>
