// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC-5192 minimal soulbound interface
interface IERC5192 {
    /// @notice Emitted when a token is locked (soulbound) and cannot move.
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title IntentCredential
 * @notice A soulbound (non-transferable) credential that encodes a person's
 *         money persona + intent score. Minted by an authorised issuer
 *         (the Intent Mirror backend), so the holder never pays gas — but the
 *         credential is owned by, and bound to, the holder's wallet forever.
 *
 *         This is the on-chain expression of the product's core idea: the user
 *         owns their financial reputation, not the bank.
 */
contract IntentCredential is ERC721, Ownable, IERC5192 {
    uint256 private _nextId = 1;

    struct Credential {
        string  persona;      // e.g. "Optimizer"
        uint256 intentScore;  // 0–100
        string  signals;      // comma-joined behavioural signals
        string  uri;          // optional metadata URI
        uint64  issuedAt;     // unix timestamp
    }

    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256)    public tokenOfHolder; // one credential per holder

    constructor(address issuer)
        ERC721("Intent Credential", "INTENT")
        Ownable(issuer)
    {}

    /// @inheritdoc IERC5192
    function locked(uint256) external pure returns (bool) {
        return true; // every credential is permanently soulbound
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == 0xb45a3c0e /* ERC-5192 */ || super.supportsInterface(interfaceId);
    }

    /**
     * @notice Issue (or refresh) a holder's credential. Only the issuer can call.
     * @dev    If the holder already has one, it is updated in place so the
     *         on-chain profile always reflects the latest behaviour.
     */
    function issue(
        address to,
        string calldata persona,
        uint256 intentScore,
        string calldata signals,
        string calldata uri
    ) external onlyOwner returns (uint256 tokenId) {
        uint256 existing = tokenOfHolder[to];
        if (existing != 0) {
            credentials[existing] = Credential(persona, intentScore, signals, uri, uint64(block.timestamp));
            return existing;
        }
        tokenId = _nextId++;
        _safeMint(to, tokenId);
        credentials[tokenId] = Credential(persona, intentScore, signals, uri, uint64(block.timestamp));
        tokenOfHolder[to] = tokenId;
        emit Locked(tokenId);
    }

    /// @notice Read a holder's credential in one call (for the frontend).
    function getByHolder(address holder)
        external
        view
        returns (
            uint256 tokenId,
            string memory persona,
            uint256 intentScore,
            string memory signals,
            string memory uri,
            uint64 issuedAt
        )
    {
        tokenId = tokenOfHolder[holder];
        Credential memory cr = credentials[tokenId];
        return (tokenId, cr.persona, cr.intentScore, cr.signals, cr.uri, cr.issuedAt);
    }

    /// @dev Soulbound enforcement: allow mint (from==0) and burn (to==0) only.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
