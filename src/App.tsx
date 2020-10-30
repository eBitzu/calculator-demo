import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "./App.scss";

enum Operators {
  PLUS = "+",
  MINUS = "-",
  MULTIPLY = "*",
  DIVIDE = "/",
  EQUAL = "=",
}

function App() {
  const buttons = ["9", "8", "7", "6", "5", "4", "3", "2", "1", "±", "0", ","];
  const operators: Operators[] = [
    Operators.PLUS,
    Operators.MINUS,
    Operators.MULTIPLY,
    Operators.DIVIDE,
  ];
  const [result, setResult] = useState("0");
  const [crtOperator, setCrtOperator]: [Operators, any] = useState(
    Operators.EQUAL
  );
  const [operand, setOperand] = useState("");
  const [lastOperand, setLastOperand] = useState("");
  const [history, setHistory]: [string[], any] = useState([]);

  const setComma = (val: string): string => {
    const number: number = +val;
    if (number % 1 !== 0) {
      return val;
    }
    const newValue = `${val},`;
    history.pop();
    setHistory([...history, newValue]);
    return newValue;
  };

  const switchSign = (val: string): string => {
    const number: number = +val;
    return `${number * -1}`;
  };

  const dictateWhere = (fn: Function) => {
    crtOperator !== Operators.EQUAL ? setOperand(fn(operand)) : setResult(fn(result));
  };

  const appendValue = (val: string) => {
    const lastIndex = history.length - 1;
    if(crtOperator !== Operators.EQUAL) {
      if(history[lastIndex] === operand) {
        history.pop();
      }
      const newOperand = `${operand}${val}`;
      setOperand(newOperand);
      setHistory([...history, `${newOperand}`]);
      return;
    }
    if(history[lastIndex] === result) {
      history.pop();
    }
    const newResult = `${result !== '0' ? result : ''}${val}`;
    setResult(newResult);
    setHistory([...history, newResult]);
  }

  const numberClicked = (ev: string) => {
    switch (ev) {
      case ",":
        dictateWhere(setComma);
        break;
      case "±":
        dictateWhere(switchSign);
        break;
      default:
        appendValue(ev);
        break;
    }
  };

  const operatorClicked = (op: Operators) => {
    if (op === Operators.EQUAL) {
      operations(crtOperator, true);
      return;
    }
    setCrtOperator(op);
    checkLastOperator();
    setHistory([...history, op]);
    setLastOperand('');
    if(operand) {
      operations(crtOperator);
    }
  };

  const toNumber = (val: string): number => {
    const noDot = val.replace(/\./g, '');
    return Number.parseFloat(noDot.replace(',', '.')) || +val;
  }

  const numberFormatter = new Intl.NumberFormat('ro-RO');
  const formatter = (val: number): string => {
    return numberFormatter.format(val);
  }

  const operations = (op: Operators, equal = false) => {
    const existing = toNumber(result);
    const operandNumber = operand ? toNumber(operand) : +lastOperand;
    let newValue = existing;
    switch (op) {
      case Operators.MULTIPLY:
        newValue = existing * operandNumber;
        break;
      case Operators.MINUS:
        newValue = existing - operandNumber;
        break;
      case Operators.DIVIDE:
        newValue = operandNumber ? existing / operandNumber : 0;
        break;
      case Operators.PLUS:
        newValue = existing + operandNumber;
        break;
      default:
        break;
    }
    setResult(formatter(newValue));
    setOperand('');
    if(equal) {
      setLastOperand(`${operandNumber}`);
      checkLastOperator();
      if(lastOperand && op !== Operators.EQUAL) {
        setHistory([...history, op, lastOperand]);
      }
    }
  };

  const checkLastOperator = (): void => {
    if(operators.includes(history[history.length - 1] as Operators)) {
      history.pop();
    }
  }
  const reset = () => {
    setResult('0');
    setOperand('');
    setLastOperand('');
    setHistory([]);
    setCrtOperator(Operators.EQUAL);
  }

  useEffect(() => {
    function validateKey({key}: KeyboardEvent){
      if(operators.includes(key as Operators)) {
        operatorClicked(key as Operators);
      }
      if(buttons.includes(key)) {
        numberClicked(key);
      }
      if(key === 'Enter') {
        operatorClicked(Operators.EQUAL);
      }

      if(key === 'Escape') {
        reset();
      }
      if(key === '.') {
        numberClicked(',');
      }
    }
    window.addEventListener('keyup', validateKey);

    return () => {
      window.removeEventListener('keyup', validateKey)
    }
  })

  const showOperand = crtOperator !== Operators.EQUAL && !!operand ? operand : result;
  return (
    <div className="App">
      <header className="App-header">
        <div className="row mt-5 mb-2" style={{ width: 220 }}>
          <div className="col-11">
            <div className="history">{history.join(' ').slice(-38) || ' 0'}</div>
            <input
              className="form-control pt-3"
              type="text"
              maxLength={10}
              disabled
              style={{ textAlign: "right" }}
              value={showOperand}
            />
          </div>
          <div className="col-6 mt-2">
            <Button onClick={() => reset()}>Reset</Button>
          </div>
          <div className="col-5 mt-2">
            <Button onClick={() => operatorClicked(Operators.EQUAL)}>Equal</Button>
          </div>
          <div className="col-9 row">
            {buttons.map((n: string) => (
              <div key={n} className="col-4 mt-4">
                <Button style={{ width: 38 }} onClick={() => numberClicked(n)}>
                  {n}
                </Button>
              </div>
            ))}
          </div>
          <div className="col-3 row">
            {operators.map((op: Operators) => (
              <div key={op} className="col-12 mt-4">
                <Button
                  style={{ width: 38 }}
                  onClick={() => operatorClicked(op)}
                >
                  {op}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>Result: {result}</div>
        <div>Current Operation: {crtOperator}</div>
        <div>Operand value: {operand}</div>
        <div>Last Operand value {lastOperand}</div>
      </header>
    </div>
  );
}

export default App;