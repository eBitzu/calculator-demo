import React, { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "./App.scss";
import { switchSign, toNumber, formatter } from "./utils/number.utils";

enum Operators {
  PLUS = "+",
  MINUS = "-",
  MULTIPLY = "*",
  DIVIDE = "/",
  EQUAL = "=",
}

const buttons = ["9", "8", "7", "6", "5", "4", "3", "2", "1", "±", "0", ","];
const operators: Operators[] = [
  Operators.PLUS,
  Operators.MINUS,
  Operators.MULTIPLY,
  Operators.DIVIDE,
];

function App() {
  const [result, setResult] = useState<string>("0");
  const [crtOperator, setCrtOperator] = useState<Operators>(
    Operators.EQUAL
  );
  const [operand, setOperand] = useState<string>("");
  const [lastOperand, setLastOperand] = useState<string>("");
  const [history, setHistory]= useState<Array<string>>([]);

  const setComma = useCallback((val: string): string => {
    const number: number = +val;
    if (number % 1 !== 0) {
      return val;
    }
    const newValue = `${val},`;
    history.pop();
    setHistory([...history, newValue]);
    return newValue;
  }, [history]);

  const dictateWhere = useCallback((fn: Function) => {
    crtOperator !== Operators.EQUAL ? setOperand(fn(operand)) : setResult(fn(result));
  }, [crtOperator, operand, result]);

  const appendValue = useCallback((val: string) => {
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
  }, [crtOperator, history, operand, result]);

  const checkLastOperator = useCallback((): void => {
    if(operators.includes(history[history.length - 1] as Operators)) {
      history.pop();
    }
  }, [history]);

  const numberClicked = useCallback((ev: string) => {
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
  }, [appendValue, dictateWhere, setComma]);

  const operations = useCallback((op: Operators, equal = false) => {
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
  }, [checkLastOperator, history, lastOperand, operand, result]);

  const operatorClicked = useCallback((op: Operators) => {
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
  }, [checkLastOperator, crtOperator, history, operand, operations]);


  const reset = () => {
    setResult('0');
    setOperand('');
    setLastOperand('');
    setHistory([]);
    setCrtOperator(Operators.EQUAL);
  }

  useEffect(() => {
    const validateKey = ({key}: KeyboardEvent) => {
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
  }, [numberClicked, operatorClicked])

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