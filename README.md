# Private Blockchain - 콘텐츠 저작권 보호 시스템 PoC

Hyperledger Besu 프라이빗 블록체인과 Base Sepolia 퍼블릭 체인을 연동한 콘텐츠 저작권 보호 시스템 PoC입니다.

## 프로젝트 구조

```
besu_test/
├── besu-qbft-docker/          # Phase 1: Besu QBFT 단일 노드 테스트 환경
├── quorum-quickstart/         # Phase 2: Besu QBFT 다중 노드 네트워크
└── hat_test/                  # 스마트 컨트랙트 및 스크립트
    ├── contracts/
    │   ├── ContentRegistry.sol    # Besu 프라이빗 체인 콘텐츠 등록
    │   └── AnchorRegistry.sol     # Base Sepolia 앵커링
    └── scripts/
        ├── deploy-ethers.ts       # ContentRegistry 배포
        ├── test-registry.ts       # 등록/조회 테스트
        ├── buildMerkleRoot.ts     # Merkle root 생성 (Phase 3)
        └── submitAnchor.ts        # Base Sepolia 앵커링 (Phase 3)
```

## 기술 스택

- **Hyperledger Besu** — QBFT 합의 프라이빗 블록체인
- **Hardhat v3** + **TypeScript**
- **viem** — 컨트랙트 인터랙션
- **ethers.js v6** — 트랜잭션 직접 전송
- **OpenZeppelin v5** — AccessControl, MerkleProof

## 네트워크 설정

| 네트워크 | 용도 | RPC | ChainId |
|----------|------|-----|---------|
| besuLocal | Besu QBFT 로컬 | http://localhost:8545 | 1337 |
| baseSepolia | Base Sepolia 테스트넷 | https://sepolia.base.org | 84532 |

## 주요 주의사항

Besu QBFT 네트워크는 Shanghai 하드포크 미적용으로 `PUSH0` 옵코드를 지원하지 않습니다.
반드시 `hardhat.config.ts`에 `evmVersion: "paris"` 설정 후 컴파일해야 합니다.

```typescript
solidity: {
  profiles: {
    default: {
      version: "0.8.28",
      settings: {
        evmVersion: "paris",
      },
    },
  },
},
```

## 실행 방법

### 1. 네트워크 시작

```bash
cd quorum-quickstart
sudo ./run.sh
```

### 2. ContentRegistry 배포 (Besu 로컬)

```bash
cd hat_test
npx hardhat run --network besuLocal scripts/deploy-ethers.ts
```

### 3. 등록/조회 테스트

```bash
npx hardhat run --network besuLocal scripts/test-registry.ts
```

### 4. AnchorRegistry 배포 (Base Sepolia)

```bash
npx hardhat run --network baseSepolia scripts/deploy-ethers.ts
```

## Block Explorer

Quorum Explorer를 통해 블록, 트랜잭션, 컨트랙트를 시각적으로 확인할 수 있습니다.

| 서비스 | URL |
|--------|-----|
| Quorum Explorer | http://localhost:25000 |

## 전체 플로우

```
1. Besu에 contentHash 등록
   ContentRegistry.registerContent(contentHash)
        ↓
2. Besu 이벤트 로그 수집 → Merkle root 계산
   scripts/buildMerkleRoot.ts
        ↓
3. Base Sepolia에 Merkle root 앵커링
   AnchorRegistry.submitAnchor(merkleRoot, fromBlock, toBlock)
        ↓
4. Merkle Proof로 콘텐츠 포함 여부 검증
   AnchorRegistry.verifyContent(contentHash, proof, merkleRoot)
```
