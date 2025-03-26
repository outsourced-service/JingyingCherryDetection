/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import writeXlsxFile from 'write-excel-file';
import readXlsxFile from 'read-excel-file';
import { removeWhitespace } from '/@/utils/toolsValidate';


Array.prototype.processWithAsync = async function (callback: any) {
    for (let i = 0; i < this.length; i++) {
        await callback(this[i], i, this);
    }
}

/** 导出模板 */
export async function exportFile(fileData: any, fileName: any = 'file.xlsx') {
    const { data = [], schema = [], columnStr = {}, isDimension = false, sheets = 'Sheet 1' } = fileData;
    const fun = (data: any, schema: any) => {
        const columnSet = new Set();  // 创建一个Set来存储唯一的列名  
        data.forEach((item: any) => {
            for (const key in item) if (item.hasOwnProperty(key)) columnSet.add(key);
        });
        Array.from(columnSet).forEach((column: any) => {
            schema.push({
                column: columnStr[column] || column,
                type: String,
                value: (student: any) => `${student?.[column] ?? ''}`
            })
        })
    }

    if (!isDimension) {
        if (schema.length === 0) fun(data, schema);
    } else {
        data.forEach((item: any, index: number) => fun(item, schema[index] = schema[index] || []))
    }
    return await writeXlsxFile(data, {
        schema: schema,
        ...isDimension ? { sheets: sheets } : {},
        fileName
    })
}
/** 导入模板 */
export async function ImportFile(fileData: File, columnStr: { [key: string]: string } = {}) {
    //title: 表头  XLSX: 数据
    const [title = [], ...XLSX] = Array.isArray(fileData) ? fileData : await readXlsxFile(fileData);
    //查找对应表头所在位置
    const keys = Object.keys(columnStr).reduce((prev: any, key: any) => {
        prev[key] = title.findIndex((item: any) => item?.includes(columnStr[key]));
        return prev;
    }, {})
    //查找状态所在位置
    let UploadStatus = title.findIndex((item: any) => item?.includes('导入状态'));
    if (UploadStatus < 0) {
        title.push('导入状态');
        UploadStatus = title.length - 1;
    }
    //查找字段对应的位置
    return {
        title: title || [],
        XLSX: XLSX || [],
        keys: keys || {},
        UploadStatus: UploadStatus || -1
    }
}
// /** 中标记录模板，导出 */
// export async function exportSuccbids(fileData: any, fileName: any = '中标记录导入上传模板.xlsx') {
//     const { data = [{
//         name: "国网陕西省电力有限公司2024年第一次物资集中规模招标采购项目中标公告",
//         product: "xxxxx",
//         date: "2024",
//         price: "xxxx",
//         province: "陕西",
//         baohao: "包号",
//         company: "中标公司",
//         year: "2024",
//         type: "国网省公司",
//         publish_date: "2024-03-28",
//         remark: "",
//         hc_companyid: "",
//     }], schema = [] } = fileData;
//     const columnStr: { [key: string]: string } = {
//         name: "项目名称",
//         product: "产品名称",
//         date: "招标年份",
//         price: "中标价格",
//         province: "省份",
//         baohao: "包号",
//         company: "中标公司",
//         year: "中标年份",
//         type: "招标类型",
//         publish_date: "公示日期",
//         remark: "备注",
//         hc_companyid: "hc公司ID",
//     }
//     return await exportFile({
//         data,
//         schema,
//         columnStr
//     }, fileName)
// }
// /** 中标记录导入*/
// export async function ImportSuccbids(fileData: any, callback: (title: any, XLSX: any, failData: any) => {}, percentageFun: Function, otherInfo: any = {}) {
//     const XLSXData: any[] = [];
//     const columnStr = {
//         name: "项目名称",
//         product: "产品名称",
//         date: "招标年份",
//         price: "中标价格",
//         province: "省份",
//         baohao: "包号",
//         company: "中标公司",
//         year: "中标年份",
//         type: "招标类型",
//         publish_date: "公示日期",
//         remark: "备注",
//         hc_companyid: "hc公司ID",
//     }
//     //title: 表头  XLSX: 数据
//     const { title, XLSX, keys, UploadStatus } = await ImportFile(fileData, columnStr);
//     //通知回调开始上传
//     await callback(title, null, XLSXData);
//     //记录上传进度
//     const percentage = {
//         current: 0,
//         count: XLSX.length,
//     }
//     //循环数据
//     //获取上传API
//     const curdFun = succbids();
//     const validate = (item: any) => {
//         if (!item.name) return { type: 'warning', message: '项目名称不能为空' };
//         if (!item.product) return { type: 'warning', message: '产品名称不能为空' };
//         if (!item.company) return { type: 'warning', message: '中标公司不能为空' };
//         if (!item.date) return { type: 'warning', message: '招标年份不能为空' };
//         if (!item.type) return { type: 'warning', message: '招标类型不能为空' };
//         if (!item.year) return { type: 'warning', message: '中标年份不能为空' };
//         if (!item.province) return { type: 'warning', message: '省份不能为空' };
//         if (!item.baohao) return { type: 'warning', message: '包号不能为空' };
//         // if (!item.price) return { type: 'warning', message: '中标价格不能为空' };
//         // if (!item.publish_date) return { type: 'warning', message: '公示日期不能为空' };
//         return false;
//     }
//     XLSX.processWithAsync(async (data: any) => {
//         //记录上传进度
//         callback(title, data, XLSXData);

//         //获取上传的数据
//         const _incSuccbids = Object.keys(keys).reduce((prev: any, key: any) => {
//             const index = keys[key]; //获取索引
//             const value = data?.[index] ?? null; //获取值
//             //判断是否为年份
//             if (['date', 'year', 'hc_companyid'].includes(key)) prev[key] = parseInt(value) || null;
//             else if (['price'].includes(key)) {
//                 const float = parseFloat(value) || 0;
//                 prev['price'] = `${float || ''}`
//                 prev['price_float'] = float
//             }
//             else prev[key] = removeWhitespace(value)
//             return prev;
//         }, {})

//         const validateRes = validate(_incSuccbids);
//         // 数据不完整直接返回，并设置状态为失败，保存错误数据
//         if (validateRes) {
//             data[UploadStatus] = 'danger';
//             percentage.current++;
//             XLSXData.push({
//                 ..._incSuccbids,
//                 '上传失败原因': validateRes.message,
//             });
//             percentageFun(percentage);
//             return;
//         }
//         // 先一行的问
//         await curdFun.inc(_incSuccbids, {}).then((res: any) => {
//             data[UploadStatus] = 'success';
//         }).catch((err: any) => {
//             data[UploadStatus] = 'danger';
//             XLSXData.push({
//                 ..._incSuccbids,
//                 '上传失败原因': "格式错误，请检查数据类型",
//             });
//         }).finally(() => {
//             percentage.current++;
//             percentageFun(percentage)
//         });
//     });
// }
