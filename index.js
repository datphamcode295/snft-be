// Required dependencies
const express = require('express')
const { ethers } = require('ethers')
require('dotenv').config()
const cors = require('cors');

const app = express()
app.use(express.json())

// Configure CORS to allow all origins
app.use(cors());

// Load environment variables
const PORT = process.env.PORT || 3001
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY // Admin's private key

// Initialize admin wallet
const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY)

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
    next()
}

// Generate signature endpoint
app.post('/api/v1/generate-signature', verifyApiKey, async (req, res) => {
    try {
        const { userAddress } = req.body

        // Validate Ethereum address
        if (!ethers.isAddress(userAddress)) {
            return res.status(400).json({ error: 'Invalid Ethereum address' })
        }

        const now = Date.now()

        // Create message hash
        const messageHash = ethers.solidityPackedKeccak256(
            ['address', 'uint'],
            [userAddress, now]
        )

        // Sign the message
        const signature = await adminWallet.signMessage(ethers.getBytes(messageHash))

        // Return the signature
        res.json({
            signature,
            userAddress,
            index: now,
            message: 'Signature generated successfully'
        })

    } catch (error) {
        console.error('Error generating signature:', error)
        res.status(500).json({ error: 'Error generating signature' })
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})