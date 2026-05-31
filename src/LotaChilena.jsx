import { useState, useCallback, useRef, useEffect } from "react";
import { supabase, supaToPlayer, supaToGame, normalizeName, isOnline } from './supabase.js';

/* ═══════════════════════════════════════════════════════════════
   LOTA CHILENA 🎱 — Chilean Family Bingo
   Full-featured prototype — architecture ready for Supabase
═══════════════════════════════════════════════════════════════ */

// How many past numbers non-MC players see (0 = none, 3 = default, 6 = max sensible)
const VISIBLE_LAST_CALLS = 3;

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
const CARTONES = [
  {id:1,rows:[[4,0,21,0,44,56,0,72,0],[0,12,0,33,0,58,64,0,85],[8,0,27,39,49,0,0,78,0]]},
  {id:2,rows:[[2,11,0,31,0,0,62,70,0],[0,15,23,0,45,51,0,0,82],[7,0,0,36,0,55,69,75,0]]},
  {id:3,rows:[[5,0,22,0,41,0,60,0,88],[0,18,26,34,0,52,0,77,0],[9,13,0,0,47,59,66,0,0]]},
  {id:4,rows:[[1,0,20,30,0,50,0,71,0],[0,14,0,35,42,0,65,0,81],[6,17,28,0,0,54,0,79,0]]},
  {id:5,rows:[[3,10,0,0,40,53,61,0,0],[0,16,24,32,0,0,0,73,89],[0,19,29,38,46,0,67,0,0]]},
  {id:6,rows:[[4,0,22,0,48,55,0,76,0],[0,12,0,34,0,51,63,0,84],[9,15,26,0,40,0,0,70,0]]},
  {id:7,rows:[[2,11,0,37,43,0,68,0,0],[0,18,25,0,0,57,0,74,90],[5,0,0,31,46,52,60,0,0]]},
  {id:8,rows:[[8,0,21,35,0,50,0,72,0],[0,13,0,0,44,59,66,79,0],[1,16,29,39,0,0,0,0,82]]},
  {id:9,rows:[[6,10,0,30,45,0,61,0,0],[0,19,24,0,0,54,0,75,87],[3,0,28,38,49,58,0,0,0]]},
  {id:10,rows:[[7,0,23,0,41,0,65,78,0],[0,14,0,33,47,53,0,0,81],[5,17,27,36,0,0,69,0,0]]},
  {id:11,rows:[[1,0,20,32,0,56,62,0,0],[0,15,25,34,48,0,0,71,0],[9,0,0,0,42,55,67,77,0]]},
  {id:12,rows:[[3,11,24,0,44,0,0,73,0],[0,12,0,38,0,50,60,0,86],[8,0,21,0,49,57,0,79,0]]},
  {id:13,rows:[[5,18,0,35,40,0,64,0,0],[0,0,29,0,43,58,0,76,88],[4,16,22,31,0,0,61,0,0]]},
  {id:14,rows:[[2,0,28,0,46,52,0,70,0],[0,14,0,39,0,54,69,0,83],[7,10,26,33,41,0,0,0,0]]},
  {id:15,rows:[[9,13,0,30,0,51,63,0,0],[0,17,23,0,45,0,0,74,85],[6,0,27,37,42,0,68,0,0]]},
  {id:16,rows:[[4,15,20,0,47,0,60,0,0],[0,0,25,34,0,59,66,72,0],[1,19,0,0,49,53,0,0,89]]},
  {id:17,rows:[[8,0,21,32,0,55,0,75,0],[0,11,29,0,44,0,61,0,82],[3,16,0,36,40,0,67,0,0]]},
  {id:18,rows:[[5,12,0,0,48,50,65,0,0],[0,18,22,38,0,57,0,77,0],[9,0,24,33,43,0,0,0,90]]},
  {id:19,rows:[[2,0,27,31,41,0,62,0,0],[0,14,26,0,0,56,0,73,84],[7,10,0,35,45,52,0,0,0]]},
  {id:20,rows:[[6,17,23,0,0,54,0,79,0],[0,0,0,39,42,58,69,0,88],[4,13,28,30,46,0,0,0,0]]},
  {id:21,rows:[[1,0,25,37,49,0,64,0,0],[0,15,0,0,40,51,63,76,0],[8,11,20,34,0,59,0,0,0]]},
  {id:22,rows:[[3,16,0,32,0,53,0,71,0],[0,19,22,0,47,0,68,0,83],[5,0,29,36,44,55,0,0,0]]},
  {id:23,rows:[[9,12,21,33,0,57,0,0,0],[0,0,27,0,43,0,60,78,86],[2,18,0,38,48,50,0,0,0]]},
  {id:24,rows:[[4,0,24,0,42,52,67,0,0],[0,14,0,31,45,0,0,74,81],[7,10,26,35,0,56,0,0,0]]},
  {id:25,rows:[[6,17,0,39,0,54,66,70,0],[0,13,28,0,41,0,62,0,85],[1,0,23,30,46,58,0,0,0]]},
  {id:26,rows:[[8,15,25,34,0,51,0,0,0],[0,0,0,37,49,0,65,72,89],[5,11,20,0,44,59,0,0,0]]},
  {id:27,rows:[[3,0,22,36,47,0,61,0,0],[0,19,0,0,40,53,0,75,82],[9,16,29,32,0,55,69,0,0]]},
  {id:28,rows:[[2,12,21,33,43,0,0,0,0],[0,18,0,38,0,50,63,77,0],[7,0,27,0,48,57,0,0,87]]},
  {id:29,rows:[[4,14,0,31,0,52,60,0,0],[0,0,26,35,45,56,0,73,0],[1,10,24,0,42,0,0,0,84]]},
  {id:30,rows:[[6,0,28,30,46,0,67,0,0],[0,17,23,39,0,54,0,79,0],[8,13,0,0,41,58,62,0,0]]},
  {id:31,rows:[[5,15,20,37,49,0,0,0,0],[0,11,25,0,0,51,64,76,0],[3,0,0,34,44,59,0,0,81]]},
  {id:32,rows:[[9,19,29,0,47,53,0,0,0],[0,16,0,32,0,55,68,71,0],[7,0,22,36,40,0,61,0,0]]},
  {id:33,rows:[[2,18,27,38,48,0,0,0,0],[0,12,0,33,0,50,65,78,0],[4,0,21,0,43,57,0,0,90]]},
  {id:34,rows:[[6,10,24,35,0,56,0,0,0],[0,14,0,31,45,0,66,74,0],[1,0,26,0,42,52,60,0,0]]},
  {id:35,rows:[[8,13,23,39,46,0,0,0,0],[0,17,0,30,0,54,62,70,0],[3,0,28,0,41,58,67,0,0]]},
  {id:36,rows:[[5,11,25,34,0,59,0,0,0],[0,15,0,37,49,0,63,72,0],[9,0,20,0,44,51,0,76,0]]},
  {id:37,rows:[[7,16,22,32,47,0,0,0,0],[0,19,0,36,0,53,61,75,0],[2,0,29,0,40,55,69,0,0]]},
  {id:38,rows:[[4,12,21,33,43,0,0,0,0],[0,18,0,38,48,57,65,0,0],[8,0,27,0,0,50,0,73,85]]},
  {id:39,rows:[[1,14,26,31,0,52,0,0,0],[0,10,24,0,45,56,68,0,0],[6,0,0,35,42,0,60,77,0]]},
  {id:40,rows:[[9,17,23,30,46,0,0,0,0],[0,13,28,0,0,58,62,79,0],[3,0,0,39,41,54,67,0,0]]},
  {id:41,rows:[[5,15,20,34,44,0,0,0,0],[0,11,25,37,0,51,64,0,0],[7,0,0,0,49,59,63,71,86]]},
  {id:42,rows:[[2,19,29,36,40,0,0,0,0],[0,16,22,0,47,53,61,0,0],[4,0,0,32,0,55,69,75,82]]},
  {id:43,rows:[[8,12,27,33,48,0,0,0,0],[0,18,21,38,0,50,65,0,0],[1,0,0,0,43,57,60,78,88]]},
  {id:44,rows:[[6,14,24,31,42,0,0,0,0],[0,10,26,35,0,52,66,0,0],[9,0,0,0,45,56,62,73,83]]},
  {id:45,rows:[[3,17,23,30,41,0,0,0,0],[0,13,28,39,0,54,67,0,0],[5,0,0,0,46,58,60,70,89]]},
  {id:46,rows:[[7,15,25,37,49,0,0,0,0],[0,11,20,34,0,59,63,0,0],[2,0,0,0,44,51,65,76,81]]},
  {id:47,rows:[[4,19,29,32,47,0,0,0,0],[0,16,22,36,0,53,68,0,0],[8,0,0,0,40,55,61,72,85]]},
  {id:48,rows:[[1,18,21,38,43,0,0,0,0],[0,12,27,33,0,57,60,0,0],[6,0,0,0,48,50,69,77,87]]},
  {id:49,rows:[[9,14,26,35,45,0,0,0,0],[0,10,24,31,0,56,66,0,0],[3,0,0,0,42,52,62,74,90]]},
  {id:50,rows:[[5,17,28,30,46,0,0,0,0],[0,13,23,39,0,58,67,0,0],[7,0,0,0,41,54,60,79,84]]},
];

// fit:'contain' = show full image (no crop); default = 'cover' (circle crop)
const SKINS = [
  {id:'dot',    label:'Clásico',  img:null},
  //{id:'x',      label:'✕',        img:null},
  {id:'poroto', label:'Poroto',   img:'/skins/Poroto1.jpg', fit:'contain'},
  {id:'peso',   label:'$1',       img:'/skins/peso1a.jpg'},
  {id:'pesob',   label:'$1 Bernado',       img:'/skins/Peso1b.jpg'},
  {id:'peso5',  label:'$5',       img:'/skins/peso5a.jpg'},
  {id:'peso5b',  label:'$5 Berardo',       img:'/skins/peso5b.jpg'},
  {id:'lucas',  label:'20 Lucas', img:'/skins/20lucas.jpg', fit:'contain'},
];

const DEMO_PLAYERS = [
  {id:'d1',name:'Caqui',   cartonIdx:1,  skin:'dot'},
  {id:'d2',name:'Karen',   cartonIdx:2,  skin:'bean'},
  {id:'d3',name:'Nana',    cartonIdx:5,  skin:'dot'},
  {id:'d4',name:'Mario P.',cartonIdx:8,  skin:'star'},
  {id:'d5',name:'Marito',  cartonIdx:11, skin:'dot'},
];

const COL_RANGES = ['1-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80-90'];

const INIT_SETTINGS = {apuesta:100,ternaPct:10,lineaPct:25,lotaPct:65,currency:'CLP',soundMode:'default'};
const INIT_PIQUE    = {enabled:false,stake:100,participants:[],active:false,settled:false,winner:null,tied:[]};
const INIT_GAME = {
  status:'idle',
  calledNumbers:[],
  lastDrawn:null,
  prizes:{terna:null,linea:null,lota:null},
  requests:[],
  log:[],
};

// ────────────────────────────────────────────────────────────
// TRANSLATIONS
// ────────────────────────────────────────────────────────────
const TR = {
  tagline:        {es:'El bingo familiar chileno',              en:'The Chilean family bingo'},
  createRoom:     {es:'Crear Sala',                             en:'Create Room'},
  mcRoleDesc:     {es:'Sé el Animador. Canta los números y dirige el juego.', en:'Be the MC. Call numbers and run the game.'},
  join:           {es:'Unirse',                                 en:'Join'},
  joinRoleDesc:   {es:'Entra con el código que te compartió el Animador.', en:'Enter the code shared by the MC.'},
  roomCode:       {es:'Código de sala',                         en:'Room code'},
  yourName:       {es:'Tu nombre',                              en:'Your name'},
  createBtn:      {es:'CREAR SALA →',                          en:'CREATE ROOM →'},
  joinBtn:        {es:'UNIRSE →',                              en:'JOIN →'},
  offlineNote:    {es:'Demo offline · Próximamente multijugador real vía Supabase', en:'Offline demo · Real multiplayer coming via Supabase'},
  playersInRoom:  {es:'Jugadores en sala',                      en:'Players in room'},
  estimatedPot:   {es:'Pozo estimado',                          en:'Estimated pot'},
  gameConfig:     {es:'Configuración del juego',                en:'Game settings'},
  bet:            {es:'Apuesta (CLP)',                          en:'Stake (CLP)'},
  chooseCarton:   {es:'Elige tu Cartón',                        en:'Choose your card'},
  markerSkin:     {es:'Marcador (Skin)',                        en:'Marker (Skin)'},
  soundSettings:  {es:'Sonidos',                                en:'Sounds'},
  classicTones:   {es:'Tonos clásicos',                         en:'Classic tones'},
  chileanSounds:  {es:'Sonidos chilenos',                       en:'Chilean sounds'},
  soundsHint:     {es:'Para sonidos 1–90 coloca archivos 1.mp3…90.mp3 en public/sounds/', en:'For 1–90 sounds add files 1.mp3…90.mp3 in public/sounds/'},
  startGame:      {es:'¡COMENZAR PARTIDA!',                     en:'START GAME!'},
  waitingMC:      {es:'Esperando que el Animador inicie la partida…', en:'Waiting for MC to start…'},
  balances:       {es:'💰 Balances',                            en:'💰 Balances'},
  leaveRoom:      {es:'← Salir',                               en:'← Exit'},
  shareLink:      {es:'📤 Compartir sala',                     en:'📤 Share room'},
  shareCopied:    {es:'✓ ¡Copiado!',                          en:'✓ Copied!'},
  shareText:      {es:'¡Únete a mi sala de Lota! Código:',    en:'Join my Lota room! Code:'},
  lobby:          {es:'Lobby',                                  en:'Lobby'},
  // Pique
  pique:          {es:'El Pique',                               en:'El Pique'},
  piqueDesc:      {es:'Una pequeña apuesta - El primer jugador al que le caiga un número en su cartón gana', en:'A little wager - First player to have a called number land on their card wins'},
  piqueEnable:    {es:'Activar El Pique',                       en:'Enable El Pique'},
  piqueDisable:   {es:'Desactivar El Pique',                    en:'Disable El Pique'},
  piqueStake:     {es:'Apuesta del Pique (CLP)',                en:'Pique stake (CLP)'},
  piqueOptIn:     {es:'Entrar al Pique',                        en:'Join the Pique'},
  piqueOptOut:    {es:'Salir del Pique',                        en:'Leave the Pique'},
  piquePartic:    {es:'Participantes',                          en:'Participants'},
  piqueTie:       {es:'¡Empate en El Pique!',                   en:'El Pique Tie!'},
  piqueTieSub:    {es:'¿Qué hacemos?',                         en:'What do we do?'},
  piqueSplit:     {es:'Dividir el pozo',                        en:'Split the pot'},
  piqueKeepDraw:  {es:'Seguir sacando',                         en:'Keep drawing'},
  piqueWon:       {es:'ganó El Pique',                          en:'won El Pique'},
  piqueActive:    {es:'Pique activo',                           en:'Pique active'},
  piqueSettled:   {es:'Pique resuelto',                         en:'Pique settled'},
  // Game
  lastCalled:     {es:'Últimos cantados',                       en:'Last called'},
  callNumber:     {es:'🎱 CANTAR NÚMERO',                      en:'🎱 CALL NUMBER'},
  mcControl:      {es:'Control del Animador',                   en:'MC Control'},
  remaining:      {es:'números restantes',                      en:'numbers remaining'},
  gamePlayers:    {es:'Jugadores',                              en:'Players'},
  gameLog:        {es:'Registro de partida',                    en:'Game log'},
  table:          {es:'Tabla 1–90',                             en:'Table 1–90'},
  finalSettle:    {es:'🏆 Cierre Final',                        en:'🏆 Final Settlement'},
  // Settlement
  settleTitle:    {es:'Cierre',                                 en:'Settlement'},
  newRound:       {es:'🎉 Nueva Ronda',                         en:'🎉 New Round'},
  backBtn:        {es:'← Volver',                              en:'← Back'},
  prizeThisRound: {es:'Premios de esta partida — Pozo:',        en:'Prizes this round — Pot:'},
  sessionHistory: {es:'Historial de sesión completo',           en:'Full session history'},
  // Balances modal
  sessionBal:     {es:'Balances de Sesión',                     en:'Session Balances'},
  closeBnt:       {es:'✕ Cerrar',                              en:'✕ Close'},
  curPrizes:      {es:'Premios de la partida actual',           en:'Current game prizes'},
  sessionAll:     {es:'Historial de sesión — todas las partidas', en:'Session history — all games'},
  balNote:        {es:'Balances acumulados. Saldo = premios ganados − apuestas totales.', en:'Running balances. Balance = prizes won − total wagered.'},
  // Snoop modal
  overviewTitle:  {es:'Vista General',                          en:'Overview'},
  pendingReqs:    {es:'Solicitudes pendientes',                 en:'Pending requests'},
  demoNote:       {es:'Modo demo: Los otros jugadores marcan automáticamente. En la versión real cada jugador marca en su dispositivo.', en:'Demo mode: Other players mark automatically. In the real version each player marks on their own device.'},
  // MC transfer
  transferTitle:  {es:'Transferir Animador',                    en:'Transfer MC Role'},
  transferConfirm:{es:'¿Pasar el control de Animador a',        en:'Transfer MC role to'},
  transferWarning:{es:'Tu cartón se queda contigo. Solo el rol de Animador cambia.', en:'Your card stays yours. Only the MC role transfers.'},
  transferNo:     {es:'← No, quedarme',                        en:'← No, stay'},
  transferYes:    {es:'Sí, transferir',                        en:'Yes, transfer'},
  // Stats table
  stPlayer:       {es:'Jugador',  en:'Player'},
  stGames:        {es:'Partidas', en:'Games'},
  stBet:          {es:'Apostado', en:'Wagered'},
  stBalance:      {es:'Saldo',    en:'Balance'},
  // pct warnings
  pctWarn:        {es:'⚠ Los porcentajes deben sumar 100% (actual:', en:'⚠ Percentages must add up to 100% (current:'},
  // Prize button hints
  pzTernaHave:    {es:'Tienes 3 en fila ✓',     en:'You have 3 in a row ✓'},
  pzTernaNeed:    {es:'3 marcas en fila',       en:'3 marks in a row'},
  pzLineaHave:    {es:'Tienes fila completa ✓', en:'You have a full row ✓'},
  pzLineaNeed:    {es:'Fila completa',          en:'Full row'},
  pzLineaFirst:   {es:'Primero la Terna',       en:'Terna first'},
  pzLotaHave:     {es:'Cartón lleno ✓',         en:'Full card ✓'},
  pzLotaNeed:     {es:'Cartón completo',        en:'Full card'},
  pzLotaFirst:    {es:'Primero la Línea',       en:'Línea first'},
  // Pique button
  piqSent:        {es:'¡Enviado! Esperando…',           en:'Sent! Waiting…'},
  piqWaitNum:     {es:'Esperando tu primer número…',    en:'Waiting for your first number…'},
  piqHaveNum:     {es:'¡Tienes un número! ✓',           en:'You have a number! ✓'},
  // Misc UI
  piqueNotEnabled:{es:'El Animador no ha activado El Pique.', en:'The MC hasn\'t enabled El Pique.'},
  notAllReady:    {es:'Algunos jugadores aún no eligen sus 2 cartones.', en:'Some players haven\'t chosen their 2 cards yet.'},
  removePlayer:   {es:'Quitar jugador',         en:'Remove player'},
  connected:      {es:'Conectado',              en:'Connected'},
  disconnected:   {es:'Desconectado',           en:'Disconnected'},
  awards:         {es:'Premios',                en:'Awards'},
  inPique:        {es:'En El Pique',            en:'In El Pique'},
  you:            {es:'tú',                     en:'you'},
  // Leave game modal
  leaveQ:         {es:'¿Salir de la partida?',  en:'Leave the game?'},
  leaveWarn:      {es:'Si sales como Animador, la partida terminará para todos los jugadores.', en:'If you leave as MC, the game will end for all players.'},
  leaveYes:       {es:'Sí, terminar partida',   en:'Yes, end game'},
  leaveNo:        {es:'← No, seguir jugando',   en:'← No, keep playing'},
  // Remove player modal
  rmQ:            {es:'¿Quitar a',              en:'Remove'},
  rmFromRoom:     {es:'de la sala?',            en:'from the room?'},
  rmNote:         {es:'Sus cartones quedarán libres. Puede volver a entrar con el mismo nombre y elegir cartones de nuevo.', en:'Their cards will be freed. They can rejoin with the same name and pick cards again.'},
  rmYes:          {es:'Sí, quitar',            en:'Yes, remove'},
  rmCancel:       {es:'← Cancelar',            en:'← Cancel'},
  kicked:         {es:'El Animador te quitó de la sala.', en:'The MC removed you from the room.'},
  // Override modal
  ovTitle:        {es:'Asignar premios (manual)', en:'Assign prizes (manual)'},
  ovNote:         {es:'Para jugadores con cartón de papel. Marca uno o varios ganadores (varios = dividen el premio) y asigna. Se anuncia a todos y se valida oficialmente.', en:'For players with paper cards. Select one or more winners (multiple = split) and assign. Announced to everyone and officially recorded.'},
  ovAssign:       {es:'Asignar',               en:'Assign'},
  ovSplit:        {es:'dividir',               en:'split'},
  // Join errors
  errRoomNotFound:{es:'Sala no encontrada. Revisa el código.', en:'Room not found. Check the code.'},
  errCreate:      {es:'Error al crear la sala. Intenta de nuevo.', en:'Error creating room. Try again.'},
  errJoin:        {es:'Error al unirse. Intenta de nuevo.', en:'Error joining. Try again.'},
  // Carton selection
  chooseN:        {es:'Elige tus 2 cartones',  en:'Choose your 2 cards'},
  selectMore:     {es:'Selecciona',            en:'Select'},
  moreCards:      {es:'cartón(es) más.',       en:'more card(s).'},
  // Dynamic announcements (per-viewer)
  winsThe:        {es:'gana la',               en:'wins'},
  requests:       {es:'Solicita',              en:'Requests'},
  wonPique:       {es:'ganó El Pique',         en:'won El Pique'},
  // Split / dividir
  divide:         {es:'Dividir',               en:'Split'},
  divideTip:      {es:'Dividir entre los que reclaman', en:'Split among claimants'},
  // Game log
  logDrew:        {es:'Salió el',              en:'Drew'},
  logShouts:      {es:'grita',                 en:'shouts'},
  logRejected:    {es:'solicitud rechazada',   en:'claim rejected'},
};
const t = (lang, key) => TR[key]?.[lang] ?? TR[key]?.es ?? key;

