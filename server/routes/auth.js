import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { ethers } from 'ethers';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-prototype-only';

router.post('/wallet/login', async (req, res) => {
  try {
    const { walletAddress, signature, message, provider, blockchain } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const addr = walletAddress.toLowerCase();
    const db = await getDb();
    
    let user = await db('users').where({ wallet_address: addr }).first();

    if (!user) {
      const userId = uuidv4();
      const userName = `User ${walletAddress.slice(2, 8)}`;

      await db('users').insert({
        id: userId,
        email: `${addr}@wallet.local`,
        password_hash: '',
        first_name: userName,
        last_name: '',
        role: 'patient',
        wallet_address: addr,
        wallet_provider: provider || 'unknown',
        wallet_blockchain: blockchain || 'unknown',
        profile: JSON.stringify({
          walletInfo: {
            provider,
            blockchain,
            address: walletAddress
          }
        }),
        active: true,
        created_at: new Date().toISOString()
      });

      await db('patients').insert({
        id: uuidv4(),
        user_id: userId,
        mrn: `MRN-WALLET-${Date.now()}`,
        medical_history: JSON.stringify({}),
        emergency_contacts: JSON.stringify([]),
        created_at: new Date().toISOString()
      });

      await db('subscriptions').insert({
        id: uuidv4(),
        user_id: userId,
        tier: 'free',
        status: 'active',
        start_date: new Date().toISOString(),
        auto_renew: false,
        created_at: new Date().toISOString()
      });

      user = await db('users').where({ id: userId }).first();
    }

    // Update last login and wallet info
    await db('users')
      .where({ id: user.id })
      .update({
        wallet_provider: provider || user.wallet_provider,
        wallet_blockchain: blockchain || user.wallet_blockchain,
        last_login: new Date().toISOString()
      });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        walletAddress: normalizedAddress,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Longer expiry for wallet users
    );

    // Get subscription info
    const subscription = await db('subscriptions')
      .where({ user_id: user.id })
      .orderBy('created_at', 'desc')
      .first();

    res.json({
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        role: user.role,
        walletAddress: user.wallet_address,
        walletProvider: user.wallet_provider,
        walletBlockchain: user.wallet_blockchain,
        avatar: user.avatar,
        subscription: subscription ? {
          tier: subscription.tier,
          status: subscription.status,
          startDate: subscription.start_date,
          expiryDate: subscription.expiry_date,
          autoRenew: subscription.auto_renew
        } : null
      }
    });

  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/wallet/verify', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Wallet address, signature, and message are required' });
    }

    try {
      const recovered = ethers.verifyMessage(message, signature);
      const isValid = recovered.toLowerCase() === walletAddress.toLowerCase();

      res.json({
        valid: isValid,
        recoveredAddress
      });
    } catch (error) {
      res.json({ valid: false, error: 'Invalid signature' });
    }

  } catch (error) {
    console.error('Wallet verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update subscription tier
 */
router.post('/wallet/subscribe', authenticateToken, async (req, res) => {
  try {
    const { tier, transactionHash } = req.body;

    if (!tier || !['free', 'basic', 'premium', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Valid tier is required' });
    }

    const db = await getDb();
    const userId = req.user.userId;

    // Get current subscription
    const currentSub = await db('subscriptions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .first();

    if (currentSub) {
      // Update existing subscription
      await db('subscriptions')
        .where({ id: currentSub.id })
        .update({
          tier,
          status: 'active',
          transaction_hash: transactionHash,
          updated_at: new Date().toISOString()
        });
    } else {
      // Create new subscription
      await db('subscriptions').insert({
        id: uuidv4(),
        user_id: userId,
        tier,
        status: 'active',
        start_date: new Date().toISOString(),
        transaction_hash: transactionHash,
        auto_renew: false,
        created_at: new Date().toISOString()
      });
    }

    const subscription = await db('subscriptions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .first();

    res.json({
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.start_date,
        expiryDate: subscription.expiry_date,
        autoRenew: subscription.auto_renew
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get current user (wallet-based)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db('users').where({ id: req.user.userId }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get subscription
    const subscription = await db('subscriptions')
      .where({ user_id: user.id })
      .orderBy('created_at', 'desc')
      .first();

    res.json({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: user.role,
      walletAddress: user.wallet_address,
      walletProvider: user.wallet_provider,
      walletBlockchain: user.wallet_blockchain,
      avatar: user.avatar,
      profile: JSON.parse(user.profile || '{}'),
      subscription: subscription ? {
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.start_date,
        expiryDate: subscription.expiry_date,
        autoRenew: subscription.auto_renew
      } : null
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update user profile
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const db = await getDb();

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name) {
      const nameParts = name.split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    await db('users')
      .where({ id: req.user.userId })
      .update(updateData);

    const user = await db('users').where({ id: req.user.userId }).first();

    res.json({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: user.role,
      walletAddress: user.wallet_address,
      avatar: user.avatar
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
