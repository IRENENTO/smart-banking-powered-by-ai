const getDb = () => global.dbConnection;

// Security Settings
exports.getSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [settings] = await getDb().query(
      'SELECT * FROM security_settings WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: settings[0] || {
        two_factor_enabled: false,
        sms_alerts: true,
        email_alerts: true,
        login_notifications: true,
        session_timeout: 30
      }
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch security settings'
    });
  }
};

exports.updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { two_factor_enabled, sms_alerts, email_alerts, login_notifications, session_timeout } = req.body;

    // Check if settings exist
    const [existing] = await getDb().query(
      'SELECT id FROM security_settings WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing settings
      await getDb().query(
        `UPDATE security_settings 
         SET two_factor_enabled = ?, sms_alerts = ?, email_alerts = ?, 
             login_notifications = ?, session_timeout = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [two_factor_enabled, sms_alerts, email_alerts, login_notifications, session_timeout, userId]
      );
    } else {
      // Insert new settings
      await getDb().query(
        `INSERT INTO security_settings 
         (user_id, two_factor_enabled, sms_alerts, email_alerts, login_notifications, session_timeout, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, two_factor_enabled, sms_alerts, email_alerts, login_notifications, session_timeout]
      );
    }

    res.json({
      success: true,
      msg: 'Security settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to update security settings'
    });
  }
};

// Notification Settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [settings] = await getDb().query(
      'SELECT * FROM notification_settings WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: settings[0] || {
        email_transactions: true,
        sms_transactions: false,
        email_promotions: false,
        sms_promotions: false,
        push_notifications: true,
        weekly_summary: true
      }
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch notification settings'
    });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email_transactions, sms_transactions, email_promotions, sms_promotions, push_notifications, weekly_summary } = req.body;

    const [existing] = await getDb().query(
      'SELECT id FROM notification_settings WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      await getDb().query(
        `UPDATE notification_settings 
         SET email_transactions = ?, sms_transactions = ?, email_promotions = ?, 
             sms_promotions = ?, push_notifications = ?, weekly_summary = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [email_transactions, sms_transactions, email_promotions, sms_promotions, push_notifications, weekly_summary, userId]
      );
    } else {
      await getDb().query(
        `INSERT INTO notification_settings 
         (user_id, email_transactions, sms_transactions, email_promotions, sms_promotions, push_notifications, weekly_summary, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, email_transactions, sms_transactions, email_promotions, sms_promotions, push_notifications, weekly_summary]
      );
    }

    res.json({
      success: true,
      msg: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to update notification settings'
    });
  }
};

// Privacy Settings
exports.getPrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [settings] = await getDb().query(
      'SELECT * FROM privacy_settings WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: settings[0] || {
        data_sharing: false,
        analytics_consent: true,
        marketing_consent: false,
        public_profile: false,
        location_tracking: false
      }
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch privacy settings'
    });
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data_sharing, analytics_consent, marketing_consent, public_profile, location_tracking } = req.body;

    const [existing] = await getDb().query(
      'SELECT id FROM privacy_settings WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      await getDb().query(
        `UPDATE privacy_settings 
         SET data_sharing = ?, analytics_consent = ?, marketing_consent = ?, 
             public_profile = ?, location_tracking = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [data_sharing, analytics_consent, marketing_consent, public_profile, location_tracking, userId]
      );
    } else {
      await getDb().query(
        `INSERT INTO privacy_settings 
         (user_id, data_sharing, analytics_consent, marketing_consent, public_profile, location_tracking, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, data_sharing, analytics_consent, marketing_consent, public_profile, location_tracking]
      );
    }

    res.json({
      success: true,
      msg: 'Privacy settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to update privacy settings'
    });
  }
};

// Transaction Limits
exports.getTransactionLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const [limits] = await getDb().query(
      'SELECT * FROM transaction_limits WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: limits[0] || {
        daily_limit: 1000000,
        weekly_limit: 5000000,
        monthly_limit: 20000000,
        single_transaction_limit: 500000
      }
    });
  } catch (error) {
    console.error('Error fetching transaction limits:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch transaction limits'
    });
  }
};

exports.updateTransactionLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { daily_limit, weekly_limit, monthly_limit, single_transaction_limit } = req.body;

    // Validate limits
    if (daily_limit < 1000 || weekly_limit < 5000 || monthly_limit < 10000 || single_transaction_limit < 500) {
      return res.status(400).json({
        success: false,
        msg: 'Transaction limits are too low. Minimum amounts apply.'
      });
    }

    const [existing] = await getDb().query(
      'SELECT id FROM transaction_limits WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      await getDb().query(
        `UPDATE transaction_limits 
         SET daily_limit = ?, weekly_limit = ?, monthly_limit = ?, single_transaction_limit = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [daily_limit, weekly_limit, monthly_limit, single_transaction_limit, userId]
      );
    } else {
      await getDb().query(
        `INSERT INTO transaction_limits 
         (user_id, daily_limit, weekly_limit, monthly_limit, single_transaction_limit, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, daily_limit, weekly_limit, monthly_limit, single_transaction_limit]
      );
    }

    res.json({
      success: true,
      msg: 'Transaction limits updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction limits:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to update transaction limits'
    });
  }
};

