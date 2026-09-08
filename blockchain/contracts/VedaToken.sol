// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title VedaToken (VDT)
/// @notice ERC-20 reward token for verified Vedic knowledge contributors on Shardeum
contract VedaToken {

    // ─── ERC-20 State ──────────────────────────────────────────────────────────

    string public constant name = "VedaToken";
    string public constant symbol = "VDT";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ─── VedaToken State ───────────────────────────────────────────────────────

    address public owner;
    address public vedaKnowledgeContract;   // Authorized minter (VedaKnowledge contract)

    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10 ** 18;    // 10M VDT
    uint256 public constant CONTRIBUTION_REWARD = 100 * 10 ** 18;      // 100 VDT per verified source
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;       // 100M VDT cap

    mapping(address => uint256) public totalRewardsEarned;

    // ─── Events ────────────────────────────────────────────────────────────────

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event KnowledgeRewarded(address indexed contributor, uint256 amount, string sourceTitle);
    event MinterUpdated(address oldMinter, address newMinter);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "VedaToken: not owner");
        _;
    }

    modifier onlyMinter() {
        require(
            msg.sender == vedaKnowledgeContract || msg.sender == owner,
            "VedaToken: not authorized minter"
        );
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ─── ERC-20 Functions ──────────────────────────────────────────────────────

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "VedaToken: insufficient allowance");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    // ─── VedaToken Functions ───────────────────────────────────────────────────

    /// @notice Reward a contributor for submitting a verified Vedic knowledge source
    function reward(address contributor, string calldata sourceTitle) external onlyMinter {
        require(totalSupply + CONTRIBUTION_REWARD <= MAX_SUPPLY, "VedaToken: max supply reached");
        _mint(contributor, CONTRIBUTION_REWARD);
        totalRewardsEarned[contributor] += CONTRIBUTION_REWARD;
        emit KnowledgeRewarded(contributor, CONTRIBUTION_REWARD, sourceTitle);
    }

    /// @notice Burn tokens (contributor can reduce their own balance)
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "VedaToken: insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    /// @notice Set the authorized minter (VedaKnowledge contract)
    function setMinter(address newMinter) external onlyOwner {
        emit MinterUpdated(vedaKnowledgeContract, newMinter);
        vedaKnowledgeContract = newMinter;
    }

    // ─── Internal ──────────────────────────────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "VedaToken: transfer to zero address");
        require(balanceOf[from] >= amount, "VedaToken: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
}
