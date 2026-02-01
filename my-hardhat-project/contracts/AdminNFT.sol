// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./openzeppelin/token/ERC721/ERC721.sol";
import "./openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import "./openzeppelin/access/Ownable.sol";
import "./openzeppelin/utils/Counters.sol";

contract AdminNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Revocation tracking
    mapping(uint256 => bool) private _revoked;
    
    // Events
    event CertificateRevoked(uint256 indexed tokenId, address indexed revokedBy);
    event CertificateReinstated(uint256 indexed tokenId, address indexed reinstatedBy);

    constructor() ERC721("AdminNFT", "ADMNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new certificate NFT
     * @param to Address to receive the NFT
     * @param _tokenURI IPFS URI of the certificate metadata
     */
    function safeMint(address to, string memory _tokenURI) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev Revoke a certificate (mark as invalid)
     * @param tokenId The ID of the token to revoke
     */
    function revoke(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!_revoked[tokenId], "Token already revoked");
        _revoked[tokenId] = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    /**
     * @dev Reinstate a revoked certificate
     * @param tokenId The ID of the token to reinstate
     */
    function reinstate(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(_revoked[tokenId], "Token not revoked");
        _revoked[tokenId] = false;
        emit CertificateReinstated(tokenId, msg.sender);
    }

    /**
     * @dev Check if a certificate is revoked
     * @param tokenId The ID of the token to check
     * @return bool True if revoked, false otherwise
     */
    function isRevoked(uint256 tokenId) public view returns (bool) {
        return _revoked[tokenId];
    }

    /**
     * @dev Get the current token count (for verification)
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}