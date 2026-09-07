import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'投递手记 · 我的求职工作台',description:'集中管理岗位投递、简历版本、面试记录与下一步行动。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}

