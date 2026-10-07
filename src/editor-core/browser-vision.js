import {binarize,detectLineCandidates} from './vision-pipeline.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function loadImage(source){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('Não foi possível rasterizar a imagem de referência'));
    img.src=source;
  });
}

function grayscale(imageData){
  const src=imageData.data,out=new Array(imageData.width*imageData.height);
  for(let i=0,j=0;i<src.length;i+=4,j++)out[j]=Math.round(src[i]*.299+src[i+1]*.587+src[i+2]*.114);
  return out;
}

function drawLineMask(mask,w,h,l,radius=1){
  let x0=Math.round(l.x1),y0=Math.round(l.y1),x1=Math.round(l.x2),y1=Math.round(l.y2);
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
  let err=dx+dy;
  while(true){
    for(let yy=y0-radius;yy<=y0+radius;yy++)for(let xx=x0-radius;xx<=x0+radius;xx++)if(xx>=0&&xx<w&&yy>=0&&yy<h)mask[yy*w+xx]=0;
    if(x0===x1&&y0===y1)break;
    const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}
  }
}

export function detectSymbolRegions(binary,lines=[],opts={}){
  const {width:w,height:h}=binary;
  const data=Uint8Array.from(binary.data);
  const suppressMin=opts.suppressMin||Math.max(40,Math.min(w,h)*.16);
  for(const l of lines)if(l.length>=suppressMin)drawLineMask(data,w,h,l,1);

  const seen=new Uint8Array(data.length),regions=[];
  const minPixels=opts.minPixels||18,maxPixels=opts.maxPixels||Math.max(2000,Math.round(w*h*.025));
  const stack=[];
  const neighbors=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const idx=y*w+x;if(!data[idx]||seen[idx])continue;
    seen[idx]=1;stack.length=0;stack.push(idx);
    let count=0,minX=x,maxX=x,minY=y,maxY=y;
    while(stack.length){
      const p=stack.pop(),py=Math.floor(p/w),px=p-py*w;count++;
      if(px<minX)minX=px;if(px>maxX)maxX=px;if(py<minY)minY=py;if(py>maxY)maxY=py;
      if(count>maxPixels)continue;
      for(const[dX,dY]of neighbors){const nx=px+dX,ny=py+dY;if(nx<0||ny<0||nx>=w||ny>=h)continue;const ni=ny*w+nx;if(data[ni]&&!seen[ni]){seen[ni]=1;stack.push(ni)}}
    }
    if(count<minPixels||count>maxPixels)continue;
    const bw=maxX-minX+1,bh=maxY-minY+1;
    if(bw<5||bh<5||bw>Math.min(240,w*.35)||bh>Math.min(180,h*.35))continue;
    const density=count/(bw*bh),aspect=bw/bh,roundness=Math.min(bw,bh)/Math.max(bw,bh);
    let familyHint='';
    if(bw>=12&&bh>=8&&aspect>=1.15&&aspect<=3.2&&density>=.06&&density<=.7)familyHint='valve';
    else if(bw>=10&&bh>=10&&roundness>.72&&density>.16)familyHint='instrument';
    if(!familyHint)continue;
    regions.push({
      id:`REG-${regions.length+1}`,
      bbox:{x:minX,y:minY,width:bw,height:bh},
      pixels:count,
      confidence:clamp(.45+density*.35+.12*roundness,0,0.86),
      features:{aspect,ports:familyHint==='valve'?2:0,circularity:roundness*clamp(density*1.8,0,1),familyHint}
    });
  }
  return regions.sort((a,b)=>b.pixels-a.pixels).slice(0,16);
}

async function runPortugueseOcr(canvas,{logger}={}){
  const {createWorker}=await import('tesseract.js');
  const base=new URL('/tesseract/',globalThis.location.href).href.replace(/\/$/,'');
  const worker=await createWorker('por',1,{
    workerPath:`${base}/worker.min.js`,
    corePath:`${base}/core`,
    langPath:`${base}/lang`,
    logger
  });
  try{
    const ret=await worker.recognize(canvas,{}, {text:true});
    const text=String(ret?.data?.text||'').trim();
    const confidence=clamp(Number(ret?.data?.confidence||0)/100,0,1);
    return text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,80).map((line,i)=>({
      id:`OCR-${i+1}`,text:line,confidence:confidence||.5,bbox:null,alternatives:[]
    }));
  }finally{
    await worker.terminate();
  }
}

export async function analyzeUnderlayRaster(underlay,{maxDimension=1400,ocr=true,logger}={}){
  if(!underlay?.source)throw new Error('Referência sem fonte rasterizável');
  if(underlay.mimeType==='application/pdf')throw new Error('PDF requer rasterização de página antes da análise no navegador');
  const img=await loadImage(underlay.source);
  const naturalW=img.naturalWidth||img.width,naturalH=img.naturalHeight||img.height;
  if(!naturalW||!naturalH)throw new Error('Imagem sem dimensões válidas');
  const scale=Math.min(1,maxDimension/Math.max(naturalW,naturalH));
  const width=Math.max(1,Math.round(naturalW*scale)),height=Math.max(1,Math.round(naturalH*scale));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
  const imgData=ctx.getImageData(0,0,width,height),gray=grayscale(imgData);
  const binary=binarize(gray,width,height);
  const rawLines=detectLineCandidates(binary,{minLength:Math.max(18,Math.round(Math.min(width,height)*.055)),maxGap:2,mergeTolerance:3}).slice(0,240);
  const rawRegions=detectSymbolRegions(binary,rawLines);
  const targetW=(underlay.width||naturalW)*(underlay.scale||1),targetH=(underlay.height||naturalH)*(underlay.scale||1);
  const sx=targetW/width,sy=targetH/height,ox=underlay.x||0,oy=underlay.y||0;
  const lines=rawLines.map((l,i)=>({...l,id:`LINE-${i+1}`,x1:ox+l.x1*sx,y1:oy+l.y1*sy,x2:ox+l.x2*sx,y2:oy+l.y2*sy,length:Math.hypot((l.x2-l.x1)*sx,(l.y2-l.y1)*sy),source:'CV-BROWSER'}));
  const regions=rawRegions.map((r,i)=>({...r,id:`REG-${i+1}`,bbox:{x:ox+r.bbox.x*sx,y:oy+r.bbox.y*sy,width:r.bbox.width*sx,height:r.bbox.height*sy},source:'CV-BROWSER'}));
  let ocrTokens=[],warnings=[];
  if(ocr){
    try{ocrTokens=await runPortugueseOcr(canvas,{logger})}
    catch(err){warnings.push('OCR local indisponível: '+String(err?.message||err))}
  }
  return{
    lines,
    ocr:ocrTokens,
    regions,
    warnings,
    metrics:{width,height,threshold:binary.threshold,lineCount:lines.length,regionCount:regions.length,ocrCount:ocrTokens.length},
    source:{naturalWidth:naturalW,naturalHeight:naturalH}
  };
}
