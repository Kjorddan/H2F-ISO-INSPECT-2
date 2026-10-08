// O TAG permanece contido no diâmetro útil do balão, inclusive siglas longas.
export function instrumentTagLayout(value,maxWidth=36){
 const text=String(value??'').trim().toUpperCase().replace(/\s+/g,' ');
 if(!text)return{lines:['I'],fontSize:10};
 let lines=[text];
 if(text.length>7){const cut=text.lastIndexOf('-',Math.floor(text.length*.65));if(cut>1&&cut<text.length-1)lines=[text.slice(0,cut),text.slice(cut+1)];else lines=[text.slice(0,Math.ceil(text.length/2)),text.slice(Math.ceil(text.length/2))];}
 const longest=Math.max(...lines.map(l=>l.length));const fontSize=Math.max(5,Math.min(10,Math.floor(maxWidth/Math.max(1,longest*.64))));
 return{lines,fontSize,requiresCompression:longest*fontSize*.64>maxWidth};
}
