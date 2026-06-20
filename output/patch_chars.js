const fs=require("fs");
const p="C:/Users/周进法/Desktop/ai-novel/app/api/generate/route.js";
let c=fs.readFileSync(p,"utf-8");

// 1. Replace rhythm rule
const r1 = "每段必须有推进：要么推进剧情，要么揭示角色，要么改变关系。不写";
let idx = c.indexOf(r1);
if(idx<0){ console.log("Rhythm not found, searching alternatives..."); idx=c.indexOf("每段必须有"); }
if(idx>=0){
  const end = c.indexOf("'`;", idx);
  if(end<0) end = c.indexOf("'", idx+50);
  if(end>0){
    c=c.substring(0,idx)+"节奏要有呼吸：紧张场景后给一两段日常——林夜怎么吃饭、苏婉清怎么整理装备、顾青云独处时在想什么"+c.substring(end);
    console.log("Rhythm replaced at",idx);
  }
}

// 2. Replace character descriptions  
const c1="林夜：能力";
const i1=c.indexOf(c1);
if(i1>=0){
  const e1=c.indexOf("\n- 苏婉清",i1);
  if(e1>0){
    c=c.substring(0,i1)+"林夜：不是圣人。他有脾气但压着，有恐惧但不逃。说话短，有时候太短了让人误会。对自己狠，对敌人更狠。但面对苏婉清不一样——那是他唯一不设防的人"+c.substring(e1);
    console.log("Lin Ye replaced");
  }
}

const c2="苏婉清：能力";
const i2=c.indexOf(c2);
if(i2>=0){
  const e2=c.indexOf("\n- 顾青云",i2);
  if(e2>0){
    c=c.substring(0,i2)+"苏婉清：看起来温柔但所有人都怕她生气。做事周到到令人发指（三年前就准备了安全屋），说话直接，林夜犯傻她会讽刺。她的温柔不是柔弱——是能力太强不用凶"+c.substring(e2);
    console.log("Su Wanqing replaced");
  }
}

const c3="顾青云：能力";
const i3=c.indexOf(c3);
if(i3>=0){
  const e3=c.indexOf("\n\n【写作原则】",i3);
  if(e3<0){ const e4=c.indexOf("\n\n`",i3+50); if(e4>0) e3_used=e4; }
  let e3_end = c.indexOf("\n\n", i3+100);
  if(e3_end>0){
    c=c.substring(0,i3)+"顾青云：不是疯批反派。穿白西装喝红酒，说话有礼貌，做事有原则——只是他的原则和别人不一样。三年前的事他认为是对的。他和林夜之间不是单纯仇恨，是都回不去了。他独处时会看一张旧照片"+c.substring(e3_end);
    console.log("Gu Qingyun replaced");
  }
}

fs.writeFileSync(p, c, "utf-8");
console.log("Done:",c.length);