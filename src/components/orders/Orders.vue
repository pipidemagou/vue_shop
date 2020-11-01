<template>
  <div>
    <!--    面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图-->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='0'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.is_send==='是'">已发货</el-tag>
            <el-tag type="danger" v-else>未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time|dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total">
      </el-pagination>
    </el-card>
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed">
      <el-form :model="this.addressForm" :rules="this.addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县：" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="物流信息"
      :visible.sync="progressDialogVisible"
      width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in progressInfo"
          :key="index"
          :timestamp="item.time">
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from '@/components/orders/citydata'

export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      progressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{
          required: true,
          message: '请选择省市区县',
          trigger: 'blur'
        }],
        address2: [{
          required: true,
          message: '请填写详细地址',
          trigger: 'blur'
        }]
      },
      cityData: citydata,
      progressInfo: []
    }
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取订单列表失败！',
          center: true
        })
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 页面改变触发
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 页码改变触发
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 显示修改地址的对话框
    showBox () {
      this.addressVisible = true
    },
    // 监听地址对话框关闭
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流进度对话框
    async showProgressDialog () {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取物流进度失败！',
          center: true
        })
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  },
  created () {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
