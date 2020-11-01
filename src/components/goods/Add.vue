<template>
  <div>
    <!--    面包屑-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card>
      <!--      提示区域-->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false">
      </el-alert>
      <!--      步骤条-->
      <el-steps :active="parseInt(activeIndex)" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model=addForm :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品所属分类">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item,index) in this.manyTableData" :key="index">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item1" v-for="(item1,index1) in item.attr_vals" :key="index1" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item,index) in onlyTableData" :key="index">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的验证规则
      addFormRules: {
        goods_name: [{
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        }],
        goods_price: [{
          required: true,
          message: '请输入商品价格',
          trigger: 'blur'
        }],
        goods_weight: [{
          required: true,
          message: '请输入商品重量',
          trigger: 'blur'
        }],
        goods_number: [{
          required: true,
          message: '请输入商品数量',
          trigger: 'blur'
        }],
        goods_cat: [{
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }]
      },
      // 分类列表
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: true
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  methods: {
    // 获取全部分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类失败！',
          center: true
        })
      }
      this.cateList = res.data
    },
    // 级联选择器改变触发
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换标签之前的钩子
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error({
          message: '请选择商品分类',
          center: true
        })
        return false
      }
    },
    // 标签页被切换触发
    async tabClicked () {
      // 如果访问的是商品参数标签页
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '获取动态参数列表失败！',
            center: true
          })
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '获取静态属性列表失败！',
            center: true
          })
        }
        this.onlyTableData = res.data
      }
    },
    // 图片预览事件
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 删除图片事件
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(item => {
        // eslint-disable-next-line no-unused-expressions
        item.pic === filePath
      })
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功触发
    handleSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        // 表单预校验
        if (!valid) {
          return this.$message.error({
            message: '请填写必要的表单项',
            center: true
          })
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: '添加商品失败！',
            center: true
          })
        }
        this.$message.success({
          message: '添加商品成功！',
          center: true
        })
        await this.$router.push('/goods')
      })
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 计算要显示商品参数的商品id
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 5px;
}
</style>