// ────────────────────────────────────────────────────────────
// UTILS
// ────────────────────────────────────────────────────────────
const genCode = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('');
};

const rowNums = r => r.filter(n => n > 0);
const allNums = c => c.rows.flatMap(rowNums);

// Can the player REQUEST this type? (only checks their own marks, not whether they're called)
const canReq = (type, carton, marked) => {
  const m = new Set(marked);
  if (type === 'terna') return carton.rows.some(r => rowNums(r).filter(n => m.has(n)).length >= 3);
  if (type === 'linea') return carton.rows.some(r => { const rn = rowNums(r); return rn.length > 0 && rn.every(n => m.has(n)); });
  if (type === 'lota')  { const a = allNums(carton); return a.length > 0 && a.every(n => m.has(n)); }
  return false;
};

// MC validation: marks must ALSO be in called numbers
const isValid = (type, carton, marked, called) => {
  const ok = new Set(marked.filter(n => called.includes(n)));
  if (type === 'terna') return carton.rows.some(r => rowNums(r).filter(n => ok.has(n)).length >= 3);
  if (type === 'linea') return carton.rows.some(r => { const rn = rowNums(r); return rn.length > 0 && rn.every(n => ok.has(n)); });
  if (type === 'lota')  { const a = allNums(carton); return a.length > 0 && a.every(n => ok.has(n)); }
  return false;
};

// ── Multi-carton helpers (each player has 2+ cards) ──
const CARDS_PER_PLAYER = 2;
const idxsOf  = p => (p?.cartonIdxs || []);
const cardsOf = p => idxsOf(p).map(i => CARTONES[i]).filter(Boolean);
const canReqAny  = (type, cartons, marked)         => cartons.some(c => canReq(type, c, marked));
const isValidAny = (type, cartons, marked, called) => cartons.some(c => isValid(type, c, marked, called));
const hasHitOnCards = (cartons, called) => called.some(n => cartons.some(c => c.rows.some(row => row.includes(n))));
const firstIdx = p => Math.min(...idxsOf(p).concat([999])); // for stable sorting
// Player ordering: MC always first, then alphabetical by name
const playerSort = (a, b) => (b.isMC === true) - (a.isMC === true) || a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
// Pick the n highest-numbered available cartons (descending from #50)
// so the low numbers stay free for people who want to choose them.
const pickTopCartons = (takenIdxs, n) => {
  const out = [];
  for (let i = 49; i >= 0 && out.length < n; i--) if (!takenIdxs.includes(i)) out.push(i);
  return out;
};

const calcPot   = (cnt, ap)  => cnt * ap;
const calcPrize = (p, pct)   => Math.floor(p * pct / 100);
const fmtClp    = n          => `$${n.toLocaleString('es-CL')}`;
const tstamp    = ()         => new Date().toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});

const playTone = (type, mode = 'default') => {
  if (mode === 'chilean') {
    const map = { draw:'/sounds/pop.mp3', win:'/sounds/win.mp3', invalid:'/sounds/alert.mp3', request:'/sounds/alert.mp3' };
    try { const a = new Audio(map[type] ?? map.draw); a.play().catch(() => {}); } catch(e) {}
    return;
  }
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const note = (f, s, d, shape = 'sine') => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = shape; o.frequency.value = f;
      g.gain.setValueAtTime(0.22, ctx.currentTime + s);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d);
      o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d);
    };
    if (type === 'draw')    { note(440,0,.05); note(660,.06,.18); }
    if (type === 'win')     { [[523,0],[659,.12],[784,.24],[1047,.36],[1319,.5]].forEach(([f,s]) => note(f,s,.4)); }
    if (type === 'invalid') { note(220,0,.2,'sawtooth'); note(165,.22,.35,'sawtooth'); }
    if (type === 'request') { note(880,0,.12); note(1108,.13,.18); }
  } catch(e) {}
};

