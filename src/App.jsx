import React, { useState, useEffect } from 'react';
import { cartones } from './cartones'; 
import './App.css';

function App() {
  const [userName, setUserName] = useState(localStorage.getItem('lota-name') || '');
  const [skin, setSkin] = useState(localStorage.getItem('lota-skin') || 'classic');
  const [marked, setMarked] = useState([]);
  const [cartonIndex, setCartonIndex] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // --- SNOOP MODAL LOGIC ---
  const [showSnoop, setShowSnoop] = useState(false);
  const fakePlayers = [
  // This adds YOU (the MC) to the top of the list
  { name: userName + " (MC)", cartonId: cartonIndex, marked: marked }, 
  { name: 'Caqui', cartonId: 1, marked: [14, 24, 66] },
  { name: 'Karen', cartonId: 2, marked: [5, 18, 90] },
  { name: 'Tío Lucho', cartonId: 5, marked: [1, 2, 3, 4] },
  { name: 'La Jefa', cartonId: 8, marked: [10, 20, 30] }
];

  // Tracks if prizes are already taken
  const [prizesWon, setPrizesWon] = useState({
  terna: false,
  linea: false,
  lota: false
});

const [prizesClaimed, setPrizesClaimed] = useState({
  terna: false,
  linea: false,
  lota: false
});

  // MC STATES
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [gameLog, setGameLog] = useState([]);

  const lobbyInfo = { id: '7802', creator: 'Rafa' };
  const [connectedPlayers] = useState([
    { name: 'Rafa', role: 'MC', status: 'Ready' },
    { name: 'Caqui', role: 'Player', status: 'Ready' },
    { name: 'Karen', role: 'Player', status: 'Ready' },
  ]);

  const isMC = userName.trim().toLowerCase() === lobbyInfo.creator.toLowerCase();
  const allReady = connectedPlayers.every(p => p.status === 'Ready');

  useEffect(() => {
    localStorage.setItem('lota-name', userName);
    localStorage.setItem('lota-skin', skin);
  }, [userName, skin]);

  const skinList = [
    { name: 'Clásico', value: 'classic' },
    { name: 'Poroto 1', value: 'Poroto1.jpg' },
    { name: 'Poroto 2', value: 'Poroto2.jpg' },
    { name: 'Poroto 3', value: 'Poroto3.jpg' },
    { name: '$1 Cara', value: 'peso1a.jpg' },
    { name: '$1 Sello', value: 'Peso1b.jpg' },
    { name: '$5 Cara', value: 'peso5a.jpg' },
    { name: '$5 Sello', value: 'peso5b.jpg' },
    { name: 'Escudo', value: 'Escudo.jpg' },
    { name: 'Cheque', value: 'cheque.jpg' },
    { name: '20 Lucas', value: '20lucas.jpg' }
  ];

  const addToLog = (message, type = 'info', requester = null) => {
    const time = new Date().toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago', // Standardize to Chile time
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  
    setGameLog(prev => [{ time, msg: message, type, requester }, ...prev]);
  };

  const drawNumber = () => {
    const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !calledNumbers.includes(n));
    if (available.length === 0) return;
    const random = available[Math.floor(Math.random() * available.length)];
    
    setCalledNumbers([...calledNumbers, random]);
    setLastDrawn(random);
    
    // Use our new helper here
    addToLog(`Salió el ${random}`);
};

  const toggleNumber = (num) => {
    if (num === 0) return;
    setMarked(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  // Internal component for the Snoop Board
  const MiniCarton = ({ cId, pMarked }) => (
    <div className="mini-carton">
      {cartones[cId].rows.map((row, ri) => (
        <div key={ri} className="mini-row">
          {row.map((num, ci) => (
            <div key={ci} className={`mini-cell ${num === 0 ? 'empty' : ''}`}>
              {num !== 0 && <span className="mini-num">{num}</span>}
              {pMarked.includes(num) && <div className="mini-dot"></div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="main-wrapper">
      {/* SNOOP MODAL - Rendered outside main container for absolute priority */}
      {showSnoop && (
        <div className="snoop-overlay">
          <div className="snoop-window">
            <button className="snoop-close-btn" onClick={() => setShowSnoop(false)}>X</button>
            <h2 style={{color: '#8b4513', textAlign: 'center'}}>Monitoreo de Jugadores</h2>
            <div className="snoop-grid">
              {fakePlayers.map((player, idx) => (
                <div key={idx} className="snoop-card">
                  <p><strong>{player.name}</strong> (Cartón #{cartones[player.cartonId].id})</p>
                  <MiniCarton cId={player.cartonId} pMarked={player.marked} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="game-header">
        <img src="/lota-logo.png" alt="Lota Chilena" className="logo" />
        <h1>¡Lota Chilena!</h1>
        {!isGameStarted && (
          <p className="lobby-welcome">Bienvenido al lobby de juego <strong>N°{lobbyInfo.id}</strong> creado por <strong>{lobbyInfo.creator}</strong></p>
        )}
      </header>

      <main className="game-container">
        {!isGameStarted ? (
          <>
            <div className="lobby-flex-container">
              <div className="players-sidebar">
                <h4>Connected players:</h4>
                <ul className="player-list">
                  {connectedPlayers.map((p, i) => (
                    <li key={i} className={p.role === 'MC' ? 'is-mc' : ''}>
                      <span>{p.name}</span>
                      <span className="p-status">{p.role === 'MC' ? '(MC)' : `Status: ${p.status}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="setup-card">
                <h3>Configuración</h3>
                <div className="input-group">
                  <label>TU NOMBRE:</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="controls-row">
                  <div className="control-group">
                    <label>Cartón:</label>
                    <select value={cartonIndex} onChange={(e) => {setCartonIndex(Number(e.target.value)); setMarked([]);}}>
                      {cartones.map((c, i) => <option key={c.id} value={i}>#{c.id}</option>)}
                    </select>
                  </div>
                  <div className="control-group">
                    <label>Skin:</label>
                    <select value={skin} onChange={(e) => setSkin(e.target.value)}>
                      {skinList.map(s => <option key={s.value} value={s.value}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                {isMC ? (
                  <button className="start-btn mc-btn" disabled={!allReady} onClick={() => setIsGameStarted(true)}>
                    {allReady ? 'Iniciar Partida' : 'Esperando Jugadores...'}
                  </button>
                ) : (
                  <button className="start-btn player-btn" onClick={() => alert("¡Listo!")}>Confirmar Cartón</button>
                )}
              </div>
            </div>
            {/* LOBBY BOARD PREVIEW */}
            {/* New Prize Buttons Section */}
            <div className="prize-actions" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button 
                className="prize-btn" 
                onClick={() => addToLog(`${userName} solicita revisar TERNA`, 'request', userName)}
              >
                ¡TERNA!
              </button>
              
              <button 
                className="prize-btn" 
                onClick={() => addToLog(`${userName} solicita revisar LÍNEA`, 'request', userName)}
              >
                ¡LÍNEA!
              </button>
              
              <button 
                className="prize-btn" 
                onClick={() => addToLog(`${userName} solicita revisar LOTA`, 'request', userName)}
              >
                ¡LOTA!
              </button>
            </div>
            <div className="carton-wrapper">
              <div className="carton">
                {cartones[cartonIndex].rows.map((row, ri) => (
                  <div key={ri} className="row">
                    {row.map((num, ci) => (
                      <div key={ci} className={`cell ${num === 0 ? 'empty' : ''}`} onClick={() => toggleNumber(num)}>
                        {num !== 0 && <span className="number-text">{num}</span>}
                        {marked.includes(num) && (
                          <div className="marker-container">
                            {skin === 'classic' ? <div className="classic-dot"></div> : <img src={`/skins/${skin}`} alt="skin" className="skin-img" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* IN-GAME VIEW */
          <div className={isMC ? "host-split-view" : "player-single-view"}>
            <div className="player-game-side">
              <div className="ingame-status">
                <h2>¡Suerte, {userName}!</h2>
                <div className="mid-game-skin">
                  <label>Cambiar Skin:</label>
                  <select value={skin} onChange={(e) => setSkin(e.target.value)}>
                    {skinList.map(s => <option key={s.value} value={s.value}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="prize-actions">
                <button 
                  className="prize-btn" 
                  disabled={prizesClaimed.terna}
                  onClick={() => addToLog(`${userName} solicita revisar TERNA`, 'request', userName)}
                >
                  {prizesClaimed.terna ? 'TERNA Cobrada' : '¡TERNA!'}
                </button>
                
                <button 
                  className="prize-btn" 
                  disabled={!prizesClaimed.terna || prizesClaimed.linea}
                  onClick={() => addToLog(`${userName} solicita revisar LÍNEA`, 'request', userName)}
                >
                  {prizesClaimed.linea ? 'LÍNEA Cobrada' : '¡LÍNEA!'}
                </button>
                
                <button 
                  className="prize-btn" 
                  disabled={!prizesClaimed.linea || prizesClaimed.lota}
                  onClick={() => addToLog(`${userName} solicita revisar LOTA`, 'request', userName)}
                >
                  {prizesClaimed.lota ? 'LOTA Cobrada' : '¡LOTA!'}
                </button>
              </div>

              <div className="carton-wrapper">
                <div className="carton">
                  {cartones[cartonIndex].rows.map((row, ri) => (
                    <div key={ri} className="row">
                      {row.map((num, ci) => (
                        <div key={ci} className={`cell ${num === 0 ? 'empty' : ''}`} onClick={() => toggleNumber(num)}>
                          {num !== 0 && <span className="number-text">{num}</span>}
                          {marked.includes(num) && (
                            <div className="marker-container">
                              {skin === 'classic' ? <div className="classic-dot"></div> : <img src={`/skins/${skin}`} alt="skin" className="skin-img" />}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mc-extra-actions" style={{marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                <button className="reset-btn" onClick={() => setIsGameStarted(false)}>
                  Salir al Lobby
                </button>
                {isMC && (
                  <button className="reset-btn" onClick={() => setShowSnoop(true)}>
                    Jugadores ({fakePlayers.length}) 🔍
                  </button>
                )}
              </div>
            </div>

            {isMC && (
              <div className="mc-control-tower">
                <div className="mc-draw-section">
                  <button className="draw-btn" onClick={drawNumber}>CANTAR NÚMERO</button>
                  <div className="mc-last-num">{lastDrawn || '--'}</div>
                </div>

                <div className="mc-log">
                  {gameLog.map((log, i) => (
                    <div key={i} className={`log-entry ${log.type === 'request' ? 'request-style' : ''}`}>
                      <div className="log-text"><span>{log.time}</span> {log.msg}</div>
                      {log.type === 'request' && (
                        <button className="trigger-btn" onClick={() => setShowSnoop(true)}>Trigger check</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mc-matrix">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80].map(rowStart => (
                    <div key={rowStart} className="matrix-row">
                      {Array.from({ length: rowStart === 80 ? 11 : 10 }, (_, i) => rowStart + i)
                        .map(num => {
                          if (num === 0) return <div key={num} style={{width: '30px', height: '30px'}}></div>;
                          return (
                            <div key={num} className={`m-cell ${calledNumbers.includes(num) ? 'hit' : ''}`}>
                              {num}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;