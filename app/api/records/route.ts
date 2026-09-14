import { database } from '@/lib/db';
import { validateRecord } from '@/lib/model';
/**
 * One-time cleanup for unambiguous data-quality issues found during the
 * application audit. This is intentionally idempotent and will be removed
 * immediately after the cleanup run is verified.
 */
async function normalizeCertainRecords(){
 const db=database();
 const rows=await db.prepare("SELECT id,kind,data,revision FROM records WHERE kind='application'").all();
 const updates:any[]=[];
 const trimKeys=['company','role','date','status','resumeId','resumeName','location','salary','source','url','contact','notes'];
 for(const row of (rows.results as any[])){
  let d:any;
  try{d=JSON.parse(row.data)}catch{continue}
  let changed=false;
  for(const key of trimKeys){
   if(typeof d[key]==='string'){
    const value=d[key].trim();
    if(value!==d[key]){d[key]=value;changed=true}
   }
  }
  if(d.source!=='BOSS'){d.source='BOSS';changed=true}
  if(d.role==='华南区域saas企业效能顾问'){d.role='华南区域 SaaS 企业效能顾问';changed=true}
  if(d.role==='解决方案/架构师（云计算/iaas/云业务）'){d.role='解决方案/架构师（云计算/IaaS/云业务）';changed=true}
  if(d.role==='高级解决方案工程师4272'){d.role='高级解决方案工程师（4272）';changed=true}
  if(d.notes==='曹佐华-科大讯飞客户销售.docx\n已读不回'){d.notes='已读不回';changed=true}
  if(d.notes==='曹佐华-行业智能解决方案销售 0908.docx\n已读不回'){d.notes='已读不回';changed=true}
  if(changed){
   updates.push(db.prepare('UPDATE records SET data=?, revision=revision+1, updated_at=? WHERE id=? AND revision=? AND kind=?').bind(JSON.stringify(d),new Date().toISOString(),row.id,row.revision,'application'));
  }
 }
 if(updates.length)await db.batch(updates);
 return updates.length;
}
export async function GET(){try{await normalizeCertainRecords();const r=await database().prepare('SELECT * FROM records ORDER BY updated_at DESC').all();return Response.json(r.results.map((r:any)=>({...r,data:JSON.parse(r.data)})),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'暂时无法加载记录，请稍后重试'},{status:500})}}
export async function POST(req:Request){return mutate(req,false)}
export async function PUT(req:Request){return mutate(req,true)}
async function mutate(req:Request,edit:boolean){try{if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'请求来源无效'},{status:403});const body=await req.text();if(body.length>200000)throw new Error('记录内容过长');const b=JSON.parse(body);const data=validateRecord(b.kind,b.data);const db=database();const now=new Date().toISOString();let id=crypto.randomUUID();let revision=1;
if(edit){if(typeof b.id!=='string'||!Number.isInteger(b.revision))throw new Error('记录标识无效');id=b.id;revision=b.revision+1;const r=await db.prepare('UPDATE records SET data=?, revision=revision+1, updated_at=? WHERE id=? AND revision=? AND kind=?').bind(JSON.stringify(data),now,id,b.revision,b.kind).run();if(!r.meta.changes)return Response.json({error:'记录已在其他页面更新，请关闭编辑并刷新后再试'},{status:409});}
else await db.prepare('INSERT INTO records (id,kind,data,revision,updated_at) VALUES (?,?,?,?,?)').bind(id,b.kind,JSON.stringify(data),revision,now).run();return Response.json({id,kind:b.kind,data,revision,updated_at:now},{status:edit?200:201});}catch(e){return Response.json({error:e instanceof Error?e.message:'保存失败，请重试'},{status:400})}}
export async function DELETE(req:Request){try{if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'请求来源无效'},{status:403});const b=await req.json() as any;if(typeof b.id!=='string'||!Number.isInteger(b.revision))throw new Error('记录无效');const r=await database().prepare('DELETE FROM records WHERE id=? AND revision=?').bind(b.id,b.revision).run();if(!r.meta.changes)return Response.json({error:'记录已变更，请刷新后重试'},{status:409});return Response.json({ok:true})}catch{return Response.json({error:'删除失败，请重试'},{status:400})}}
