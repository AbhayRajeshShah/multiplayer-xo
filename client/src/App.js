import { useState, useEffect } from "react";
import "./App.css";
import { io } from "socket.io-client";
import done from "./assets/done.mp3";
import wait from "./assets/wait.mp3";

function App() {
  const [grid, setGrid] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [x, setX] = useState(true);
  const [socket, setSocket] = useState();
  const [sNo, setSNo] = useState(0);
  const [click, setclick] = useState(false);
  const [turn, setTurn] = useState(false);
  const waitAudio = new Audio(wait);
  const doneAudio = new Audio(done);
  const [started, setStarted] = useState(false);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    let tempS = io(process.env.REACT_APP_URL);
    setSocket(tempS);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("switch", (el) => {
        setTurn(el);
        console.log(el);
        console.log(x);
      });
      socket.on("join", (el) => {
        console.log("hi");
        if (el < 3) {
          setStarted(true);
          if (el > 1) {
            setWaiting(false);
          }
        } else {
          alert("Room is Full");
        }
      });
      socket.on("new", (el) => {
        if (el > 1) {
          setWaiting(false);
        }
      });
      socket.on("turn", (el) => {
        console.log(el);
        setX(el);
      });
      socket.on("gridL", (el) => {
        if (el !== grid) {
          setGrid(
            el.map((ele) => {
              return ele;
            })
          );
        }
      });
      socket.on("winner", ({ el, els }) => {
        setGrid(els.map((ele) => ele));
        setTimeout(() => {
          if (el === x) {
            alert("you win");
          } else {
            alert("you lose");
            doneAudio.play();
          }
        }, 500);
      });
    }
  }, [socket]);

  const joinRoom = () => {
    if (socket) {
      if (sNo !== 0) {
        socket.emit("joinRoom", sNo);
        setGrid([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }
    }
  };

  useEffect(() => {
    if (socket) {
      if (sNo) {
        if (click) {
          socket.emit("grid", { el: grid, sNo: sNo, t: turn });
          setclick(false);
          setTurn(!turn);
          let temp = grid;
          let won = false;
          for (var i = 1; i < 5; i++) {
            if (
              temp[4] === temp[4 - i] &&
              temp[4] === temp[4 + i] &&
              temp[4] !== 0
            ) {
              won = true;
            }
          }
          if (
            //column
            (temp[3] === temp[0] && temp[0] === temp[6] && temp[6] !== 0) ||
            (temp[2] === temp[5] && temp[5] === temp[8] && temp[2] !== 0) ||
            //row
            (temp[0] === temp[1] && temp[1] === temp[2] && temp[2] !== 0) ||
            (temp[6] === temp[7] && temp[7] === temp[8] && temp[6] !== 0)
          ) {
            won = true;
          }

          if (won) {
            setTimeout(() => {
              doneAudio.play();
              socket.emit("winner", { sNo: sNo, x: x, grid: grid });
              alert("You win");
            }, 500);
          }
        }
      }
    }
  }, [grid, sNo, socket, click, turn]);

  const change = (ind) => {
    setGrid(
      grid.map((el, i) => {
        if (i === ind) {
          if (x) {
            el = 1;
          } else {
            el = 2;
          }
        }
        return el;
      })
    );
    setclick(true);
  };

  return (
    <div className="App">
      {started ? (
        <>
          <div className="grid">
            {grid.map((el, i) => {
              return (
                <div
                  className="cell"
                  key={i}
                  onClick={() => {
                    if (!waiting) {
                      if (el === 0) {
                        if (turn === x) {
                          change(i);
                        } else {
                          waitAudio.play();
                        }
                      }
                    } else {
                      alert("waiting for opponent");
                    }
                  }}
                >
                  {el === 0 ? "" : el === 1 ? "X" : "O"}
                </div>
              );
            })}
          </div>
          <p>{waiting ? "Waiting For Opponent" : "Opponent Has Joined"}</p>
        </>
      ) : (
        <div className="input">
          <input
            type="number"
            placeholder="Enter Room No"
            value={sNo == 0 ? "" : sNo}
            onChange={(e) => {
              setSNo(e.target.value);
            }}
          />
          <button
            onClick={() => {
              joinRoom();
            }}
          >
            Join
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
