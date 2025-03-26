<template>
	<div class="personal layout-pd">
		<el-row>
			<!-- 个人信息 -->
			<el-col :xs="24" :sm="16">
				<el-card shadow="hover" header="个人信息">
					<div class="personal-user">
						<div class="personal-user-left">
							<el-image style="width: 100%; height: 100%" :src="userInfos.photo" fit="contain"
								:preview-src-list="[userInfos.photo]" preview-teleported />
							<!-- <el-upload class="h100 personal-user-left-upload"
								action="https://jsonplaceholder.typicode.com/posts/" multiple :limit="1">
								<img :src="userInfos.photo" />
							</el-upload> -->
						</div>
						<div class="personal-user-right">
							<el-row>
								<el-col :span="24" class="personal-title mb18">{{ currentTime }}，{{ userInfos.nickname
									}}
								</el-col>
								<el-col :span="24">
									<el-row>
										<el-col :xs="24" :sm="8" class="personal-item mb6">
											<div class="personal-item-label">账户：</div>
											<div class="personal-item-value">{{ userInfos.username }}</div>
										</el-col>
										<el-col :xs="24" :sm="16" class="personal-item mb6">
											<div class="personal-item-label">身份：</div>
											<div class="personal-item-value">{{ roles() }}</div>
										</el-col>
									</el-row>
								</el-col>
								<el-col :span="24">
									<el-row>
										<el-col :xs="24" :sm="8" class="personal-item mb6">
											<div class="personal-item-label">手机号：</div>
											<div class="personal-item-value">{{
				userInfos.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') }}</div>
										</el-col>
										<el-col :xs="24" :sm="16" class="personal-item mb6">
											<div class="personal-item-label">登录时间：</div>
											<div class="personal-item-value">{{ userInfos.login_time }}</div>
										</el-col>
									</el-row>
								</el-col>
							</el-row>
						</div>
					</div>
				</el-card>
			</el-col>

			<!-- 更新信息 -->
			<el-col :span="24">
				<el-card shadow="hover" class="mt15 personal-edit" header="更新信息">
					<div class="personal-edit-title">基本信息</div>
					<el-form :model="state.personalForm" size="default" label-width="40px" class="mt35 mb35">
						<el-row :gutter="35">
							<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
								<el-form-item label="昵称">
									<el-input v-model="state.personalForm.nickname" placeholder="请输入昵称"
										clearable></el-input>
								</el-form-item>
								<el-form-item label="手机">
									<el-input v-model="state.personalForm.phone" placeholder="请输入手机"
										clearable></el-input>
								</el-form-item>
							</el-col>
							<el-col :xs="24" :sm="12" :md="8" :lg="18" :xl="4" class="mb20">
								<el-form-item label="头像">
									<el-upload v-model:file-list="state.fileListAvatar" action="#" accept="image/*"
										:http-request="beforeLicenseHandle" list-type="picture-card"
										:on-success="handleImgSuccess" :limit="1">
										<div class="tip_all_img">+</div>
									</el-upload>
								</el-form-item>
							</el-col>
							<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
								<el-form-item>
									<el-button type="primary" @click="updatePersonal">
										<el-icon>
											<ele-Position />
										</el-icon>
										更新个人信息
									</el-button>
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
					<div class="personal-edit-title mb15">账号安全</div>
					<div class="personal-edit-safe-box">
						<div class="personal-edit-safe-item">
							<div class="personal-edit-safe-item-left">
								<div class="personal-edit-safe-item-left-label">账户密码</div>
								<div class="personal-edit-safe-item-left-value">建议定期更改密码以提高安全性</div>
							</div>
							<div class="personal-edit-safe-item-right">
								<el-button text type="primary" @click="onChangePwd">立即修改</el-button>
							</div>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>
		<DeptDialog ref="deptDialogRef" @refresh="setPwd" />
	</div>
</template>

<script setup lang="ts" name="personal">
import { reactive, computed, onMounted, defineAsyncComponent, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useUserInfo } from '/@/stores/userInfo';
import { formatAxis } from '/@/utils/formatTime';
import { useUserApi } from '/@/api/system/index';
import { ElMessage, ElMessageBox, UploadProps, UploadRequestOptions } from 'element-plus';
import md5 from 'md5';
import { mdapi } from '/@/utils/zionMdapi.js';
import { Session } from '/@/utils/storage';

const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);
const userApi = useUserApi();
const DeptDialog = defineAsyncComponent(() => import('./dialog.vue'));

const deptDialogRef = ref();
// 定义变量内容
const { t } = useI18n();
const state = reactive<PersonalState>({
	fileListAvatar: [],
	personalForm: {
		nickname: '',
		username: '',
		avatar_id: '',
		role: '',
		phone: '',
		login_time: new Date().toLocaleString(),
	},
});

// 当前时间提示语
const currentTime = computed(() => {
	return formatAxis(new Date());
});
const roles = () => {
	let userInfo = userInfos.value;
	return userInfo.manager_role.map((item: { name: any }) => item.name).join('、');
};
const onChangePwd = () => {
	deptDialogRef.value.openDialog();
};
const beforeLicenseHandle = (param: UploadRequestOptions) => {
	return new Promise((resolve) => {
		const formData = new FormData();
		formData.append('file', param.file);
		resolve(formData);
	});
};
const handleImgSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
	mdapi.local_uimage(uploadFile.raw!).then((res: { imageId: any }) => {
		const { imageId } = res;
		state.personalForm.avatar_id = imageId;
	});
};
const updatePersonal = async () => {
	await userApi.userBaseInfo({
		nickname: state.personalForm.nickname,
		phone: state.personalForm.phone,
		manager_pk: userInfos.value.id,
		avatar_id: state.personalForm.avatar_id,
	});
	state.personalForm.nickname = '';
	state.personalForm.phone = '';
	state.fileListAvatar = [];
	// 触发初始化用户信息 pinia
	await useUserInfo().setUserInfos(false, true);
	ElMessage.success('修改成功');
};
const setPwd = async (password: any) => {


	ElMessageBox.confirm(`密码修改成功后，将重新登录，是否确认?`, "再次确认", {
		type: 'warning',
		closeOnClickModal: false,
		closeOnPressEscape: false,
		// title: t('message.user.logOutTitle'),
		// message: `确认将密码修改为：“${pwd.password}”，是否继续?`,
		showCancelButton: true,
		confirmButtonText: t('message.user.logOutConfirm'),
		cancelButtonText: t('message.user.logOutCancel'),
		buttonSize: 'default',
	})
		.then(async () => {
			await userApi.userUpdateAccount({
				username: userInfos.value.username,
				password: md5(password),
				manager_pk: userInfos.value.id,
			});
			ElMessage.success('修改成功');
			// 清除缓存/token等
			Session.clear();
			// 使用 reload 时，不需要调用 resetRoute() 重置路由
			window.location.reload();
		})
		.catch(() => { });
};
onMounted(() => { });
</script>

