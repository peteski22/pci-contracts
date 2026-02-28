/**
 * Type definitions for PCI Contracts
 */

/**
 * Identity linkage rules for privacy-preserving verification
 * Controls how ephemeral DIDs relate to root identity
 */
export interface IdentityLinkage {
  /** Requester must use ephemeral DID (did:key) - unlinkable by third parties */
  ephemeralRequired: boolean;
  /** Requester may voluntarily prove root DID ownership (for legal/audit) */
  proofOfRootAllowed: boolean;
  /** Requester may prove same-person across sessions via ZK (without revealing identity) */
  zkContinuityAllowed: boolean;
}

/**
 * Payment currency for S-PAL policies.
 *
 * - `{ kind: "Ada" }` - Payment denominated in lovelace (1 ADA = 1,000,000 lovelace)
 * - `{ kind: "NativeToken", policyId, assetName }` - Payment denominated in a native token
 *   (e.g., USDCx uses 6 decimal places: 1 USDCx = 1,000,000 micro-USDCx)
 *
 * Note: Every Cardano UTxO must carry minimum ADA (~1.2-2 ADA) even for pure token transfers.
 * One currency per policy; "accept either" is not supported in MVP.
 */
export type PaymentCurrency =
  | { kind: "Ada" }
  | { kind: "NativeToken"; policyId: string; assetName: string };

export interface SPALPolicy {
  /** Policy identifier */
  id: string;
  /** Policy owner's public key hash */
  ownerPkh: string;
  /** Minimum payment amount (0 = no payment required). Units depend on paymentCurrency. */
  minPayment: bigint;
  /** Maximum data retention in milliseconds */
  maxRetentionMs: number;
  /** Identity linkage rules */
  identityLinkage: IdentityLinkage;
  /** Hash of required ZKP proof type (empty string = no proof required) */
  requiredProofHash: string;
  /** Data context scope path (e.g., "medical/diagnosis_codes") */
  contextScope: string;
  /** Payment currency (Ada or native token). Defaults to Ada if omitted. */
  paymentCurrency?: PaymentCurrency;
}

export interface ValidationRequest {
  /** The S-PAL policy ID (optional, for reference) */
  policyId?: string;
  /** Requester's DID (ephemeral did:key or persistent) */
  requesterDid: string;
  /** Reference to ZKP proof (e.g., Midnight tx hash) */
  proofReference: string;
  /** Access timestamp for audit */
  accessTime: number;
  /** Payment amount (must meet minPayment). Units match policy's paymentCurrency. */
  paymentAmount: bigint;
}

export interface ProofData {
  /** Proof type */
  type: "zkp" | "attestation" | "signature";
  /** The claim being proven */
  claim: string;
  /** Serialized proof */
  proof: string;
  /** Verification key */
  verificationKey: string;
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Transaction hash if submitted */
  txHash?: string;
}

export interface CompiledScript {
  /** Compiled Plutus script (CBOR hex) */
  cborHex: string;
  /** Script hash */
  hash: string;
  /** Script address (for specific network) */
  address?: string;
}

/**
 * Cardano network configuration
 */
export type Network = "Mainnet" | "Preprod" | "Preview" | "Custom";

/**
 * Lucid provider configuration
 */
export interface LucidConfig {
  /** Network to connect to */
  network: Network;
  /** Provider URL (Kupmios for Yaci devnet, Blockfrost for testnets/mainnet) */
  providerUrl: string;
  /** API key (for Blockfrost) */
  apiKey?: string;
  /** Custom network magic (for custom networks) */
  networkMagic?: number;
}

/**
 * Policy UTxO information
 */
export interface PolicyUtxo {
  /** Transaction hash of the UTxO */
  txHash: string;
  /** Output index */
  outputIndex: number;
  /** The policy datum */
  datum: SPALPolicy;
  /** Lovelace value locked */
  lovelace: bigint;
}
