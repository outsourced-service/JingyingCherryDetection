import { mdapi } from '/@/utils/zionMdapi.js';
/** 统一插入模板 */
const setInc = async (model: String, data: Array<Object> | Object, fields: Array<Object | string> | string | undefined, config: Object = {}) => {
    return await mdapi.api('/', 'curd', {
        model: model, //数据表名称
        operate: '新增',
        data,
        fields
    }, config || {});
}
/** 统一删除模板 */
const setDel = async (model: String, ID: Array<Number> | Number, isForceDelete: Boolean, fields: Array<Object | string> | string | undefined, config: Object = {}) => {
    return await mdapi.api('/', 'curd', {
        model: model, //数据表名称
        operate: '删除',
        data_pk: ID,
        isForceDelete,
        fields
    }, config || {});
}
/** 统一修改模板 */
const setUpd = async (model: String, ID: Array<Number> | Number, data: Object, fields: Array<Object | string> | string | undefined, config: Object = {}) => {
    return await mdapi.api('/', 'curd', {
        model: model, //数据表名称
        operate: '编辑',
        data_pk: ID,
        data,
        fields
    }, config || {});
}
/** 统一查询模板 */
const getQue = async (model: String, inpus: Object, fields: Array<Object | string> | string | undefined, config: Object = {}) => {
    return await mdapi.api('/', 'curd', {
        model: model, //数据表名称
        operate: '列表',
        page_index: 1,
        page_size: 100,
        ...inpus,
        fields
    }, config || {});
}
/** 统一查询模板 */
const getQueOne = async (model: String, ID: Number, fields: Array<Object | string> | string | undefined, config: Object = {}) => {
    return await mdapi.api('/', 'curd', {
        model: model, //数据表名称
        operate: '详情',
        data_pk: ID,
        fields
    }, config || {});
}

/** 合并增删改查 */
const initUnified = function name(model: String, fields: Array<Object | string> | string | undefined) {
    const MODEL = model;
    const FIELDS = Array.isArray(fields) ? fields : fields ? [fields] : [];
    return {
        inc: (data: Object | Object[], config: Object) => setInc(MODEL, data, undefined, config),
        del: (ID: Number, isForceDelete: Boolean | null, config: Object) => setDel(MODEL, ID, isForceDelete || false, undefined, config),
        set: (ID: Number | Number[], data: any, config: Object) => setUpd(MODEL, ID, data, undefined, config),
        get: (inputs: Object, config: Object) => getQue(MODEL, inputs, FIELDS, config),
    };
}

export { getQue, getQueOne, setInc, setUpd, setDel, initUnified };