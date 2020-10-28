<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card class="box-card">
      <el-row>
        <!--        分类按钮-->
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--        分类数据列表-->
      <tree-table class="treeTable"
                  :data="categoryList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  :show-index="true"
                  index-text="#"
                  border>
        <!--        是否有效-->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: green"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--        排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!--      操作-->
        <template slot="options">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!--        分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total">
      </el-pagination>
    </el-card>
    <!--    添加分配的对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="100px" :rules="addCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类分类：">
          <!--            options用来指定数据源,change-on-select可以-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            :change-on-select="true"></el-cascader>
        </el-form-item>
        <el-form-item>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      categoryList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isOk'

      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'options'
      }
      ],
      // 添加分类的对话框的显示or隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        // 需要添加的分类的名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },
      // 添加分类规则
      addCateFormRules: {
        cat_name: [{
          required: true,
          message: '请输入分类名称',
          trigger: 'blur'
        }]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类id的数组
      selectedKeys: []
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    // 获取商品分类数据
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类失败！',
          center: true
        })
      }
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 监听pagenum值改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategoryList()
    },
    // 显示添加分类的对话框
    showAddCateDialog () {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        this.addCateDialogVisible = false
        return this.$message.error({
          message: '获取父级分类数据失败！',
          center: true
        })
      }
      this.parentCateList = res.data
    },
    // 级联选择改变触发时间
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加新的分类
    async addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          this.addCateDialogVisible = false
          return this.$message.error({
            message: '分类数据校验错误',
            center: true
          })
        } else {
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            this.addCateDialogVisible = false
            return this.$message.error({
              message: '新增分类出错！',
              center: true
            })
          } else {
            this.addCateDialogVisible = false
            this.getCategoryList()
            return this.$message.success({
              message: '新增分类成功',
              center: true
            })
          }
        }
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
