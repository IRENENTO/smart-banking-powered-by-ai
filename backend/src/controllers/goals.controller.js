exports.getGoals = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const [rows] = await connection.execute(
            'SELECT id, user_id, name, target_amount AS target, current_amount AS current, target_date AS deadline, auto_deduction_amount, auto_deduction_period, last_deduction_date, status, created_at FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({
            goals: rows.map(g => ({
                ...g,
                target: g.target ? parseFloat(g.target) : 0,
                current: g.current ? parseFloat(g.current) : 0,
                auto_deduction_amount: g.auto_deduction_amount ? parseFloat(g.auto_deduction_amount) : null,
            }))
        });
    } catch (err) {
        console.error('Get goals error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const { name, target, current, deadline } = req.body;
        if (!name || !target || !deadline) {
            return res.status(400).json({ msg: 'Name, target amount, and deadline are required' });
        }
        const connection = global.dbConnection;
        const [result] = await connection.execute(
            'INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, name, target, current || 0, deadline]
        );
        const [rows] = await connection.execute(
            'SELECT id, user_id, name, target_amount AS target, current_amount AS current, target_date AS deadline, status, created_at FROM savings_goals WHERE id = ?',
            [result.insertId]
        );
        res.status(201).json({
            goal: {
                ...rows[0],
                target: rows[0].target ? parseFloat(rows[0].target) : 0,
                current: rows[0].current ? parseFloat(rows[0].current) : 0,
            }
        });
    } catch (err) {
        console.error('Create goal error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { name, target, current, deadline, autoDeductionAmount, autoDeductionPeriod } = req.body;

        const connection = global.dbConnection;
        const [existing] = await connection.execute(
            'SELECT * FROM savings_goals WHERE id = ? AND user_id = ?',
            [goalId, req.user.id]
        );

        if (!existing.length) {
            return res.status(404).json({ msg: 'Goal not found' });
        }

        const fields = [];
        const values = [];
        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (target !== undefined) { fields.push('target_amount = ?'); values.push(target); }
        if (current !== undefined) { fields.push('current_amount = ?'); values.push(current); }
        if (deadline !== undefined) { fields.push('target_date = ?'); values.push(deadline); }
        if (autoDeductionAmount !== undefined) { fields.push('auto_deduction_amount = ?'); values.push(autoDeductionAmount); }
        if (autoDeductionPeriod !== undefined) { fields.push('auto_deduction_period = ?'); values.push(autoDeductionPeriod); }

        if (fields.length === 0) {
            return res.status(400).json({ msg: 'No fields to update' });
        }

        values.push(goalId, req.user.id);
        await connection.execute(
            `UPDATE savings_goals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
            values
        );

        const [rows] = await connection.execute(
            'SELECT id, user_id, name, target_amount AS target, current_amount AS current, target_date AS deadline, auto_deduction_amount, auto_deduction_period, last_deduction_date, status, created_at FROM savings_goals WHERE id = ?',
            [goalId]
        );

        res.json({
            goal: {
                ...rows[0],
                target: rows[0].target ? parseFloat(rows[0].target) : 0,
                current: rows[0].current ? parseFloat(rows[0].current) : 0,
                auto_deduction_amount: rows[0].auto_deduction_amount ? parseFloat(rows[0].auto_deduction_amount) : null,
            }
        });
    } catch (err) {
        console.error('Update goal error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const connection = global.dbConnection;
        const [result] = await connection.execute(
            'DELETE FROM savings_goals WHERE id = ? AND user_id = ?',
            [goalId, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Goal not found' });
        }
        res.json({ msg: 'Goal deleted successfully' });
    } catch (err) {
        console.error('Delete goal error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
