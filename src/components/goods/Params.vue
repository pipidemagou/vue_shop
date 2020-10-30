<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区-->
    <el-card class="box-card">
      <!--      警告区域-->
      <el-alert
        :closable="false"
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon>
      </el-alert>
      <!--      选择商品分类区域-->
      <el-row class="category_option">
        <el-col>
          <span>选择商品对象：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            @change="handleChange"
            :props="cateProps"></el-cascader>
        </el-col>
      </el-row>
      <!--      v-model绑定的当前标签页的name-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数
          </el-button>
          <!--          动态参数表格-->
          <el-table :data="manyTableData">
            <!--            展开行-->
            <el-table-column type="expand">
              <!--              参数的可选项-->
              <template slot-scope="scope">
                <el-tag :key=index v-for="(item,index) in scope.row.attr_vals" closable
                        @close="handleClose(index,scope.row)">
                  {{ item }}
                </el-tag>
                <!--                输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性
          </el-button>
          <!--          静态参数表格-->
          <el-table :data="onlyTableData">
            <!--            展开行-->
            <el-table-column type="expand">
              <!--              参数的可选项-->
              <template slot-scope="scope">
                <el-tag :key=index v-for="(item,index) in scope.row.attr_vals" closable
                        @close="handleClose(index,scope.row)">
                  {{ item }}
                </el-tag>
                <!--                输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加参数对话框-->
    <el-dialog
      :title="
                '添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText+':'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改参数对话框-->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText+':'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [],
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单数据规则
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入动态参数',
          trigger: 'blur'
        }]
      },
      // 修改参数对话框的关闭or开启
      editDialogVisible: false,
      // 修改参数表单数据
      editForm: {
        attr_name: '',
        attr_id: ''
      },
      // 修改参数表单验证规则
      editFormRules: {
        attr_name: [{
          required: true,
          message: '请输入动态参数',
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    // 获取所有的商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类失败！',
          center: true
        })
      } else {
        this.cateList = res.data
      }
    },
    // 只能选择三级分类
    handleChange () {
      this.getParamData()
    },
    // tab页签点击事件
    handleClick () {
      this.getParamData()
    },
    async getParamData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error({
          message: '只允许为第三级分类设置相关参数！',
          center: true
        })
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取参数列表失败！',
          center: true
        })
      }
      res.data.forEach(item => {
        // 字符串分割成数组
        item.attr_vals = item.attr_vals ? item.attr_vals = item.attr_vals.split(' ') : []
        // 控制文本框的显示和隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听对话框的关闭
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.addDialogVisible = false
          return this.$message.error({
            message: '参数校验错误！',
            center: true
          })
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: '添加参数失败！',
            center: true
          })
        }
        this.addDialogVisible = false
        await this.getParamData()
        return this.$message.success({
          message: '添加参数成功！',
          center: true
        })
      })
    },
    // 显示修改参数对话框
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取参数失败！',
          center: true
        })
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改参数对话框的关闭
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          this.editDialogVisible = false
          return this.$message.error({
            message: '修改参数校验失败！',
            center: true
          })
        } else {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error({
              message: '修改参数失败！',
              center: true
            })
          }
          await this.getParamData()
          this.editDialogVisible = false
          this.$message.success({
            message: '修改参数成功！',
            center: true
          })
        }
      })
      this.editDialogVisible = false
    },
    // 删除参数
    removeParams (attrId) {
      this.$messagebox.confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '删除失败!'
          })
        }
        await this.getParamData()
        this.$message.success({
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message.info({
          message: '已取消删除'
        })
      })
    },
    // 文本框失去焦点或者回车都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      }
    },
    // 显示输入框
    showInput (row) {
      row.inputVisible = true
      // 输入框自动获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag标签
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    // 添加或者删除参数可选项
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '修改参数项失败！',
          center: true
        })
      } else {
        return this.$message.success({
          message: '修改参数项成功！',
          center: true
        })
      }
    }
  },
  created () {
    this.getCateList()
  },
  // 计算属性
  computed: {
    isBtnDisabled () {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级分类id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 对话框的title显示切换
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.category_option {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
