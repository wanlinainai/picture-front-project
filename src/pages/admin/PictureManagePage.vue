<template>
  <div id="pictureManagePage">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="searchParams.searchText" placeholder="从名称或者简介搜索" allow-clear></a-input>
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input v-model:value="searchParams.category" placeholder="请输入标签" allow-clear></a-input>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select v-model:value="searchParams.tags" mode="tags" placeholder="请输入标签" style="min-width: 180px"
          allow-clear></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>

      <a-form-item label="审核状态" name="reviewStatus">
        <a-select v-model:value="searchParams.reviewStatus" :options="PIC_REVIEW_STATUS_OPTIONS" placeholder="请输入审核状态"
          style="min-width: 180px;" allow-clear></a-select>
      </a-form-item>

      <a-form-item style="display: flex; align-items: center; margin-left: 8px;">
        <a-button type="primary" href="/add_picture" target="_blank"> + 创建图片</a-button>
      </a-form-item>
    </a-form>

    <div style="margin-bottom: 16px"></div>

    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核信息：{{ record.reviewMessage }}</div>
          <div>审核人：{{ record.reviewerId }}</div>
        </template>

        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120" />
        </template>

        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in record.tags || JSON.parse('[]')" :key="tag">
              {{ tag }}
            </a-tag>
          </a-space>
        </template>

        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>

        <template v-if="column.dataIndex === 'userId'">
          {{ record.user.id }}
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS" type="link"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)">通过</a-button>
          </a-space>

          <a-space wrap>
            <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT" type="link"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)">拒绝</a-button>
          </a-space>

          <a-button type="link" :href="`/add_picture?id=${record.id}`" @click="doDelete(record.id)"
            target="_blank">编辑</a-button>
          <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_MAP } from '@/constants/picture'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 表格数据
let dataList = ref([])
let total = ref(0)

// 搜索条件
let searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
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

// 删除图片
const doDelete = async (id: number) => {
  // todo: 增加删除前的确认弹框
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    await fetchData()
  } else {
    message.error('删除失败')
  }
}

// 搜索
const doSearch = async () => {
  searchParams.current = 1
  await fetchData()
}

const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 翻页事件
const doTableChange = async (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  await fetchData()
}

onMounted(() => {
  fetchData()
})

/**
 * 审核函数
 * @param record
 * @param reviewStatus
 */
const handleReview = async (record: API.PictureVO, reviewStatus: number) => {
  const reviewMessage = reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '通过' : '拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewMessage,
    reviewStatus
  })

  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取数据列表
    fetchData()
  } else {
    message.error('审核操作失败,' + res.data.message)
  }
}
</script>
