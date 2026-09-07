export const statuses=['待投递','已投递','笔试 / 作业','面试中','等待反馈','Offer','未通过','已撤回'];
export type Task={id:string;title:string;due:string;done:boolean};
export type Interview={id:string;round:string;time:string;method:string;notes:string};
export type Application={company:string;role:string;date:string;status:string;resumeId:string;resumeName:string;location:string;salary:string;source:string;url:string;contact:string;notes:string;tasks:Task[];interviews:Interview[];history:{date:string;status:string}[]};
export type Resume={name:string;url:string;notes:string};
export type RecordItem={id:string;kind:'application'|'resume';data:any;revision:number;updated_at:string};
export function validateRecord(kind:unknown,value:unknown){
 if(kind!=='application'&&kind!=='resume')throw new Error('记录类型无效');
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('记录内容无效');
 const d=value as any;
 const str=(k:string,required=false,max=10000)=>{if(typeof d[k]!=='string'||d[k].length>max||(required&&!d[k].trim()))throw new Error('请检查字段：'+k)};
 if(kind==='resume'){str('name',true,200);str('url');str('notes');}
 else{for(const k of ['company','role'])str(k,true,200); for(const k of ['date','status','resumeId','resumeName','location','salary','source','url','contact','notes'])str(k);if(!statuses.includes(d.status))throw new Error('进展无效'); if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(d.date)))throw new Error('投递日期无效');
 for(const k of ['tasks','interviews','history'])if(!Array.isArray(d[k])||d[k].length>300)throw new Error('条目过多或格式不正确');
 for(const t of d.tasks)if(!t||typeof t.id!=='string'||typeof t.title!=='string'||!t.title.trim()||t.title.length>1000||typeof t.due!=='string'||(t.due&&!/^\d{4}-\d{2}-\d{2}$/.test(t.due))||typeof t.done!=='boolean')throw new Error('请填写待办内容和有效截止日期');
 for(const i of d.interviews)if(!i||['id','round','time','method','notes'].some(k=>typeof i[k]!=='string')||!i.round.trim()||(i.time&&Number.isNaN(Date.parse(i.time))))throw new Error('请填写面试轮次和有效时间');
 for(const h of d.history)if(!h||typeof h.date!=='string'||!statuses.includes(h.status))throw new Error('进展记录无效');}
 if(d.url){let u;try{u=new URL(d.url)}catch{throw new Error('请填写完整的 https:// 或 http:// 链接')}if(!['https:','http:'].includes(u.protocol))throw new Error('链接仅支持 HTTP 或 HTTPS');}
 if(JSON.stringify(d).length>180000)throw new Error('记录内容过长');return d;
}
