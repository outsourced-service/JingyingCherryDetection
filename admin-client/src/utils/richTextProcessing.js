/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
    mdapi
} from '/@/api/index';

/**
 * 使用DOMParser解析HTML字符串 生成虚拟DOM
 */
export function domParser(richText = "") {
    // 使用DOMParser解析HTML字符串  
    const parser = new DOMParser();
    return parser.parseFromString(richText, 'text/html');
}

/**
 * 将富文本中的图片替换为指定路径的图片
 * @param {""} richText 富文本 
 */
export function replaceImage(richText = '',) {
    return new Promise((resolve) => {
        //1.生成虚拟dom
        const DOM = domParser(richText);
        //2.获取所有的img元素 
        const imgElements = DOM.getElementsByTagName('img');
        // 遍历img元素并替换src属性
        const promises = Array.from(imgElements).map(async (imgElement) => {
            // const originalSrc = imgElement.getAttribute('src');
            const dataHref = imgElement.getAttribute('data-href');
            await mdapi.query({
                action_name: "getImageById",
                inputs: {
                    imageId: +dataHref.split('fz_image_')[1]
                },
                fields: "id url"
            }).then(res => {
                imgElement.setAttribute('src', res.url);
            }).catch(err => { })
        });
        // 如果你需要获取或操作替换后的HTML字符串，可以将整个doc重新序列化
        Promise.all(promises).then(results => {

            const serializer = new XMLSerializer();
            const newRichText = serializer.serializeToString(DOM);
            resolve(newRichText); // 输出替换后的HTML字符串 
        }).catch(error => { });
    })
}
/**
 * 将富文本中的视频替换为指定路径的视频
 * @param {""} richText 富文本 
 */
export function replaceVideo(richText = "") {
    return new Promise((resolve) => {
        //1.生成虚拟dom
        const DOM = domParser(richText);
        //2.获取所有的img元素 
        const videoElements = DOM.getElementsByTagName('video');
        // 遍历video元素并替换src属性
        const promises = Array.from(videoElements).map(async (videoElement) => {
            const originalSrc = videoElement.getAttribute('poster'); // 获取poster属性（如果需要的话）  
            const sourceElement = videoElement.querySelector('source');
            // const originalSourceSrc = sourceElement.getAttribute('src'); // 获取source元素的src属性  
            await mdapi.query({
                action_name: "getVideoById",
                inputs: {
                    videoId: +originalSrc.split('fz_video_')[1]
                },
                fields: "id url"
            }).then(res => {
                sourceElement.setAttribute('src', res.url);
                videoElement.setAttribute('poster', res.url);
            }).catch(err => { })
        })
        // 如果你需要获取或操作替换后的HTML字符串，可以将整个doc重新序列化
        Promise.all(promises).then(results => {

            const serializer = new XMLSerializer();
            const newRichText = serializer.serializeToString(DOM);
            resolve(newRichText); // 输出替换后的HTML字符串 
        }).catch(error => { });
    })
}


/**
 * 将富文本中的视频和图片替换为指定路径的视频和图片
 * @param {""} richText 富文本 
 */
export function replaceVideoAndImage(richText = "") {
    return new Promise((resolve) => {
        //1.生成虚拟dom
        const DOM = domParser(richText);
        //2.获取所有的video元素 
        const videoElements = DOM.getElementsByTagName('video');
        //2.获取所有的img元素 
        const imgElements = DOM.getElementsByTagName('img');
        // 遍历img元素并替换src属性  
        const promises = Array.from(imgElements).map(async (imgElement) => {
            // const originalSrc = imgElement.getAttribute('src');
            const dataHref = imgElement.getAttribute('data-href');
            await mdapi.query({
                action_name: "getImageById",
                inputs: {
                    imageId: +dataHref.split('fz_image_')[1]
                },
                fields: "id url"
            }).then(res => {
                imgElement.setAttribute('src', res.url);
            }).catch(err => { })
        });
        // 遍历video元素并替换src属性  
        promises.push(...Array.from(videoElements).map(async (videoElement) => {
            const originalSrc = videoElement.getAttribute('poster'); // 获取poster属性（如果需要的话）  
            const sourceElement = videoElement.querySelector('source');
            // const originalSourceSrc = sourceElement.getAttribute('src'); // 获取source元素的src属性  
            await mdapi.query({
                action_name: "getVideoById",
                inputs: {
                    videoId: +originalSrc.split('fz_video_')[1]
                },
                fields: "id url"
            }).then(res => {
                sourceElement.setAttribute('src', res.url);
                videoElement.setAttribute('poster', res.url);
            }).catch(err => { })
        }));
        // 如果你需要获取或操作替换后的HTML字符串，可以将整个doc重新序列化  
        Promise.all(promises).then(results => {
            const serializer = new XMLSerializer();
            const newRichText = serializer.serializeToString(DOM);
            resolve(newRichText); // 输出替换后的HTML字符串 
        }).catch(error => { });
    })
}