// ────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lobster&family=Nunito:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#140903}
::-webkit-scrollbar-thumb{background:#C94B28;border-radius:3px}

/* ── APP ── */
.la{min-height:100vh;background:#120804;color:#FFF3E0;font-family:'Nunito',sans-serif}
.logo-txt{font-family:'Lobster',cursive;color:#E8B84B;text-shadow:0 0 40px rgba(232,184,75,.45),0 4px 20px rgba(0,0,0,.7);line-height:1}

/* ── LANDING ── */
.landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;gap:36px}
.hero{text-align:center}
.hero .logo-txt{font-size:clamp(4.5rem,11vw,8rem)}
.tagline{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.25em;color:#C8A070;margin-top:.6rem;text-shadow:0 1px 8px rgba(0,0,0,.8)}
.cards-wrap{display:flex;gap:18px;width:100%;max-width:580px;flex-wrap:wrap;justify-content:center}
.lc{background:rgba(12, 5, 2, 0.98);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(212,82,42,.9);border-radius:22px;padding:28px;flex:1;min-width:240px;display:flex;flex-direction:column;gap:14px;transition:border-color .25s,transform .2s}
.lc:hover{border-color:rgba(212,82,42,.65);transform:translateY(-3px)}
.lc-icon{font-size:2.2rem;text-align:center}
.lc h2{font-size:1.2rem;font-weight:900;text-align:center;color:#FAEBD7}
.lc p{font-size:.8rem;color:#F0D8B0;text-align:center;line-height:1.5}
.or-div{display:flex;align-items:center;gap:12px;color:#BF8A60;font-weight:900;font-size:.7rem;letter-spacing:.12em;width:100%;max-width:580px}
.or-div::before,.or-div::after{content:'';flex:1;height:1px;background:rgba(212,82,42,.2)}

/* ── INPUTS ── */
.fld{display:flex;flex-direction:column;gap:5px}
.lbl{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#F0D0A0}
.inp{background:rgba(255,255,255,.18);border:1px solid rgba(212,82,42,.32);border-radius:10px;padding:11px 14px;color:#FFF3E0;font-size:1rem;font-family:'Nunito',sans-serif;width:100%;outline:none;transition:border-color .2s}
.inp:focus{border-color:#C94B28}
.inp::placeholder{color:#D4B080}
.inp-code{letter-spacing:.35em;text-transform:uppercase;font-weight:800;font-size:1.15rem;text-align:center}
.inp-num{-moz-appearance:textfield}
.inp-num::-webkit-outer-spin-button,.inp-num::-webkit-inner-spin-button{-webkit-appearance:none}

/* ── BUTTONS ── */
.btn{padding:11px 22px;border-radius:10px;border:none;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;transition:all .18s;font-size:.93rem;display:inline-flex;align-items:center;justify-content:center;gap:6px;letter-spacing:.02em}
.btn:disabled{opacity:.72;cursor:not-allowed!important;transform:none!important;pointer-events:none}
.btn-gold{background:#E8B84B;color:#2C1810}
.btn-gold:hover{background:#F5CC70;transform:translateY(-1px)}
.btn-red{background:#D94F28;color:#fff}
.btn-red:hover{background:#E86038;transform:translateY(-1px)}
.btn-ghost{background:transparent;color:#BFA080;border:1px solid rgba(212,82,42,.28)}
.btn-ghost:hover{border-color:#C94B28;color:#C94B28}
.btn-green{background:#27AE60;color:#fff}
.btn-green:hover{background:#2ECC71;transform:translateY(-1px)}
.btn-danger{background:#C0392B;color:#fff}
.btn-danger:hover{background:#E74C3C}
.btn-xl{padding:16px 34px;font-size:1.05rem;border-radius:14px;letter-spacing:.04em}
.btn-sm{padding:6px 13px;font-size:.78rem;border-radius:7px}
.btn-block{width:100%}
.btn-draw{flex:1;padding:16px;background:linear-gradient(140deg,#C94B28,#A0331A);color:#fff;border:none;border-radius:12px;font-family:'Nunito',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;text-transform:uppercase;letter-spacing:.07em;transition:all .18s;box-shadow:0 4px 18px rgba(201,75,40,.4)}
.btn-draw:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(201,75,40,.5)}
.btn-draw:active{transform:translateY(0)}
.btn-draw:disabled{opacity:.4;cursor:not-allowed;transform:none!important;box-shadow:none}

/* ── LOBBY ── */
.lobby{min-height:100vh;padding:20px;display:flex;flex-direction:column;align-items:center;gap:18px}
.lobby-hdr{width:100%;max-width:980px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.code-pill{background:#1C0E07;border:1px solid rgba(212,82,42,.28);border-radius:100px;padding:7px 18px;display:flex;align-items:center;gap:12px}
.code-val{font-family:'Courier New',monospace;font-size:1.3rem;font-weight:900;color:#E8B84B;letter-spacing:.22em}
.code-lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#C8A878}
.lobby-body{display:flex;gap:18px;width:100%;max-width:980px;flex-wrap:wrap;align-items:flex-start}
.lb-left{flex:1;min-width:210px;display:flex;flex-direction:column;gap:14px}
.lb-right{flex:2.2;min-width:300px;display:flex;flex-direction:column;gap:14px}
.panel{background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:16px;padding:18px}
.panel-title{font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.13em;color:#B08868;margin-bottom:12px}
.p-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.p-row:last-child{border-bottom:none}
.p-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#C94B28,#8B2500);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.8rem;flex-shrink:0;color:#fff}
.p-name{font-weight:700;font-size:.88rem;flex:1}
.p-tag-mc{font-size:.62rem;padding:2px 8px;border-radius:4px;font-weight:800;text-transform:uppercase;background:rgba(232,184,75,.15);color:#E8B84B;border:1px solid rgba(232,184,75,.3)}
.p-tag-ct{font-size:.62rem;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.07);color:#B08868}
.settings-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pct-bar{display:flex;gap:3px;height:6px;border-radius:4px;overflow:hidden;margin-top:8px}
.pct-t{background:#E8B84B;transition:flex .3s}
.pct-l{background:#C94B28;transition:flex .3s}
.pct-lo{background:#27AE60;transition:flex .3s}
.pct-leg{display:flex;gap:12px;font-size:.68rem;font-weight:700;margin-top:7px;flex-wrap:wrap}
.dot-sq{width:8px;height:8px;border-radius:2px;display:inline-block;margin-right:4px;vertical-align:middle}
.prize-pool{font-family:'Lobster',cursive;font-size:1.9rem;color:#E8B84B;text-shadow:0 0 20px rgba(232,184,75,.4);line-height:1.1}
.cs-wrap{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px}
.cs-btn{background:#120804;border:1px solid rgba(212,82,42,.22);color:#FFF3E0;border-radius:7px;padding:5px 10px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:all .15s}
.cs-btn:hover{border-color:#C94B28}
.cs-btn.cs-free{background:#FFF8F0;border-color:#E0C5A8;color:#4A3728}      /* available — white */
.cs-btn.cs-free:hover{border-color:#C94B28;background:#fff}
.cs-btn.cs-taken{background:#2A2622;border-color:rgba(255,255,255,.08);color:#6B5E52}  /* owned by others — grey */
.cs-btn.active{background:#C94B28;border-color:#C94B28;color:#fff}          /* mine — orange */
.cs-btn:disabled{cursor:not-allowed}
.sk-row{display:flex;gap:6px;flex-wrap:wrap}
.sk-btn{width:44px;height:44px;border-radius:9px;border:2px solid rgba(212,82,42,.2);background:#120804;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;font-size:1.1rem;color:#FFF3E0;font-family:'Nunito',sans-serif;font-weight:900}
.sk-btn.active{border-color:#E8B84B;background:rgba(232,184,75,.12)}
.sk-btn:hover{border-color:#C94B28}
.wait-banner{background:rgba(201,75,40,.08);border:1px solid rgba(201,75,40,.2);border-radius:10px;padding:14px;text-align:center}

/* ── CARTON ── */
.ct-wrap{background:#FFF8F0;border-radius:14px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.55);width:100%;max-width:540px}
.ct-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px}
.ct-id{font-size:.72rem;font-weight:800;color:#8B4513;text-transform:uppercase;letter-spacing:.08em}
.ct-prog{font-size:.7rem;color:#B07040;font-weight:600}
.ct-grid{display:flex;flex-direction:column;gap:3px}
.ct-row{display:flex;gap:3px}
.ct-cell{flex:1;aspect-ratio:1;min-width:0;border:1px solid #E0C5A8;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;background:#fff;transition:background .12s;user-select:none;-webkit-tap-highlight-color:transparent}
.ct-cell.emp{background:#F5E8D5;cursor:default;border-color:#DEC8B0}
.ct-cell.cld{background:#FFFDE7}
.ct-cell.mkd.cld{background:#E8F8EE}
.ct-cell.ro{cursor:default}
.ct-num{font-weight:800;font-size:clamp(.64rem,2.4vw,1.08rem);color:#4A3728;position:relative;z-index:1;pointer-events:none;line-height:1}
.ct-marker{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;animation:popIn .22s cubic-bezier(.175,.885,.32,1.275);pointer-events:none;z-index:2;font-size:clamp(1rem,3.2vw,1.65rem);line-height:1}
.mk-dot{width:70%;height:70%;border-radius:50%;background:rgba(39,174,96,.72);border:2px solid #27AE60}
.mk-x{font-weight:900;color:#E74C3C;font-size:clamp(.85rem,2.8vw,1.35rem)}
.ct-cols{display:flex;gap:3px;margin-top:4px}
.ct-col-l{flex:1;text-align:center;font-size:clamp(.38rem,.85vw,.58rem);color:#C0A070;font-weight:600;min-width:0}

/* ── GAME ── */
.game{min-height:100vh;padding:14px 16px;display:flex;flex-direction:column;align-items:center;gap:14px}
.game-hdr{width:100%;max-width:1180px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.prize-bar{display:flex;gap:7px;flex-wrap:wrap}
.pb-item{padding:4px 13px;border-radius:100px;font-size:.7rem;font-weight:800;border:1px solid;transition:all .35s;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
.pb-pend{border-color:rgba(212,82,42,.18);color:#5B3A28}
.pb-open{border-color:#E8B84B;color:#E8B84B;background:rgba(232,184,75,.08)}
.pb-won{border-color:#27AE60;color:#2ECC71;background:rgba(39,174,96,.08);text-decoration:line-through;opacity:.75}
.game-body{display:flex;gap:18px;width:100%;max-width:1180px;align-items:flex-start;flex-wrap:wrap;justify-content:center}
.game-main{display:flex;flex-direction:column;gap:14px;flex:1;min-width:280px;max-width:560px;align-items:center}
.game-tower{width:325px;flex-shrink:0;display:flex;flex-direction:column;gap:12px}

/* ── PRIZE BUTTONS ── */
.pz-row{display:flex;gap:9px;width:100%;max-width:540px}
.pz-btn{flex:1;padding:13px 5px;border-radius:11px;border:2px solid;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:900;cursor:pointer;transition:all .18s;text-transform:uppercase;letter-spacing:.06em;background:transparent;display:flex;flex-direction:column;align-items:center;gap:2px}
.pz-btn:disabled{opacity:.52;cursor:not-allowed;transform:none!important}
.pz-sub{font-size:.6rem;font-weight:600;letter-spacing:.04em;opacity:.82}
.pz-terna{border-color:#E8B84B;color:#E8B84B}
.pz-terna:not(:disabled):hover{background:#E8B84B;color:#2C1810;transform:translateY(-2px)}
.pz-linea{border-color:#C94B28;color:#C94B28}
.pz-linea:not(:disabled):hover{background:#C94B28;color:#fff;transform:translateY(-2px)}
.pz-lota{border-color:#27AE60;color:#27AE60}
.pz-lota:not(:disabled):hover{background:#27AE60;color:#fff;transform:translateY(-2px)}
.pz-pique{border-color:#9B59B6;color:#BE8EE8;width:100%}
.pz-pique:not(:disabled):hover{background:#9B59B6;color:#fff;transform:translateY(-2px)}
.pz-lota:not(:disabled):hover{background:#27AE60;color:#fff;transform:translateY(-2px)}
.pz-won{text-decoration:line-through;opacity:.45}

/* ── MC TOWER ── */
.tw-panel{background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:14px;padding:14px}
.tw-title{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.13em;color:#C8A878;margin-bottom:10px}
.draw-row{display:flex;align-items:center;gap:14px}
.big-ball{width:78px;height:78px;border-radius:50%;background:radial-gradient(circle at 30% 27%,#E8856A 0%,#C94B28 45%,#7A2010 100%);display:flex;align-items:center;justify-content:center;font-family:'Lobster',cursive;font-size:2.1rem;color:#fff;box-shadow:0 6px 22px rgba(201,75,40,.55),inset 0 2px 5px rgba(255,255,255,.2);flex-shrink:0;transition:box-shadow .3s}
.big-ball.fresh{animation:ballPop .44s cubic-bezier(.175,.885,.32,1.275)}
.big-ball.empty{background:#231008;color:#8A6050;font-family:'Nunito',sans-serif;font-size:.75rem;font-weight:700}
.matrix{display:flex;flex-direction:column;gap:3px}
.mx-row{display:flex;gap:3px}
.mx-cell{width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:.63rem;font-weight:700;background:#120804;color:#8A6848;transition:all .3s}
.mx-cell.hit{background:#C94B28;color:#fff;animation:cellHit .35s}
.game-log{max-height:130px;overflow-y:auto;display:flex;flex-direction:column;gap:3px}
.le{padding:5px 9px;border-radius:6px;font-size:.73rem;display:flex;justify-content:space-between;align-items:center;gap:8px}
.le-draw{background:rgba(255,255,255,.04);color:#A8886A}
.le-req{background:rgba(232,184,75,.1);color:#E8B84B;border:1px solid rgba(232,184,75,.22)}
.le-win{background:rgba(39,174,96,.1);color:#2ECC71;border:1px solid rgba(39,174,96,.18);font-weight:700}
.le-inv{background:rgba(193,57,43,.1);color:#E74C3C;border:1px solid rgba(193,57,43,.18)}
.le-ts{font-size:.62rem;opacity:.68;flex-shrink:0;font-weight:600}
.stat-row{display:flex;align-items:center;justify-content:space-between;font-size:.72rem}

/* ── PLAYER: LAST CALLS ── */
.last-wrap{display:flex;flex-direction:column;align-items:center;gap:7px;width:100%;max-width:540px}
.last-lbl{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#A8886A}
.last-balls{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.mini-ball{width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 30% 27%,#E8856A 0%,#C94B28 45%,#7A2010 100%);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.72rem;color:#fff;box-shadow:0 2px 8px rgba(201,75,40,.4);flex-shrink:0}
.mini-ball.newest{animation:ballPop .38s cubic-bezier(.175,.885,.32,1.275)}

/* ── ANNOUNCEMENT ── */
.ann-bg{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9998;pointer-events:auto;background:rgba(0,0,0,.55);cursor:pointer}
.ann-box{padding:38px 56px;border-radius:28px;text-align:center;animation:annPop .44s cubic-bezier(.175,.885,.32,1.275);box-shadow:0 0 80px rgba(0,0,0,.9);position:relative;cursor:default}
.ann-close{position:absolute;top:12px;right:14px;background:transparent;border:none;color:rgba(255,255,255,.35);font-size:1rem;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;line-height:1;transition:color .15s;padding:4px 8px}
.ann-close:hover{color:rgba(255,255,255,.9)}
.ann-draw{background:rgba(8,4,1,.97);border:3px solid #E8B84B}
.ann-request{background:rgba(8,4,1,.97);border:3px solid #E8B84B}
.ann-win{background:rgba(8,4,1,.97);border:3px solid #27AE60}
.ann-invalid{background:rgba(8,4,1,.97);border:3px solid #E74C3C}
.ann-ball{width:108px;height:108px;border-radius:50%;background:radial-gradient(circle at 30% 27%,#E8856A 0%,#C94B28 45%,#7A2010 100%);display:flex;align-items:center;justify-content:center;font-family:'Lobster',cursive;font-size:3rem;color:#fff;margin:0 auto 16px;box-shadow:0 0 45px rgba(201,75,40,.7)}
.ann-title{font-family:'Lobster',cursive;font-size:2.3rem;line-height:1.1}
.ann-draw   .ann-title{color:#FFF3E0}
.ann-request .ann-title{color:#E8B84B}
.ann-win    .ann-title{color:#2ECC71}
.ann-invalid .ann-title{color:#E74C3C}
.ann-sub{font-size:.83rem;color:#B08868;margin-top:7px;font-weight:600}
.ann-emoji{font-size:2rem;margin-top:10px}

/* ── SNOOP MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
.modal-box{background:#180A04;border:1px solid rgba(212,82,42,.28);border-radius:20px;width:100%;max-width:1040px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden}
.modal-hdr{padding:16px 22px;border-bottom:1px solid rgba(212,82,42,.18);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.modal-hdr h2{font-size:.95rem;font-weight:900}
.modal-body{padding:18px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.reqs-section{display:flex;flex-direction:column;gap:8px}
.req-banner{background:rgba(232,184,75,.1);border:1px solid rgba(232,184,75,.3);border-radius:9px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.req-type{font-weight:900;color:#E8B84B;font-size:.9rem;text-transform:uppercase;font-family:'Lobster',cursive;font-size:1.1rem}
.snoop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.sn-card{background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:12px;padding:12px}
.sn-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.sn-name{font-weight:800;font-size:.9rem}
.sn-req-mini{background:rgba(232,184,75,.1);border:1px solid rgba(232,184,75,.25);border-radius:7px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}

/* ── MINI CARTON (Snoop) ── */
.mn-grid{display:flex;flex-direction:column;gap:2px}
.mn-row{display:flex;gap:2px}
.mn-cell{flex:1;aspect-ratio:1;min-width:0;max-width:33px;border:1px solid #E0C5A8;border-radius:4px;display:flex;align-items:center;justify-content:center;background:#fff;position:relative;overflow:hidden}
.mn-cell.mn-emp{background:#F5E8D5}
.mn-num{font-size:.56rem;font-weight:800;color:#4A3728;position:relative;z-index:1;line-height:1}
.mn-cell.mn-h{background:rgba(39,174,96,.22)}
.mn-cell.mn-l{background:rgba(231,76,60,.17)}
.mn-cell.mn-m{background:rgba(255,248,200,.75);border:1px dashed #E8B84B}
.mn-dot{width:11px;height:11px;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2}
.mn-dh{background:rgba(39,174,96,.8);border:1px solid #27AE60}
.mn-dl{background:rgba(192,57,43,.85);border:1px solid #C0392B;box-shadow:0 0 5px rgba(231,76,60,.5)}

/* ── SETTLEMENT ── */
.settle{min-height:100vh;padding:22px;display:flex;flex-direction:column;align-items:center;gap:20px}
.settle-hdr{width:100%;max-width:620px;display:flex;align-items:center;justify-content:space-between}
.bal-table{width:100%;max-width:620px;background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:16px;overflow:hidden}
.bal-row{display:flex;padding:11px 20px;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.04)}
.bal-row:last-child{border-bottom:none}
.bal-name{flex:1;font-weight:700;font-size:.9rem}
.bal-pos{color:#2ECC71;font-weight:900;font-size:1rem}
.bal-neg{color:#E74C3C;font-weight:900;font-size:1rem}
.bal-zero{color:#A8886A;font-weight:700;font-size:1rem}
.prize-line{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.prize-line:last-child{border-bottom:none}
.prize-type{font-weight:900;font-size:.85rem;text-transform:uppercase}
.prize-winner{font-size:.85rem;flex:1;padding:0 12px;color:#BFA080}
.prize-amt{font-weight:800;font-size:.9rem}

/* ── CHIPS ── */
.chip{padding:2px 9px;border-radius:100px;font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.chip-mc{background:rgba(232,184,75,.14);color:#E8B84B;border:1px solid rgba(232,184,75,.28)}
.chip-ok{background:rgba(39,174,96,.14);color:#2ECC71;border:1px solid rgba(39,174,96,.28)}
.chip-req{background:rgba(232,184,75,.14);color:#E8B84B;border:1px solid rgba(232,184,75,.3)}
.chip-pending{background:rgba(201,75,40,.14);color:#C94B28;border:1px solid rgba(201,75,40,.28)}

/* ── UTILS ── */
.flex{display:flex}.fc{flex-direction:column}.ac{align-items:center}.jb{justify-content:space-between}.jc{justify-content:center}
.g3{gap:3px}.g6{gap:6px}.g8{gap:8px}.g10{gap:10px}.g12{gap:12px}.g16{gap:16px}
.w100{width:100%}.tc{text-align:center}
.fw7{font-weight:700}.fw9{font-weight:900}
.gold{color:#E8B84B}.dim{color:#B08868}.green{color:#2ECC71}.red{color:#E74C3C}.white{color:#FFF3E0}
.xs{font-size:.73rem}.sm{font-size:.85rem}.lg{font-size:1.1rem}
.mt4{margin-top:4px}.mt8{margin-top:8px}.mt12{margin-top:12px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}
.p12{padding:12px}.p16{padding:16px}
.pulse{animation:pulsar 1.5s infinite}
.warn{color:#E8B84B;font-size:.72rem;font-weight:700;margin-top:6px}
.divline{height:1px;background:rgba(212,82,42,.14);width:100%;margin:6px 0}

/* ── ANIMATIONS ── */
@keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes ballPop{0%{transform:scale(.25);opacity:0}65%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
@keyframes annPop{0%{transform:scale(.5);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes cellHit{0%{transform:scale(.65)}55%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes pulsar{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ── SESSION STATS TABLE ── */
.stats-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.stats-tbl{width:100%;border-collapse:collapse;min-width:520px}
.stats-tbl th{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#C8A878;padding:9px 12px;border-bottom:1px solid rgba(212,82,42,.2);text-align:center;white-space:nowrap}
.stats-tbl th:first-child{text-align:left}
.stats-tbl td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.86rem;text-align:center;font-weight:700;vertical-align:middle}
.stats-tbl td:first-child{text-align:left}
.stats-tbl tr:last-child td{border-bottom:none}
.stats-tbl tr:hover td{background:rgba(255,255,255,.025);transition:background .12s}
.st-terna{color:#E8B84B}
.st-linea{color:#C94B28}
.st-lota{color:#27AE60}
.cur-prizes{display:flex;flex-direction:column;gap:3px;margin-bottom:16px}

/* ── CONNECTION DOT ── */
.dot-online{width:9px;height:9px;border-radius:50%;background:#27AE60;border:1.5px solid #120804;flex-shrink:0}
.dot-offline{width:9px;height:9px;border-radius:50%;background:#E74C3C;border:1.5px solid #120804;flex-shrink:0}
/* ── PLAYERS PANEL (game view left column) ── */
.pl-av-wrap{position:relative;flex-shrink:0}
.rm-x{position:absolute;top:-5px;right:-5px;width:15px;height:15px;border-radius:50%;background:#C0392B;color:#fff;border:1.5px solid #120804;font-size:.7rem;line-height:1;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;font-family:'Nunito',sans-serif;transition:background .15s}
.rm-x:hover{background:#E74C3C}
/* ── RESPONSIVE ── */
@media(max-width:640px){
  .ann-box{padding:26px 32px}
  .ann-ball{width:80px;height:80px;font-size:2.3rem}
  .ann-title{font-size:1.8rem}
  .cards-wrap{flex-direction:column}
  .settings-g{grid-template-columns:1fr}
  .game-tower{width:100%}
}
@media(max-width:940px){
  .game-tower{width:100%}
}
`;

// ────────────────────────────────────────────────────────────
// COMPONENTS
// ────────────────────────────────────────────────────────────

// Language toggle button shown on every screen
function LangToggle({ lang, onToggle }) {
  return (
    <button onClick={onToggle}
      title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      style={{background:'transparent',border:'1px solid rgba(212,82,42,.28)',borderRadius:8,padding:'5px 11px',cursor:'pointer',fontSize:'.82rem',lineHeight:1,flexShrink:0,display:'flex',alignItems:'center',gap:6,color:'#FFF3E0',fontFamily:"'Nunito',sans-serif",fontWeight:800}}>
      <img
        src={lang === 'es' ? '/flags/cl.png' : '/flags/nz.png'}
        alt={lang === 'es' ? 'Chile' : 'New Zealand'}
        style={{width:20,height:20,objectFit:'cover',borderRadius:3,display:'block'}}
      />
      {lang === 'es' ? 'ES' : 'EN'}
    </button>
  );
}

// Skin marker rendered inside a carton cell
function Marker({ skin }) {
  const s = SKINS.find(x => x.id === skin);
  if (s?.img) {
    const contain = s.fit === 'contain';
    return <img src={s.img} alt={s.label} style={{
      width: contain ? '92%' : '80%',
      height: contain ? '92%' : '80%',
      objectFit: contain ? 'contain' : 'cover',
      borderRadius: contain ? 2 : '50%',
    }} />;
  }
  if (skin === 'dot') return <div className="mk-dot" />;
  if (skin === 'x')   return <span className="mk-x">✕</span>;
  return <div className="mk-dot" />;
}

// Full carton card with marking.
// hideCalled = true → don't reveal which numbers have been called (player's own card);
// the player must spot and mark numbers themselves.
function CartonCard({ carton, marked = [], calledNums = [], skin = 'dot', onToggle, readonly = false, hideCalled = false }) {
  const m = new Set(marked), c = new Set(calledNums);
  const total = allNums(carton).length;
  const correct = allNums(carton).filter(n => m.has(n) && c.has(n)).length;
  const markedCount = allNums(carton).filter(n => m.has(n)).length;
  return (
    <div className="ct-wrap">
      <div className="ct-hdr">
        <span className="ct-id">Cartón #{carton.id}</span>
        <span className="ct-prog">{hideCalled ? markedCount : correct} / {total}</span>
      </div>
      <div className="ct-grid">
        {carton.rows.map((row, ri) => (
          <div key={ri} className="ct-row">
            {row.map((num, ci) => {
              if (num === 0) return <div key={ci} className="ct-cell emp" />;
              const isMk = m.has(num), isCld = !hideCalled && c.has(num);
              return (
                <div
                  key={ci}
                  className={`ct-cell${isCld ? ' cld' : ''}${isMk ? ' mkd' : ''}${readonly ? ' ro' : ''}`}
                  onClick={() => !readonly && onToggle && onToggle(num)}
                >
                  <span className="ct-num">{num}</span>
                  {isMk && <div className="ct-marker"><Marker skin={skin} /></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ct-cols">
        {COL_RANGES.map(r => <div key={r} className="ct-col-l">{r}</div>)}
      </div>
    </div>
  );
}

// Compact carton for snoop (MC overview)
function MiniCarton({ carton, marked = [], calledNums = [] }) {
  const m = new Set(marked), c = new Set(calledNums);
  return (
    <div className="mn-grid">
      {carton.rows.map((row, ri) => (
        <div key={ri} className="mn-row">
          {row.map((num, ci) => {
            if (num === 0) return <div key={ci} className="mn-cell mn-emp" />;
            const isMk = m.has(num), isCld = c.has(num);
            let cls = '', dot = null;
            if (isMk && isCld)  { cls = 'mn-h'; dot = 'mn-dh'; }
            if (isMk && !isCld) { cls = 'mn-l'; dot = 'mn-dl'; }
            if (!isMk && isCld) { cls = 'mn-m'; }
            return (
              <div key={ci} className={`mn-cell ${cls}`}>
                <span className="mn-num">{num}</span>
                {dot && <div className={`mn-dot ${dot}`} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LANDING
// ────────────────────────────────────────────────────────────
function LandingView({ onCreate, onJoin, lang, onToggleLang, initialCode = '', loading = false, joinError = '' }) {
  const [cName, setCName] = useState('');
  const [jCode, setJCode] = useState(initialCode);
  const [jName, setJName] = useState('');

  return (
    <div className="landing" style={{position:'relative'}}>
      {/* Background photo — wooden bingo tokens */}
      <img src="/lota-logo.png" aria-hidden="true" alt="" style={{
        position:'absolute', inset:0, width:'100%', height:'100%',
        objectFit:'cover', objectPosition:'center',
        filter:'blur(1.5px) saturate(0.7)',
        opacity:0.11,
        pointerEvents:'none', userSelect:'none', zIndex:0,
      }} />
      {/* Radial vignette — darkens edges, lets centre breathe */}
      <div aria-hidden="true" style={{
        position:'absolute', inset:0, zIndex:1,
        background:'radial-gradient(ellipse at 50% 65%, rgba(18,8,4,0) 20%, rgba(18,8,4,0.65) 70%, rgba(18,8,4,0.75) 100%)',
        pointerEvents:'none',
      }} />
      {/* All content sits above the background layers */}
      <div style={{position:'relative',zIndex:2,display:'contents'}}>
      <div style={{position:'absolute',top:16,right:16,zIndex:3}}>
        <LangToggle lang={lang} onToggle={onToggleLang} />
      </div>
      <div className="hero">
        <div className="logo-txt">LOTA</div>
        <p className="tagline">{t(lang,'tagline')}</p>
      </div>

      <div className="cards-wrap">
        <div className="lc">
          <div className="lc-icon">🎉</div>
          <h2>{t(lang,'createRoom')}</h2>
          <p>{t(lang,'mcRoleDesc')}</p>
          <div className="fld">
            <label className="lbl">{t(lang,'yourName')}</label>
            <input className="inp" value={cName} onChange={e => setCName(e.target.value)}
              placeholder="Ej: Felipito Camiroaga" onKeyDown={e => e.key === 'Enter' && cName.trim() && onCreate(cName.trim())} />
          </div>
          <button className="btn btn-gold btn-xl btn-block" disabled={!cName.trim() || loading} onClick={() => onCreate(cName.trim())}>
            {loading ? '⏳' : t(lang,'createBtn')}
          </button>
        </div>

        <div className="or-div">O</div>

        <div className="lc">
          <div className="lc-icon">🎯</div>
          <h2>{t(lang,'join')}</h2>
          <p>{t(lang,'joinRoleDesc')}</p>
          <div className="fld">
            <label className="lbl">{t(lang,'roomCode')}</label>
            <input className="inp inp-code" value={jCode}
              onChange={e => setJCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123" maxLength={6} />
          </div>
          <div className="fld">
            <label className="lbl">{t(lang,'yourName')}</label>
            <input className="inp" value={jName} onChange={e => setJName(e.target.value)} placeholder="Ej: Felipito Camiroaga" />
          </div>
          {joinError && <p style={{color:'#E74C3C',fontSize:'.8rem',fontWeight:700,textAlign:'center'}}>{joinError}</p>}
          <button className="btn btn-red btn-xl btn-block"
            disabled={jCode.length < 6 || !jName.trim() || loading}
            onClick={() => onJoin(jCode, jName.trim())}>
            {loading ? '⏳' : t(lang,'joinBtn')}
          </button>
        </div>
      </div>

      <p className="xs tc" style={{color:'#9A7050'}}>{lang==='es'?'Multijugador en tiempo real · LotaChilena.cl · by Caqui & Rafi':'Real-time multiplayer · LotaChilena.cl · by Caqui & Rafi'}</p>
      </div>{/* end z-index content wrapper */}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TRANSFER MODAL
// ────────────────────────────────────────────────────────────
function ShareModal({ room, onClose, lang }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/${room.code}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch(_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Lota Chilena', url: shareUrl }); } catch(_) {}
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{maxWidth:400}} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>📤 {lang==='es' ? 'Compartir sala' : 'Share room'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{t(lang,'closeBnt')}</button>
        </div>
        <div className="modal-body" style={{gap:12}}>
          <p className="xs dim">{lang==='es'
            ? 'Manda este enlace. Al abrirlo, el código ya estará listo — solo hay que poner el nombre.'
            : 'Send this link. When opened, the code is pre-filled — they just enter their name.'}</p>
          <div style={{background:'rgba(255,255,255,.04)',borderRadius:10,padding:'10px 14px',fontFamily:'Courier New,monospace',fontSize:'.88rem',color:'#E8B84B',letterSpacing:'.04em',textAlign:'center',fontWeight:900,wordBreak:'break-all'}}>
            {shareUrl}
          </div>
          <button className="btn btn-block btn-gold" style={{padding:'13px',fontSize:'1rem'}} onClick={copyLink}>
            {copied
              ? '✓ ' + (lang==='es' ? '¡Copiado!' : 'Copied!')
              : '📋 ' + (lang==='es' ? 'Copiar enlace' : 'Copy link')}
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button className="btn btn-block btn-ghost" style={{padding:'13px',fontSize:'1rem'}} onClick={nativeShare}>
              📲 {lang==='es' ? 'Compartir por app…' : 'Share via app…'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TransferModal({ targetName, onConfirm, onCancel, lang }) {
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal-box" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>🎤 {t(lang,'transferTitle')}</h2>
        </div>
        <div className="modal-body">
          <p style={{fontSize:'1rem',fontWeight:700,lineHeight:1.5}}>
            {t(lang,'transferConfirm')} <span style={{color:'#E8B84B'}}>{targetName}</span>?
          </p>
          <p className="xs dim mt8">{t(lang,'transferWarning')}</p>
          <div className="flex g10 mt12" style={{justifyContent:'space-between',alignItems:'center'}}>
            <button className="btn btn-ghost btn-sm" onClick={onConfirm}>{t(lang,'transferYes')}</button>
            <button className="btn btn-gold btn-xl" onClick={onCancel}>{t(lang,'transferNo')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LOBBY
// ────────────────────────────────────────────────────────────
function LobbyView({ room, me, players, settings, onSettings, onCarton, onSkin, onStart, onBack, onShowBalances, onTransferMC, onRemovePlayer, pique, onPique, lang, onToggleLang, loading = false }) {
  const [transferTarget, setTransferTarget] = useState(null);
  const [removeTarget, setRemoveTarget]     = useState(null);
  const [showShare, setShowShare]           = useState(false);
  const taken  = players.filter(p => p.id !== me.id).flatMap(p => idxsOf(p));
  const myIdxs = idxsOf(me);
  const pctSum = settings.ternaPct + settings.lineaPct + settings.lotaPct;
  const total  = calcPot(players.length, settings.apuesta);
  const inPique = pique.participants.includes(me.id);

  const togglePiqueParticipation = () => {
    const next = inPique
      ? pique.participants.filter(id => id !== me.id)
      : [...pique.participants, me.id];
    onPique({ ...pique, participants: next });
  };


  return (
    <div className="lobby">
      <div className="lobby-hdr">
        <div className="code-pill">
          <span className="code-lbl">{lang==='es'?'Sala':'Room'}</span>
          <span className="code-val">{room.code}</span>
          <span className="code-lbl">· {players.length} {lang==='es'?'jugadores':'players'}</span>
        </div>
        <div className="flex g8 ac">
          {me.isMC && <span className="chip chip-mc">Animador 🎤</span>}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowShare(true)}>
            {t(lang,'shareLink')}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onShowBalances}>{t(lang,'balances')}</button>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>{t(lang,'leaveRoom')}</button>
          <LangToggle lang={lang} onToggle={onToggleLang} />
        </div>
      </div>

      <div className="lobby-body">
        {/* LEFT COLUMN */}
        <div className="lb-left">
          <div className="panel">
            <div className="panel-title">{t(lang,'playersInRoom')}</div>
            {[...players].sort(playerSort).map(p => (
              <div key={p.id} className="p-row">
                <div className="pl-av-wrap">
                  <div className="p-av">{p.name[0].toUpperCase()}</div>
                  <div className={isOnline(p) ? 'dot-online' : 'dot-offline'}
                    style={{position:'absolute',bottom:-1,right:-1}} title={isOnline(p)?(lang==='es'?'Conectado':'Connected'):(lang==='es'?'Desconectado':'Disconnected')} />
                  {me.isMC && p.id !== me.id && (
                    <button className="rm-x" title={lang==='es'?'Quitar jugador':'Remove player'}
                      onClick={() => setRemoveTarget(p)}>×</button>
                  )}
                </div>
                <span className="p-name">{p.name}{p.id === me.id ? ` (${lang==='es'?'tú':'you'})` : ''}</span>
                {p.isMC && <span className="p-tag-mc">MC</span>}
                {pique.enabled && pique.participants.includes(p.id) && (
                  <span title={t(lang,'inPique')} style={{fontSize:'.8rem'}}>⚡</span>
                )}
                <span className="p-tag-ct">{idxsOf(p).map(i => `#${CARTONES[i].id}`).join(' ')}</span>
                {me.isMC && !p.isMC && (
                  <button className="btn btn-ghost btn-sm" style={{padding:'2px 7px',fontSize:'.65rem'}}
                    onClick={() => setTransferTarget(p)} title={t(lang,'transferTitle')}>🎤→</button>
                )}
              </div>
            ))}
          </div>

          {me.isMC && (
            <div className="panel">
              <div className="panel-title">{t(lang,'estimatedPot')}</div>
              <div className="prize-pool">{fmtClp(total)}</div>
              <p className="xs dim mt4">{fmtClp(settings.apuesta)} × {players.length} {lang==='es'?'jugadores':'players'}</p>
              <div className="pct-bar">
                <div className="pct-t" style={{ flex: settings.ternaPct }} />
                <div className="pct-l" style={{ flex: settings.lineaPct }} />
                <div className="pct-lo" style={{ flex: settings.lotaPct }} />
              </div>
              <div className="pct-leg">
                <span><span className="dot-sq" style={{ background: '#E8B84B' }} />Terna {settings.ternaPct}%</span>
                <span><span className="dot-sq" style={{ background: '#C94B28' }} />Línea {settings.lineaPct}%</span>
                <span><span className="dot-sq" style={{ background: '#27AE60' }} />Lota {settings.lotaPct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lb-right">
          {me.isMC && (
            <div className="panel">
              <div className="panel-title">{t(lang,'gameConfig')}</div>
              <div className="settings-g">
                <div className="fld">
                  <label className="lbl">{t(lang,'bet')}</label>
                  <input className="inp inp-num" type="number" value={settings.apuesta} min={0} step={100}
                    onChange={e => onSettings({ ...settings, apuesta: Math.max(0, Number(e.target.value)) })} />
                </div>
                <div className="fld">
                  <label className="lbl">% Terna</label>
                  <input className="inp inp-num" type="number" value={settings.ternaPct} min={1} max={97}
                    onChange={e => onSettings({ ...settings, ternaPct: Number(e.target.value) })} />
                </div>
                <div className="fld">
                  <label className="lbl">% Línea</label>
                  <input className="inp inp-num" type="number" value={settings.lineaPct} min={1} max={97}
                    onChange={e => onSettings({ ...settings, lineaPct: Number(e.target.value) })} />
                </div>
                <div className="fld">
                  <label className="lbl">% Lota</label>
                  <input className="inp inp-num" type="number" value={settings.lotaPct} min={1} max={97}
                    onChange={e => onSettings({ ...settings, lotaPct: Number(e.target.value) })} />
                </div>
              </div>
              {pctSum !== 100 && <p className="warn">{t(lang,'pctWarn')} {pctSum}%)</p>}
            </div>
          )}

          <div className="panel">
            <div className="panel-title">
              {lang==='es' ? `Elige tus ${CARDS_PER_PLAYER} cartones` : `Choose your ${CARDS_PER_PLAYER} cards`}
              {' '}({myIdxs.length}/{CARDS_PER_PLAYER})
            </div>
            <div className="cs-wrap">
              {CARTONES.map((c, i) => {
                const mine    = myIdxs.includes(i);
                const byOther = taken.includes(i);
                // mine = orange, owned by others = grey/disabled, free = white
                const cls = mine ? 'cs-btn active' : byOther ? 'cs-btn cs-taken' : 'cs-btn cs-free';
                return (
                  <button key={c.id} className={cls}
                    disabled={byOther}
                    onClick={() => onCarton(i)}>
                    #{c.id}
                  </button>
                );
              })}
            </div>
            {myIdxs.length < CARDS_PER_PLAYER && (
              <p className="warn">{lang==='es'
                ? `Selecciona ${CARDS_PER_PLAYER - myIdxs.length} cartón(es) más.`
                : `Select ${CARDS_PER_PLAYER - myIdxs.length} more card(s).`}</p>
            )}
            <div className="flex fc g12" style={{marginTop:10, alignItems: 'center'}}>
              {myIdxs.map(i => (
                <CartonCard key={i} carton={CARTONES[i]} marked={[]} calledNums={[]} skin={me.skin} readonly />
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">{t(lang,'markerSkin')}</div>
            <div className="sk-row">
              {SKINS.map(s => (
                <button key={s.id} className={`sk-btn${me.skin === s.id ? ' active' : ''}`} onClick={() => onSkin(s.id)}
                  title={s.label} style={{overflow:'hidden',padding:s.img?0:undefined}}>
                  {s.img
                    ? <img src={s.img} alt={s.label} style={{width:'100%',height:'100%',objectFit:s.fit==='contain'?'contain':'cover',borderRadius:s.fit==='contain'?4:7}} />
                    : s.id === 'dot'
                      ? <div style={{ width:20,height:20,borderRadius:'50%',background:'rgba(39,174,96,.8)',border:'2px solid #27AE60' }} />
                      : s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">{t(lang,'soundSettings')}</div>
            <div className="cs-wrap">
              <button className={`cs-btn${settings.soundMode==='default'?' active':''}`}
                onClick={() => onSettings({...settings, soundMode:'default'})}>
                🎵 {t(lang,'classicTones')}
              </button>
              <button className={`cs-btn${settings.soundMode==='chilean'?' active':''}`}
                onClick={() => onSettings({...settings, soundMode:'chilean'})}>
                🇨🇱 {t(lang,'chileanSounds')}
              </button>
            </div>
          </div>

          {/* El Pique */}
          <div className="panel">
            <div className="flex jb ac mb8">
              <div className="panel-title" style={{margin:0}}>⚡ {t(lang,'pique')}</div>
              {me.isMC && (
                <button className={`btn btn-sm ${pique.enabled?'btn-danger':'btn-ghost'}`}
                  onClick={() => onPique({...INIT_PIQUE, enabled:!pique.enabled, stake:pique.stake})}>
                  {pique.enabled ? t(lang,'piqueDisable') : t(lang,'piqueEnable')}
                </button>
              )}
            </div>
            {pique.enabled ? (
              <>
                <p className="xs dim mb8">{t(lang,'piqueDesc')}</p>
                {me.isMC && (
                  <div className="fld mb8">
                    <label className="lbl">{t(lang,'piqueStake')}</label>
                    <input className="inp inp-num" type="number" value={pique.stake} min={0} step={100}
                      onChange={e => onPique({...pique, stake:Math.max(0,Number(e.target.value))})} />
                  </div>
                )}
                <div className="flex jb ac mb8">
                  <span className="xs dim">{t(lang,'piquePartic')}: {pique.participants.length}</span>
                  <button className={`btn btn-sm ${inPique?'btn-danger':'btn-green'}`}
                    onClick={togglePiqueParticipation}>
                    {inPique ? t(lang,'piqueOptOut') : t(lang,'piqueOptIn')} ({fmtClp(pique.stake)})
                  </button>
                </div>
                {pique.participants.length > 0 && (
                  <div className="flex g6" style={{flexWrap:'wrap'}}>
                    {pique.participants.map(pid => {
                      const p = players.find(x => x.id === pid);
                      return p ? <span key={pid} className="chip chip-ok">{p.name}</span> : null;
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="xs dim">{me.isMC ? t(lang,'piqueDesc') : (lang==='es'?'El Animador no ha activado El Pique.':'The MC has not enabled El Pique.')}</p>
            )}
          </div>

          {me.isMC
            ? (() => {
                const everyoneReady = players.every(p => idxsOf(p).length >= CARDS_PER_PLAYER);
                return <>
                  <button className="btn btn-gold btn-xl btn-block" disabled={pctSum !== 100 || loading || !everyoneReady} onClick={onStart}>
                    {loading ? '⏳' : '🎉 ' + t(lang,'startGame')}
                  </button>
                  {!everyoneReady && <p className="warn">{lang==='es'
                    ? 'Algunos jugadores aún no eligen sus 2 cartones.'
                    : 'Some players haven\'t chosen their 2 cards yet.'}</p>}
                </>;
              })()
            : <div className="wait-banner">
                <p className="dim sm pulse">{t(lang,'waitingMC')}</p>
              </div>
          }
        </div>
      </div>

      {transferTarget && (
        <TransferModal
          targetName={transferTarget.name}
          lang={lang}
          onConfirm={() => { onTransferMC(transferTarget.id); setTransferTarget(null); }}
          onCancel={() => setTransferTarget(null)}
        />
      )}
      {removeTarget && (
        <RemovePlayerModal player={removeTarget} lang={lang}
          onConfirm={() => { onRemovePlayer(removeTarget.id); setRemoveTarget(null); }}
          onCancel={() => setRemoveTarget(null)} />
      )}
      {showShare && (
        <ShareModal room={room} lang={lang} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SNOOP MODAL
// ────────────────────────────────────────────────────────────
function SnoopModal({ players, game, onClose, onValidate, onReject, lang }) {
  const reqsByPlayer = {};
  game.requests.forEach(r => {
    if (!reqsByPlayer[r.playerId]) reqsByPlayer[r.playerId] = [];
    reqsByPlayer[r.playerId].push(r);
  });

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <h2>👁 {t(lang,'overviewTitle')} — {players.length} {lang==='es'?'Jugadores':'Players'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{t(lang,'closeBnt')}</button>
        </div>
        <div className="modal-body">
          {/* Pending requests at the top */}
          {game.requests.length > 0 && (
            <div className="reqs-section">
              <div className="panel-title" style={{ color: '#E8B84B' }}>
                ⚡ {t(lang,'pendingReqs')} ({game.requests.length})
              </div>
              {game.requests.map(req => {
                const pl = players.find(p => p.id === req.playerId);
                const valid = pl && (req.type === 'pique'
                  ? hasHitOnCards(cardsOf(pl), game.calledNumbers)
                  : isValidAny(req.type, cardsOf(pl), pl.marked, game.calledNumbers));
                const validMsg = req.type === 'pique'
                  ? (lang==='es' ? '✅ Tiene un número cantado en su cartón' : '✅ Has a called number on their card')
                  : (lang==='es' ? '✅ Válido según marcas y números' : '✅ Valid by marks and numbers');
                const invalidMsg = req.type === 'pique'
                  ? (lang==='es' ? '❌ Ningún número cantado en su cartón aún' : '❌ No called number on their card yet')
                  : (lang==='es' ? '❌ Las marcas no coinciden con cantados' : '❌ Marks don\'t match called numbers');
                return (
                  <div key={req.id} className="req-banner">
                    <div>
                      <div className="req-type">¡{req.type.toUpperCase()}! — {req.playerName}</div>
                      <p className="xs dim mt4">
                        {req.ts} · {valid ? validMsg : invalidMsg}
                      </p>
                    </div>
                    <div className="flex g6">
                      <button className="btn btn-green btn-sm" onClick={() => { onValidate(req.id); }}>✓ Validar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { onReject(req.id); }}>✗ Rechazar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All player cards */}
          <div className="snoop-grid">
            {[...players].sort(playerSort).map(p => {
              const cards = cardsOf(p);
              const reqs = reqsByPlayer[p.id] || [];
              const correctMarks = p.marked.filter(n => game.calledNumbers.includes(n)).length;
              const wrongMarks = p.marked.filter(n => !game.calledNumbers.includes(n)).length;
              return (
                <div key={p.id} className="sn-card">
                  <div className="sn-head">
                    <span className="sn-name">{p.name}</span>
                    <div className="flex g5 ac">
                      {p.isMC && <span className="chip chip-mc">MC</span>}
                      <span className="xs dim">{idxsOf(p).map(i => `#${CARTONES[i].id}`).join(' ')}</span>
                      {reqs.length > 0 && <span className="chip chip-req">¡{reqs[0].type.toUpperCase()}!</span>}
                    </div>
                  </div>
                  {reqs.map(req => (
                    <div key={req.id} className="sn-req-mini">
                      <span className="fw9 gold xs" style={{ textTransform: 'uppercase' }}>¡{req.type}!</span>
                      <div className="flex g4">
                        <button className="btn btn-green btn-sm" onClick={() => onValidate(req.id)}>✓</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onReject(req.id)}>✗</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex fc g8">
                    {cards.map((carton, ci) => (
                      <div key={ci}>
                        <div className="xs dim" style={{marginBottom:3}}>#{carton.id}</div>
                        <MiniCarton carton={carton} marked={p.marked} calledNums={game.calledNumbers} />
                      </div>
                    ))}
                  </div>
                  <div className="flex jb mt8 xs dim">
                    <span>✅ {correctMarks} {lang==='es'?'correctos':'correct'}</span>
                    <span>🔴 {wrongMarks} {lang==='es'?'incorrectos':'wrong'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// ANNOUNCEMENT OVERLAY
// ────────────────────────────────────────────────────────────
function AnnView({ ann, onClose }) {
  return (
    <div className="ann-bg" onClick={onClose}>
      <div className={`ann-box ann-${ann.type}`} onClick={e => e.stopPropagation()}>
        <button className="ann-close" onClick={onClose}>✕</button>
        {ann.type === 'draw' && <div className="ann-ball">{ann.val}</div>}
        <div className="ann-title">{ann.msg}</div>
        {ann.sub && <div className="ann-sub">{ann.sub}</div>}
        {ann.type === 'win' && <div className="ann-emoji">🎉✨🎊</div>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// GAME VIEW
// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
// TIE BREAK MODAL
// ────────────────────────────────────────────────────────────
// Compact player strip shown in the game view for everyone
function PlayersStrip({ players, pique, me, lang, onRemove }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="panel" style={{width:230,flexShrink:0,alignSelf:'flex-start'}}>
      <div className="panel-title">{lang==='es'?'Jugadores en sala':'Players'}</div>
      {[...players].sort(playerSort).map(p => (
        <div key={p.id} className="p-row">
          <div className="pl-av-wrap">
            <div className="p-av">{p.name[0].toUpperCase()}</div>
            <div className={isOnline(p) ? 'dot-online' : 'dot-offline'}
              style={{position:'absolute',bottom:-1,right:-1}}
              title={isOnline(p)?(lang==='es'?'Conectado':'Connected'):(lang==='es'?'Desconectado':'Disconnected')} />
            {me?.isMC && p.id !== me.id && (
              <button className="rm-x" title={lang==='es'?'Quitar jugador':'Remove player'}
                onClick={() => onRemove(p)}>×</button>
            )}
          </div>
          <span className="p-name">
            {p.name}{p.id === me?.id ? ` (${lang==='es'?'tú':'you'})` : ''}
          </span>
          {p.isMC && <span className="p-tag-mc">MC</span>}
          {pique?.enabled && pique.participants?.includes(p.id) && <span title={t(lang,'inPique')} style={{fontSize:'.75rem'}}>⚡</span>}
          <span className="p-tag-ct">{idxsOf(p).map(i => `#${CARTONES[i].id}`).join(' ')}</span>
        </div>
      ))}
    </div>
  );
}

function LeaveGameModal({ onConfirm, onCancel, lang }) {
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal-box" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>⚠️ {lang==='es'?'¿Salir de la partida?':'Leave the game?'}</h2>
        </div>
        <div className="modal-body">
          <p style={{fontWeight:700,fontSize:'1rem',lineHeight:1.5}}>
            {lang==='es'
              ? 'Si sales como Animador, la partida terminará para todos los jugadores.'
              : 'If you leave as MC, the game will end for all players.'}
          </p>
          <div className="flex g10 mt12" style={{justifyContent:'space-between',alignItems:'center'}}>
            <button className="btn btn-ghost btn-sm" onClick={onConfirm}>
              {lang==='es'?'Sí, terminar partida':'Yes, end game'}
            </button>
            <button className="btn btn-gold btn-xl" onClick={onCancel}>
              {lang==='es'?'← No, seguir jugando':'← No, keep playing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirm before kicking a player from the room
function RemovePlayerModal({ player, onConfirm, onCancel, lang }) {
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal-box" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr"><h2>🗑️ {lang==='es'?'Quitar jugador':'Remove player'}</h2></div>
        <div className="modal-body">
          <p style={{fontWeight:700,fontSize:'1rem',lineHeight:1.5}}>
            {lang==='es' ? '¿Quitar a ' : 'Remove '}<span style={{color:'#E8B84B'}}>{player.name}</span>{lang==='es'?' de la sala?':' from the room?'}
          </p>
          <p className="xs dim mt8">{lang==='es'
            ? 'Sus cartones quedarán libres. Puede volver a entrar con el mismo nombre y elegir cartones de nuevo.'
            : 'Their cards will be freed. They can rejoin with the same name and pick cards again.'}</p>
          <div className="flex g10 mt12" style={{justifyContent:'space-between',alignItems:'center'}}>
            <button className="btn btn-danger btn-sm" onClick={onConfirm}>{lang==='es'?'Sí, quitar':'Yes, remove'}</button>
            <button className="btn btn-gold btn-xl" onClick={onCancel}>{lang==='es'?'← Cancelar':'← Cancel'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manual override window — MC assigns prizes directly (for paper-card players)
function OverrideModal({ players, game, pique, settings, onAward, onClose, lang }) {
  const PRIZES = ['terna','linea','lota'].concat(pique.active && !pique.settled ? ['pique'] : []);
  const COLORS = { terna:'#E8B84B', linea:'#C94B28', lota:'#27AE60', pique:'#BE8EE8' };
  const [sel, setSel] = useState({ terna:[], linea:[], lota:[], pique:[] });
  const total = calcPot(players.length, settings.apuesta);
  const amountFor = (type) => type==='pique'
    ? (pique.participants?.length || 0) * pique.stake
    : calcPrize(total, { terna:settings.ternaPct, linea:settings.lineaPct, lota:settings.lotaPct }[type]);

  const toggle = (type, id) => setSel(s => ({ ...s, [type]: s[type].includes(id) ? s[type].filter(x=>x!==id) : [...s[type], id] }));
  const winnerOf = (type) => type==='pique' ? (pique.settled ? pique.winner : null) : game.prizes[type];

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{maxWidth:680}}>
        <div className="modal-hdr">
          <h2>🏆 {lang==='es'?'Asignar premios (manual)':'Assign prizes (manual)'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{t(lang,'closeBnt')}</button>
        </div>
        <div className="modal-body" style={{gap:14}}>
          <p className="xs dim">{lang==='es'
            ? 'Para jugadores con cartón de papel. Marca uno o varios ganadores (varios = dividen el premio) y asigna. Se anuncia a todos y se valida oficialmente.'
            : 'For players with paper cards. Select one or more winners (multiple = split) and assign. Announced to everyone and officially recorded.'}</p>
          {PRIZES.map(type => {
            const won = winnerOf(type);
            return (
              <div key={type} className="panel" style={{padding:12}}>
                <div className="flex jb ac mb8">
                  <span className="fw9" style={{color:COLORS[type],textTransform:'uppercase',letterSpacing:'.05em'}}>
                    {type==='pique'?'⚡ Pique':type} · {fmtClp(amountFor(type))}
                  </span>
                  {won
                    ? <span className="chip chip-ok">✓ {won.playerName}</span>
                    : <button className="btn btn-sm" disabled={!sel[type].length}
                        style={{background:COLORS[type],color:'#1A0E06',border:'none',borderRadius:6,fontWeight:800,opacity:sel[type].length?1:.4,cursor:sel[type].length?'pointer':'not-allowed'}}
                        onClick={() => { onAward(type, sel[type]); setSel(s=>({...s,[type]:[]})); }}>
                        {lang==='es'?'Asignar':'Assign'}{sel[type].length>1?` (${lang==='es'?'dividir':'split'} ${sel[type].length})`:''}
                      </button>}
                </div>
                {!won && (
                  <div className="flex g6" style={{flexWrap:'wrap'}}>
                    {[...players].sort(playerSort).map(p => (
                      <button key={p.id} onClick={() => toggle(type, p.id)}
                        className={`cs-btn${sel[type].includes(p.id)?' active':' cs-free'}`}
                        style={{fontSize:'.74rem'}}>
                        {p.name} <span style={{opacity:.6}}>{idxsOf(p).map(i=>`#${CARTONES[i].id}`).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TieBreakModal({ tiedPlayers, piqueAmount, onSplit, onKeepDrawing, lang }) {
  const perPlayer = Math.floor(piqueAmount / tiedPlayers.length);
  return (
    <div className="modal-bg">
      <div className="modal-box" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr">
          <h2 style={{color:'#E8B84B'}}>⚡ {t(lang,'piqueTie')}</h2>
        </div>
        <div className="modal-body tc">
          <p style={{fontSize:'1.05rem',fontWeight:800,marginBottom:6,lineHeight:1.4}}>
            {tiedPlayers.map(p=>p.name).join(' & ')}
          </p>
          <p className="dim xs mb8">{lang==='es'?'tienen el número':'have the number'} · {t(lang,'piqueTieSub')}</p>
          <div className="flex g10 mt12 jc" style={{flexWrap:'wrap'}}>
            <button className="btn btn-gold btn-xl" onClick={onSplit}>
              {t(lang,'piqueSplit')}
              <span className="pz-sub">{fmtClp(perPlayer)} {lang==='es'?'c/u':'each'}</span>
            </button>
            <button className="btn btn-red" onClick={onKeepDrawing}>
              {t(lang,'piqueKeepDraw')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameView({ room, me, players, settings, game, onDraw, onMark, onClaim, onClaimPique, onValidate, onReject, onAwardPrize, onRemovePlayer, showSnoop, setShowSnoop, ballKey, onLeave, onSettle, onShowBalances, pique, piqueAction, lang, onToggleLang }) {
  const [showLeaveWarn, setShowLeaveWarn] = useState(false);
  const [showOverride, setShowOverride]   = useState(false);
  const [removeTarget, setRemoveTarget]   = useState(null);
  const myCards = cardsOf(me);
  const total = calcPot(players.length, settings.apuesta);
  const { terna, linea, lota } = game.prizes;
  const allDone = !!(terna && linea && lota);

  // Prize button eligibility (across all of player's cards)
  const canTerna = !terna && canReqAny('terna', myCards, me.marked);
  const canLinea = !!terna && !linea && canReqAny('linea', myCards, me.marked);
  const canLota  = !!linea && !lota  && canReqAny('lota',  myCards, me.marked);

  // Pique button: active participant + at least 1 called number on any card + not already claimed
  const inPique      = pique.active && !pique.settled && pique.participants?.includes(me.id);
  const canClaimPiq  = inPique
    && !game.requests.some(r => r.type === 'pique' && r.playerId === me.id)
    && hasHitOnCards(myCards, game.calledNumbers);
  const pendingPiqReq = game.requests.some(r => r.type === 'pique' && r.playerId === me.id);

  const recent = [...game.calledNumbers].reverse().slice(0, VISIBLE_LAST_CALLS);

  return (
    <div className="game">
      {/* ── HEADER ── */}
      <div className="game-hdr">
        <div className="code-pill">
          <span className="code-val" style={{ fontSize: '1.1rem' }}>{room.code}</span>
          {me.isMC && <span className="chip chip-mc">MC 🎤</span>}
        </div>

        <div className="prize-bar">
          <div className={`pb-item ${terna ? 'pb-won' : 'pb-open'}`}>
            Terna{terna ? ` — ${terna.playerName}` : ` ${fmtClp(calcPrize(total, settings.ternaPct))}`}
          </div>
          <div className={`pb-item ${linea ? 'pb-won' : terna ? 'pb-open' : 'pb-pend'}`}>
            Línea{linea ? ` — ${linea.playerName}` : ` ${fmtClp(calcPrize(total, settings.lineaPct))}`}
          </div>
          <div className={`pb-item ${lota ? 'pb-won' : linea ? 'pb-open' : 'pb-pend'}`}>
            Lota{lota ? ` — ${lota.playerName}` : ` ${fmtClp(calcPrize(total, settings.lotaPct))}`}
          </div>
          {pique.active && (
            <div className={`pb-item ${pique.settled ? 'pb-won' : 'pb-open'}`} style={{borderColor:'#9B59B6',color:pique.settled?'#9B59B6':'#BE8EE8'}}>
              ⚡ Pique{pique.settled && pique.winner ? ` — ${pique.winner.playerName}` : ` ${fmtClp(pique.participants.length * pique.stake)}`}
            </div>
          )}
        </div>

        <div className="flex g8 ac">
          {me.isMC && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowLeaveWarn(true)}>{t(lang,'lobby')}</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onShowBalances}>{t(lang,'balances')}</button>
          {me.isMC && allDone && (
            <button className="btn btn-gold btn-sm" onClick={onSettle}>{t(lang,'finalSettle')}</button>
          )}
          <LangToggle lang={lang} onToggle={onToggleLang} />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="game-body">
        {/* LEFT: players panel */}
        <PlayersStrip players={players} pique={pique} me={me} lang={lang} onRemove={setRemoveTarget} />

        {/* CENTER: player carton + prize buttons */}
        <div className="game-main">
          {/* Players see only last-drawn numbers, not a full list */}
          {!me.isMC && recent.length > 0 && (
            <div className="last-wrap">
              <span className="last-lbl">{t(lang,'lastCalled')}</span>
              <div className="last-balls">
                {recent.map((n, i) => (
                  <div key={n} className={`mini-ball${i === 0 ? ' newest' : ''}`}>{n}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex fc g12" style={{width:'100%',maxWidth:540}}>
            {myCards.map((carton, ci) => (
              <CartonCard key={ci} carton={carton} marked={me.marked} calledNums={game.calledNumbers}
                skin={me.skin} onToggle={onMark} hideCalled />
            ))}
          </div>

          {/* Pique button — shown to participants only, below prize row */}
          {(inPique || pique.settled) && (
            <div style={{width:'100%',maxWidth:540}}>
              <button className={`pz-btn pz-pique${pique.settled?' pz-won':''}`}
                disabled={pique.settled || pendingPiqReq || !canClaimPiq}
                onClick={onClaimPique}>
                {pique.settled
                  ? `✓ ⚡ Pique — ${pique.winner?.playerName}`
                  : pendingPiqReq
                    ? `⚡ ${t(lang,'piqSent')}`
                    : '⚡ ¡PIQUE!'}
                <span className="pz-sub">
                  {pique.settled
                    ? fmtClp(pique.winner?.amount ?? 0)
                    : canClaimPiq ? t(lang,'piqHaveNum') : t(lang,'piqWaitNum')}
                </span>
              </button>
            </div>
          )}

          {/* Prize request buttons */}
          <div className="pz-row">
            <button className={`pz-btn pz-terna${terna ? ' pz-won' : ''}`}
              disabled={terna ? true : !canTerna}
              onClick={() => onClaim('terna')}>
              {terna ? '✓ Terna' : '¡TERNA!'}
              <span className="pz-sub">{terna ? terna.playerName : canTerna ? t(lang,'pzTernaHave') : t(lang,'pzTernaNeed')}</span>
            </button>
            <button className={`pz-btn pz-linea${linea ? ' pz-won' : ''}`}
              disabled={linea ? true : !canLinea}
              onClick={() => onClaim('linea')}>
              {linea ? '✓ Línea' : '¡LÍNEA!'}
              <span className="pz-sub">{linea ? linea.playerName : terna ? (canLinea ? t(lang,'pzLineaHave') : t(lang,'pzLineaNeed')) : t(lang,'pzLineaFirst')}</span>
            </button>
            <button className={`pz-btn pz-lota${lota ? ' pz-won' : ''}`}
              disabled={lota ? true : !canLota}
              onClick={() => onClaim('lota')}>
              {lota ? '✓ Lota' : '¡LOTA!'}
              <span className="pz-sub">{lota ? lota.playerName : linea ? (canLota ? t(lang,'pzLotaHave') : t(lang,'pzLotaNeed')) : t(lang,'pzLotaFirst')}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: MC Control Tower */}
        {me.isMC && (
          <div className="game-tower">
            {/* Draw section */}
            <div className="tw-panel">
              <div className="tw-title">{t(lang,'mcControl')}</div>
              <div className="draw-row">
                <div className={`big-ball${game.lastDrawn ? ' fresh' : ' empty'}`} key={ballKey}>
                  {game.lastDrawn || '—'}
                </div>
                <button className="btn-draw" onClick={onDraw}
                  disabled={game.calledNumbers.length >= 90 || allDone}>
                  {t(lang,'callNumber')}
                </button>
              </div>
              <div className="divline" />
              <div className="stat-row">
                <span style={{fontSize:'.72rem',color:'#C8A878',fontWeight:700}}>{90 - game.calledNumbers.length} {t(lang,'remaining')}</span>
              </div>
              <div className="flex g6 mt8">
                <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={() => setShowSnoop(true)}>
                  👁 {t(lang,'gamePlayers')} {game.requests.length > 0 && `(${game.requests.length} ⚡)`}
                </button>
                <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={() => setShowOverride(true)}>
                  🏆 {lang==='es'?'Premios':'Awards'}
                </button>
              </div>
            </div>

            {/* Log */}
            {game.log.length > 0 && (
              <div className="tw-panel">
                <div className="tw-title">{t(lang,'gameLog')}</div>
                <div className="game-log">
                  {game.log.map(e => (
                    <div key={e.id} className={`le le-${e.type === 'pique-tie' ? 'req' : e.type}`}>
                      <span>{e.msg}</span>
                      <div className="flex ac g6">
                        {e.type === 'req' && e.reqId && (() => {
                          const thisReq = game.requests.find(r => r.id === e.reqId);
                          if (!thisReq) return null; // already handled — no buttons
                          const sameType = game.requests.filter(r => r.type === thisReq.type);
                          const others   = sameType.filter(r => r.id !== e.reqId);
                          const canSplit = others.length > 0 && (thisReq.type === 'pique' ? !pique.settled : true);
                          const splitIds = [...others.map(r=>r.playerId), thisReq.playerId];
                          return (
                            <>
                              <button className="btn btn-green btn-sm" onClick={() => onValidate(e.reqId)} title={lang==='es'?'Validar':'Validate'}>✓</button>
                              {canSplit && (
                                <button className="btn btn-sm" style={{fontSize:'.62rem',padding:'3px 7px',background:'#9B59B6',color:'#fff',border:'none',borderRadius:5,cursor:'pointer',fontFamily:"'Nunito',sans-serif",fontWeight:800}}
                                  title={lang==='es'?'Dividir entre los que reclaman':'Split among claimants'}
                                  onClick={() => thisReq.type === 'pique' ? piqueAction('split', splitIds) : onAwardPrize(thisReq.type, splitIds)}>
                                  {lang==='es'?'Dividir':'Split'}
                                </button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={() => onReject(e.reqId)} title={lang==='es'?'Rechazar':'Reject'}>✗</button>
                            </>
                          );
                        })()}
                        <span className="le-ts">{e.ts}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Number matrix */}
            <div className="tw-panel">
              <div className="tw-title">{t(lang,'table')}</div>
              <div className="matrix">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80].map(start => (
                  <div key={start} className="mx-row">
                    {Array.from({ length: start === 80 ? 11 : 10 }, (_, i) => start + i)
                      .filter(n => n > 0)
                      .map(n => (
                        <div key={n} className={`mx-cell${game.calledNumbers.includes(n) ? ' hit' : ''}`}>{n}</div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {allDone && (
              <button className="btn btn-gold btn-xl btn-block" onClick={onSettle}>
                {t(lang,'finalSettle')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Snoop Modal */}
      {showSnoop && (
        <SnoopModal
          players={players} game={game} lang={lang}
          onClose={() => setShowSnoop(false)}
          onValidate={reqId => { onValidate(reqId); setShowSnoop(false); }}
          onReject={reqId => { onReject(reqId); setShowSnoop(false); }}
        />
      )}

      {/* Leave game warning (MC only) */}
      {showLeaveWarn && (
        <LeaveGameModal lang={lang}
          onConfirm={() => { setShowLeaveWarn(false); onLeave(); }}
          onCancel={() => setShowLeaveWarn(false)} />
      )}

      {/* Manual override window (MC) */}
      {showOverride && (
        <OverrideModal players={players} game={game} pique={pique} settings={settings} lang={lang}
          onAward={(type, ids) => onAwardPrize(type, ids)}
          onClose={() => setShowOverride(false)} />
      )}

      {/* Remove player confirm (MC) */}
      {removeTarget && (
        <RemovePlayerModal player={removeTarget} lang={lang}
          onConfirm={() => { onRemovePlayer(removeTarget.id); setRemoveTarget(null); }}
          onCancel={() => setRemoveTarget(null)} />
      )}

      {/* Tie Break Modal */}
      {pique.tied.length > 0 && !pique.settled && (
        <TieBreakModal
          lang={lang}
          tiedPlayers={pique.tied.map(id => players.find(p => p.id === id)).filter(Boolean)}
          piqueAmount={pique.participants.length * pique.stake}
          onSplit={() => piqueAction('split')}
          onKeepDrawing={() => piqueAction('keep')}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// BALANCES MODAL  (lobby + in-game overlay)
// ────────────────────────────────────────────────────────────
const EMPTY_STAT = { gamesPlayed: 0, wins: { terna: 0, linea: 0, lota: 0, pique: 0 }, totalWagered: 0 };

function StatsTable({ players, stats, lang = 'es' }) {
  const sorted = [...players].sort((a, b) => b.balance - a.balance);
  return (
    <div className="stats-wrap">
      <table className="stats-tbl">
        <thead>
          <tr>
            <th>{t(lang,'stPlayer')}</th>
            <th>{t(lang,'stGames')}</th>
            <th style={{color:'#E8B84B'}}>Ternas</th>
            <th style={{color:'#C94B28'}}>Líneas</th>
            <th style={{color:'#27AE60'}}>Lotas</th>
            <th style={{color:'#BE8EE8'}}>Piques</th>
            <th>{t(lang,'stBet')}</th>
            <th>{t(lang,'stBalance')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
            // Prefer DB-synced per-player stats (visible to everyone) — fall back to local stats for older data
            const local = stats[p.name] || EMPTY_STAT;
            const st = {
              gamesPlayed:  p.gamesPlayed  ?? local.gamesPlayed  ?? 0,
              totalWagered: p.totalWagered ?? local.totalWagered ?? 0,
              wins:         p.wins         ?? local.wins         ?? EMPTY_STAT.wins,
            };
            return (
              <tr key={p.id}>
                <td>
                  <div className="flex ac g8">
                    <div className="p-av" style={{width:26,height:26,fontSize:'.68rem',flexShrink:0}}>{p.name[0]}</div>
                    <span>{p.name}</span>
                    {p.isMC && <span className="chip chip-mc" style={{fontSize:'.55rem'}}>MC</span>}
                  </div>
                </td>
                <td className="dim">{st.gamesPlayed}</td>
                <td className="st-terna">{st.wins.terna}</td>
                <td className="st-linea">{st.wins.linea}</td>
                <td className="st-lota">{st.wins.lota}</td>
                <td style={{color:'#BE8EE8'}}>{st.wins.pique ?? 0}</td>
                <td className="dim">-{fmtClp(st.totalWagered)}</td>
                <td className={p.balance > 0 ? 'bal-pos' : p.balance < 0 ? 'bal-neg' : 'bal-zero'}>
                  {p.balance > 0 ? '+' : ''}{fmtClp(p.balance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BalancesModal({ players, stats, currentGame, onClose, lang = 'es' }) {
  const prizes = currentGame?.prizes || {};
  const anyPrize = prizes.terna || prizes.linea || prizes.lota;
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{maxWidth:760}}>
        <div className="modal-hdr">
          <h2>💰 {t(lang,'sessionBal')}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{t(lang,'closeBnt')}</button>
        </div>
        <div className="modal-body">
          {anyPrize && (
            <div>
              <div className="panel-title" style={{color:'#C8A878',marginBottom:8}}>{t(lang,'curPrizes')}</div>
              <div className="cur-prizes">
                {['terna','linea','lota'].map(type => {
                  const p = prizes[type];
                  if (!p) return null;
                  return (
                    <div key={type} className="prize-line">
                      <span className="prize-type" style={{color:type==='terna'?'#E8B84B':type==='linea'?'#C94B28':'#27AE60',width:60}}>{type}</span>
                      <span className="prize-winner">{p.playerName}</span>
                      <span className="prize-amt" style={{color:'#2ECC71'}}>+{fmtClp(p.amount)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="divline" />
            </div>
          )}
          <div className="panel-title" style={{color:'#C8A878',marginBottom:10}}>{t(lang,'sessionAll')}</div>
          <StatsTable players={players} stats={stats} lang={lang} />
          <p className="xs dim tc mt12">{t(lang,'balNote')}</p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SETTLEMENT VIEW
// ────────────────────────────────────────────────────────────
function SettleView({ players, settings, game, stats, onNewRound, onBack, lang = 'es', onToggleLang }) {
  const total = calcPot(players.length, settings.apuesta);
  const pctMap = { terna: settings.ternaPct, linea: settings.lineaPct, lota: settings.lotaPct };

  return (
    <div className="settle">
      <div className="settle-hdr">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="logo-txt" style={{ fontSize: '2.2rem' }}>{t(lang,'settleTitle')}</div>
          <LangToggle lang={lang} onToggle={onToggleLang} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>{t(lang,'backBtn')}</button>
      </div>

      {/* Prizes this round */}
      <div className="panel" style={{ width: '100%', maxWidth: 680 }}>
        <div className="panel-title">{t(lang,'prizeThisRound')} {fmtClp(total)}</div>
        {['terna', 'linea', 'lota'].map(type => {
          const p = game.prizes[type];
          return (
            <div key={type} className="prize-line">
              <span className="prize-type" style={{ color: type === 'terna' ? '#E8B84B' : type === 'linea' ? '#C94B28' : '#27AE60', width: 60 }}>
                {type}
              </span>
              <span className="prize-winner">{p ? p.playerName : '—'}</span>
              <span className="prize-amt" style={{ color: p ? '#2ECC71' : '#B08868' }}>
                {p ? `+${fmtClp(p.amount)}` : fmtClp(calcPrize(total, pctMap[type]))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Full session stats */}
      <div className="panel" style={{ width: '100%', maxWidth: 680 }}>
        <div className="panel-title">{t(lang,'sessionHistory')}</div>
        <StatsTable players={players} stats={stats} lang={lang} />
      </div>

      <button className="btn btn-gold btn-xl" onClick={onNewRound}>
        {t(lang,'newRound')}
      </button>
      <p className="xs dim tc">
        Próximamente: transferencias directas y alertas de pago automáticas
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN APP — State Machine (Supabase-backed multiplayer)
// ────────────────────────────────────────────────────────────
export default function App() {
  const [screen,       setScreen]       = useState('landing');
  const [room,         setRoom]         = useState(null);
  const [me,           setMe]           = useState(null);
  const [players,      setPlayers]      = useState([]);
  const [settings,     setSettings]     = useState(INIT_SETTINGS);
  const [game,         setGame]         = useState(INIT_GAME);
  const [gameId,       setGameId]       = useState(null);
  const [pique,        setPique]        = useState(INIT_PIQUE);
  const [ann,          setAnn]          = useState(null);
  const [snoop,        setSnoop]        = useState(false);
  const [ballKey,      setBallKey]      = useState(0);
  const [stats,        setStats]        = useState({});
  const [showBalances, setShowBalances] = useState(false);
  const [lang,         setLang]         = useState('es');
  const [loading,      setLoading]      = useState(false);
  const [joinError,    setJoinError]    = useState('');

  const annTimer      = useRef(null);
  const settingsRef   = useRef(settings);   settingsRef.current   = settings;
  const langRef       = useRef(lang);       langRef.current       = lang;
  const piqueRef      = useRef(pique);      piqueRef.current      = pique;
  const playersRef    = useRef(players);    playersRef.current    = players;
  const meRef         = useRef(me);         meRef.current         = me;
  const gameRef       = useRef(game);       gameRef.current       = game;
  const gameIdRef     = useRef(gameId);     gameIdRef.current     = gameId;
  const roomRef       = useRef(room);       roomRef.current       = room;

  const toggleLang = useCallback(() => setLang(l => l === 'es' ? 'en' : 'es'), []);

  // URL pre-fill: read room code from path (e.g. /ABC123)
  const urlCode = window.location.pathname.slice(1).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const initialCode = urlCode.length === 6 ? urlCode : '';
  useEffect(() => { if (initialCode) window.history.replaceState(null, '', '/'); }, [initialCode]);

  // Heartbeat: keep last_seen fresh so others can tell we're connected
  useEffect(() => {
    if (!me?.id) return;
    const ping = async () => {
      const ts = new Date().toISOString();
      await supabase.from('players').update({ last_seen: ts }).eq('id', me.id);
      setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, lastSeen: ts } : p));
    };
    ping(); // immediate on join
    const t = setInterval(ping, 20000);
    return () => clearInterval(t);
  }, [me?.id]);

  // ── Announcement ──────────────────────────────────────────
  const announce = useCallback((type, msg, val = '', sub = '', dur = 3500) => {
    if (annTimer.current) clearTimeout(annTimer.current);
    setAnn({ type, msg, val, sub });
    playTone(type, settingsRef.current.soundMode);
    annTimer.current = setTimeout(() => setAnn(null), dur);
  }, []);

  // ── Realtime subscription (set up once per room) ──────────
  useEffect(() => {
    if (!room?.code) return;
    const code = room.code;

    const channel = supabase.channel(`room:${code}`)

      // ── Players changes ──
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${code}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const p = supaToPlayer(payload.new);
            setPlayers(prev => prev.find(x => x.id === p.id) ? prev : [...prev, p]);
          } else if (payload.eventType === 'UPDATE') {
            const p = supaToPlayer(payload.new);
            setPlayers(prev => prev.map(x => x.id === p.id ? p : x));
            if (meRef.current && payload.new.id === meRef.current.id) {
              setMe(prev => ({ ...prev, ...p }));
            }
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(x => x.id !== payload.old.id));
            // If I was the one removed, send me back to the landing screen
            if (meRef.current && payload.old.id === meRef.current.id) {
              window.history.pushState(null, '', '/');
              setScreen('landing');
              setRoom(null); setMe(null); setGame(INIT_GAME); setPique(INIT_PIQUE);
              setJoinError(langRef.current === 'es' ? 'El Animador te quitó de la sala.' : 'The MC removed you from the room.');
            }
          }
        })

      // ── Game changes ──
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `room_code=eq.${code}` },
        (payload) => {
          if (!payload.new || payload.new.status === 'settled') return;
          const newGame = supaToGame(payload.new);
          const prevGame = gameRef.current;

          // Non-MC: react to draws and prizes via realtime
          if (!meRef.current?.isMC) {
            if (newGame.lastDrawn && newGame.lastDrawn !== prevGame.lastDrawn) {
              announce('draw', `¡${newGame.lastDrawn}!`, newGame.lastDrawn, '', 1600);
              setBallKey(k => k + 1);
            }
            ['terna','linea','lota'].forEach(type => {
              if (newGame.prizes[type] && !prevGame.prizes[type]) {
                announce('win', `¡${newGame.prizes[type].playerName} ${t(langRef.current,'winsThe')} ${type.toUpperCase()}!`, type, fmtClp(newGame.prizes[type].amount), 5500);
              }
            });
            // New request from another player
            newGame.requests.forEach(req => {
              if (!prevGame.requests.find(r => r.id === req.id) && req.playerId !== meRef.current?.id) {
                announce('request', `¡${req.playerName}!`, req.type, `${t(langRef.current,'requests')} ${req.type.toUpperCase()}`, 3000);
              }
            });
            // Broadcast log entries carrying an announcement (e.g. incorrect-claim "shame")
            const prevIds = new Set(prevGame.log.map(e => e.id));
            newGame.log.forEach(e => {
              if (e.ann && !prevIds.has(e.id)) announce(...e.ann);
            });
          }

          // Pique resolved externally
          const newPs = payload.new.pique_state;
          if (newPs?.settled && !piqueRef.current.settled) {
            if (!meRef.current?.isMC) {
              if (newPs.winner) announce('win', `¡${newPs.winner.playerName} ${langRef.current==='es'?'ganó El Pique':'won El Pique'}!`, '', fmtClp(newPs.winner.amount), 5000);
            }
            setPique(newPs);
          }

          setGame(newGame);
          setGameId(payload.new.id);
        })

      // ── Room changes (settings, status) ──
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        (payload) => {
          const r = payload.new;
          const { pique: savedPique, ...gameSettings } = r.settings;
          setSettings(gameSettings);
          // Sync pique config from room settings (MC writes it, everyone reads it)
          if (savedPique) setPique(prev => ({ ...prev, ...savedPique }));
          // Non-MC: follow room status to change screens
          if (!meRef.current?.isMC) {
            if (r.status === 'active'  && ['landing','lobby'].includes(screenRef.current)) setScreen('game');
            if (r.status === 'lobby'   && screenRef.current === 'game')  { setGame(INIT_GAME); setPique(prev => ({...INIT_PIQUE, enabled:prev.enabled, stake:prev.stake})); setScreen('lobby'); }
            if (r.status === 'settled' && screenRef.current === 'game')  setScreen('settle');
          }
        })

      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room?.code, announce]);

  // Need a screenRef so the realtime closure can read current screen
  const screenRef = useRef(screen); screenRef.current = screen;

  // ── CREATE ROOM (MC) ─────────────────────────────────────
  const createRoom = useCallback(async (name) => {
    setLoading(true); setJoinError('');
    try {
      // Generate a code not already in DB
      let code;
      for (let i = 0; i < 10; i++) {
        code = genCode();
        const { data } = await supabase.from('rooms').select('code').eq('code', code).maybeSingle();
        if (!data) break;
      }
      const id = 'mc-' + Date.now();
      const mcCards = pickTopCartons([], CARDS_PER_PLAYER); // top 2: #50, #49
      await supabase.from('rooms').insert({ code, settings: INIT_SETTINGS, status: 'lobby' });
      await supabase.from('players').insert({
        id, room_code: code, name, normalized_name: normalizeName(name),
        is_mc: true, carton_idx: mcCards[0], carton_idxs: mcCards, skin: 'dot', marked: [], balance: 0,
      });
      window.history.pushState(null, '', `/${code}`);
      const mc = { id, name, isMC: true, cartonIdxs: mcCards, skin: 'dot', marked: [], balance: 0 };
      setRoom({ code });
      setMe(mc);
      setPlayers([mc]);
      setSettings(INIT_SETTINGS);
      setScreen('lobby');
    } catch (e) { setJoinError(lang === 'es' ? 'Error al crear la sala. Intenta de nuevo.' : 'Error creating room. Try again.'); }
    finally { setLoading(false); }
  }, [lang]);

  // ── JOIN ROOM (Player) ────────────────────────────────────
  const joinRoom = useCallback(async (code, name) => {
    setLoading(true); setJoinError('');
    try {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle();
      if (!roomData) {
        setJoinError(lang === 'es' ? 'Sala no encontrada. Revisa el código.' : 'Room not found. Check the code.');
        setLoading(false); return;
      }
      const normalized = normalizeName(name);
      // Reconnection: same normalized name in same room?
      const { data: existing } = await supabase.from('players')
        .select('*').eq('room_code', code).eq('normalized_name', normalized).maybeSingle();

      let player;
      if (existing) {
        // Restore existing player
        await supabase.from('players').update({ last_seen: new Date().toISOString() }).eq('id', existing.id);
        player = supaToPlayer(existing);
      } else {
        // New player — assign 2 highest available cartons (descending from #50)
        const { data: taken } = await supabase.from('players').select('carton_idxs,carton_idx').eq('room_code', code);
        const takenIdxs = (taken || []).flatMap(p => (p.carton_idxs?.length ? p.carton_idxs : [p.carton_idx]));
        const myCards = pickTopCartons(takenIdxs, CARDS_PER_PLAYER);
        const id = 'p-' + Date.now();
        await supabase.from('players').insert({
          id, room_code: code, name, normalized_name: normalized,
          is_mc: false, carton_idx: myCards[0], carton_idxs: myCards, skin: 'dot', marked: [], balance: 0,
        });
        player = { id, name, isMC: false, cartonIdxs: myCards, skin: 'dot', marked: [], balance: 0 };
      }

      // Load current players + active game
      const { data: allPlayers } = await supabase.from('players').select('*').eq('room_code', code);
      const { data: activeGame } = await supabase.from('games')
        .select('*').eq('room_code', code).eq('status', 'active').maybeSingle();

      window.history.pushState(null, '', `/${code}`);
      const { pique: savedPique, ...gameSettings } = roomData.settings;
      setSettings(gameSettings);
      if (savedPique) setPique(prev => ({ ...prev, ...savedPique }));
      setRoom({ code });
      setMe(player);
      setPlayers((allPlayers || []).map(supaToPlayer));
      if (activeGame) {
        setGame(supaToGame(activeGame));
        setGameId(activeGame.id);
        if (activeGame.pique_state) setPique(activeGame.pique_state);
        setScreen('game');
      } else {
        setScreen('lobby');
      }
    } catch (e) { setJoinError(lang === 'es' ? 'Error al unirse. Intenta de nuevo.' : 'Error joining. Try again.'); }
    finally { setLoading(false); }
  }, [lang]);

  // ── SELECT CARTON ─────────────────────────────────────────
  // Cards are kept in selection order [oldest … newest]. Defaults are
  // [#highest, #lower] so the highest is evicted first when overwriting.
  // - click your own (orange) card → deselect it
  // - click a free (white) card when not full → add it
  // - click a free card when full → evict the OLDEST, append the new one
  // - click a card owned by someone else (grey) → ignored
  const selectCarton = useCallback(async (idx) => {
    const takenByOthers = players.filter(p => p.id !== me.id).flatMap(p => idxsOf(p));
    if (takenByOthers.includes(idx)) return;
    const mine = idxsOf(me);
    let next;
    if (mine.includes(idx)) {
      next = mine.filter(i => i !== idx);            // deselect own
    } else if (mine.length < CARDS_PER_PLAYER) {
      next = [...mine, idx];                          // add (newest last)
    } else {
      next = [...mine.slice(1), idx];                 // full → drop oldest, append new
    }
    setMe(prev => ({ ...prev, cartonIdxs: next, marked: [] }));
    setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, cartonIdxs: next, marked: [] } : p));
    await supabase.from('players').update({ carton_idx: next[0] ?? 0, carton_idxs: next, marked: [] }).eq('id', me.id);
  }, [me, players]);

  // ── SELECT SKIN ───────────────────────────────────────────
  const selectSkin = useCallback(async (skin) => {
    setMe(prev => ({ ...prev, skin }));
    setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, skin } : p));
    await supabase.from('players').update({ skin }).eq('id', me.id);
  }, [me]);

  // ── SETTINGS (MC writes to DB) ────────────────────────────
  const handleSettings = useCallback(async (newSettings) => {
    setSettings(newSettings);
    // Preserve pique in settings so it stays synced
    if (room?.code) await supabase.from('rooms').update({ settings: { ...newSettings, pique: piqueRef.current } }).eq('code', room.code);
  }, [room]);

  // ── PIQUE (MC writes to DB so all players see it) ─────────
  const handlePique = useCallback(async (newPique) => {
    setPique(newPique);
    if (room?.code) await supabase.from('rooms').update({ settings: { ...settingsRef.current, pique: newPique } }).eq('code', room.code);
  }, [room]);

  // ── TRANSFER MC ───────────────────────────────────────────
  const transferMC = useCallback(async (targetId) => {
    setPlayers(prev => prev.map(p => p.id === targetId ? { ...p, isMC: true } : p.isMC ? { ...p, isMC: false } : p));
    setMe(prev => ({ ...prev, isMC: false }));
    await Promise.all([
      supabase.from('players').update({ is_mc: false }).eq('id', me.id),
      supabase.from('players').update({ is_mc: true  }).eq('id', targetId),
    ]);
  }, [me]);

  // ── START GAME ────────────────────────────────────────────
  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      const gId = 'g-' + Date.now();
      const piqueForGame = pique.enabled && pique.participants.length > 0
        ? { ...pique, active: true }
        : { ...INIT_PIQUE, enabled: false };

      await supabase.from('games').insert({
        id: gId, room_code: room.code, called_numbers: [], last_drawn: null,
        prizes: { terna: null, linea: null, lota: null },
        requests: [], log: [], pique_state: piqueForGame, status: 'active',
      });

      // Deduct balances, reset marks, bump session stats (games_played + wagered)
      await Promise.all(players.map(p => {
        let balance = p.balance - settings.apuesta;
        if (pique.enabled && pique.participants.includes(p.id)) balance -= pique.stake;
        return supabase.from('players').update({
          balance, marked: [],
          games_played:  (p.gamesPlayed  ?? 0) + 1,
          total_wagered: (p.totalWagered ?? 0) + settings.apuesta,
        }).eq('id', p.id);
      }));

      // Write active pique into rooms.settings so the realtime bounce-back restores active:true, not active:false
      await supabase.from('rooms').update({
        status: 'active',
        last_activity: new Date().toISOString(),
        settings: { ...settings, pique: piqueForGame },
      }).eq('code', room.code);

      // Track stats locally
      setStats(prev => {
        const next = { ...prev };
        players.forEach(p => { const e = next[p.name] || EMPTY_STAT; next[p.name] = { ...e, gamesPlayed: e.gamesPlayed+1, totalWagered: e.totalWagered+settings.apuesta }; });
        return next;
      });

      // MC: update local state immediately
      setPlayers(prev => prev.map(p => { let bal = p.balance - settings.apuesta; if (pique.enabled && pique.participants.includes(p.id)) bal -= pique.stake; return { ...p, balance: bal, marked: [] }; }));
      setMe(prev => { let bal = prev.balance - settings.apuesta; if (pique.enabled && pique.participants.includes(prev.id)) bal -= pique.stake; return { ...prev, marked: [], balance: bal }; });
      if (piqueForGame.active) setPique(piqueForGame);
      setGame({ ...INIT_GAME, status: 'active' });
      setGameId(gId);
      setScreen('game');
    } catch(e) { console.error('startGame error', e); }
    finally { setLoading(false); }
  }, [room, settings, players, pique]);

  // ── DRAW NUMBER ───────────────────────────────────────────
  const drawNumber = useCallback(async () => {
    if (game.status !== 'active') return;
    const avail = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !game.calledNumbers.includes(n));
    if (!avail.length) return;
    const num = avail[Math.floor(Math.random() * avail.length)];

    const newCalled = [...game.calledNumbers, num];
    const entry = { id: Date.now() + '', ts: tstamp(), msg: `${t(langRef.current,'logDrew')} ${num}`, type: 'draw' };
    const newLog = [entry, ...game.log];

    // MC: update local state immediately for responsiveness
    setGame(prev => ({ ...prev, calledNumbers: newCalled, lastDrawn: num, log: newLog }));
    announce('draw', `¡${num}!`, num, '', 1600);
    setBallKey(k => k + 1);

    // Write to DB — realtime notifies all other players
    await supabase.from('games')
      .update({ called_numbers: newCalled, last_drawn: num, log: newLog })
      .eq('id', gameIdRef.current);

  }, [game, announce]);

  // ── TOGGLE MARK ───────────────────────────────────────────
  const toggleMark = useCallback(async (num) => {
    if (!num || game.status !== 'active') return;
    const nm = me.marked.includes(num) ? me.marked.filter(n => n !== num) : [...me.marked, num];
    setMe(prev => ({ ...prev, marked: nm }));
    setPlayers(pp => pp.map(p => p.id === me.id ? { ...p, marked: nm } : p));
    await supabase.from('players').update({ marked: nm }).eq('id', me.id);
  }, [me, game.status]);

  // ── CLAIM PIQUE (skill-based button) ─────────────────────
  const claimPique = useCallback(async () => {
    if (!me || game.status !== 'active') return;
    const pq = piqueRef.current;
    if (!pq.active || pq.settled) return;
    if (!pq.participants?.includes(me.id)) return;
    // Must have at least one called number on any card
    if (!hasHitOnCards(cardsOf(me), game.calledNumbers)) return;
    // Already have a pending pique claim
    if (game.requests.some(r => r.type === 'pique' && r.playerId === me.id)) return;

    const reqId = Date.now() + '';
    const req   = { id: reqId, playerId: me.id, playerName: me.name, type: 'pique', ts: tstamp() };
    const entry = { id: reqId, ts: tstamp(), msg: `${me.name} ${t(langRef.current,'logShouts')} ⚡ ¡PIQUE!`, type: 'req', reqId };
    const newRequests = [...game.requests, req];
    const newLog      = [entry, ...game.log];

    setGame(prev => ({ ...prev, requests: newRequests, log: newLog }));
    announce('request', `¡${me.name}!`, 'pique', '⚡ ¡PIQUE!', 4000);
    await supabase.from('games').update({ requests: newRequests, log: newLog }).eq('id', gameIdRef.current);
  }, [me, game, announce]);

  // ── CLAIM PRIZE ───────────────────────────────────────────
  const claimPrize = useCallback(async (type) => {
    if (!me || game.status !== 'active') return;
    if (game.prizes[type]) return;
    if (type === 'linea' && !game.prizes.terna) return;
    if (type === 'lota'  && !game.prizes.linea) return;
    if (!canReqAny(type, cardsOf(me), me.marked)) return;

    const reqId = Date.now() + '';
    const req   = { id: reqId, playerId: me.id, playerName: me.name, type, ts: tstamp() };
    const entry = { id: reqId, ts: tstamp(), msg: `${me.name} ${t(langRef.current,'logShouts')} ¡${type.toUpperCase()}!`, type: 'req', reqId };
    const newRequests = [...game.requests, req];
    const newLog      = [entry, ...game.log];

    setGame(prev => ({ ...prev, requests: newRequests, log: newLog }));
    announce('request', `¡${me.name}!`, type, `Solicita ${type.toUpperCase()}`, 4000);
    await supabase.from('games').update({ requests: newRequests, log: newLog }).eq('id', gameIdRef.current);
  }, [me, game, announce]);

  // ── VALIDATE WIN ──────────────────────────────────────────
  const validateWin = useCallback(async (reqId) => {
    const req    = game.requests.find(r => r.id === reqId);
    if (!req) return;
    const player = players.find(p => p.id === req.playerId);
    if (!player) return;
    const es = langRef.current === 'es';

    // ── Pique claim ──────────────────────────────────────────
    if (req.type === 'pique') {
      const pq = piqueRef.current;
      if (pq.settled) { // already settled, reject
        const newReqs = game.requests.filter(r => r.id !== reqId);
        const invEntry = { id: Date.now()+'', ts: tstamp(), msg: `✗ ${req.playerName} — ${es?'Pique ya resuelto':'Pique already settled'}`, type:'inv' };
        setGame(prev => ({ ...prev, requests: newReqs, log: [invEntry, ...prev.log] }));
        await supabase.from('games').update({ requests: newReqs, log: [invEntry, ...game.log] }).eq('id', gameIdRef.current);
        return;
      }
      // Validate: must be a participant with at least 1 called number on any card
      const hasHit = hasHitOnCards(cardsOf(player), game.calledNumbers);
      const amount = pq.participants.length * pq.stake;
      // Remove this request + all other pique requests (auto-reject)
      const otherPiqueReqs = game.requests.filter(r => r.id !== reqId && r.type === 'pique');
      const newReqs = game.requests.filter(r => r.id !== reqId && r.type !== 'pique');
      const rejectEntries = otherPiqueReqs.map(r => ({ id: Date.now()+Math.random()+'', ts: tstamp(), msg: `✗ ${r.playerName} — ${es?'Pique ya reclamado':'Pique already claimed'}`, type:'inv' }));

      if (hasHit) {
        const newPiqueState = { ...pq, settled: true, active: false, tied: [], winner: { playerId: req.playerId, playerName: req.playerName, amount } };
        const winEntry = { id: Date.now()+'', ts: tstamp(), msg: `⚡ ¡${req.playerName} ${es?'ganó El Pique':'won El Pique'}! — ${fmtClp(amount)}`, type:'win' };
        const newLog = [winEntry, ...rejectEntries, ...game.log];
        setPique(newPiqueState);
        setGame(prev => ({ ...prev, requests: newReqs, log: newLog }));
        setPlayers(prev => prev.map(p => p.id === req.playerId ? { ...p, balance: p.balance + amount } : p));
        if (req.playerId === me.id) setMe(prev => ({ ...prev, balance: prev.balance + amount }));
        setStats(prev => { const e = prev[req.playerName]||EMPTY_STAT; return {...prev,[req.playerName]:{...e,wins:{...e.wins,pique:(e.wins.pique??0)+1}}}; });
        announce('win', `¡${req.playerName} ${es?'ganó El Pique':'won El Pique'}!`, '', fmtClp(amount), 5500);
        await Promise.all([
          supabase.from('games').update({ pique_state: newPiqueState, requests: newReqs, log: newLog }).eq('id', gameIdRef.current),
          supabase.from('players').update({ balance: player.balance + amount, wins: { ...(player.wins||{}), pique: (player.wins?.pique ?? 0) + 1 } }).eq('id', req.playerId),
        ]);
      } else {
        const invEntry = { id: Date.now()+'', ts: tstamp(), msg: `✗ ${req.playerName} — ${es?'sin número cantado en su cartón':'no called number on their card'}`, type:'inv' };
        const allNewReqs = game.requests.filter(r => r.id !== reqId);
        const newLog = [invEntry, ...game.log];
        setGame(prev => ({ ...prev, requests: allNewReqs, log: newLog }));
        announce('invalid', `¡Incorrecto!`, '', req.playerName, 2500);
        await supabase.from('games').update({ requests: allNewReqs, log: newLog }).eq('id', gameIdRef.current);
      }
      return;
    }

    // ── Regular prize claim ───────────────────────────────────
    // Prize already taken by someone else → auto-reject
    if (game.prizes[req.type]) {
      const invEntry = { id: Date.now()+'', ts: tstamp(), msg: `✗ ${req.playerName} — ${es?'ya fue reclamado por':'already claimed by'} ${game.prizes[req.type].playerName}`, type: 'inv' };
      const newReqs  = game.requests.filter(r => r.id !== reqId);
      const newLog   = [invEntry, ...game.log];
      setGame(prev => ({ ...prev, requests: newReqs, log: newLog }));
      announce('invalid', es?'¡Ya reclamado!':'Already claimed!', '', `${game.prizes[req.type].playerName} ${es?'ya ganó la':'already won'} ${req.type.toUpperCase()}`, 2500);
      await supabase.from('games').update({ requests: newReqs, log: newLog }).eq('id', gameIdRef.current);
      return;
    }
    const valid   = isValidAny(req.type, cardsOf(player), player.marked, game.calledNumbers);
    const newReqs = game.requests.filter(r => r.id !== reqId);

    if (valid) {
      const total  = calcPot(players.length, settings.apuesta);
      const pctMap = { terna: settings.ternaPct, linea: settings.lineaPct, lota: settings.lotaPct };
      const amt    = calcPrize(total, pctMap[req.type]);
      const winEntry = { id: Date.now()+'', ts: tstamp(), msg: `✓ ${req.playerName} ${es?'gana la':'wins'} ${req.type.toUpperCase()} — ${fmtClp(amt)}`, type:'win' };
      const newPrizes = { ...game.prizes, [req.type]: { playerId: req.playerId, playerName: req.playerName, amount: amt } };
      const newLog    = [winEntry, ...game.log];

      setGame(prev => ({ ...prev, prizes: newPrizes, requests: newReqs, log: newLog }));
      setPlayers(prev => prev.map(p => p.id === req.playerId ? { ...p, balance: p.balance + amt } : p));
      if (req.playerId === me.id) setMe(prev => ({ ...prev, balance: prev.balance + amt }));
      setStats(prev => { const e = prev[req.playerName]||EMPTY_STAT; return {...prev,[req.playerName]:{...e,wins:{...e.wins,[req.type]:e.wins[req.type]+1}}}; });
      announce('win', `¡${req.playerName} ${es?'gana la':'wins'} ${req.type.toUpperCase()}!`, req.type, fmtClp(amt), 5500);
      await Promise.all([
        supabase.from('games').update({ prizes: newPrizes, requests: newReqs, log: newLog }).eq('id', gameIdRef.current),
        supabase.from('players').update({ balance: player.balance + amt, wins: { ...(player.wins||{}), [req.type]: (player.wins?.[req.type] ?? 0) + 1 } }).eq('id', req.playerId),
      ]);
    } else {
      // Incorrect claim — broadcast a "shame" announcement to everyone via the log's ann field
      const shameTitle = `¡Incorrecto, ${req.playerName}!`;
      const shameSub   = es ? `Reclamó ${req.type.toUpperCase()} sin tenerla` : `Claimed ${req.type.toUpperCase()} without having it`;
      const invEntry = { id: Date.now()+'', ts: tstamp(), msg: `✗ ${es?'Solicitud inválida de':'Invalid claim from'} ${req.playerName} (${req.type.toUpperCase()})`, type:'inv',
        ann: ['invalid', shameTitle, '', shameSub, 3500] };
      const newLog = [invEntry, ...game.log];
      setGame(prev => ({ ...prev, requests: newReqs, log: newLog }));
      announce('invalid', shameTitle, '', shameSub, 3500);
      await supabase.from('games').update({ requests: newReqs, log: newLog }).eq('id', gameIdRef.current);
    }
  }, [game, players, me, settings, announce]);

  // ── REJECT REQUEST ────────────────────────────────────────
  const rejectRequest = useCallback(async (reqId) => {
    const req  = game.requests.find(r => r.id === reqId);
    if (!req) return;
    const entry   = { id: Date.now()+'', ts: tstamp(), msg: `✗ ${req.playerName} — ${t(langRef.current,'logRejected')}`, type:'inv' };
    const newReqs = game.requests.filter(r => r.id !== reqId);
    const newLog  = [entry, ...game.log];
    setGame(prev => ({ ...prev, requests: newReqs, log: newLog }));
    announce('invalid', '¡Rechazado!', '', `${req.playerName} — ${req.type.toUpperCase()}`, 2500);
    await supabase.from('games').update({ requests: newReqs, log: newLog }).eq('id', gameIdRef.current);
  }, [game, announce]);

  // ── AWARD PRIZE (manual / split — MC authority, no digital-mark check) ──
  // Used by the "Dividir" log buttons and the manual-override window.
  // playerIds: one winner, or several to split the prize equally.
  const awardPrize = useCallback(async (type, playerIds) => {
    if (!playerIds.length) return;
    const es = langRef.current === 'es';
    const g  = gameRef.current;
    const winners = playerIds.map(id => playersRef.current.find(p => p.id === id)).filter(Boolean);
    if (!winners.length) return;
    const names = winners.map(w => w.name).join(es ? ' y ' : ' & ');
    const label = type === 'pique' ? 'PIQUE' : type.toUpperCase();

    // Prize amount
    let amount;
    if (type === 'pique') {
      const pq = piqueRef.current;
      amount = (pq.participants?.length || winners.length) * pq.stake;
    } else {
      const total = calcPot(playersRef.current.length, settingsRef.current.apuesta);
      const pctMap = { terna: settingsRef.current.ternaPct, linea: settingsRef.current.lineaPct, lota: settingsRef.current.lotaPct };
      amount = calcPrize(total, pctMap[type]);
    }
    const per = Math.floor(amount / winners.length);
    const splitNote = winners.length > 1 ? (es ? ` (${fmtClp(per)} c/u)` : ` (${fmtClp(per)} each)`) : '';
    const logEntry = { id: Date.now()+'', ts: tstamp(), msg: `✓ ${names} ${es?'gana':'win'} ${label} — ${fmtClp(amount)}${splitNote}`, type:'win' };
    const newReqs  = g.requests.filter(r => r.type !== type);
    const newLog   = [logEntry, ...g.log];

    // Credit balances + stats + DB
    winners.forEach(async w => {
      setPlayers(prev => prev.map(p => p.id === w.id ? { ...p, balance: p.balance + per } : p));
      if (w.id === meRef.current?.id) setMe(m => ({ ...m, balance: m.balance + per }));
      setStats(prev => { const e = prev[w.name]||EMPTY_STAT; return {...prev,[w.name]:{...e,wins:{...e.wins,[type]:(e.wins[type]??0)+1}}}; });
      await supabase.from('players').update({ balance: w.balance + per, wins: { ...(w.wins||{}), [type]: (w.wins?.[type] ?? 0) + 1 } }).eq('id', w.id);
    });
    announce('win', `¡${names} ${es?'gana':'win'} ${label}!`, type==='pique'?'':type, fmtClp(per)+(winners.length>1?(es?' c/u':' each'):''), 5500);

    if (type === 'pique') {
      const pq = piqueRef.current;
      const newPs = { ...pq, settled:true, active:false, tied:[], winner:{ playerName:names, amount } };
      setPique(newPs);
      setGame(prev => ({ ...prev, requests:newReqs, log:newLog }));
      await supabase.from('games').update({ pique_state:newPs, requests:newReqs, log:newLog }).eq('id', gameIdRef.current);
    } else {
      const winnerObj = { playerId: playerIds[0], playerName: names, amount, split: winners.length>1 };
      const newPrizes = { ...g.prizes, [type]: winnerObj };
      setGame(prev => ({ ...prev, prizes:newPrizes, requests:newReqs, log:newLog }));
      await supabase.from('games').update({ prizes:newPrizes, requests:newReqs, log:newLog }).eq('id', gameIdRef.current);
    }
  }, [announce]);

  // ── REMOVE PLAYER (MC kicks an inactive player) ──────────
  const removePlayer = useCallback(async (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    await supabase.from('players').delete().eq('id', playerId);
  }, []);

  // ── PIQUE TIE ACTION ──────────────────────────────────────
  const piqueAction = useCallback(async (action, splitIds = null) => {
    const pq  = piqueRef.current;
    const es  = langRef.current === 'es';
    const currentLog = gameRef.current.log;
    if (action === 'split') {
      const winnerIds = splitIds || pq.tied;
      const amount    = pq.participants.length * pq.stake;
      const perPlayer = Math.floor(amount / winnerIds.length);
      const names     = winnerIds.map(id => playersRef.current.find(p=>p.id===id)?.name).filter(Boolean).join(es?' y ':' & ');
      const newPs     = { ...pq, settled: true, active: false, tied: [], winner: { playerName: names, amount } };
      const logEntry  = { id: Date.now()+'', ts: tstamp(), msg: `⚡ ${es?'Empate resuelto':'Tie resolved'}: ${names} ${es?'dividieron el Pique':'split El Pique'} — ${fmtClp(perPlayer)} ${es?'c/u':'each'}`, type: 'win' };
      // Remove all pending pique requests
      const newReqs   = gameRef.current.requests.filter(r => r.type !== 'pique');
      const newLog    = [logEntry, ...currentLog];
      setPique(newPs);
      setGame(prev => ({ ...prev, requests: newReqs, log: newLog }));
      winnerIds.forEach(async pid => {
        const p = playersRef.current.find(x => x.id === pid);
        if (!p) return;
        setPlayers(pp => pp.map(x => x.id === pid ? { ...x, balance: x.balance + perPlayer } : x));
        if (pid === meRef.current?.id) setMe(m => ({ ...m, balance: m.balance + perPlayer }));
        await supabase.from('players').update({ balance: p.balance + perPlayer }).eq('id', pid);
      });
      await supabase.from('games').update({ pique_state: newPs, requests: newReqs, log: newLog }).eq('id', gameIdRef.current);
    } else {
      // keep drawing — narrow to tied players
      const names  = pq.tied.map(id => playersRef.current.find(p=>p.id===id)?.name).filter(Boolean).join(es?' y ':' & ');
      const newPs  = { ...pq, participants: pq.tied, tied: [] };
      const logEntry = { id: Date.now()+'', ts: tstamp(), msg: `⚡ ${es?'Pique continúa entre':'Pique continues between'}: ${names}`, type: 'req' };
      const newLog = [logEntry, ...currentLog];
      setPique(newPs);
      setGame(prev => ({ ...prev, log: newLog }));
      await supabase.from('games').update({ pique_state: newPs, log: newLog }).eq('id', gameIdRef.current);
    }
  }, []);

  // ── NEW ROUND ─────────────────────────────────────────────
  const newRound = useCallback(async () => {
    setPique(INIT_PIQUE);
    setGame(INIT_GAME);
    setGameId(null);
    if (room?.code) {
      await supabase.from('games').update({ status: 'settled' }).eq('id', gameIdRef.current);
      // Reset pique in room settings so all players see it disabled
      await supabase.from('rooms').update({
        status: 'lobby',
        last_activity: new Date().toISOString(),
        settings: { ...settingsRef.current, pique: INIT_PIQUE },
      }).eq('code', room.code);
    }
    setScreen('lobby');
  }, [room]);

  // ── LEAVE GAME → LOBBY ────────────────────────────────────
  const leaveToLobby = useCallback(async () => {
    setGame(INIT_GAME);
    setPique(INIT_PIQUE);
    if (me?.isMC && room?.code) {
      await supabase.from('rooms').update({
        status: 'lobby',
        settings: { ...settingsRef.current, pique: INIT_PIQUE },
      }).eq('code', room.code);
    }
    setScreen('lobby');
  }, [me, room]);

  // ────────────────────────────────────────────────────────
  const errMsg = lang === 'es' ? 'Error de conexión' : 'Connection error';

  return (
    <div className="la">
      <style>{CSS}</style>

      {screen === 'landing' && (
        <LandingView onCreate={createRoom} onJoin={joinRoom} lang={lang} onToggleLang={toggleLang}
          initialCode={initialCode} loading={loading} joinError={joinError} />
      )}

      {screen === 'lobby' && (
        <LobbyView
          room={room} me={me} players={players} settings={settings}
          onSettings={handleSettings}
          onCarton={selectCarton}
          onSkin={selectSkin}
          onStart={startGame}
          onBack={() => { window.history.pushState(null,'','/'); setScreen('landing'); }}
          onShowBalances={() => setShowBalances(true)}
          onTransferMC={transferMC}
          onRemovePlayer={removePlayer}
          pique={pique} onPique={handlePique}
          lang={lang} onToggleLang={toggleLang}
          loading={loading}
        />
      )}

      {screen === 'game' && (
        <GameView
          room={room} me={me} players={players} settings={settings} game={game}
          onDraw={drawNumber}
          onMark={toggleMark}
          onClaim={claimPrize}
          onClaimPique={claimPique}
          onValidate={validateWin}
          onReject={rejectRequest}
          onAwardPrize={awardPrize}
          onRemovePlayer={removePlayer}
          showSnoop={snoop} setShowSnoop={setSnoop}
          ballKey={ballKey}
          onLeave={leaveToLobby}
          onSettle={() => setScreen('settle')}
          onShowBalances={() => setShowBalances(true)}
          pique={pique} piqueAction={piqueAction}
          lang={lang} onToggleLang={toggleLang}
        />
      )}

      {screen === 'settle' && (
        <SettleView
          players={players} settings={settings} game={game} stats={stats}
          onNewRound={newRound}
          onBack={() => setScreen('game')}
          lang={lang} onToggleLang={toggleLang}
        />
      )}

      {showBalances && (
        <BalancesModal
          players={players} stats={stats}
          currentGame={screen === 'game' ? game : null}
          onClose={() => setShowBalances(false)}
          lang={lang}
        />
      )}

      {ann && <AnnView ann={ann} onClose={() => { if (annTimer.current) clearTimeout(annTimer.current); setAnn(null); }} />}
    </div>
  );
}
