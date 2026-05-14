const Investment = require('../models/Investment');

const investmentTypes = [
    {
        id: 'stocks',
        name: 'Stock Market',
        description: 'Invest in listed companies on Rwanda Stock Exchange',
        min_amount: 10000,
        risk_levels: ['medium', 'high'],
        expected_returns: { low: 8, medium: 15, high: 25 }
    },
    {
        id: 'bonds',
        name: 'Bonds & Fixed Income',
        description: 'Low-risk government and corporate bonds',
        min_amount: 5000,
        risk_levels: ['low', 'medium'],
        expected_returns: { low: 4, medium: 8, high: 12 }
    },
    {
        id: 'startups',
        name: 'Startups & Innovation',
        description: 'Invest in promising Rwandan startups',
        min_amount: 25000,
        risk_levels: ['medium', 'high'],
        expected_returns: { low: 10, medium: 22, high: 40 }
    },
    {
        id: 'realestate',
        name: 'Real Estate',
        description: 'Property investment opportunities',
        min_amount: 50000,
        risk_levels: ['low', 'medium'],
        expected_returns: { low: 6, medium: 12, high: 20 }
    }
];

exports.getInvestments = async (req, res) => {
    try {
        const userId = req.user.id;
        const investments = await Investment.findByUserId(userId);
        
        res.json({
            success: true,
            data: investments.map(inv => ({
                id: inv.id,
                type: inv.type,
                amount: inv.amount,
                duration: inv.duration,
                risk_level: inv.risk_level,
                expected_return: inv.expected_return,
                actual_return: inv.actual_return,
                status: inv.status,
                created_at: inv.created_at,
                updated_at: inv.updated_at
            }))
        });
    } catch (err) {
        console.error('Get investments error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.createInvestment = async (req, res) => {
    try {
        const { type, amount, duration, risk_level = 'medium', expected_return } = req.body;
        
        if (!type || !amount || !duration) {
            return res.status(400).json({ msg: 'Type, amount, and duration are required' });
        }

        const investmentType = investmentTypes.find(t => t.id === type);
        if (!investmentType) {
            return res.status(400).json({ msg: 'Invalid investment type' });
        }

        if (amount < investmentType.min_amount) {
            return res.status(400).json({ 
                msg: `Minimum investment amount for ${investmentType.name} is ${investmentType.min_amount} RWF` 
            });
        }

        if (!investmentType.risk_levels.includes(risk_level)) {
            return res.status(400).json({ msg: `Invalid risk level for ${type}. Allowed: ${investmentType.risk_levels.join(', ')}` });
        }

        const userId = req.user.id;
        const investment = await Investment.create({
            user_id: userId,
            type,
            amount,
            duration,
            risk_level,
            expected_return: expected_return || investmentType.expected_returns[risk_level],
            status: 'active'
        });

        res.status(201).json({
            success: true,
            data: {
                id: investment.id,
                type: investment.type,
                amount: investment.amount,
                duration: investment.duration,
                risk_level: investment.risk_level,
                expected_return: investment.expected_return,
                status: investment.status,
                created_at: investment.created_at
            }
        });
    } catch (err) {
        console.error('Create investment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getInvestmentById = async (req, res) => {
    try {
        const investmentId = req.params.id;
        const userId = req.user.id;
        
        const investment = await Investment.findByIdAndUserId(investmentId, userId);
        if (!investment) {
            return res.status(404).json({ msg: 'Investment not found' });
        }

        res.json({
            success: true,
            data: {
                id: investment.id,
                type: investment.type,
                amount: investment.amount,
                duration: investment.duration,
                risk_level: investment.risk_level,
                expected_return: investment.expected_return,
                actual_return: investment.actual_return,
                status: investment.status,
                created_at: investment.created_at,
                updated_at: investment.updated_at
            }
        });
    } catch (err) {
        console.error('Get investment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.updateInvestment = async (req, res) => {
    try {
        const investmentId = req.params.id;
        const userId = req.user.id;
        const { amount, duration, risk_level, expected_return } = req.body;
        
        const investment = await Investment.findByIdAndUserId(investmentId, userId);
        if (!investment) {
            return res.status(404).json({ msg: 'Investment not found' });
        }

        if (investment.status !== 'active') {
            return res.status(400).json({ msg: 'Cannot update completed investment' });
        }

        const updateData = {};
        if (amount) updateData.amount = amount;
        if (duration) updateData.duration = duration;
        if (risk_level) {
            const investmentType = investmentTypes.find(t => t.id === investment.type);
            if (!investmentType.risk_levels.includes(risk_level)) {
                return res.status(400).json({ msg: `Invalid risk level for ${investment.type}` });
            }
            updateData.risk_level = risk_level;
        }
        if (expected_return) updateData.expected_return = expected_return;

        const updatedInvestment = await Investment.update(investmentId, updateData);

        res.json({
            success: true,
            data: {
                id: updatedInvestment.id,
                type: updatedInvestment.type,
                amount: updatedInvestment.amount,
                duration: updatedInvestment.duration,
                risk_level: updatedInvestment.risk_level,
                expected_return: updatedInvestment.expected_return,
                status: updatedInvestment.status,
                updated_at: updatedInvestment.updated_at
            }
        });
    } catch (err) {
        console.error('Update investment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteInvestment = async (req, res) => {
    try {
        const investmentId = req.params.id;
        const userId = req.user.id;
        
        const investment = await Investment.findByIdAndUserId(investmentId, userId);
        if (!investment) {
            return res.status(404).json({ msg: 'Investment not found' });
        }

        if (investment.status !== 'active') {
            return res.status(400).json({ msg: 'Cannot delete completed investment' });
        }

        await Investment.delete(investmentId);

        res.json({
            success: true,
            message: 'Investment deleted successfully'
        });
    } catch (err) {
        console.error('Delete investment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getInvestmentTypes = async (req, res) => {
    try {
        res.json({
            success: true,
            data: investmentTypes
        });
    } catch (err) {
        console.error('Get investment types error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.calculateReturns = async (req, res) => {
    try {
        const { type, amount, duration, risk_level = 'medium' } = req.body;
        
        if (!type || !amount || !duration) {
            return res.status(400).json({ msg: 'Type, amount, and duration are required' });
        }

        const investmentType = investmentTypes.find(t => t.id === type);
        if (!investmentType) {
            return res.status(400).json({ msg: 'Invalid investment type' });
        }

        const baseReturn = investmentType.expected_returns[risk_level] || investmentType.expected_returns.medium;
        const totalReturns = amount * (baseReturn / 100) * (duration / 12);
        const finalAmount = amount + totalReturns;

        res.json({
            success: true,
            data: {
                principal: amount,
                expected_return_rate: baseReturn,
                total_returns: totalReturns,
                final_amount: finalAmount,
                duration_months: duration,
                risk_level: risk_level
            }
        });
    } catch (err) {
        console.error('Calculate returns error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
