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
    { name: userName + " (MC)", cartonId: cartonIndex, marked: marked }, 
    { name: 'Caqui', cartonId: 1, marked: [4,25,39] },
    { name: 'Karen', cartonId: 2, marked: [] },
    { name: 'Tío Lucho', cartonId: 5, marked: [] },
    { name: 'La Jefa', cartonId: 8, marked: [] }
  ];

  // Tracks which prizes are finished
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
  
  const isMC = userName.trim().toLowerCase() === lobbyInfo.creator.toLowerCase();

  const checkWinCondition = (cId, pMarked, type) => {
      const carton = cartones[cId];
      // Filter only numbers that were actually called by the MC
      const correctMarks = pMarked.filter(num => calledNumbers.includes(num));

      if (type === 'terna') {
        // Check if any row has 3 or more correct marks
        return carton.rows.some(row => {
          const rowNumbers = row.filter(n => n !== 0);
          const correctInRow = rowNumbers.filter(n => correctMarks.includes(n));
          return correctInRow.length >= 3;
        });
      }

      if (type === 'linea') {
        // Check if any row has ALL its numbers correct
        return carton.rows.some(row => {
          const rowNumbers = row.filter(n => n !== 0);
          return rowNumbers.every(n => correctMarks.includes(n));
        });
      }

      if (type === 'lota') {
        // Check if ALL numbers in the whole carton are correct
        const allNumbers = carton.rows.flat().filter(n => n !== 0);
        return allNumbers.every(n => correctMarks.includes(n));
      }

      return false;
  };

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

  // LOG HELPER
  const addToLog = (message, type = 'info', requester = null) => {
    const time = new Date().toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
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
    addToLog(`Salió el ${random}`);
  };

  const toggleNumber = (num) => {
    if (num === 0) return;
    setMarked(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const validateWinner = (winnerName, prizeType) => {
    setPrizesClaimed(prev => ({ ...prev, [prizeType]: true }));
    addToLog(`¡${winnerName} ha ganado la ${prizeType.toUpperCase()}!`, 'success');
    setShowSnoop(false);
  };

  const MiniCarton = ({ cId, pMarked }) => (
  <div className="mini-carton">
    {cartones[cId].rows.map((row, ri) => (
      <div key={ri} className="mini-row">
        {row.map((num, ci) => {
          if (num === 0) return <div key={ci} className="mini-cell empty"></div>;
          
          const isMarked = pMarked.includes(num);
          const isCalled = calledNumbers.includes(num);
          
          // Cell Background for Status 3 (Missed)
          let cellStatus = (!isMarked && isCalled) ? "status-missed" : "";
          
          // Dot Logic for Status 1 & 2
          let dotClass = "";
          if (isMarked && isCalled) dotClass = "dot-hit";      // Translucent Green
          if (isMarked && !isCalled) dotClass = "dot-liar";    // Translucent Red

          return (
            <div key={ci} className={`mini-cell ${cellStatus}`}>
              {num !== 0 && <span className="mini-num">{num}</span>}
              {isMarked && <div className={`mini-dot ${dotClass}`}></div>}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

  return (
    <div className="main-wrapper">
      {showSnoop && (
        <div className="snoop-overlay">
          <div className="snoop-window">
            <button className="snoop-close-btn" onClick={() => setShowSnoop(false)}>X</button>
            <h2 style={{color: '#8b4513', textAlign: 'center'}}>Monitoreo de Jugadores</h2>
            <div className="snoop-grid">
              {fakePlayers.map((player, idx) => (
                <div key={idx} className="snoop-card">
                  <p style={{marginBottom: '10px'}}>
                    <strong>{player.name}</strong> — <small>Cartón #{cartones[player.cartonId].id}</small>
                  </p>
                  <MiniCarton cId={player.cartonId} pMarked={player.marked} />
                  
                  <div className="snoop-validation-actions" style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                    {!prizesClaimed.terna && (
                      <button 
                        className="val-btn" 
                        disabled={!checkWinCondition(player.cartonId, player.marked, 'terna')}
                        onClick={() => validateWinner(player.name, 'terna')}
                      >
                        Validar Terna
                      </button>
                    )}
                    {(prizesClaimed.terna && !prizesClaimed.linea) && (
                      <button 
                        className="val-btn" 
                        disabled={!checkWinCondition(player.cartonId, player.marked, 'linea')}
                        onClick={() => validateWinner(player.name, 'linea')}
                      >
                        Validar Línea
                      </button>
                    )}
                    {(prizesClaimed.linea && !prizesClaimed.lota) && (
                      <button 
                        className="val-btn lota" 
                        disabled={!checkWinCondition(player.cartonId, player.marked, 'lota')}
                        onClick={() => validateWinner(player.name, 'lota')}
                      >
                        Validar Lota
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="game-header">
        <img src="/lota-logo.png" alt="Lota Chilena" className="logo" />
        <h1>¡Lota Chilena!</h1>
      </header>

      <main className="game-container">
        {!isGameStarted ? (
          <> 
            <div className="lobby-room-info">
                <p>Estás en la sala <strong>#{lobbyInfo.id}</strong> creada por <strong>{lobbyInfo.creator}</strong></p>
            </div>
            <div className="lobby-flex-container">
              <div className="players-sidebar">
                <h4>Jugadores Conectados:</h4>
                <ul className="player-list">
                  <li className="is-mc"><span>{lobbyInfo.creator}</span><span className="p-status">(MC)</span></li>
                  {fakePlayers.filter(p => !p.name.includes("(MC)")).map((p, i) => (
                    <li key={i}><span>{p.name}</span><span className="p-status">Status: Ready</span></li>
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
                <button className="start-btn" onClick={() => setIsGameStarted(true)}>
                  {isMC ? 'Iniciar Partida' : 'Entrar a la Partida'}
                </button>
              </div>
            </div>
            
            <div className="carton-wrapper">
              <h3>Vista Previa del Cartón</h3>
              <div className="carton">
                {cartones[cartonIndex].rows.map((row, ri) => (
                  <div key={ri} className="row">
                    {row.map((num, ci) => (
                      <div key={ci} className={`cell ${num === 0 ? 'empty' : ''}`} style={{ cursor: 'default' }}>
                        {num !== 0 && <span className="number-text">{num}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={isMC ? "host-split-view" : "player-single-view"}>
            <div className="player-game-side">
              
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

              <div className="ingame-status">
                <h2>¡Suerte, {userName}!</h2>
                  <h3>Estás jugando con el Cartón #{cartones[cartonIndex].id}</h3>
                <div className="mid-game-skin">
                  <label>Skin:</label>
                  <select value={skin} onChange={(e) => setSkin(e.target.value)}>
                    {skinList.map(s => <option key={s.value} value={s.value}>{s.name}</option>)}
                  </select>
                </div>
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
                <button className="reset-btn" onClick={() => setIsGameStarted(false)}>Salir al Lobby</button>
                {isMC && (
                  <button className="reset-btn" onClick={() => setShowSnoop(true)}>Jugadores ({fakePlayers.length}) 🔍</button>
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
                    <div key={i} className={`log-entry ${log.type === 'request' ? 'request-style' : ''} ${log.type === 'success' ? 'success-style' : ''}`}>
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
                            <div key={num} className={`m-cell ${calledNumbers.includes(num) ? 'hit' : ''}`}>{num}</div>
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