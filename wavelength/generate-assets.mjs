import fs from 'node:fs';
import path from 'node:path';
const destination=path.join(import.meta.dirname,'dist','assets');
fs.mkdirSync(destination,{recursive:true});
const grain=`<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".16"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>`;
const covers=[
  {name:'after-hours',bg:'#56716b',sun:'#edc284',a:'#224d48',b:'#143b37',c:'#102c29',title:'AFTER',line:'HOURS',num:'001',shape:'landscape'},
  {name:'golden',bg:'#d5a66b',sun:'#f1d89d',a:'#bf8156',b:'#9a5940',c:'#673e32',title:'GOLDEN',line:'HOUR',num:'002',shape:'sun'},
  {name:'somewhere-slow',bg:'#a8b09c',sun:'#e2dfbb',a:'#859981',b:'#5f7767',c:'#42594e',title:'SOFT',line:'FOCUS',num:'003',shape:'arches'},
  {name:'ocean-drive',bg:'#719297',sun:'#d5d6af',a:'#426f77',b:'#2a5660',c:'#193c49',title:'BLUE',line:'HOUR',num:'004',shape:'waves'},
  {name:'sunday',bg:'#c3947c',sun:'#ead1a3',a:'#b1715c',b:'#985a4a',c:'#693f37',title:'SUNDAY',line:'MORNING',num:'005',shape:'window'},
  {name:'night-light',bg:'#6c717b',sun:'#d2bc89',a:'#4b5263',b:'#353b4d',c:'#232936',title:'NIGHT',line:'LIGHT',num:'006',shape:'landscape'},
  {name:'local',bg:'#7d8971',sun:'#dfcc99',a:'#596b56',b:'#3e523f',c:'#2a3a2d',title:'YOUR',line:'SOUNDS',num:'∞',shape:'arches'}
];
for(const c of covers){
 let shapes='';
 if(c.shape==='landscape')shapes=`<circle cx="405" cy="225" r="112" fill="${c.sun}"/><path d="M0 335 130 280 225 328 330 295 460 363 600 294V600H0Z" fill="${c.a}"/><path d="M0 420 135 346 260 410 388 340 600 434V600H0Z" fill="${c.b}"/><path d="M0 505Q200 390 390 470T600 445V600H0Z" fill="${c.c}"/><path d="m365 600-75-70 70-39-76-37" fill="none" stroke="${c.sun}" stroke-opacity=".25" stroke-width="3"/>`;
 if(c.shape==='sun')shapes=`<circle cx="300" cy="265" r="186" fill="${c.sun}"/><path d="M0 350Q140 290 300 350T600 350V600H0Z" fill="${c.a}"/><path d="M0 406Q180 345 360 410T600 430V600H0Z" fill="${c.b}"/><path d="M0 520Q170 410 360 500T600 520V600H0Z" fill="${c.c}"/>`;
 if(c.shape==='arches')shapes=`<path d="M75 600V300a225 225 0 0 1 450 0v300" fill="${c.a}"/><path d="M125 600V300a175 175 0 0 1 350 0v300" fill="${c.b}"/><path d="M175 600V300a125 125 0 0 1 250 0v300" fill="${c.c}"/><path d="M225 600V300a75 75 0 0 1 150 0v300" fill="${c.sun}"/><path d="M225 390h150M225 420h150M225 450h150M225 480h150M225 510h150M225 540h150M225 570h150" stroke="${c.c}" stroke-width="3" opacity=".3"/>`;
 if(c.shape==='waves')shapes=`<circle cx="410" cy="200" r="90" fill="${c.sun}"/><path d="M0 290Q150 210 300 300T600 290V600H0Z" fill="${c.a}"/><path d="M0 380Q150 300 300 390T600 380V600H0Z" fill="${c.b}"/><path d="M0 470Q150 390 300 480T600 470V600H0Z" fill="${c.c}"/><path d="M0 490Q150 410 300 500T600 490M0 510Q150 430 300 520T600 510M0 530Q150 450 300 540T600 530" stroke="${c.sun}" stroke-width="1" fill="none" opacity=".25"/>`;
 if(c.shape==='window')shapes=`<path d="M120 550V260a180 180 0 0 1 360 0v290Z" fill="${c.sun}"/><circle cx="390" cy="275" r="82" fill="${c.a}"/><path d="M120 435Q250 300 480 400V550H120Z" fill="${c.b}"/><path d="M120 510Q350 390 480 455V550H120Z" fill="${c.c}"/><path d="M300 80v470M120 330h360" stroke="${c.bg}" stroke-width="14"/>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs>${grain}<linearGradient id="light" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs><g filter="url(#grain)"><path fill="${c.bg}" d="M0 0h600v600H0z"/>${shapes}<path fill="url(#light)" d="M0 0h600v600H0z"/></g><g fill="#f6efda" font-family="Arial,sans-serif"><text x="39" y="45" font-size="10" letter-spacing="3">WAVELENGTH / ORIGINAL SESSIONS</text><text x="38" y="112" font-size="48" letter-spacing="6" font-weight="300">${c.title}</text><text x="39" y="165" font-size="48" letter-spacing="6" font-weight="300">${c.line}</text><text x="39" y="563" font-size="9" letter-spacing="2">A LITTLE SPACE TO GET LOST.</text><text x="550" y="563" font-size="10" text-anchor="end">WL—${c.num}</text></g><rect x="18" y="18" width="564" height="564" stroke="#f6efda" stroke-opacity=".16" fill="none"/></svg>`;
 fs.writeFileSync(path.join(destination,`${c.name}.svg`),svg);
}
fs.writeFileSync(path.join(destination,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1c251c"/><g stroke="#e8bb66" stroke-width="5" stroke-linecap="round"><path d="M17 25v14M27 15v34M37 20v24M47 28v8"/></g></svg>');
const sampleRate=22050, seconds=48, length=sampleRate*seconds;
const songs=[
 {id:'midnight-drift',root:45,chords:[0,5,3,7],seed:1,pace:1,brightness:.35},
 {id:'golden',root:48,chords:[0,7,9,5],seed:2,pace:2,brightness:.8,major:true},
 {id:'somewhere-slow',root:50,chords:[0,3,7,5],seed:3,pace:.5,brightness:.2},
 {id:'ocean-drive',root:43,chords:[0,5,7,3],seed:4,pace:1,brightness:.5},
 {id:'sunday-kind-of-love',root:48,chords:[0,5,9,7],seed:5,pace:1,brightness:.4,major:true},
 {id:'stay-a-little-longer',root:47,chords:[0,3,5,7],seed:6,pace:.5,brightness:.3}
];
const freq=midi=>440*2**((midi-69)/12),tau=Math.PI*2;
for(const song of songs){
 const data=new Float32Array(length);let random=12345+song.seed*84637;
 const rand=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296*2-1};
 const scale=song.major?[0,2,4,7,9,12,14,16]:[0,3,5,7,10,12,15,17];
 for(let i=0;i<length;i++){
  const t=i/sampleRate,beat=t/.75,bar=Math.floor(beat/4),chord=song.root+song.chords[Math.floor(bar/2)%4];
  const chordTime=t%6;const chordEnv=Math.min(1,chordTime/1.1)*Math.min(1,(6-chordTime)/1.3);
  let signal=0;
  for(const offset of [0,song.major?4:3,7,14]){const f=freq(chord+offset+12);signal+=(Math.sin(tau*f*t)+.22*Math.sin(tau*f*1.002*t))*.035*chordEnv}
  const bassTime=t%1.5;signal+=Math.sin(tau*freq(chord)*t)*.14*Math.exp(-bassTime*2.3)*Math.min(1,bassTime/.025);
  const stepDuration=.75/song.pace,step=Math.floor(t/stepDuration),noteTime=t%stepDuration;
  const note=scale[(step*3+Math.floor(step/8)+song.seed)%scale.length];const f=freq(song.root+24+note);
  const noteEnv=(1-Math.exp(-noteTime*100))*Math.exp(-noteTime*(3.8+song.pace));
  signal+=(Math.sin(tau*f*t)+song.brightness*.3*Math.sin(tau*f*2*t)+.08*Math.sin(tau*f*3*t))*noteEnv*.12;
  if(t>3&&t<45){const kick=t%1.5;signal+=Math.sin(tau*(45*kick+5*(1-Math.exp(-kick*30))))*Math.exp(-kick*17)*.22;const hat=t%.375;signal+=rand()*Math.exp(-hat*100)*.024;const snare=(t+.75)%1.5;signal+=rand()*Math.exp(-snare*32)*.035}
  const fade=Math.min(1,t/2,(seconds-t)/3);data[i]=signal*fade;
 }
 const delay=Math.floor(sampleRate*.375);let peak=0;
 for(let i=0;i<length;i++){if(i>delay)data[i]+=data[i-delay]*.23;peak=Math.max(peak,Math.abs(data[i]))}
 const wav=Buffer.alloc(44+length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(sampleRate,24);wav.writeUInt32LE(sampleRate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(length*2,40);
 for(let i=0;i<length;i++)wav.writeInt16LE(Math.round(data[i]/peak*.7*32767),44+i*2);
 fs.writeFileSync(path.join(destination,`${song.id}.wav`),wav);
}
console.log('Created seven original covers, a favicon, and six 48-second instrumental demos.');