// User Preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const [preferences] = await getDb().query(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: preferences[0] || {
        currency: 'RWF',
        language: 'en',
        timezone: 'Africa/Kigali',
        date_format: 'DD/MM/YYYY',
        theme: 'light'
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch user preferences'
    });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currency, language, timezone, date_format, theme, large_text, high_contrast } = req.body;

    const [existing] = await getDb().query(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      await getDb().query(
        `UPDATE user_preferences 
         SET currency = ?, language = ?, timezone = ?, date_format = ?, theme = ?, large_text = ?, high_contrast = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [currency, language, timezone, date_format, theme, large_text, high_contrast, userId]
      );
    } else {
      await getDb().query(
        `INSERT INTO user_preferences 
         (user_id, currency, language, timezone, date_format, theme, large_text, high_contrast, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, currency, language, timezone, date_format, theme, large_text, high_contrast]
      );
    }

    res.json({
      success: true,
      msg: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to update user preferences'
    });
  }
};

// Cards Management
exports.getCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const [cards] = await getDb().query(
      'SELECT * FROM cards WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true, data: cards });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ success: false, msg: 'Failed to fetch cards' });
  }
};

exports.addCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { card_type, card_number, card_holder_name, expiry_date, cvv } = req.body;

    // Check if it's the first card to set as default
    const [existing] = await getDb().query('SELECT id FROM cards WHERE user_id = ?', [userId]);
    const is_default = existing.length === 0;

    const [result] = await getDb().query(
      `INSERT INTO cards (user_id, card_type, card_number, card_holder_name, expiry_date, cvv, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, card_type, card_number, card_holder_name, expiry_date, cvv, is_default]
    );

    res.json({ success: true, msg: 'Card added successfully', cardId: result.insertId });
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ success: false, msg: 'Failed to add card' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    await getDb().query('DELETE FROM cards WHERE id = ? AND user_id = ?', [cardId, userId]);
    res.json({ success: true, msg: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ success: false, msg: 'Failed to delete card' });
  }
};

exports.updateCardStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    const { status } = req.body;
    await getDb().query('UPDATE cards SET card_status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?', [status, cardId, userId]);
    res.json({ success: true, msg: `Card ${status} successfully` });
  } catch (error) {
    console.error('Error updating card status:', error);
    res.status(500).json({ success: false, msg: 'Failed to update card status' });
  }
};

exports.setDefaultCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    
    // Unset all as default
    await getDb().query('UPDATE cards SET is_default = FALSE WHERE user_id = ?', [userId]);
    // Set selected as default
    await getDb().query('UPDATE cards SET is_default = TRUE WHERE id = ? AND user_id = ?', [cardId, userId]);
    
    res.json({ success: true, msg: 'Default card updated successfully' });
  } catch (error) {
    console.error('Error setting default card:', error);
    res.status(500).json({ success: false, msg: 'Failed to set default card' });
  }
};

// Statements Management
exports.getStatements = async (req, res) => {
  try {
    const userId = req.user.id;
    const [statements] = await getDb().query(
      'SELECT * FROM statements WHERE user_id = ? ORDER BY generated_at DESC',
      [userId]
    );
    res.json({ success: true, data: statements });
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({ success: false, msg: 'Failed to fetch statements' });
  }
};

exports.generateStatement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;
    
    const period = type === 'monthly' 
      ? `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`
      : type === 'quarterly'
      ? `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`
      : `Annual ${new Date().getFullYear()}`;

    const filePath = `/statements/${type}-${Date.now()}.pdf`;
    const fileSize = Math.floor(Math.random() * 1000000) + 500000;

    const [result] = await getDb().query(
      `INSERT INTO statements (user_id, statement_type, statement_period, file_path, file_size, generated_at, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, type, period, filePath, fileSize]
    );

    res.json({ success: true, msg: 'Statement generated successfully', statementId: result.insertId });
  } catch (error) {
    console.error('Error generating statement:', error);
    res.status(500).json({ success: false, msg: 'Failed to generate statement' });
  }
};

exports.incrementDownloadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const statementId = req.params.id;
    await getDb().query('UPDATE statements SET download_count = download_count + 1 WHERE id = ? AND user_id = ?', [statementId, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    res.status(500).json({ success: false });
  }
};
