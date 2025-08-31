"use strict";(()=>{var e={};e.id=838,e.ids=[838],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2615:e=>{e.exports=require("http")},8791:e=>{e.exports=require("https")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1568:e=>{e.exports=require("zlib")},8911:(e,a,t)=>{t.r(a),t.d(a,{originalPathname:()=>m,patchFetch:()=>d,requestAsyncStorage:()=>T,routeModule:()=>l,serverHooks:()=>_,staticGenerationAsyncStorage:()=>E});var s={};t.r(s),t.d(s,{GET:()=>u,POST:()=>p});var n=t(9303),r=t(8716),o=t(670),i=t(7070),c=t(1926);async function p(){try{let e=(0,c.m)();return await e.rpc("exec_sql",{sql:`
        CREATE TABLE IF NOT EXISTS campaigns (
          campaign_id   TEXT PRIMARY KEY,
          campaign_name TEXT NOT NULL,
          created_at    TIMESTAMP DEFAULT now()
        );
      `}),await e.rpc("exec_sql",{sql:`
        CREATE TABLE IF NOT EXISTS campaign_uploads (
          upload_id     TEXT PRIMARY KEY,
          campaign_id   TEXT NOT NULL REFERENCES campaigns(campaign_id),
          filename      TEXT NOT NULL,
          stored_path   TEXT NOT NULL,
          uploaded_at   TIMESTAMP DEFAULT now()
        );
      `}),await e.rpc("exec_sql",{sql:`
        CREATE TABLE IF NOT EXISTS campaign_content_raw (
          campaign_id          TEXT NOT NULL REFERENCES campaigns(campaign_id),
          campaign_name_src    TEXT,
          content_title        TEXT,
          content_network_name TEXT,
          impression           BIGINT,
          quartile100          BIGINT
        );
      `}),await e.rpc("exec_sql",{sql:`
        CREATE TABLE IF NOT EXISTS content_aliases (
          content_title_canon TEXT NOT NULL,
          content_key         TEXT NOT NULL,
          created_at          TIMESTAMP DEFAULT now(),
          PRIMARY KEY (content_title_canon)
        );
      `}),i.NextResponse.json({success:!0,message:"Database tables created successfully",tables:["campaigns","campaign_uploads","campaign_content_raw","content_aliases"]})}catch(e){return console.error("Database setup failed:",e),i.NextResponse.json({success:!1,error:`Database setup failed: ${e instanceof Error?e.message:"Unknown error"}`,note:"You may need to run the SQL script manually in Supabase SQL Editor"},{status:500})}}async function u(){try{let e=(0,c.m)(),{data:a,error:t}=await e.from("information_schema.tables").select("table_name").eq("table_schema","public").eq("table_type","BASE TABLE");if(t)throw t;let s=a?.map(e=>e.table_name)||[];return i.NextResponse.json({success:!0,existingTables:s,requiredTables:["campaigns","campaign_uploads","campaign_content_raw","content_aliases"],missingTables:["campaigns","campaign_uploads","campaign_content_raw","content_aliases"].filter(e=>!s.includes(e))})}catch(e){return console.error("Database check failed:",e),i.NextResponse.json({success:!1,error:`Database check failed: ${e instanceof Error?e.message:"Unknown error"}`,note:"Check your Supabase connection and environment variables"},{status:500})}}let l=new n.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/setup/route",pathname:"/api/setup",filename:"route",bundlePath:"app/api/setup/route"},resolvedPagePath:"/Users/mattmurphy/ctv-rollup-fresh/src/app/api/setup/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:T,staticGenerationAsyncStorage:E,serverHooks:_}=l,m="/api/setup/route";function d(){return(0,o.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:E})}},1926:(e,a,t)=>{t.d(a,{m:()=>o});var s=t(9498);let n=process.env.NEXT_PUBLIC_SUPABASE_URL,r=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;n&&r&&(0,s.eI)(n,r);let o=()=>{let e=process.env.NEXT_PUBLIC_SUPABASE_URL,a=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!a)throw Error("Supabase environment variables not configured");return(0,s.eI)(e,a,{auth:{autoRefreshToken:!1,persistSession:!1}})}}};var a=require("../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),s=a.X(0,[948,972,498],()=>t(8911));module.exports=s})();