'use strict';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatTime = (seconds) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}` : '—:—';
const tracks = [
  { id:'midnight-drift', title:'Midnight Drift', artist:'Wavelength Studio', album:'After Hours', mood:'chill', duration:48, art:'after-hours' },
  { id:'golden', title:'Golden', artist:'Wavelength Studio', album:'Daylight', mood:'upbeat', duration:48, art:'golden' },
  { id:'somewhere-slow', title:'Somewhere Slow', artist:'Wavelength Studio', album:'Soft Focus', mood:'focus', duration:48, art:'somewhere-slow' },
  { id:'ocean-drive', title:'Ocean Drive', artist:'Wavelength Studio', album:'Blue Hour', mood:'chill', duration:48, art:'ocean-drive' },
  { id:'sunday-kind-of-love', title:'Sunday Kind of Love', artist:'Wavelength Studio', album:'Sunday Morning', mood:'chill', duration:48, art:'sunday' },
  { id:'stay-a-little-longer', title:'Stay a Little Longer', artist:'Wavelength Studio', album:'Night Light', mood:'focus', duration:48, art:'night-light' }
].map(track => ({...track, src:`assets/${track.id}.wav`, art:`assets/${track.art}.svg`}));
const originalIds = new Set(tracks.map(track => track.id));
function readSaved(){try{return JSON.parse(localStorage.getItem('wavelength-v1')) || {}}catch{return {}}}
const saved = readSaved();
const liked = new Set(Array.isArray(saved.liked) ? saved.liked.filter(id=>originalIds.has(id)) : []);
const playlists = Array.isArray(saved.playlists) ? saved.playlists.filter(p=>p && typeof p.name==='string' && typeof p.id==='string' && p.id.startsWith('custom-') && Array.isArray(p.tracks)).map(p=>({...p,tracks:p.tracks.filter(id=>originalIds.has(id))})) : [];
const builtins = [
  {id:'after-hours',name:'After hours',color:'#c2a36c',tracks:tracks.map(t=>t.id)},
  {id:'soft-focus',name:'Soft focus',color:'#8b9e91',tracks:tracks.filter(t=>t.mood==='focus').map(t=>t.id)},
  {id:'golden-hour',name:'Golden hour',color:'#c98668',tracks:tracks.filter(t=>t.mood==='upbeat').map(t=>t.id)}
];
const audio = $('#audio');
let currentId = tracks[0].id, view = 'discover', filter = 'all', query = '';
let queue = tracks.map(t=>t.id), naturalQueue = [...queue];
let shuffle = false, repeat = ['off','all','one'].includes(saved.repeat) ? saved.repeat : 'off';
let autoplay = typeof saved.autoplay === 'boolean' ? saved.autoplay : true;
let desiredPlayback = false, playRequest = 0, toastTimeout, pendingAdd = null;
let lastVolume = typeof saved.volume==='number' && saved.volume>0 && saved.volume<=1 ? saved.volume : .7;
audio.volume = typeof saved.volume==='number' && saved.volume>=0 && saved.volume<=1 ? saved.volume : .7;
function persist(){try{localStorage.setItem('wavelength-v1',JSON.stringify({liked:[...liked].filter(id=>originalIds.has(id)),playlists:playlists.map(p=>({...p,tracks:p.tracks.filter(id=>originalIds.has(id))})),volume:audio.volume,repeat,autoplay}))}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function currentTrack(){return tracks.find(t=>t.id===currentId)}
function trackById(id){return tracks.find(t=>t.id===id)}
function visibleTracks(){let list=tracks;if(view==='liked')list=list.filter(t=>liked.has(t.id));else{const playlist=[...builtins,...playlists].find(p=>p.id===view);if(playlist)list=playlist.tracks.map(trackById).filter(Boolean)}return list.filter(t=>(filter==='all'||t.mood===filter)&&`${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(query))}
function renderPlaylists(){
  $('#playlist-nav').innerHTML=[...builtins,...playlists].map(p=>`<button class="playlist-link ${view===p.id?'active':''}" data-playlist="${escapeHTML(p.id)}" ${view===p.id?'aria-current="page"':''}><span class="playlist-dot" style="--dot:${p.color||'#99ac86'}"></span><span class="playlist-name">${escapeHTML(p.name)}</span></button>`).join('');
  const shelf=$('#library-playlists');
  if(shelf){shelf.hidden=view!=='library';shelf.innerHTML=[...builtins,...playlists].map(p=>`<button class="secondary-btn" data-playlist="${escapeHTML(p.id)}">${icon('library')}${escapeHTML(p.name)}<span class="muted">${p.tracks.length}</span></button>`).join('')}
}
function renderTracks(){
  const list=visibleTracks();
  $('#tracks').innerHTML=list.map((t,index)=>`<div class="track-row ${t.id===currentId?'current':''}" role="row" ${t.id===currentId?'aria-current="true"':''}>
    <div role="cell"><button class="track-number" data-play="${escapeHTML(t.id)}" aria-label="${t.id===currentId&&!audio.paused?'Pause':'Play'} ${escapeHTML(t.title)}">${t.id===currentId?(!audio.paused?'<span class="playing-bars"><i></i><i></i><i></i></span>':icon('play')):String(index+1).padStart(2,'0')}</button></div>
    <div role="cell"><button class="track-main" data-play="${escapeHTML(t.id)}" aria-label="Play ${escapeHTML(t.title)} by ${escapeHTML(t.artist)}"><img src="${t.art}" alt=""><span class="track-meta"><span class="track-title">${escapeHTML(t.title)}</span><span class="track-artist">${escapeHTML(t.artist)}</span></span></button></div>
    <span class="track-album" role="cell">${escapeHTML(t.album)}</span><span class="track-duration" role="cell">${formatTime(t.duration)}</span><div class="track-actions" role="cell"><button class="icon-btn ${liked.has(t.id)?'liked':''}" data-like="${escapeHTML(t.id)}" aria-label="${liked.has(t.id)?'Unlike':'Like'} ${escapeHTML(t.title)}" aria-pressed="${liked.has(t.id)}">${icon('heart')}</button><button class="icon-btn" data-add="${escapeHTML(t.id)}" aria-label="Add ${escapeHTML(t.title)} to playlist" title="Add to playlist">${icon('plus')}</button></div></div>`).join('');
  $('#track-count').textContent=`${list.length} ${list.length===1?'track':'tracks'}`;
  $('#empty-state').hidden=!!list.length;
  $('#empty-title').textContent=view==='liked'&&!query?'Your favorites start here':'A little quiet in here';
  $('#empty-description').textContent=view==='liked'&&!query?'Tap the heart beside any song to keep it close.':'Try another filter, or add music from your device.';
  $('#liked-count').textContent=liked.size;
}
function renderQueue(){
  const pos=queue.indexOf(currentId);let upcoming=queue.slice(pos+1);
  if(repeat==='all')upcoming=upcoming.concat(queue.slice(0,pos));
  $('#up-next').innerHTML=upcoming.slice(0,2).map(trackById).filter(Boolean).map(t=>`<button class="queue-track" data-queue="${escapeHTML(t.id)}" aria-label="Play ${escapeHTML(t.title)}"><img src="${t.art}" alt=""><div><strong>${escapeHTML(t.title)}</strong><span>${escapeHTML(t.artist)}</span></div>${icon('arrow')}</button>`).join('')||'<p class="local-note">You’ve reached the end of this mix.</p>';
  $('#queue-label').textContent=shuffle?'SHUFFLED':'IN THE MIX';
}
function renderCurrent(){
  const t=currentTrack();
  $('#now-title').textContent=$('#player-title').textContent=t.title;
  $('#now-artist').textContent=$('#player-artist').textContent=t.artist;
  $('#now-art').src=$('#player-art').src=t.art;
  $('#now-art').alt=`${t.album} cover`;
  $('#duration').textContent=formatTime(t.duration);
  $$('.like-current').forEach(b=>{b.classList.toggle('liked',liked.has(t.id));b.setAttribute('aria-pressed',String(liked.has(t.id)));b.setAttribute('aria-label',`${liked.has(t.id)?'Unlike':'Like'} current song`)});
  if('mediaSession' in navigator && 'MediaMetadata' in window)navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:t.album});
  renderTracks();renderQueue();
}
function updatePlayback(){const playing=!audio.paused&&!audio.ended;$('#play').innerHTML=icon(playing?'pause':'play');$('#play').setAttribute('aria-label',playing?'Pause':'Play');document.body.classList.toggle('is-playing',playing);$('#playback-status').textContent=playing?'You’re right where you need to be.':'A moment for yourself.';if('mediaSession' in navigator)navigator.mediaSession.playbackState=playing?'playing':'paused';renderTracks()}
function updateProgress(){const duration=Number.isFinite(audio.duration)?audio.duration:currentTrack().duration;const value=duration?audio.currentTime/duration*1000:0;$('#progress').value=value;$('#progress').style.setProperty('--value',`${value/10}%`);$('#progress').setAttribute('aria-valuetext',`${formatTime(audio.currentTime)} of ${formatTime(duration)}`);$('#elapsed').textContent=formatTime(audio.currentTime);$('#duration').textContent=formatTime(duration)}
async function play(){desiredPlayback=true;const request=++playRequest;try{await audio.play();if(request!==playRequest)return}catch(error){if(request!==playRequest||error.name==='AbortError')return;desiredPlayback=false;toast(error.name==='NotAllowedError'?'Press play to start your music.':'This audio could not play. Try another track or a supported audio file.');updatePlayback()}}
function pause(){desiredPlayback=false;playRequest++;audio.pause();updatePlayback()}
function togglePlay(){if(audio.paused)play();else pause()}
function selectTrack(id,shouldPlay=true){const t=trackById(id);if(!t)return;playRequest++;desiredPlayback=shouldPlay;currentId=id;audio.src=t.src;audio.load();renderCurrent();updateProgress();updatePlayback();if(shouldPlay)play()}
function shuffled(ids){const list=[...ids];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
function setQueue(ids,start){naturalQueue=[...ids];queue=shuffle?[start,...shuffled(ids.filter(id=>id!==start))]:[...ids]}
function next(manual=true){if(!queue.length)return;const pos=queue.indexOf(currentId);if(pos===queue.length-1&&!manual&&repeat!=='all'){desiredPlayback=false;updatePlayback();return}const id=queue[(pos+1)%queue.length];selectTrack(id,manual||desiredPlayback)}
function previous(){if(audio.currentTime>3){audio.currentTime=0;updateProgress();return}const pos=queue.indexOf(currentId);selectTrack(queue[(pos-1+queue.length)%queue.length],true)}
function toggleLike(id){if(liked.has(id))liked.delete(id);else liked.add(id);persist();renderCurrent()}
function setView(nextView){view=nextView;filter='all';query='';$('#search').value='';const names={discover:'Discover',library:'Your library',liked:'Liked songs'};const p=[...builtins,...playlists].find(p=>p.id===view);const title=names[view]||p?.name||'Discover';$('#breadcrumb-view').textContent=title;$('#page-title').innerHTML=view==='discover'?'Find your frequency<span>.</span>':`${escapeHTML(title)}<span>.</span>`;$('.hero').hidden=view!=='discover'&&view!=='after-hours';$('#playlist-title').textContent=view==='liked'?'Close to your heart':p?p.name:'The rotation';$('#playlist-subtitle').textContent=view==='liked'?'The ones you keep coming back to.':p?`${p.tracks.length} tracks, one good feeling.`:view==='library'?'All your sounds, in one place.':'Good music. On repeat.';$$('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'))});renderPlaylists();renderTracks()}
function updateVolume(){const volume=audio.muted?0:audio.volume;$('#volume').value=volume;$('#volume').style.setProperty('--value',`${volume*100}%`);$('#volume-value').textContent=`${Math.round(volume*100)}%`;$('#mute').innerHTML=icon(volume===0?'mute':'volume');$('#mute').setAttribute('aria-label',volume===0?'Unmute':'Mute');$('#volume').setAttribute('aria-valuetext',`${Math.round(volume*100)} percent`)}
function toggleMute(){if(audio.muted||audio.volume===0){audio.muted=false;audio.volume=lastVolume}else{lastVolume=audio.volume;audio.muted=true}updateVolume()}
function updateRepeat(){$('#repeat').classList.toggle('active',repeat!=='off');$('#repeat').setAttribute('aria-pressed',String(repeat!=='off'));$('#repeat').setAttribute('aria-label',`Repeat ${repeat}`);$('#repeat').title=`Repeat: ${repeat}`;$('#repeat-one').hidden=repeat!=='one';renderQueue()}
function updateAutoplay(){$('#autoplay').classList.toggle('on',autoplay);$('#autoplay').setAttribute('aria-checked',String(autoplay));$('#autoplay-mobile').setAttribute('aria-pressed',String(autoplay));$('#autoplay-mobile span').textContent=autoplay?'on':'off'}
function openCreate(){ $('#playlist-name').value='';$('#playlist-dialog').showModal();$('#playlist-name').focus() }
function openAdd(id){pendingAdd=id;$('#playlist-choices').innerHTML=playlists.map(p=>`<button class="playlist-choice" data-add-to="${escapeHTML(p.id)}">${icon('library')}<span>${escapeHTML(p.name)}</span>${p.tracks.includes(id)?'<span class="muted">Added</span>':''}</button>`).join('')+`<button class="playlist-choice" id="create-from-add">${icon('plus')}Create a playlist</button>`;$('#add-dialog').showModal()}
$('#play').addEventListener('click',togglePlay);$('#next').addEventListener('click',()=>next());$('#previous').addEventListener('click',previous);
$('#play-mix').addEventListener('click',()=>{setQueue(builtins[0].tracks,tracks[0].id);selectTrack(tracks[0].id)});
$('#progress').addEventListener('input',()=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number($('#progress').value)/1000*audio.duration;updateProgress()}});
$('#volume').addEventListener('input',()=>{audio.muted=false;audio.volume=Number($('#volume').value);if(audio.volume>0)lastVolume=audio.volume;updateVolume();persist()});
$('#mute').addEventListener('click',toggleMute);
$('#shuffle').addEventListener('click',()=>{shuffle=!shuffle;queue=shuffle?[currentId,...shuffled(naturalQueue.filter(id=>id!==currentId))]:[...naturalQueue];$('#shuffle').classList.toggle('active',shuffle);$('#shuffle').setAttribute('aria-pressed',String(shuffle));renderQueue();toast(shuffle?'Shuffle is on. A new way through your mix.':'Shuffle is off.')});
$('#repeat').addEventListener('click',()=>{repeat=repeat==='off'?'all':repeat==='all'?'one':'off';updateRepeat();persist();toast(`Repeat ${repeat==='one'?'this song':repeat==='all'?'the playlist':'off'}`)});
$('#autoplay').addEventListener('click',()=>{autoplay=!autoplay;updateAutoplay();persist()});
$('#autoplay-mobile').addEventListener('click',()=>{autoplay=!autoplay;updateAutoplay();persist()});
$$('.like-current').forEach(button=>button.addEventListener('click',()=>toggleLike(currentId)));
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderTracks()}));
$('#search').addEventListener('input',()=>{query=$('#search').value.toLowerCase().trim();renderTracks()});
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.play){if(b.dataset.play===currentId)togglePlay();else{setQueue(visibleTracks().map(t=>t.id),b.dataset.play);selectTrack(b.dataset.play)}}if(b.dataset.queue)selectTrack(b.dataset.queue);if(b.dataset.like)toggleLike(b.dataset.like);if(b.dataset.add)openAdd(b.dataset.add);if(b.dataset.playlist)setView(b.dataset.playlist);if(b.dataset.addTo){const p=playlists.find(p=>p.id===b.dataset.addTo);if(p&&pendingAdd&&!p.tracks.includes(pendingAdd)){p.tracks.push(pendingAdd);persist();renderPlaylists();renderTracks();toast(`Added to ${p.name}`)}else toast('This song is already in that playlist.');$('#add-dialog').close();pendingAdd=null}if(b.id==='create-from-add'){$('#add-dialog').close();openCreate()}});
$('#new-playlist').addEventListener('click',()=>{pendingAdd=null;openCreate()});
$('#playlist-form').addEventListener('submit',event=>{event.preventDefault();const name=$('#playlist-name').value.trim();if(!name){$('#playlist-name').setCustomValidity('Give your playlist a name.');$('#playlist-name').reportValidity();return}const playlist={id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,tracks:pendingAdd?[pendingAdd]:[]};playlists.push(playlist);persist();$('#playlist-dialog').close();pendingAdd=null;setView(playlist.id);toast(`“${name}” is ready. Use + beside a song to add it.`)});
$('#playlist-name').addEventListener('input',()=>$('#playlist-name').setCustomValidity(''));
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}}));
$('#shortcuts-open').addEventListener('click',()=>$('#shortcuts-dialog').showModal());
$('#add-music').addEventListener('click',()=>$('#file-input').click());
$('#file-input').addEventListener('change',()=>{
  const files=[...$('#file-input').files];let added=0;
  for(const file of files){if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name))continue;const base=file.name.replace(/\.[^.]+$/,'');const split=base.indexOf(' - ');const track={id:`local-${Date.now()}-${Math.random().toString(36).slice(2)}`,title:split>-1?base.slice(split+3):base,artist:split>-1?base.slice(0,split):'Your collection',album:'From your device',mood:'local',duration:NaN,art:'assets/local.svg',src:URL.createObjectURL(file),local:true};tracks.push(track);added++;const metadata=new Audio();metadata.preload='metadata';metadata.src=track.src;metadata.addEventListener('loadedmetadata',()=>{track.duration=metadata.duration;renderTracks();metadata.removeAttribute('src');metadata.load()},{once:true});metadata.addEventListener('error',()=>{toast(`Could not read “${track.title}”. Your browser may not support this file.`);metadata.removeAttribute('src');metadata.load()},{once:true})}
  if(added){setView('library');toast(`${added} ${added===1?'song added':'songs added'}. Local files stay available until you close this page.`)}else toast('Choose an audio file such as MP3, WAV, or OGG.');$('#file-input').value='';
});
audio.addEventListener('timeupdate',updateProgress);
audio.addEventListener('loadedmetadata',()=>{if(Number.isFinite(audio.duration)){currentTrack().duration=audio.duration;renderTracks();updateProgress()}});
audio.addEventListener('play',updatePlayback);audio.addEventListener('pause',updatePlayback);audio.addEventListener('volumechange',updateVolume);
audio.addEventListener('ended',()=>{if(repeat==='one'){audio.currentTime=0;play()}else if(autoplay){next(false)}else{desiredPlayback=false;updatePlayback()}});
audio.addEventListener('waiting',()=>{if(desiredPlayback)$('#playback-status').textContent='Finding your frequency…'});
audio.addEventListener('playing',updatePlayback);
audio.addEventListener('error',()=>{desiredPlayback=false;updatePlayback();toast('This track is unavailable. Try the next song or add your own music.')});
document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||event.target.matches('input,textarea,select,[contenteditable]')||$('dialog[open]'))return;if(event.code==='Space'&&!event.target.closest('button,a')){event.preventDefault();togglePlay()}else if(event.key==='ArrowRight'){event.preventDefault();next()}else if(event.key==='ArrowLeft'){event.preventDefault();previous()}else if(event.key.toLowerCase()==='m')toggleMute();else if(event.key==='/'){event.preventDefault();$('#search').focus()}else if(event.key==='?')$('#shortcuts-dialog').showModal()});
if('mediaSession' in navigator){for(const [action,handler] of Object.entries({play,pause,previoustrack:previous,nexttrack:()=>next(),seekbackward:()=>{audio.currentTime=Math.max(0,audio.currentTime-10)},seekforward:()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+10)},seekto:details=>{if(Number.isFinite(details.seekTime))audio.currentTime=details.seekTime}})){try{navigator.mediaSession.setActionHandler(action,handler)}catch{}}}
window.addEventListener('beforeunload',()=>tracks.filter(t=>t.local).forEach(t=>URL.revokeObjectURL(t.src)));
const shelf=document.createElement('div');shelf.id='library-playlists';shelf.hidden=true;$('.list-toolbar').before(shelf);
const createButton=document.createElement('button');createButton.className='secondary-btn';createButton.innerHTML=icon('library');createButton.setAttribute('aria-label','Create playlist');createButton.title='Create playlist';createButton.addEventListener('click',()=>{pendingAdd=null;openCreate()});$('.playlist-actions').prepend(createButton);
renderPlaylists();renderCurrent();updateVolume();updateRepeat();updateAutoplay();updateProgress();
