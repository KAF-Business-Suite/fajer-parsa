export type IntakePayload={requestId:string;service:string;destination:string;variant:string;contact:string;consent:true;challenge:string;website:''}
export type IntakeReceipt={status:'received';receipt:string;replayed:boolean}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export class IntakeFailure extends Error { status:number; constructor(status:number){super('intake_failed');this.status=status} }
export async function submitIntake(payload:IntakePayload,fetcher:typeof fetch=fetch,endpoint='/api/requests'):Promise<IntakeReceipt>{
  if(endpoint!=='/api/requests'&&endpoint!=='https://krzxajtrhvupyywovdzy.supabase.co/functions/v1/fajr-web-intake-qa')throw new IntakeFailure(400)
  // Only the same-origin path or fixed QA Edge endpoint; never arbitrary destinations or URL credentials.
  const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',cache:'no-store',redirect:'error',body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)})
  if(response.status!==200&&response.status!==201)throw new IntakeFailure(response.status)
  const data=await response.json() as Partial<IntakeReceipt>
  if(data.status!=='received'||typeof data.receipt!=='string'||!uuid.test(data.receipt)||typeof data.replayed!=='boolean')throw new IntakeFailure(502)
  return data as IntakeReceipt
}
export function intakeErrorMessage(error:unknown){
  if(error instanceof IntakeFailure){
    if(error.status===429)return 'درخواست‌ها زیاد شده‌اند؛ کمی بعد دوباره تلاش کنید.'
    if(error.status===403)return 'تأیید امنیتی کامل نشد؛ دوباره تأیید کنید.'
    if(error.status===400)return 'اطلاعات درخواست پذیرفته نشد؛ برای راهنمایی با دفتر تماس بگیرید.'
  }
  return 'رسید دریافت نشد؛ وضعیت ثبت قطعی نیست. برای بررسی دوباره، همین درخواست را تکرار کنید.'
}
