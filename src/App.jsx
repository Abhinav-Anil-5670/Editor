import { useState } from 'react'
import Editor from './components/Editor'
import JoinPage from './components/JoinPage'
import './App.css'

function App() {
  const [room, setRoom] = useState(null);
  const [userName, setUserName] = useState(null);

  const handleJoin = (room, user) => {
    setRoom(room);
    setUserName(user);
  };

  return (
    <>
      {!room ? (
        <JoinPage onJoin={handleJoin} />
      ) : (
        <Editor room={room} userName={userName} onLeave={() => setRoom(null)} />
      )}
    </>
  )
}

export default App
