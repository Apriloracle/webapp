'use client';

import React, { useState, useCallback } from 'react';
import GameAttestations from './GameAttestations';

type Square = 'X' | 'O' | null;

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Square>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [createAttestation, setCreateAttestation] = useState<((index: number, player: 'X' | 'O') => Promise<void>) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateWinner = useCallback((squares: Square[]): Square => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const handleMove = useCallback(async (index: number) => {
    if (board[index] || winner || isGameOver) return;

    const newBoard = [...board];
    const currentPlayer = xIsNext ? 'X' : 'O';
    newBoard[index] = currentPlayer;

    setError(null); // Clear any previous errors

    if (createAttestation) {
      try {
        await createAttestation(index, currentPlayer);
      } catch (err) {
        console.error("Error creating attestation:", err);
        setError("Failed to create attestation. The move was recorded, but not attested on the blockchain.");
      }
    }

    setBoard(newBoard);
    
    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      setIsGameOver(true);
    } else if (newBoard.every(Boolean)) {
      setIsGameOver(true);
    } else {
      setXIsNext(!xIsNext);
    }
  }, [board, xIsNext, winner, isGameOver, calculateWinner, createAttestation]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setIsGameOver(false);
    setError(null);
  }, []);

  const renderSquare = (index: number) => (
    <button 
      key={index} 
      className="w-16 h-16 border border-gray-400 text-2xl font-bold bg-gray-800 hover:bg-gray-700 transition-colors"
      onClick={() => handleMove(index)}
      disabled={!!board[index] || isGameOver}
    >
      {board[index]}
    </button>
  );

  const status = winner
    ? `Winner: ${winner}`
    : isGameOver
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Tic Tac Toe</h2>
      <div className="text-xl font-bold mb-4 text-green-400">{status}</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((_, index) => renderSquare(index))}
      </div>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4"
        onClick={resetGame}
      >
        Reset Game
      </button>
      {error && (
        <div className="text-red-400 mb-4 p-2 bg-red-100 border border-red-400 rounded">
          <p>{error}</p>
          <p className="text-sm mt-1">Check the console for more details.</p>
        </div>
      )}
      <GameAttestations setCreateAttestation={setCreateAttestation} />
    </div>
  );
};

export default TicTacToe;
