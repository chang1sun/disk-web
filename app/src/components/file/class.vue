<template>
  <el-container class="class-container">
    <el-button-group class="btn-group">
      <el-button type="primary" icon="el-icon-upload" @click="uploadDialogVisible = true"
        >上传</el-button>
      <el-button
        type="primary"
        icon="el-icon-folder-add"
        @click="mkdir()"
        >新建</el-button
      >
      <el-button type="primary" icon="el-icon-copy-document" plain @click="copyMulDialogVisible = true" :disabled="multipleSelection.length === 0">复制到...</el-button>
      <el-button type="primary" icon="el-icon-thumb" plain @click="moveMulDialogVisible = true" :disabled="multipleSelection.length === 0">移动到...</el-button>
      <el-button type="primary" icon="el-icon-open" plain @click="setHiddenDocInBatch(1)" :disabled="multipleSelection.length === 0">设为隐藏</el-button>
      <el-button type="primary" icon="el-icon-turn-off" plain @click="setHiddenDocInBatch(2)" :disabled="multipleSelection.length === 0">取消隐藏</el-button>
      <el-button type="danger" icon="el-icon-delete" @click="moveToRecycleBinInBatch()" :disabled="multipleSelection.length === 0">删除</el-button>
    </el-button-group>
    <div class="class-table">
    <el-table
      :key="classTableKey"
      class="table-data"
      ref="multipleTable"
      :data="classList"
      style="height: 100%; width: 1150px"
      tooltip-effect="dark"
      v-el-table-infinite-scroll="load"
      infinite-scroll-disabled="disableLoading"
      infinite-scroll-immediate="false"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'updateAt', order: 'descending' }"
      v-loading="classLoading"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column prop="docName" label="文件名" width="500" sortable>
        <template slot-scope="scope">
          <span style="font-size: 14px">{{ scope.row.docName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="docPath" label="路径" width="500" sortable>
        <template slot-scope="scope">
          <span style="font-size: 14px">{{ scope.row.docPath }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="docSize" label="大小" width="100" sortable>
        <template slot-scope="scope">{{
          displaySize(scope.row.docSize)
        }}</template>
      </el-table-column>
      <el-table-column
        prop="updateAt"
        label="创建日期"
        show-overflow-tooltip
        width="180"
        sortable
      >
        <template slot-scope="scope">{{ scope.row.updateAt }}</template>
      </el-table-column>
      <el-table-column
        prop="updateAt"
        label="修改日期"
        show-overflow-tooltip
        width="180"
        sortable
      >
        <template slot-scope="scope">{{ scope.row.updateAt }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="240">
        <template slot-scope="scope">
          <div class="op-group">
            <el-button
              type="text"
              size="small"
              @click="showCopyDialog(scope.row)"
            >
              复制
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="showMoveDialog(scope.row)"
            >
              移动
            </el-button>
            <el-dropdown class="op-more" placement="bottom">
              <span class="el-dropdown-link">
                &nbsp;&nbsp;&nbsp;&nbsp;<i
                  class="el-icon-arrow-down el-icon--right"
                ></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>下载</el-dropdown-item>
                <el-dropdown-item @click.native="rename(scope.row.docId)">重命名</el-dropdown-item>
                <el-dropdown-item
                  @click.native="moveToRecycleBin([scope.row.docId])"
                  >删除</el-dropdown-item
                >
                <el-dropdown-item
                  divided
                  @click.native="setHiddenDoc([scope.row.docId], 1)"
                  >设为隐藏</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="setHiddenDoc([scope.row.docId], 2)"
                  >取消隐藏</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
    </div>
    <!-- 对话框 -->
    <el-dialog
      name="single-copy-dialog"
      title="复制"
      :visible.sync="copyDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="copyToPath"
      >
      </el-tree>
    </el-dialog>
    <el-dialog
      name="multiple-copy-dialog"
      title="复制"
      :visible.sync="copyMulDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="copyToPathInBatch"
      >
      </el-tree>
    </el-dialog>
    <el-dialog
      name="single-move-dialog"
      title="移动"
      :visible.sync="moveDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="moveToPath"
      >
      </el-tree>
    </el-dialog>
    <el-dialog
      name="multiple-move-dialog"
      title="移动"
      :visible.sync="moveMulDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="moveToPathInBatch"
      >
      </el-tree>
    </el-dialog>
    <el-dialog
      name="upload-dialog"
      title="上传文件"
      :visible.sync="uploadDialogVisible"
      width="30%"
      :before-close="handleDialogClose"
    >
      <!-- 上传组件 -->
      <el-upload
        class="upload-demo"
        ref="upload"
        action=""
        :auto-upload="false"
        drag
        :show-file-list="false"
        :on-change="handleUploadChange"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :limit="1"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div v-if="isFileSelected">
        <el-progress
          :text-inside="true"
          :stroke-width="18"
          :percentage="uploadPercent"
        ></el-progress>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import SparkMD5 from "spark-md5";
export default {
  data() {
    return {
      userId: '',
      curPage: 0,
      pageSize: 8,
      class: 0,
      classList: [],
      classLoading: false,
      classTableKey: null,
      disableLoading: false,
      singleSelection: null,
      multipleSelection: [],
      // 对话框显示控制
      copyDialogVisible: false,
      copyMulDialogVisible: false,
      moveDialogVisible: false,
      moveMulDialogVisible: false,
      // 树形控件
      tree: {
        defaultProps: {
          label: "docName",
          isLeaf: (data, node) => {
            return data.isDir === 1 ? false : true;
          },
          children: "children",
        },
      },
      // 上传相关
      uploadDialogVisible: false, // 展示上传对话框
      isFileSelected: false,
      uploadPercent: 0,
      fileList: [],
      chunkSize: 1024 * 1024 * 50, // 分块大小：50Mb
    };
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: "refreshClassList"
  },
  computed: {
  },
  methods: {
    load() {
      //滑到底部时进行加载
      this.classLoading = true;
      setTimeout(() => {
        this.curPage += 1; //页数+1
        this.getClassList(); //调用接口，此时页数+1，查询下一页数据
      }, 2000);
    },
    displaySize(size) {
      if (size === 0 || !size) {
        return "";
      } else if (size < 1000) return String(size) + "B";
      else if (size > 1024 && size < 1048576)
        return String((size / 1024).toFixed(1)) + "KB";
      else if (size > 1048576 && size < 1073741824)
        return String((size / 1048576).toFixed(1)) + "MB";
      else return String((size / 1073741824).toFixed(1)) + "GB";
    },
    async getClassList() {
      const params = {
        type: this.class,
        offset: this.curPage * this.pageSize,
        limit: this.pageSize,
      };
      await this.$http
        .get(this.userId + "/files/classified", {params: params})
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else if (res.data !== null) {
            if (res.data.list.length === 0) {
              this.disableLoading = true;
              this.$message.info("没有更多了");
            }
            this.classLoading = false;
            this.classTableKey = Math.random();
            this.classList = this.classList.concat(res.data.list);
          }
        });
    },
    async refreshClassList() {
      this.getRouteClass();
      this.classLoading = true;
      this.curPage = 0;
      const params = {
        type: this.class,
        offset: this.curPage * this.pageSize,
        limit: this.pageSize,
      };
      await this.$http
        .get(this.userId + "/files/classified", {params: params})
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else if (res.data !== null) {
            if (res.data.list.length === 0) {
              this.disableLoading = true;
              this.$message.info("没有更多了");
            }
            this.classLoading = false;
            this.classTableKey = Math.random();
            this.classList = res.data.list;
          }
        });
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
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    enterFolder(docName) {
      var path = this.getPathString() + docName + "/";
      this.$router.push(
        "/home/contents/" + encodeURIComponent(path)
      );
    },
    showCopyDialog(data) {
      this.copyDialogVisible = true;
      this.singleSelection = data;
    },
    showMoveDialog(data) {
      this.moveDialogVisible = true;
      this.singleSelection = data;
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.$http
          .get(this.userId + "/files", {
            params: { path: "/", show_hide: true },
          })
          .then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              resolve(res.data.details);
            }
          });
      } else {
        if (node.data !== null) {
          this.$http
            .get(this.userId + "/files", {
              params: {
                path: node.data.docPath + node.data.docName + "/",
                showHide: 1,
              },
            })
            .then((res) => {
              if (res.status !== 200) {
                return this.$message.error("服务器异常，请重试!");
              } else if (res.data !== null && "code" in res.data) {
                return this.$message.error(res.data.msg);
              } else if (res.data !== null) {
                resolve(res.data.details);
              }
            });
        }
      }
    },
    setHiddenDoc(docIds, hideStatus) {
      const data = {
        userId: this.userId,
        ids: docIds,
        hideStatus: hideStatus,
      };
      this.$http.post("files/set-hidden", data).then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          if (res.data.code === 20201) {
            return this.$message.warn("参数错误，请检查输入或刷新重试");
          } else if (res.data.code === 20202) {
            return this.$message.error(
              "修改数目与实际传入数不符，请再次检查文件列表"
            );
          }
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          this.getContentList();
          return this.$message.success("设置成功!");
        }
      });
    },
    setHiddenDocInBatch(hideStatus) {
      this.$confirm("确认更改所有选中的隐藏状态吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      }).then(() => {
        let ids = this.multipleSelection.map((a) => a.docId);
        const data = {
        userId: this.userId,
        ids: ids,
        hideStatus: hideStatus,
      };
      this.$http.post("files/set-hidden", data).then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          if (res.data.code === 20201) {
            return this.$message.warn("参数错误，请检查输入或刷新重试");
          } else if (res.data.code === 20202) {
            return this.$message.error(
              "修改数目与实际传入数不符，请再次检查文件列表"
            );
          }
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          this.getContentList();
          return this.$message.success("设置成功!");
        }
      });
      }).catch(() => {})
    },
    rename(docId) {
      this.$prompt("请输入新名字: ", "重命名", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          const data = {
            userId: this.userId,
            id: docId,
            newName: value,
            overwrite: 2, // 不覆盖
          };
          this.$http.post("files/rename", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("修改名字成功!");
            }
          });
        })
        .catch(() => {});
    },
    mkdir() {
      this.$prompt("请输入文件夹名: ", "在当前路径下创建文件夹", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          const data = {
            userId: this.userId,
            path: this.$route.params.path,
            dirName: value,
            overwrite: 2, // 不覆盖
          };
          this.$http.post("files/mkdir", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("创建新文件夹成功!");
            }
          });
        })
        .catch(() => {});
    },
    moveToPath(data, node, item) {
      this.$confirm("将该文件或文件夹移动到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: [this.singleSelection.docId],
            overwrite: 2,
          };
          this.$http.post("files/move", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.moveDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功移动至选定路径!");
            }
          });
        })
        .catch(() => {});
    },
    moveToPathInBatch(data, node, item) {
      this.$confirm("将所选文件或文件夹移动到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: ids,
            overwrite: 2,
          };
          this.$http.post("files/move", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.moveMulDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功移动至选定路径!");
            }
          });
        })
        .catch(() => {});
    },
    copyToPath(data, node, item, params) {
      this.$confirm("将该文件或文件夹复制到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: [this.singleSelection.docId],
            overwrite: 2,
          };
          this.$http.post("files/copy", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.copyDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功复制!");
            }
          });
        })
        .catch(() => {});
    },
    copyToPathInBatch(data, node, item) {
      this.$confirm("将所选文件或文件夹复制到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: ids,
            overwrite: 2,
          };
          this.$http.post("files/copy", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.copyMulDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功复制!");
            }
          });
        })
        .catch(() => {});
    },
    moveToRecycleBin(docIds) {
      this.$confirm(
        "删除该文件将把文件放入回收站中，我们最多可以为您保存七天, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          const data = {
            userId: this.userId,
            ids: docIds,
          };
          this.$http.post("files/recycle", data).then((res) => {
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
              this.getContentList();
              return this.$message.success("已成功删除!");
            }
          });
        })
        .catch(() => {});
    },
    moveToRecycleBinInBatch() {
      this.$confirm(
        "删除选中文件将把其放入回收站中，我们最多可以为您保存七天, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const data = {
            userId: this.userId,
            ids: ids,
          };
          this.$http.post("files/recycle", data).then((res) => {
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
              this.getContentList();
              return this.$message.success("已成功删除!");
            }
          });
        })
        .catch(() => {});
    },
    removeDoc(docIds) {
      const data = {
        userId: this.userId,
        ids: docIds,
      };
      this.$http.post("files/delete", data).then((res) => {
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
          return this.$message.success("已成功删除!");
        }
      });
      this.getContentList();
    },
    //
    // 上传相关
    handleDialogClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    async handleUploadChange(file, fileList) {
      if (!file) return;
      console.log(file);
      this.isFileSelected = true;
      // 获取文件并转成 ArrayBuffer 对象
      const fileObj = file.raw;
      let buffer;
      try {
        buffer = await this.fileToBuffer(fileObj);
      } catch (e) {
        console.log(e);
      }
      // 根据文件内容生成 hash 值
      const spark = new SparkMD5.ArrayBuffer();
      spark.append(buffer);
      const md5 = spark.end();
      const formHeader = { "Content-Type": "multipart/form-data" };
      // 低于50mb直接一次上传
      if (fileObj.size < this.chunkSize) {
        const formData = new FormData();
        formData.append("user_id", this.userId);
        formData.append("md5", md5);
        formData.append("file", fileObj);
        await this.$http
          .post("file/upload", formData, {
            header: formHeader,
          })
          .then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10109) {
                return this.$message.info("已存在相同文件，请勿重复上传");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null && "file_id" in res.data) {
              this.uploadPercent = 100;
              return this.$message.success("上传成功!");
            }
          });
        return;
      }
      // 将文件按固定大小（50M）进行切片，注意此处同时声明了多个常量
      const chunkList = []; // 保存所有切片的数组
      const chunkListLength = Math.ceil(fileObj.size / this.chunkSize); // 计算总共多个切片
      // 发送探测请求
      var nextIdx = 0;
      const testData = new FormData();
      testData.append("user_id", this.userId);
      testData.append("md5", md5);
      testData.append("file_name", file.name);
      testData.append("chunk_size", this.chunkSize);
      testData.append("chunk_num", chunkListLength);
      var continueUpload = false;
      await this.$http
        .post("file/mp-upload-test", testData, { header: formHeader })
        .then((res) => {
          if (res.status !== 200) {
            return this.$message.error("服务器异常，请重试!");
          } else if (res.data !== null && "code" in res.data) {
            if (res.data.code === 10109) {
              return this.$message.info("已存在相同文件，请勿重复上传");
            }
            return this.$message.error(res.data.msg);
          } else if (res.data !== null && "file_id" in res.data) {
            this.uploadPercent = 100;
            return this.$message.success("已成功秒传!");
          } else if (res.data !== null && "next_idx" in res.data) {
            continueUpload = true;
            nextIdx = parseInt(res.data.next_idx);
          } else {
            return this.$message.error("服务器内部错误");
          }
        });
      if (!continueUpload) return;
      // 生成切片
      let curChunk = 0; // 切片时的初始位置
      for (let i = 0; i < chunkListLength; i++) {
        const item = {
          file: fileObj.slice(curChunk, curChunk + this.chunkSize),
          md5: md5,
          chunk_id: i,
          userId: this.userId,
        };
        curChunk += this.chunkSize;
        chunkList.push(item);
      }
      const uploadData = new FormData();
      uploadData.append("user_id", this.userId);
      uploadData.append("md5", md5);
      uploadData.append("chunk_id", nextIdx);
      uploadData.append("file", chunkList[nextIdx].file);
      // 分多次发送请求，使用flag来控制循环结束
      var flag = true;
      var fusion = 0;
      while (nextIdx < chunkListLength) {
        console.log(uploadData);
        await this.$http
          .post("file/mp-upload", uploadData, { header: formHeader })
          .then((res) => {
            if (res.status !== 200) {
              flag = false;
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              flag = false;
              return this.$message.error(res.data.msg);
            } else if (res.data !== null && "next_idx" in res.data) {
              fusion++;
              nextIdx = parseInt(res.data.next_idx);
              this.uploadPercent = Math.floor(
                (nextIdx / chunkListLength) * 100
              );
              uploadData.set("chunk_id", nextIdx);
              uploadData.set("file", chunkList[nextIdx].file);
            } else if (res.data !== null && "file_id" in res.data) {
              flag = false;
              this.uploadPercent = 100;
              return this.$message.success("文件已成功上传!");
            } else {
              flag = false;
              return this.$message.error("服务器内部错误");
            }
          });
        if (!flag || fusion >= chunkListLength) break;
      }
    },
    // 将 File 对象转为 ArrayBuffer
    fileToBuffer(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = (e) => {
          resolve(e.target.result);
        };
        fr.readAsArrayBuffer(file);
        fr.onerror = () => {
          reject(new Error("转换文件格式发生错误"));
        };
      });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了       ${files.length + fileList.length} 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    getRouteClass() {
      console.log(this.$route.params.class);
      switch (this.$route.params.class) {
        case "pictures": {this.class = 1; break;}
        case "videos": {this.class = 2; break;}
        case "musics": {this.class = 3; break;}
        case "documents": {this.class = 4; break;}
        default: {
          this.$message.error("错误的文件分类")
        }
      }
      console.log(this.class);
    },
  },
  created() {
    this.userId = window.localStorage.getItem("userId");
    this.refreshClassList();
  },
};
</script>

<style scoped>
.btn-group {
  position: fixed;
  left: 210px;
  top: 90px;
}
.class-table {
  position: fixed;
  left: 210px;
  top: 150px;
}
</style>