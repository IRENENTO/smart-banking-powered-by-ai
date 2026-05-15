exports.getSchedules = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const [rows] = await connection.execute(`
            SELECT id, user_id, name, description, recipient_type, recipient_value, amount, frequency, start_date, end_date, next_payment_date, status, created_at, updated_at
            FROM payment_schedules
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [req.user.id]);

        res.json({ data: rows });
    } catch (err) {
        console.error('Get schedules error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { name, description, amount, frequency, startDate, endDate, recipient_type, recipient_value } = req.body;

        if (!name || !amount || amount <= 0 || !startDate || !frequency) {
            return res.status(400).json({ msg: 'Name, amount, start date, and frequency are required' });
        }

        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
            return res.status(400).json({ msg: 'Frequency must be daily, weekly, or monthly' });
        }

        const connection = global.dbConnection;
        const [result] = await connection.execute(`
            INSERT INTO payment_schedules (user_id, name, description, recipient_type, recipient_value, amount, frequency, start_date, end_date, next_payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.user.id,
            name,
            description || null,
            recipient_type || 'account',
            recipient_value || '',
            amount,
            frequency,
            startDate,
            endDate || null,
            startDate
        ]);

        const [rows] = await connection.execute(`
            SELECT id, user_id, name, description, recipient_type, recipient_value, amount, frequency, start_date, end_date, next_payment_date, status, created_at, updated_at
            FROM payment_schedules
            WHERE id = ?
        `, [result.insertId]);

        res.status(201).json({ msg: 'Schedule created successfully', data: rows[0] });
    } catch (err) {
        console.error('Create schedule error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { name, description, amount, frequency, startDate, endDate, recipient_type, recipient_value } = req.body;

        const connection = global.dbConnection;
        const [existing] = await connection.execute(
            'SELECT * FROM payment_schedules WHERE id = ? AND user_id = ?',
            [scheduleId, req.user.id]
        );

        if (!existing.length) {
            return res.status(404).json({ msg: 'Schedule not found' });
        }

        await connection.execute(`
            UPDATE payment_schedules
            SET name = ?, description = ?, recipient_type = ?, recipient_value = ?, amount = ?, frequency = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `, [
            name || existing[0].name,
            description !== undefined ? description : existing[0].description,
            recipient_type || existing[0].recipient_type,
            recipient_value !== undefined ? recipient_value : existing[0].recipient_value,
            amount || existing[0].amount,
            frequency || existing[0].frequency,
            startDate || existing[0].start_date,
            endDate !== undefined ? endDate : existing[0].end_date,
            scheduleId,
            req.user.id
        ]);

        const [rows] = await connection.execute(
            'SELECT * FROM payment_schedules WHERE id = ?',
            [scheduleId]
        );

        res.json({ msg: 'Schedule updated successfully', data: rows[0] });
    } catch (err) {
        console.error('Update schedule error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.pauseSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { action } = req.body;

        if (!action || !['pause', 'resume'].includes(action)) {
            return res.status(400).json({ msg: 'Action must be "pause" or "resume"' });
        }

        const newStatus = action === 'pause' ? 'paused' : 'active';

        const connection = global.dbConnection;
        const [result] = await connection.execute(
            'UPDATE payment_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [newStatus, scheduleId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Schedule not found' });
        }

        res.json({ msg: `Schedule ${action}d successfully`, data: { status: newStatus } });
    } catch (err) {
        console.error('Pause/resume schedule error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        const connection = global.dbConnection;
        const [result] = await connection.execute(
            'DELETE FROM payment_schedules WHERE id = ? AND user_id = ?',
            [scheduleId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Schedule not found' });
        }

        res.json({ msg: 'Schedule deleted successfully' });
    } catch (err) {
        console.error('Delete schedule error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
