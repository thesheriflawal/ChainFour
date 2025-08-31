"use client";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Users,
  Copy,
  Check,
  Gamepad2,
  Trophy,
  Zap,
  Crown,
  User,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { ethers } from "ethers";

// Contract configuration
const CONTRACT_ADDRESS = "0x499FC431B0ce5C360f37D61CDc1335851a3968A0";
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "GameAbandoned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "string",
        name: "roomId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player1",
        type: "address",
      },
    ],
    name: "GameCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "winner",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint8[4]",
        name: "winningCells",
        type: "uint8[4]",
      },
    ],
    name: "GameFinished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "player1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "player2",
        type: "address",
      },
    ],
    name: "GameStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint8",
        name: "player",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "column",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "row",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "playerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "MoveMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player2",
        type: "address",
      },
    ],
    name: "PlayerJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sessionKey",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiryTime",
        type: "uint256",
      },
    ],
    name: "SessionKeyRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sessionKey",
        type: "address",
      },
    ],
    name: "SessionKeyRevoked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "sessionKeyAddrs",
        type: "address[]",
      },
    ],
    name: "batchCheckSessionKeys",
    outputs: [
      {
        internalType: "bool[]",
        name: "valid",
        type: "bool[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "checkGameTimeout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "cleanupAbandonedGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "roomId",
        type: "string",
      },
    ],
    name: "createGame",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "forfeitGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "gameMoves",
    outputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "player",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "column",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "row",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "games",
    outputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "player1",
        type: "address",
      },
      {
        internalType: "address",
        name: "player2",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "currentPlayer",
        type: "uint8",
      },
      {
        internalType: "enum ConnectFour.GameStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "winner",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "lastMoveTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gameStartTime",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "roomId",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "moveCount",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getGame",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "player1",
        type: "address",
      },
      {
        internalType: "address",
        name: "player2",
        type: "address",
      },
      {
        internalType: "uint8[7][6]",
        name: "board",
        type: "uint8[7][6]",
      },
      {
        internalType: "uint8",
        name: "currentPlayer",
        type: "uint8",
      },
      {
        internalType: "enum ConnectFour.GameStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "winner",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "lastMoveTime",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "roomId",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "moveCount",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "roomId",
        type: "string",
      },
    ],
    name: "getGameByRoomId",
    outputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getGameMoves",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "gameId",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "player",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "column",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "row",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct ConnectFour.Move[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getGameState",
    outputs: [
      {
        internalType: "uint8[7][6]",
        name: "board",
        type: "uint8[7][6]",
      },
      {
        internalType: "uint8",
        name: "currentPlayer",
        type: "uint8",
      },
      {
        internalType: "enum ConnectFour.GameStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "winner",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "timeRemaining",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "getPlayerActiveGame",
    outputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sessionKeyAddr",
        type: "address",
      },
    ],
    name: "getSessionKey",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiryTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getTimeRemaining",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalGames",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "column",
        type: "uint8",
      },
    ],
    name: "isColumnFull",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "roomId",
        type: "string",
      },
    ],
    name: "joinGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "leaveGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "column",
        type: "uint8",
      },
    ],
    name: "makeMove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "playerToActiveGame",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sessionKey",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiryTime",
        type: "uint256",
      },
    ],
    name: "registerSessionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sessionKey",
        type: "address",
      },
    ],
    name: "revokeSessionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "roomIdToGameId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "sessionKeys",
    outputs: [
      {
        internalType: "address",
        name: "sessionKey",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiryTime",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Connect Four Game Logic
const createEmptyBoard = () => {
  return Array(6)
    .fill(null)
    .map(() => Array(7).fill(null));
};

// Check for winning condition
const checkWinner = (board) => {
  const rows = 6;
  const cols = 7;

  // Check horizontal
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (
        board[row][col] &&
        board[row][col] === board[row][col + 1] &&
        board[row][col] === board[row][col + 2] &&
        board[row][col] === board[row][col + 3]
      ) {
        return {
          winner: board[row][col],
          winningCells: [
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row, col + 3],
          ],
        };
      }
    }
  }

  // Check vertical
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 0; col < cols; col++) {
      if (
        board[row][col] &&
        board[row][col] === board[row + 1][col] &&
        board[row][col] === board[row + 2][col] &&
        board[row][col] === board[row + 3][col]
      ) {
        return {
          winner: board[row][col],
          winningCells: [
            [row, col],
            [row + 1, col],
            [row + 2, col],
            [row + 3, col],
          ],
        };
      }
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let row = 0; row < rows - 3; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (
        board[row][col] &&
        board[row][col] === board[row + 1][col + 1] &&
        board[row][col] === board[row + 2][col + 2] &&
        board[row][col] === board[row + 3][col + 3]
      ) {
        return {
          winner: board[row][col],
          winningCells: [
            [row, col],
            [row + 1, col + 1],
            [row + 2, col + 2],
            [row + 3, col + 3],
          ],
        };
      }
    }
  }

  // Check diagonal (bottom-left to top-right)
  for (let row = 3; row < rows; row++) {
    for (let col = 0; col < cols - 3; col++) {
      if (
        board[row][col] &&
        board[row][col] === board[row - 1][col + 1] &&
        board[row][col] === board[row - 2][col + 2] &&
        board[row][col] === board[row - 3][col + 3]
      ) {
        return {
          winner: board[row][col],
          winningCells: [
            [row, col],
            [row - 1, col + 1],
            [row - 2, col + 2],
            [row - 3, col + 3],
          ],
        };
      }
    }
  }

  return null;
};

