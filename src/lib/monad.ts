import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

const MONAD_CONTRACT_ADDRESS = '0xceCBFF203C8B6044F52CE23D914A1bfD997541A4';
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

const contractAbi = parseAbi([
  'function updatePlayerData(address player, uint256 score, uint256 txCount) external'
]);

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(MONAD_RPC_URL),
});

export async function submitOnchainScore(
  walletClient: any,
  playerAddress: string,
  score: number,
  txCount: number = 1
) {
  try {
    const hash = await walletClient.writeContract({
      address: MONAD_CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'updatePlayerData',
      args: [playerAddress as `0x${string}`, BigInt(score), BigInt(txCount)],
    });
    
    return { success: true, hash };
  } catch (error) {
    console.error('Error submitting onchain score:', error);
    return { success: false, error };
  }
}

export async function fetchMonadUsername(walletAddress: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${walletAddress}`
    );
    const data = await response.json();
    return data.username || null;
  } catch (error) {
    console.error('Error fetching Monad username:', error);
    return null;
  }
}

export async function fetchMonadLeaderboard(): Promise<any[]> {
  try {
    const response = await fetch('https://monad-games-id-site.vercel.app/api/leaderboard');
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching Monad leaderboard:', error);
    return [];
  }
}