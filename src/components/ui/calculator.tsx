'use client';

import * as React from 'react';
import { Calculator as CalculatorIcon, Delete } from 'lucide-react';
import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CalculatorProps {
  onConfirm: (value: number) => void;
  initialValue?: number | '';
}

export function Calculator({ onConfirm, initialValue }: CalculatorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [display, setDisplay] = React.useState('0');
  const [operator, setOperator] = React.useState<string | null>(null);
  const [prevValue, setPrevValue] = React.useState<number | null>(null);
  const [resetNext, setResetNext] = React.useState(false);

  const handleOpen = () => {
    const val = initialValue && initialValue !== '' ? String(initialValue) : '0';
    setDisplay(val);
    setOperator(null);
    setPrevValue(null);
    setResetNext(false);
    setIsOpen(true);
  };

  const handleNumber = (num: string) => {
    if (resetNext) {
      setDisplay(num);
      setResetNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const calculate = (a: number, op: string, b: number): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operator && !resetNext) {
      const result = calculate(prevValue, operator, current);
      setDisplay(String(parseFloat(result.toFixed(2))));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(op);
    setResetNext(true);
  };

  const handleEquals = () => {
    if (prevValue === null || !operator) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, operator, current);
    setDisplay(String(parseFloat(result.toFixed(2))));
    setPrevValue(null);
    setOperator(null);
    setResetNext(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setOperator(null);
    setPrevValue(null);
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (resetNext) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    // If there's a pending operation, calculate first
    let finalValue = parseFloat(display);
    if (prevValue !== null && operator && !resetNext) {
      finalValue = calculate(prevValue, operator, finalValue);
      finalValue = parseFloat(finalValue.toFixed(2));
    }
    onConfirm(finalValue);
    setIsOpen(false);
  };

  const CalcButton = ({
    children,
    onClick,
    variant = 'default'
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'operator' | 'action';
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-14 rounded-xl text-lg font-semibold transition-colors active:scale-95',
        variant === 'default' && 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50 hover:bg-surface-200 dark:hover:bg-surface-700',
        variant === 'operator' && 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50',
        variant === 'action' && 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-600',
      )}
    >
      {children}
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <CalculatorIcon className="w-5 h-5" />
      </button>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Calculator">
        {/* Display */}
        <div className="mb-4 p-4 bg-surface-100 dark:bg-surface-800 rounded-xl">
          {prevValue !== null && operator && (
            <div className="text-xs text-surface-500 text-right mb-1">
              {prevValue} {operator}
            </div>
          )}
          <div className="text-right text-3xl font-bold text-surface-900 dark:text-surface-50 tabular-nums truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <CalcButton onClick={handleClear} variant="action">C</CalcButton>
          <CalcButton onClick={handleBackspace} variant="action">
            <Delete className="w-5 h-5 mx-auto" />
          </CalcButton>
          <CalcButton onClick={() => handleOperator('÷')} variant="operator">÷</CalcButton>
          <CalcButton onClick={() => handleOperator('×')} variant="operator">×</CalcButton>

          <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
          <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
          <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>
          <CalcButton onClick={() => handleOperator('-')} variant="operator">−</CalcButton>

          <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
          <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
          <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>
          <CalcButton onClick={() => handleOperator('+')} variant="operator">+</CalcButton>

          <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
          <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
          <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>
          <button
            type="button"
            onClick={handleEquals}
            className="h-14 rounded-xl text-lg font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors active:scale-95"
          >
            =
          </button>

          <CalcButton onClick={() => handleNumber('0')}>0</CalcButton>
          <div className="col-span-1">
            <CalcButton onClick={handleDecimal}>.</CalcButton>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="col-span-2 h-14 rounded-xl text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors active:scale-95"
          >
            Set Amount
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
