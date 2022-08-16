import { useState, useEffect } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [grid, setGrid] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [x, setX] = useState(true);
  const [socket, setSocket] = useState();
  const [sNo, setSNo] = useState();
  const [click, setclick] = useState(false);
  const [turn, setTurn] = useState(false);

  useEffect(() => {
    let tempS = io("http://localhost:3001");
    setSocket(tempS);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("sNo", (el) => {
        console.log(el);
        setSNo(el);
      });
      socket.on("switch", (el) => {
        setTurn(el);
        console.log(el);
        console.log(x);
      });
      socket.on("turn", (el) => {
        setX(el);
      });
      socket.on("gridL", (el) => {
        if (el !== grid) {
          console.log(grid);
          console.log(el);
          setGrid(
            el.map((ele) => {
              return ele;
            })
          );
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      if (sNo) {
        if (click) {
          socket.emit("grid", { el: grid, sNo: sNo, t: turn });
          setclick(false);
          setTurn(!turn);
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
      <div className="grid">
        {grid.map((el, i) => {
          return (
            <div
              className="cell"
              key={i}
              onClick={() => {
                if (el === 0) {
                  if (turn === x) {
                    change(i);
                  }
                }
              }}
            >
              {el === 0 ? "" : el === 1 ? "X" : "O"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
