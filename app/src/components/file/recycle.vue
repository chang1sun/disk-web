<template>
  <el-container class="recycle-container">
    <el-button-group class="btn-group-up">
      <el-button type="primary" icon="el-icon-upload" @click="recoverInBatch()"> 还原</el-button>
      <el-button type="danger" icon="el-icon-document-delete" @click="deleteDocInBatch()"
        >彻底删除</el-button
      >
    </el-button-group>
    <span class="info-tip">Tips: 回收站中的文件仍占据空间，若想释放空间，请将其彻底删除～</span>
    <div class="recycle-table">
    <el-table
      :key="recycleTableKey"
      class="table-data"
      ref="multipleTable"
      :data="recycleList.slice((curPage-1)*pageSize,curPage*pageSize)"
      tooltip-effect="dark"
      style="width: 1200px"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'deleteAt', order: 'descending' }"
      v-loading="recycleLoading"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column
        prop="isDir"
        label="类型"
        width="70"
        :filters="[
          { text: '文件', value: 2 },
          { text: '文件夹', value: 1 },
        ]"
        :filter-method="filterHandler"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <span style="font-size: 16px">
            <i
              v-if="scope.row.isDir === 1"
              class="el-icon-folder-opened el-icon--right"
            ></i>
            <i v-else class="el-icon-document el-icon--right"></i>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="docName" label="文件名" width="500" sortable>
        <template slot-scope="scope">
          <span style="font-size: 14px">{{ scope.row.docName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="deleteAt"
        label="删除时间"
        show-overflow-tooltip
        width="180"
        sortable
      >
        <template slot-scope="scope">{{ scope.row.deleteAt }}</template>
      </el-table-column>
      <el-table-column
        prop="expireAt"
        label="过期时间"
        show-overflow-tooltip
        width="180"
        sortable
      >
        <template slot-scope="scope">{{ scope.row.expireAt }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="140">
        <template slot-scope="scope">
          <div class="op-group">
            <el-button
              type="text"
              size="small"
              @click="recover(scope.row.docId)"
            >
              还原
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="deleteDoc(scope.row.docId)"
            >
              彻底删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
          class="table-pagination"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="curPage"
          :page-sizes="[3, 5, 8]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="recycleList.length">
        </el-pagination>
    </div>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      userId: '',
      curPage: 1,
      pageSize: 8,
      recycleList: [],
      recycleLoading: false,
      recycleTableKey: null,
      multipleSelection: [],
    };
  },

  methods: {
    async getRecycleList() {
      const params = {
        offset: 0,
        limit: 0,
      };
      await this.$http
        .get(this.userId + "/files/recycle-bin", { params: params })
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else {
            this.recycleLoading = false;
            this.recycleTableKey = Math.random();
            this.recycleList = res.data.list;
          }
        });
    },
    filterHandler(value, row) {
      return row.isDir === value;
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    // 初始页currentPage、初始每页数据数pagesize和数据data
    handleSizeChange(size) {
        this.pageSize = size
        console.log(this.pageSize)  //每页下拉显示数据
      },
    handleCurrentChange(curPage) {
        this.curPage = curPage
        console.log(this.curPage)  //点击第几页
      },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    recover(docId) {
      this.$confirm("将该文件或文件夹复原吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          const postdata = {
            userId: this.userId,
            ids: [docId],
          };
          this.$http.post("files/recover", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error(
                  "原路径下有重复命名文件或文件夹，还原失败！"
                );
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "修改数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getRecycleList();
              return this.$message.success("已成功还原所选项!");
            }
          });
        })
        .catch(() => {});
    },
    recoverInBatch() {
      this.$confirm("将选中文件或文件夹复原吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const postdata = {
            userId: this.userId,
            ids: ids,
          };
          this.$http.post("files/recover", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error(
                  "原路径下有重复命名文件或文件夹，还原失败！"
                );
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "修改数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getRecycleList();
              return this.$message.success("已成功还原所选项!");
            }
          });
        })
        .catch(() => {});
    },
    deleteDoc(docId) {
      this.$confirm("将该文件或文件夹彻底删除吗？请注意该操作为不可逆！", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const postdata = {
            userId: this.userId,
            ids: [docId],
          };
          this.$http.post("files/delete", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "删除数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getRecycleList();
              return this.$message.success("已成功彻底删除所选项!");
            }
          });
        })
        .catch(() => {});
    },
    deleteDocInBatch() {
        this.$confirm("将选中文件或文件夹彻底删除吗？请注意该操作为不可逆！", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const postdata = {
            userId: this.userId,
            ids: ids,
          };
          this.$http.post("files/delete", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "删除数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getRecycleList();
              return this.$message.success("已成功彻底删除所选项!");
            }
          });
        })
        .catch(() => {});
    },
  },
  created() {
    this.userId = window.localStorage.getItem("userId");
    this.getRecycleList();
  },
};
</script>

<style scoped>
.btn-group-up {
  position: fixed;
  left: 210px;
  top: 90px;
}
.recycle-table {
  position: fixed;
  left: 210px;
  top: 150px;
}
.info-tip {
  position: fixed;
  right: 100px;
  top: 100px;
  font-size: 14px;
  color: gray;
}
</style>