// Generate a beep sound using Web Audio API
const playBeep = () => {
  if (typeof window !== "undefined") {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn("Could not play beep sound:", error);
    }
  }
};

const ConnectFour = ({
  contract,
  signer,
  roomId,
  gameId,
  playerAddress,
  playerNumber,
  players,
  gameState,
  onBackToLobby,
}) => {
  const [board, setBoard] = useState(gameState?.board || createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(
    gameState?.currentPlayer || 1
  );
  const [winner, setWinner] = useState(gameState?.winner || null);
  const [gameOver, setGameOver] = useState(gameState?.gameOver || false);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [moveHistory, setMoveHistory] = useState(gameState?.moveHistory || []);
  const [winningCells, setWinningCells] = useState(
    gameState?.winningCells || []
  );
  const [timer, setTimer] = useState(300);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  const myPlayerNumber = playerNumber;
  const myTurn = currentPlayer === myPlayerNumber && !gameOver;
  const opponent = players.find((p) => p.id !== playerAddress);

  // Timer effect
  useEffect(() => {
    if (!gameOver && currentPlayer) {
      setTimer(300);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Time's up - could implement auto-forfeit here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPlayer, gameOver]);

  useEffect(() => {
    if (!contract || !gameId) return;

    const handleMoveMade = (
      gameIdEvent,
      player,
      column,
      row,
      playerAddress,
      timestamp
    ) => {
      if (gameIdEvent.toString() === gameId.toString()) {
        console.log("Move made event received:", { player, column, row });
        fetchGameState();
        playBeep();

        // Add to move history
        const playerName = getPlayerName(Number(player));
        setMoveHistory((prev) => [
          ...prev,
          {
            player: Number(player),
            column: Number(column),
            row: Number(row),
            playerName,
            timestamp,
          },
        ]);

        setLastMove({ column: Number(column), row: Number(row) });

        // Clear last move highlight after 2 seconds
        setTimeout(() => setLastMove(null), 2000);
      }
    };

    const handleGameFinished = (gameIdEvent, winner, reason, winningCells) => {
      if (gameIdEvent.toString() === gameId.toString()) {
        console.log("Game finished event received:", {
          winner,
          reason,
          winningCells,
        });
        setWinner(Number(winner));
        setGameOver(true);
        if (winningCells && Array.isArray(winningCells)) {
          setWinningCells(winningCells);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Add leaderboard update
        const gameResult = Number(winner) === myPlayerNumber ? "win" : "loss";
        updateLeaderboard(
          playerAddress,
          getPlayerName(myPlayerNumber),
          gameResult
        );
      }
    };

    const handlePlayerJoined = (gameIdEvent, player, playerNumber) => {
      if (gameIdEvent.toString() === gameId.toString()) {
        console.log("Player joined event received:", { player, playerNumber });
        fetchGameState();
      }
    };

    try {
      contract.on("MoveMade", handleMoveMade);
      contract.on("GameFinished", handleGameFinished);
      contract.on("PlayerJoined", handlePlayerJoined);
    } catch (error) {
      console.warn("Could not set up event listeners:", error);
    }

    return () => {
      try {
        contract.off("MoveMade", handleMoveMade);
        contract.off("GameFinished", handleGameFinished);
        contract.off("PlayerJoined", handlePlayerJoined);
      } catch (error) {
        console.warn("Could not remove event listeners:", error);
      }
    };
  }, [contract, gameId]);

  // Fetch game state from contract
  const fetchGameState = async () => {
    try {
      console.log("[v0] Fetching game state for gameId:", gameId);
      const [boardData, currentPlayerFromContract, status, winnerFromContract] =
        await contract.getGameState(gameId);

      console.log("[v0] Raw board data from contract:", boardData);
      console.log(
        "[v0] Current player from contract:",
        currentPlayerFromContract
      );
      console.log("[v0] Game status:", status);

      const convertedBoard = createEmptyBoard(); // Start with empty 6x7 board (rows x cols)

      if (Array.isArray(boardData) && boardData.length === 6) {
        // Frontend board is also [6][7] (rows x columns)
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 7; col++) {
            const cellValue = boardData[row][col];
            convertedBoard[row][col] =
              cellValue === 0 ? null : Number(cellValue);
          }
        }
      }

      console.log("[v0] Converted board for frontend:", convertedBoard);
      setBoard(convertedBoard);
      setCurrentPlayer(Number(currentPlayerFromContract));

      if (Number(winnerFromContract) > 0) {
        setWinner(Number(winnerFromContract));
        setGameOver(true);
      }

      setGameOver(Number(status) >= 2);

      // Check for winner locally as backup
      const winResult = checkWinner(convertedBoard);
      if (winResult && !winner) {
        setWinner(winResult.winner);
        setWinningCells(winResult.winningCells);
        setGameOver(true);
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
      setError("Failed to fetch game state: " + error.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (contract && gameId) {
      fetchGameState();
    }
  }, [contract, gameId]);

  useEffect(() => {
    if (gameState) {
      setBoard(gameState.board);
      setCurrentPlayer(gameState.currentPlayer);
      setWinner(gameState.winner);
      setGameOver(gameState.gameOver);
      setWinningCells(gameState.winningCells || []);
      setMoveHistory(gameState.moveHistory || []);
    }
  }, [gameState]);

  const handleColumnClick = async (col) => {
    if (!myTurn || gameOver || !contract || !gameId || isLoading) {
      return;
    }

    if (!canDropInColumn(col)) {
      setError("Column is full!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Making move:", { gameId, col, player: myPlayerNumber });

      // Estimate gas first
      const gasEstimate = await contract.makeMove.estimateGas(gameId, col);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2); // Add 20% buffer

      const tx = await contract.makeMove(gameId, col, {
        gasLimit: gasLimit,
      });

      setError("Transaction submitted... waiting for confirmation");

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setError("");

      // The event handlers will update the state
    } catch (error) {
      console.error("Error making move:", error);
      let errorMessage = "Failed to make move";

      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (error.message.includes("execution reverted")) {
        errorMessage =
          "Move not allowed - " + (error.reason || "check game state");
      } else {
        errorMessage = "Error: " + (error.message || "Unknown error");
      }

      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerColor = (playerNum) => {
    return playerNum === 1 ? "bg-red-500" : "bg-yellow-500";
  };

  const getPlayerName = (playerNum) => {
    const player = players.find((p) => p.playerNumber === playerNum);
    return player ? player.username : `Player ${playerNum}`;
  };

  const isWinningCell = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  const canDropInColumn = (col) => {
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null || board[row][col] === 0) {
        return true;
      }
    }
    return false;
  };

  const handleMoveMade = (
    gameIdEvent,
    player,
    column,
    row,
    playerName,
    timestamp
  ) => {
    if (gameIdEvent.toString() === gameId.toString()) {
      console.log("[v0] Move made event received:", {
        player: Number(player),
        column: Number(column),
        row: Number(row),
        playerName,
        timestamp,
      });

      setTimeout(() => {
        console.log("[v0] Fetching updated game state after move");
        fetchGameState();
      }, 1000); // Wait 1 second for contract state to update

      setMoveHistory((prev) => [
        ...prev,
        {
          player: Number(player),
          column: Number(column),
          row: Number(row),
          playerName,
          timestamp,
        },
      ]);

      setLastMove({ column: Number(column), row: Number(row) });

      // Clear last move highlight after 2 seconds
      setTimeout(() => setLastMove(null), 2000);
    }
  };

  useEffect(() => {
    if (!contract || !gameId) return;

    const handleMoveMade = (
      gameIdEvent,
      player,
      column,
      row,
      playerAddress,
      timestamp
    ) => {
      if (gameIdEvent.toString() === gameId.toString()) {
        console.log("Move made event received:", { player, column, row });
        fetchGameState();
        playBeep();

        // Add to move history
        const playerName = getPlayerName(Number(player));
        setMoveHistory((prev) => [
          ...prev,
          {
            player: Number(player),
            column: Number(column),
            row: Number(row),
            playerName,
            timestamp,
          },
        ]);

        setLastMove({ column: Number(column), row: Number(row) });

        // Clear last move highlight after 2 seconds
        setTimeout(() => setLastMove(null), 2000);
      }
    };

    const handleGameFinished = (gameIdEvent, winner, reason, winningCells) => {
      if (gameIdEvent.toString() === gameId.toString()) {
        console.log("Game finished event received:", {
          winner,
          reason,
          winningCells,
        });
        setWinner(Number(winner));
        setGameOver(true);
        if (winningCells && Array.isArray(winningCells)) {
          setWinningCells(winningCells);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    };

    const handlePlayerJoined = (gameIdEvent, player, playerNumber) => {
      if (gameIdEvent.toString() === gameId.toString()) {
        console.log("Player joined event received:", { player, playerNumber });
        fetchGameState();
      }
    };

    try {
      contract.on("MoveMade", handleMoveMade);
      contract.on("GameFinished", handleGameFinished);
      contract.on("PlayerJoined", handlePlayerJoined);
    } catch (error) {
      console.warn("Could not set up event listeners:", error);
    }

    return () => {
      try {
        contract.off("MoveMade", handleMoveMade);
        contract.off("GameFinished", handleGameFinished);
        contract.off("PlayerJoined", handlePlayerJoined);
      } catch (error) {
        console.warn("Could not remove event listeners:", error);
      }
    };
  }, [contract, gameId]);

  useEffect(() => {
    if (contract && gameId && !gameOver) {
      const interval = setInterval(() => {
        console.log("[v0] Periodic game state refresh");
        fetchGameState();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [contract, gameId, gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Error Toast */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 max-w-md">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBackToLobby}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            ← Back to Lobby
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Connect Four</h1>
            <p className="text-blue-200">Room: {roomId}</p>
          </div>
          <div className="text-right">
            <div className="text-white text-sm">
              Players: {players.length}/2
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            {/* Game Status */}
            <div className="text-center mb-6">
              {gameOver ? (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  {winner ? (
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400">
                      <Trophy className="w-8 h-8 animate-pulse" />
                      {winner === myPlayerNumber
                        ? "You Win!"
                        : `${getPlayerName(winner)} Wins!`}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">
                      It's a Draw!
                    </div>
                  )}
                  <button
                    onClick={onBackToLobby}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Lobby
                  </button>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-xl font-semibold text-white">
                    {myTurn ? (
                      <>
                        <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                        Your Turn
                        {isLoading && (
                          <span className="text-blue-400 ml-2 animate-spin">
                            ⟳
                          </span>
                        )}
                        <span
                          className={`ml-2 ${
                            timer <= 10
                              ? "text-red-400 animate-pulse"
                              : "text-yellow-400"
                          }`}
                          aria-label={`Time remaining: ${timer} seconds`}
                        >
                          {timer}s
                        </span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-6 h-6 text-purple-400" />
                        {getPlayerName(currentPlayer)}'s Turn
                        <span
                          className={`ml-2 ${
                            timer <= 10
                              ? "text-red-400 animate-pulse"
                              : "text-yellow-400"
                          }`}
                          aria-label={`Time remaining: ${timer} seconds`}
                        >
                          {timer}s
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Game Board */}
            <div className="bg-blue-600 rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-7 gap-2">
                {Array(7)
                  .fill(null)
                  .map((_, col) => (
                    <div key={col} className="flex flex-col gap-2">
                      {Array(6)
                        .fill(null)
                        .map((_, rowIndex) => {
                          const row = 5 - rowIndex;
                          const cellValue = board[row][col];
                          const isHovered =
                            hoveredCol === col &&
                            !gameOver &&
                            myTurn &&
                            canDropInColumn(col);
                          const isLastMove =
                            lastMove &&
                            lastMove.row === row &&
                            lastMove.column === col;
                          const isWinning = isWinningCell(row, col);

                          return (
                            <div
                              key={`${row}-${col}`}
                              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-800 cursor-pointer transition-all duration-200 ${
                                cellValue === 1
                                  ? "bg-red-500 shadow-lg"
                                  : cellValue === 2
                                  ? "bg-yellow-500 shadow-lg"
                                  : "bg-blue-700 hover:bg-blue-600"
                              } ${
                                isHovered
                                  ? "transform scale-105 border-white"
                                  : ""
                              } ${
                                isLastMove
                                  ? "ring-4 ring-white ring-opacity-50 animate-pulse"
                                  : ""
                              } ${
                                isWinning
                                  ? "ring-4 ring-yellow-400 ring-opacity-75 animate-bounce"
                                  : ""
                              } ${
                                isLoading
                                  ? "cursor-wait"
                                  : myTurn && canDropInColumn(col) && !gameOver
                                  ? "cursor-pointer"
                                  : "cursor-default"
                              }`}
                              onClick={() => handleColumnClick(col)}
                              onMouseEnter={() =>
                                !gameOver && myTurn && setHoveredCol(col)
                              }
                              onMouseLeave={() => setHoveredCol(null)}
                              role="button"
                              tabIndex={
                                myTurn && canDropInColumn(col) && !gameOver
                                  ? 0
                                  : -1
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleColumnClick(col);
                                }
                              }}
                              aria-label={`Drop piece in column ${
                                col + 1
                              }, row ${row + 1}`}
                            />
                          );
                        })}
                    </div>
                  ))}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex justify-between mt-6">
              <div
                className={`p-4 rounded-lg ${
                  myPlayerNumber === 1 ? "bg-red-500" : "bg-gray-700"
                } ${
                  currentPlayer === 1 && !gameOver ? "ring-2 ring-white" : ""
                }`}
              >
                <div className="flex items-center gap-2 text-white">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="font-semibold">
                    {getPlayerName(1)} {myPlayerNumber === 1 ? "(You)" : ""}
                  </span>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  myPlayerNumber === 2 ? "bg-yellow-500" : "bg-gray-700"
                } ${
                  currentPlayer === 2 && !gameOver ? "ring-2 ring-white" : ""
                }`}
              >
                <div className="flex items-center gap-2 text-white">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold">
                    {getPlayerName(2)} {myPlayerNumber === 2 ? "(You)" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Players List */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players
              </h3>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      player.id === playerAddress
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    } ${
                      currentPlayer === player.playerNumber && !gameOver
                        ? "ring-2 ring-yellow-400"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getPlayerColor(
                        player.playerNumber
                      )}`}
                    ></div>
                    <span className="text-white text-sm">
                      {player.username}{" "}
                      {player.id === playerAddress ? "(You)" : ""}
                    </span>
                    {currentPlayer === player.playerNumber && !gameOver && (
                      <Crown className="w-4 h-4 text-yellow-400 ml-auto" />
                    )}
                  </div>
                ))}
                {players.length < 2 && (
                  <div className="flex items-center gap-2 p-2 rounded bg-gray-700 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-gray-400 text-sm">
                      Waiting for player...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-4">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game ID:</span>
                  <span className="text-white">
                    {gameId ? gameId.toString().slice(-6) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Moves:</span>
                  <span className="text-white">{moveHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-medium ${
                      gameOver ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {gameOver ? "Finished" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">Move History</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm">No moves yet</p>
                ) : (
                  moveHistory.slice(-10).map((move, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getPlayerColor(
                          move.player
                        )}`}
                      ></div>
                      <span className="text-white">
                        {move.playerName} → Col {move.column + 1}
                      </span>
                      <span className="text-gray-400 ml-auto text-xs">
                        #{index + 1}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to your component to run diagnostics
const debugContractConnection = async (contract, userAddress) => {
  if (!contract || !userAddress) {
    console.log("Contract or user address not available");
    return false;
  }

  try {
    // Check if the contract is connected to a provider/signer
    if (!contract.provider) {
      console.error("Contract is not connected to a provider.");
      return false;
    }

    // Get the contract's code
    const code = await contract.provider.getCode(contract.address);
    if (!code || code === "0x") {
      console.error("Contract code not found at address:", contract.address);
      return false;
    }

    // Check if the user address is valid
    if (!ethers.isAddress(userAddress)) {
      console.error("Invalid user address:", userAddress);
      return false;
    }

    // Try a simple contract call
    const contractOwner = await contract.owner();
    console.log("Contract owner:", contractOwner);

    return true; // Return true if all checks pass
  } catch (error) {
    console.error("Contract connection debug failed:", error);
    return false;
  }
};

const safeContractCall = async (
  contract,
  methodName,
  args = [],
  options = {}
) => {
  try {
    // Estimate gas limit
    const gasEstimate = await contract.estimateGas[methodName](
      ...args,
      options
    );
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2); // Add a 20% buffer

    // Execute the contract method with the gas limit
    const tx = await contract[methodName](...args, { ...options, gasLimit });
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.error(`Error calling contract method ${methodName}:`, error);
    throw error; // Re-throw the error for the calling function to handle
  }
};

const createRoomWithDebug = async (contract, roomId) => {
  try {
    // Estimate gas first
    const gasEstimate = await contract.createGame.estimateGas(roomId);
    const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

    const tx = await contract.createGame(roomId, {
      gasLimit: gasLimit,
    });

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error("Transaction failed");
    }
    console.log("Room created, receipt:", receipt);
    return receipt;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Add this to your component to run diagnostics
const runDiagnostics = async (contract, userAddress) => {
  if (!contract || !userAddress) {
    console.log("Contract or user address not available");
    return;
  }

  await debugContractConnection(contract, userAddress);
};

export {
  debugContractConnection,
  safeContractCall,
  createRoomWithDebug,
  runDiagnostics,
};

const GameLobby = () => {
  const [currentView, setCurrentView] = useState("username");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [playerNumber, setPlayerNumber] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [gameId, setGameId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
  });

  const updateLeaderboard = async (playerAddress, username, gameResult) => {
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerAddress, username, gameResult }),
      });

      if (!res.ok) {
        throw new Error("Failed to update leaderboard");
      }

      const data = await res.json();
      console.log("Leaderboard updated:", data);
      return data;
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await res.json();
      setLeaderboard(data);
      return data;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const fetchPlayerStats = async (playerAddress) => {
    try {
      const res = await fetch(`/api/leaderboard?player=${playerAddress}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch player stats");
      }

      const data = await res.json();
      setPlayerStats(data);
      return data;
    } catch (error) {
      console.error("Error fetching player stats:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install MetaMask to play.");
        return false;
      }

      setIsLoading(true);
      setConnectionStatus("connecting");

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        setError("No accounts found. Please check MetaMask.");
        setConnectionStatus("error");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if we're on the correct network (Lisk Sepolia)
      const network = await provider.getNetwork();
      const LISK_SEPOLIA_CHAIN_ID = 4202; // Lisk Sepolia chain ID

      if (Number(network.chainId) !== LISK_SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${LISK_SEPOLIA_CHAIN_ID.toString(16)}` }],
          });

          // Reload the provider after network switch
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          const newSigner = await newProvider.getSigner();

          setProvider(newProvider);
          setSigner(newSigner);
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Network not added to MetaMask
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${LISK_SEPOLIA_CHAIN_ID.toString(16)}`,
                    chainName: "Lisk Sepolia Testnet",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.sepolia-api.lisk.com"],
                    blockExplorerUrls: ["https://sepolia-blockscout.lisk.com"],
                  },
                ],
              });

              // Reload the provider after adding network
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const newProvider = new ethers.BrowserProvider(window.ethereum);
              const newSigner = await newProvider.getSigner();

              setProvider(newProvider);
              setSigner(newSigner);
            } catch (addError) {
              setError(
                "Failed to add Lisk Sepolia network. Please add it manually."
              );
              setConnectionStatus("error");
              return false;
            }
          } else {
            setError("Please switch to Lisk Sepolia network in MetaMask");
            setConnectionStatus("error");
            return false;
          }
        }
      } else {
        setProvider(provider);
        setSigner(signer);
      }

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setContract(contractInstance);
      setUserAddress(address);
      setConnectionStatus("connected");
      setError("");

      console.log("Connected to Web3:", address);
      console.log("Network:", await provider.getNetwork());
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      let errorMessage = "Failed to connect wallet";

      if (error.code === 4001) {
        errorMessage = "Connection rejected by user";
      } else if (error.code === -32002) {
        errorMessage = "Connection request pending. Please check MetaMask.";
      } else {
        errorMessage =
          "Failed to connect wallet: " + (error.message || "Unknown error");
      }

      setError(errorMessage);
      setConnectionStatus("error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Handle MetaMask setup client-side only
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }

    // Auto-connect if MetaMask is available and previously connected
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.log("Auto-connect failed:", error);
        }
      }
    };

    autoConnect();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setConnectionStatus("disconnected");
          setUserAddress("");
          setContract(null);
          setSigner(null);
          setProvider(null);
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a valid username");
      return;
    }

    if (connectionStatus !== "connected") {
      const connected = await connectWallet();
      if (!connected) return;
    }

    setCurrentView("home");
  };

  const createRoom = async () => {
    if (!contract || !username.trim()) {
      setError("Wallet not connected or invalid username");
      return;
    }

    // Check if player is already in an active game
    try {
      const playerActiveGame = await contract.getPlayerActiveGame(userAddress);
      if (playerActiveGame && playerActiveGame.toString() !== "0") {
        // Check if they're trying to rejoin the same game
        const gameIdToJoin = await contract.getGameByRoomId(roomIdToJoin);
        if (gameIdToJoin.toString() === playerActiveGame.toString()) {
          // They're rejoining their own game, allow it
          const gameData = await contract.getGame(gameIdToJoin);
          const [id, player1, player2, , , status] = gameData;

          if (status < 2) {
            // Game is still active
            const players = [
              {
                id: player1,
                username: player1 === userAddress ? username : "Player 1",
                playerNumber: 1,
              },
            ];

            if (player2 !== ethers.ZeroAddress) {
              players.push({
                id: player2,
                username: player2 === userAddress ? username : "Player 2",
                playerNumber: 2,
              });
            }

            setPlayers(players);
            setRoomId(roomIdToJoin);
            setGameId(gameIdToJoin);
            setPlayerNumber(player1 === userAddress ? 1 : 2);
            setCurrentView(player2 !== ethers.ZeroAddress ? "game" : "waiting");
            setError("");
            setIsLoading(false);
            return;
          }
        } else {
          setError(
            "You are already in a different active game. Please finish or leave your current game first."
          );
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log("Could not check existing game, proceeding with join");
    }

    setIsLoading(true);
    setError("");

    try {
      const roomIdGenerated = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      // Validate room ID format
      if (roomIdGenerated.length < 6) {
        setError("Room ID too short");
        setIsLoading(false);
        return;
      }

      console.log("Creating room with ID:", roomIdGenerated);

      const gasEstimate = await contract.createGame.estimateGas(
        roomIdGenerated
      );
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await contract.createGame(roomIdGenerated, {
        gasLimit: gasLimit,
      });

      setError("Creating room... please wait for transaction confirmation");

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      console.log("Room created, receipt:", receipt);

      // Find the GameCreated event
      let gameCreatedEvent;
      if (receipt.logs) {
        // Try to parse logs
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            if (parsedLog && parsedLog.name === "GameCreated") {
              gameCreatedEvent = parsedLog;
              break;
            }
          } catch (e) {
            // Skip unparseable logs
            continue;
          }
        }
      }

      if (gameCreatedEvent) {
        const gameIdFromEvent = gameCreatedEvent.args.gameId;
        setRoomId(roomIdGenerated);
        setGameId(gameIdFromEvent);
        setPlayerNumber(1);
        setPlayers([{ id: userAddress, username: username, playerNumber: 1 }]);
        setCurrentView("waiting");
        setError("");

        // Set up listener for second player joining
        const handlePlayerJoined = (gameId, player2Address) => {
          if (gameId.toString() === gameIdFromEvent.toString()) {
            setPlayers((prev) => [
              ...prev,
              { id: player2Address, username: "Player 2", playerNumber: 2 },
            ]);
            setCurrentView("game");
            contract.off("PlayerJoined", handlePlayerJoined);
          }
        };

        contract.on("PlayerJoined", handlePlayerJoined);
      } else {
        // Fallback: try to get game ID by room ID
        try {
          const gameIdFromContract = await contract.getGameByRoomId(
            roomIdGenerated
          );
          if (gameIdFromContract && gameIdFromContract.toString() !== "0") {
            setRoomId(roomIdGenerated);
            setGameId(gameIdFromContract);
            setPlayerNumber(1);
            setPlayers([
              { id: userAddress, username: username, playerNumber: 1 },
            ]);
            setCurrentView("waiting");
            setError("");
          } else {
            throw new Error("Game not found after creation");
          }
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
          setError(
            "Room created but couldn't retrieve game ID. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error creating room:", error);
      let errorMessage = "Failed to create room";

      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (error.message.includes("execution reverted")) {
        errorMessage =
          "Contract error: " + (error.reason || "Please try again");
      } else {
        errorMessage =
          "Failed to create room: " + (error.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!contract || !joinRoomId.trim() || !username.trim()) {
      setError("Please enter a valid room ID and username");
      return;
    }

    // Check if player is already in an active game
    try {
      const playerActiveGame = await contract.getPlayerActiveGame(userAddress);
      if (playerActiveGame && playerActiveGame.toString() !== "0") {
        // Check if they're trying to rejoin their existing game
        const existingGameData = await contract.getGame(playerActiveGame);
        const [, player1, player2, , , status] = existingGameData;

        if (status < 2) {
          // Game is still active
          // Try to rejoin the existing game instead of creating new one
          const existingRoomData = await contract.games(playerActiveGame);
          const existingRoomId = existingRoomData.roomId;

          setRoomId(existingRoomId);
          setGameId(playerActiveGame);

          const players = [
            {
              id: player1,
              username: player1 === userAddress ? username : "Player 1",
              playerNumber: 1,
            },
          ];

          if (player2 !== ethers.ZeroAddress) {
            players.push({
              id: player2,
              username: player2 === userAddress ? username : "Player 2",
              playerNumber: 2,
            });
            setCurrentView("game");
          } else {
            setCurrentView("waiting");
          }

          setPlayerNumber(player1 === userAddress ? 1 : 2);
          setPlayers(players);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log(
        "Could not check existing game, proceeding with room creation"
      );
    }

    setIsLoading(true);
    setError("");

    try {
      const roomIdToJoin = joinRoomId.trim().toUpperCase();
      console.log("Trying to join room:", roomIdToJoin);

      // First check if the room exists
      const gameIdToJoin = await contract.getGameByRoomId(roomIdToJoin);
      if (!gameIdToJoin || gameIdToJoin.toString() === "0") {
        setError("Room not found. Please check the room ID.");
        return;
      }

      // Check game state
      const gameData = await contract.getGame(gameIdToJoin);
      const [id, player1, player2, boardData, currentPlayer, status] = gameData;

      if (player2 !== ethers.ZeroAddress) {
        setError("Room is already full");
        return;
      }

      if (player1.toLowerCase() === userAddress.toLowerCase()) {
        setError("You cannot join your own room");
        return;
      }

      // Estimate gas first
      const gasEstimate = await contract.joinGame.estimateGas(roomIdToJoin);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2); // Add 20% buffer

      const tx = await contract.joinGame(roomIdToJoin, {
        gasLimit: gasLimit,
      });

      setError("Joining room... please wait for transaction confirmation");

      await tx.wait();

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      console.log("Successfully joined room");

      // Get updated game data
      const updatedGameData = await contract.getGame(gameIdToJoin);
      const [, updatedPlayer1, updatedPlayer2] = updatedGameData;

      setPlayers([
        { id: updatedPlayer1, username: "Player 1", playerNumber: 1 },
        { id: userAddress, username: username, playerNumber: 2 },
      ]);

      setRoomId(roomIdToJoin);
      setGameId(gameIdToJoin);
      setPlayerNumber(2);
      setCurrentView("game");
      setError("");
    } catch (error) {
      console.error("Error joining room:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      let errorMessage = "Failed to join room";

      if (error.message.includes("user rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (error.message.includes("execution reverted")) {
        if (error.message.includes("Game is full")) {
          errorMessage = "Room is already full";
        } else if (error.message.includes("Game not found")) {
          errorMessage = "Room not found";
        } else {
          errorMessage =
            "Cannot join room: " + (error.reason || "Please try again");
        }
      } else {
        errorMessage =
          "Failed to join room: " + (error.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const rejoinCurrentGame = async () => {
    if (!contract || !userAddress) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const playerActiveGame = await contract.getPlayerActiveGame(userAddress);
      if (!playerActiveGame || playerActiveGame.toString() === "0") {
        setError("You are not in any active game");
        setIsLoading(false);
        return;
      }

      const gameData = await contract.getGame(playerActiveGame);
      const [id, player1, player2, , , status] = gameData;

      if (status >= 2) {
        setError("Your previous game has already ended");
        setIsLoading(false);
        return;
      }

      const gameInfo = await contract.games(playerActiveGame);
      const roomIdFromContract = gameInfo.roomId;

      const players = [
        {
          id: player1,
          username: player1 === userAddress ? username : "Player 1",
          playerNumber: 1,
        },
      ];

      if (player2 !== ethers.ZeroAddress) {
        players.push({
          id: player2,
          username: player2 === userAddress ? username : "Player 2",
          playerNumber: 2,
        });
      }

      setPlayers(players);
      setRoomId(roomIdFromContract);
      setGameId(playerActiveGame);
      setPlayerNumber(player1 === userAddress ? 1 : 2);
      setCurrentView(player2 !== ethers.ZeroAddress ? "game" : "waiting");
      setError("");
    } catch (error) {
      console.error("Error rejoining game:", error);
      setError("Failed to rejoin game: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const leaveCurrentGame = async () => {
    if (!contract || !userAddress) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const playerActiveGame = await contract.getPlayerActiveGame(userAddress);
      if (!playerActiveGame || playerActiveGame.toString() === "0") {
        setError("You are not in any active game");
        setIsLoading(false);
        return;
      }

      const tx = await contract.leaveGame(playerActiveGame);
      setError("Leaving game... please wait for confirmation");

      await tx.wait();
      setError("Successfully left the game");
      setTimeout(() => setError(""), 3000);
    } catch (error) {
      console.error("Error leaving game:", error);
      let errorMessage = "Failed to leave game";

      if (error.message.includes("Cannot leave active game")) {
        errorMessage =
          "Cannot leave an active game. You need to forfeit the game instead.";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else {
        errorMessage =
          "Failed to leave game: " + (error.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy room ID:", error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const backToLobby = () => {
    // Clean up any event listeners
    if (contract) {
      try {
        contract.removeAllListeners();
      } catch (error) {
        console.warn("Could not remove contract listeners:", error);
      }
    }

    setCurrentView("home");
    setRoomId("");
    setPlayerId("");
    setPlayerNumber(null);
    setPlayers([]);
    setGameState(null);
    setJoinRoomId("");
    setGameId(null);
    setError("");
  };

  const retryConnection = () => {
    setError("");
    connectWallet();
  };

  if (currentView === "game") {
    return (
      <ConnectFour
        contract={contract}
        signer={signer}
        roomId={roomId}
        gameId={gameId}
        playerAddress={userAddress}
        playerNumber={playerNumber}
        players={players}
        gameState={gameState}
        onBackToLobby={backToLobby}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            GameHub
          </h1>
          <div className="flex items-center justify-center gap-2 text-white">
            {connectionStatus === "connected" ? (
              <Wallet className="w-5 h-5 text-green-500" />
            ) : connectionStatus === "connecting" ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span>
              {connectionStatus === "connecting"
                ? "Connecting..."
                : connectionStatus.charAt(0).toUpperCase() +
                  connectionStatus.slice(1)}
            </span>
            {userAddress && (
              <span className="text-gray-300 text-sm ml-2">
                ({userAddress.slice(0, 6)}...{userAddress.slice(-4)})
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 max-w-md">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            {connectionStatus === "error" && (
              <button
                onClick={retryConnection}
                className="ml-4 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Retry
              </button>
            )}
            <button
              onClick={() => setError("")}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Username View */}
        {currentView === "username" && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-6 h-6" />
              Enter Username
            </h2>
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={20}
                required
              />
              <button
                type="submit"
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5" />
                )}
                {connectionStatus === "connected"
                  ? "Continue"
                  : "Connect Wallet"}
              </button>
            </form>
            {connectionStatus === "disconnected" && (
              <p className="text-gray-400 text-sm mt-2 text-center">
                MetaMask required to play
              </p>
            )}
          </div>
        )}

        {/* Leaderboard View */}
        {currentView === "leaderboard" && (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Leaderboard
            </h2>
            {/* Leaderboard table/list component here */}
            <button
              onClick={() => setCurrentView("home")}
              className="mt-6 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Lobby
            </button>
          </div>
        )}

        {/* Home View */}
        {currentView === "home" && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6" />
              Connect Four Lobby
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={createRoom}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={connectionStatus !== "connected" || isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Create Room
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter Room ID"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  maxLength={6}
                />
                <button
                  onClick={joinRoom}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    connectionStatus !== "connected" ||
                    isLoading ||
                    !joinRoomId.trim()
                  }
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                  Join Room
                </button>

                <button
                  onClick={rejoinCurrentGame}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={connectionStatus !== "connected" || isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Rejoin Current Game
                </button>

                <button
                  onClick={leaveCurrentGame}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={connectionStatus !== "connected" || isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  Leave Current Game
                </button>
                <button
                  onClick={() => setCurrentView("leaderboard")}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </button>
              </div>
            </div>
            {connectionStatus !== "connected" && (
              <div className="mt-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
                <p className="text-yellow-200 text-sm text-center">
                  Please connect your wallet to create or join games
                </p>
              </div>
            )}
          </div>
        )}

        {/* Waiting Room View */}
        {currentView === "waiting" && (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Waiting for Opponent
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
            </h2>
            <p className="text-gray-300 mb-4">
              Share this room ID with a friend to join the game:
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={roomId}
                readOnly
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 text-center text-lg font-mono"
              />
              <button
                onClick={copyRoomId}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Copy room ID"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm text-center mb-4">
                Room ID copied to clipboard!
              </p>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-white text-sm">{username} (You)</span>
                <Crown className="w-4 h-4 text-yellow-400 ml-auto" />
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-700 rounded opacity-50">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">
                  Waiting for player...
                </span>
              </div>
            </div>
            <button
              onClick={backToLobby}
              className="mt-6 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              ← Back to Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