<style scoped lang="scss">
@import '../../../theme/mixins/index.scss';

.personal {
	.personal-user {
		height: 130px;
		display: flex;
		align-items: center;

		.personal-user-left {
			width: 130px;
			height: 130px;
			border-radius: 3px;

			:deep(.el-upload) {
				height: 100%;
			}

			.personal-user-left-upload {
				img {
					width: 100%;
					height: 100%;
					border-radius: 3px;
				}

				&:hover {
					img {
						animation: logoAnimation 0.3s ease-in-out;
					}
				}
			}
		}

		.personal-user-right {
			flex: 1;
			padding: 0 15px;

			.personal-title {
				font-size: 18px;
				@include text-ellipsis(1);
			}

			.personal-item {
				display: flex;
				align-items: center;
				font-size: 13px;

				.personal-item-label {
					color: var(--el-text-color-secondary);
					@include text-ellipsis(1);
				}

				.personal-item-value {
					@include text-ellipsis(1);
				}
			}
		}
	}

	.personal-info {
		.personal-info-more {
			float: right;
			color: var(--el-text-color-secondary);
			font-size: 13px;

			&:hover {
				color: var(--el-color-primary);
				cursor: pointer;
			}
		}

		.personal-info-box {
			height: 130px;
			overflow: hidden;

			.personal-info-ul {
				list-style: none;

				.personal-info-li {
					font-size: 13px;
					padding-bottom: 10px;

					.personal-info-li-title {
						display: inline-block;
						@include text-ellipsis(1);
						color: var(--el-text-color-secondary);
						text-decoration: none;
					}

					& a:hover {
						color: var(--el-color-primary);
						cursor: pointer;
					}
				}
			}
		}
	}

	.personal-recommend-row {
		.personal-recommend-col {
			.personal-recommend {
				position: relative;
				height: 100px;
				border-radius: 3px;
				overflow: hidden;
				cursor: pointer;

				&:hover {
					i {
						right: 0px !important;
						bottom: 0px !important;
						transition: all ease 0.3s;
					}
				}

				i {
					position: absolute;
					right: -10px;
					bottom: -10px;
					font-size: 70px;
					transform: rotate(-30deg);
					transition: all ease 0.3s;
				}

				.personal-recommend-auto {
					padding: 15px;
					position: absolute;
					left: 0;
					top: 5%;
					color: var(--next-color-white);

					.personal-recommend-msg {
						font-size: 12px;
						margin-top: 10px;
					}
				}
			}
		}
	}

	.personal-edit {
		.personal-edit-title {
			position: relative;
			padding-left: 10px;
			color: var(--el-text-color-regular);

			&::after {
				content: '';
				width: 2px;
				height: 10px;
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				background: var(--el-color-primary);
			}
		}

		.personal-edit-safe-box {
			border-bottom: 1px solid var(--el-border-color-light, #ebeef5);
			padding: 15px 0;

			.personal-edit-safe-item {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.personal-edit-safe-item-left {
					flex: 1;
					overflow: hidden;

					.personal-edit-safe-item-left-label {
						color: var(--el-text-color-regular);
						margin-bottom: 5px;
					}

					.personal-edit-safe-item-left-value {
						color: var(--el-text-color-secondary);
						@include text-ellipsis(1);
						margin-right: 15px;
					}
				}
			}

			&:last-of-type {
				padding-bottom: 0;
				border-bottom: none;
			}
		}
	}
}
</style>
