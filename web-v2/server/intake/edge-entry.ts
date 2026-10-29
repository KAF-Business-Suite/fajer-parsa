import {handleEdge} from './edge.ts'
Deno.serve((request:Request)=>handleEdge(request,{SUPABASE_URL:Deno.env.get('SUPABASE_URL'),SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}))
