// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AgeVerifier.sol";

contract AgeVerificationRegistry {
    AgeVerifier public immutable verifier;
    
    event AgeVerified(address indexed user, uint256 minAge, uint256 timestamp);
    event VerifierUpdated(address indexed newVerifier);
    
    constructor(address _verifier) {
        verifier = AgeVerifier(_verifier);
    }
    
    function verifyAge(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256 minAge
    ) external returns (bool) {
        uint256[1] memory input = [minAge];
        bool isValid = verifier.verifyProof(a, b, c, input);
        
        if (isValid) {
            emit AgeVerified(msg.sender, minAge, block.timestamp);
        }
        
        return isValid;
    }
    
    function verifyAgeView(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256 minAge
    ) external view returns (bool) {
        uint256[1] memory input = [minAge];
        return verifier.verifyProof(a, b, c, input);
    }
}